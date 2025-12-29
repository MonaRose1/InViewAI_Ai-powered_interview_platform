const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Models & Services
const Interview = require('./models/Interview');
const Application = require('./models/Application');
const Job = require('./models/Job');
const { evaluateAnswer } = require('./services/aiProxyService');
const AIResult = require('./models/AIResult');
const connectDB = require('./config/db');

// Database Connection
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin and specific network IPs if needed
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) || /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) || /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO Setup with Room Tracking
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track users in rooms: { roomId: { socketId: userId } }
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log('[CONN] User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);

    // Update room tracking
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, {});
    }
    roomUsers.get(roomId)[socket.id] = userId;

    console.log(`[ROOM] User ${userId} (${socket.id}) joined: ${roomId}`);

    // Tell others about this new user
    socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });

    // Send the list of existing users to the person joining
    const usersInRoom = roomUsers.get(roomId);
    const existingUsers = Object.entries(usersInRoom)
      .filter(([sid]) => sid !== socket.id)
      .map(([sid, uid]) => ({ socketId: sid, userId: uid }));

    if (existingUsers.length > 0) {
      socket.emit('room-users', existingUsers);
      console.log(`[ROOM] Informed ${socket.id} of ${existingUsers.length} existing users`);
    }
  });

  socket.on('offer', (payload) => {
    console.log(`[RTC] Offer: ${socket.id} -> ${payload.target}`);
    socket.to(payload.target).emit('offer', {
      sdp: payload.sdp,
      senderSocketId: socket.id
    });
  });

  socket.on('answer', (payload) => {
    console.log(`[RTC] Answer: ${socket.id} -> ${payload.target}`);
    socket.to(payload.target).emit('answer', {
      sdp: payload.sdp,
      senderSocketId: socket.id
    });
  });

  socket.on('ice-candidate', (payload) => {
    socket.to(payload.target).emit('ice-candidate', {
      candidate: payload.candidate,
      senderSocketId: socket.id
    });
  });

  socket.on('report-ai-stats', (data) => {
    const { roomId } = data;
    if (roomId) {
      io.to(roomId).emit('ai-result', data);
    }
  });

  socket.on('analyze-frame', async (payload) => {
    const { roomId, image_data } = payload;
    const { analyzeFrame } = require('./services/aiProxyService');
    const result = await analyzeFrame(image_data, roomId);
    if (result) {
      io.to(roomId).emit('ai-result', result);

      // Persist snapshot to history
      try {
        let aiRes = await AIResult.findOne({ interview: roomId });
        if (!aiRes) {
          aiRes = await AIResult.create({ interview: roomId });
        }

        aiRes.sessionHistory.push({
          confidence: result.confidence || (result.behavior_analysis?.professional_presence_score) || 0,
          stress: result.stress || (result.behavior_analysis?.stress_score) || 0
        });

        // Limit history to 200 entries to prevent DB bloat
        if (aiRes.sessionHistory.length > 200) aiRes.sessionHistory.shift();

        await aiRes.save();
      } catch (err) {
        console.error('[AI-SNAP] History error:', err.message);
      }
    }
  });

  socket.on('send-questions', async (payload) => {
    let { roomId, questions } = payload;

    // Defensive: Parse if questions is a string
    if (typeof questions === 'string') {
      try { questions = JSON.parse(questions); } catch (e) { console.error("[QUESTIONS] JSON Parse failed"); }
    }

    console.log(`[QUESTIONS] Received ${questions?.length} questions for room: ${roomId}`);
    if (!roomId || !Array.isArray(questions)) return;

    // Broadcast to candidate immediately
    io.to(roomId).emit('receive-questions', questions);

    // Update DB
    try {
      const interview = await Interview.findById(roomId);
      if (interview) {
        const existingIds = (interview.questions || []).map(q => q.questionId?.toString());
        const newQuestions = questions.filter(q => !existingIds.includes(q.questionId?.toString()));

        if (newQuestions.length > 0) {
          console.log(`[DB] Appending ${newQuestions.length} questions`);
          const questionsToPush = newQuestions.map(q => ({
            questionId: q.questionId,
            text: q.text,
            type: q.type,
            options: q.options || [],
            status: 'pending'
          }));

          interview.questions.push(...questionsToPush);
          await interview.save();
          console.log(`[DB] Saved questions successfully`);
        }
      }
    } catch (err) {
      console.error('[DB] QUESTION SAVE ERROR:', err);
    }
  });

  socket.on('submit-answers', async (payload) => {
    let { roomId, answers } = payload;

    // Defensive: Parse if answers is a string
    if (typeof answers === 'string') {
      try { answers = JSON.parse(answers); } catch (e) { console.error("[SUBMIT] JSON Parse failed"); }
    }

    console.log(`[SUBMIT] Received answers for room: ${roomId}, count: ${answers?.length}`);
    if (!roomId || !answers || !Array.isArray(answers)) return;

    // Presence check for debugging
    const clients = io.sockets.adapter.rooms.get(roomId);
    const clientCount = clients ? clients.size : 0;
    console.log(`[SUBMIT] Active signaling peers in room ${roomId}: ${clientCount} (${Array.from(clients || [])})`);

    try {
      const interview = await Interview.findById(roomId).populate({
        path: 'application',
        populate: { path: 'job' }
      });

      if (!interview) {
        console.error(`[SUBMIT] Interview not found: ${roomId}`);
        return;
      }

      // --- STAGE 1: SAVE ANSWERS IMMEDIATELY ---
      // We go through all the answers sent by the candidate and match them to our questions
      let hasUpdates = false;

      answers.forEach(submitted => {
        // Find the specific question by its ID or QuestionId
        const targetQ = interview.questions.find(q =>
          (q.questionId && q.questionId.toString() === submitted.questionId?.toString()) ||
          (q._id && q._id.toString() === submitted.questionId?.toString())
        );

        if (targetQ) {
          targetQ.candidateAnswer = submitted.answer;
          // Mark as 'submitted' so the AI knows it should analyze it next
          if (targetQ.status !== 'analyzed') {
            targetQ.status = 'submitted';
          }
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        await interview.save();
        // Notify the front-end that the database has received the answers
        io.to(roomId).emit('answers-received', interview.questions);
        console.log(`[SUBMIT] Answers saved and broadcast for room: ${roomId}`);

        // --- STAGE 2: BACKGROUND AI REVIEW ---
        const targetJobTitle = interview.application?.job?.title || "Software Engineer";

        // Logic to process each "submitted" question using AI
        const processAIReviews = async () => {
          for (let i = 0; i < interview.questions.length; i++) {
            const currentQ = interview.questions[i];

            if (currentQ.status === 'submitted' && currentQ.candidateAnswer) {
              console.log(`[AI] Analyzing: ${currentQ.text.substring(0, 20)}...`);

              try {
                // Get evaluation from our AI proxy service
                const aiResult = await evaluateAnswer(currentQ.text, currentQ.candidateAnswer, targetJobTitle);

                if (aiResult && aiResult.evaluation) {
                  // Refetch freshest interview state to avoid overwriting other updates
                  const fresherInterview = await Interview.findById(roomId);
                  const dbEntry = fresherInterview.questions.id(currentQ._id);

                  dbEntry.aiAnalysis = {
                    score: aiResult.evaluation.overall_score || 0,
                    feedback: aiResult.evaluation.detailed_feedback || 'Analysis complete.',
                    technicalAccuracy: aiResult.evaluation.technical_score || 0
                  };
                  dbEntry.status = 'analyzed';

                  // --- RE-CALCULATE OVERALL INTERVIEW SCORE ---
                  const analyzedList = fresherInterview.questions.filter(q => q.status === 'analyzed');

                  let scoreSum = 0;
                  analyzedList.forEach(q => {
                    scoreSum += (q.aiAnalysis?.score || 0);
                  });

                  let calculatedAvg = 0;
                  if (analyzedList.length > 0) {
                    calculatedAvg = scoreSum / analyzedList.length;
                  }

                  // Update or create the AIResult record
                  let resultDoc = await AIResult.findOne({ interview: roomId });
                  if (!resultDoc) {
                    resultDoc = await AIResult.create({
                      interview: roomId,
                      overallConfidence: Math.round(calculatedAvg)
                    });
                  } else {
                    resultDoc.overallConfidence = Math.round(calculatedAvg);
                    await resultDoc.save();
                  }

                  fresherInterview.aiResult = resultDoc._id;
                  await fresherInterview.save();

                  // Sync the new score to the application for the rankings list
                  if (fresherInterview.application) {
                    const Application = require('./models/Application');
                    await Application.findByIdAndUpdate(fresherInterview.application, {
                      'scoreBreakdown.aiScore': Math.round(calculatedAvg)
                    });
                  }

                  // Let the UI know there is new feedback/score available
                  io.to(roomId).emit('answers-received', fresherInterview.questions);
                  console.log(`[AI] Feedback saved for question: ${dbEntry._id}`);
                }
              } catch (err) {
                console.error(`[AI] Error processing question ${currentQ._id}:`, err.message);
              }
            }
          }
        };

        processAIReviews();
      }
    } catch (err) {
      console.error('[SUBMIT] fatal:', err);
    }
  });

  socket.on('end-interview', async ({ roomId }) => {
    socket.to(roomId).emit('interview-ended');

    // Calculate final average scores from session history
    try {
      const aiRes = await AIResult.findOne({ interview: roomId });
      if (aiRes && aiRes.sessionHistory.length > 0) {
        const sumConf = aiRes.sessionHistory.reduce((acc, s) => acc + (s.confidence || 0), 0);
        const sumStress = aiRes.sessionHistory.reduce((acc, s) => acc + (s.stress || 0), 0);

        aiRes.overallConfidence = Math.round(sumConf / aiRes.sessionHistory.length);
        aiRes.overallStress = Math.round(sumStress / aiRes.sessionHistory.length);

        await aiRes.save();
        console.log(`[AI-FINAL] Averaged scores for ${roomId} - Conf: ${aiRes.overallConfidence}%, Stress: ${aiRes.overallStress}%`);

        // Sync to Application
        const interview = await Interview.findById(roomId);
        if (interview && interview.application) {
          const Application = require('./models/Application');
          await Application.findByIdAndUpdate(interview.application, {
            'scoreBreakdown.aiScore': aiRes.overallConfidence
          });
        }
      }
    } catch (err) {
      console.error('[AI-FINAL] Error:', err.message);
    }
  });

  socket.on('send-chat-message', ({ roomId, message, sender }) => {
    io.to(roomId).emit('receive-chat-message', {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      message,
      sender,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('[CONN] User left:', socket.id);

    // Find which rooms this socket was in and clean up
    for (const [roomId, users] of roomUsers.entries()) {
      if (users[socket.id]) {
        delete users[socket.id];
        // Notify others
        socket.to(roomId).emit('user-disconnected', socket.id);

        // If room is empty, optionally delete it
        if (Object.keys(users).length === 0) {
          roomUsers.delete(roomId);
        }
      }
    }
  });
});

// Routes
app.get('/', (req, res) => res.send('v5-SERVER: Online'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/ranking', require('./routes/rankingRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

const PORT = 5000;

process.on('uncaughtException', (err) => {
  console.error('CRITICAL ERROR!', err);
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`v5-SERVER: Listening on all interfaces at port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
});
