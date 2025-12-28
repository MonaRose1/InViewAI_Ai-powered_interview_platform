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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('[CONN] User joined:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`[ROOM] User ${userId} joined: ${roomId}`);
    socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });

  socket.on('analyze-frame', async (payload) => {
    const { roomId, image_data } = payload;
    const { analyzeFrame } = require('./services/aiProxyService');
    const result = await analyzeFrame(image_data, roomId);
    if (result) {
      io.to(roomId).emit('ai-result', result);
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

    try {
      const interview = await Interview.findById(roomId).populate({
        path: 'application',
        populate: { path: 'job' }
      });

      if (!interview) {
        console.error(`[SUBMIT] Interview not found: ${roomId}`);
        return;
      }

      // Stage 1: Immediate save and broadcast
      let updatedAny = false;
      answers.forEach(submitted => {
        const q = interview.questions.find(iq =>
          (iq.questionId && iq.questionId.toString() === submitted.questionId?.toString()) ||
          (iq._id && iq._id.toString() === submitted.questionId?.toString())
        );

        if (q) {
          q.candidateAnswer = submitted.answer;
          if (q.status !== 'analyzed') q.status = 'submitted';
          updatedAny = true;
        }
      });

      if (updatedAny) {
        await interview.save();
        io.to(roomId).emit('answers-received', interview.questions);
        console.log(`[SUBMIT] Answers broadcast for room: ${roomId}`);

        // Stage 2: Background AI Review
        const jobTitle = interview.application?.job?.title || "Software Engineer";

        interview.questions.forEach(async (q) => {
          if (q.status === 'submitted' && q.candidateAnswer) {
            console.log(`[AI] Analyzing: ${q.text.substring(0, 20)}...`);
            try {
              const aiResult = await evaluateAnswer(q.text, q.candidateAnswer, jobTitle);
              if (aiResult && aiResult.evaluation) {
                const currentInterview = await Interview.findById(roomId);
                const currentQ = currentInterview.questions.id(q._id);
                if (currentQ) {
                  currentQ.aiAnalysis = {
                    score: aiResult.evaluation.overall_score || 0,
                    feedback: aiResult.evaluation.detailed_feedback || 'Analysis complete.',
                    technicalAccuracy: aiResult.evaluation.technical_score || 0
                  };
                  currentQ.status = 'analyzed';
                  await currentInterview.save();
                  io.to(roomId).emit('answers-received', currentInterview.questions);
                  console.log(`[AI] Complete: ${currentQ._id}`);
                }
              }
            } catch (aiErr) {
              console.error(`[AI] Error: ${q._id}`, aiErr.message);
            }
          }
        });
      }
    } catch (err) {
      console.error('[SUBMIT] fatal:', err);
    }
  });

  socket.on('end-interview', ({ roomId }) => {
    socket.to(roomId).emit('interview-ended');
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
  });
});

// Routes
app.get('/', (req, res) => res.send('v5-SERVER: Online'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/organization', require('./routes/organizationRoutes'));
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
