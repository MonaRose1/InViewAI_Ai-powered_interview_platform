const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased for base64 avatar uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for dev, restrict in prod
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // WebRTC Signaling Events
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
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

  // Code Editor Events
  socket.on('code-change', (payload) => {
    // Broadcast to everyone in the room except sender
    socket.to(payload.roomId).emit('code-update', payload.code);
  });

  socket.on('run-code', (payload) => {
    const { code, roomId } = payload;
    const vm = require('vm'); // Late import to avoid top-level clutter

    try {
      // Create a sandbox with console support
      const logOutput = [];
      const sandbox = {
        console: {
          log: (...args) => {
            logOutput.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
          },
          error: (...args) => {
            logOutput.push('[Error] ' + args.join(' '));
          },
          warn: (...args) => {
            logOutput.push('[Warn] ' + args.join(' '));
          }
        },
        setTimeout: setTimeout,
        clearTimeout: clearTimeout
      };

      // Contextify the sandbox
      vm.createContext(sandbox);

      // Execute code with timeout
      const script = new vm.Script(`
            try {
                ${code}
            } catch (e) {
                console.error(e.message);
            }
        `);

      script.runInContext(sandbox, { timeout: 1000 });

      // Small delay to capture async logs if any (simple approach)
      setTimeout(() => {
        const output = logOutput.length > 0 ? `> Output:\n${logOutput.join('\n')}` : `> Execution finished (No Output).`;
        io.to(roomId).emit('code-output', output);
      }, 50);

    } catch (error) {
      const errorOutput = `> Execution Failed:\n${error.message}`;
      io.to(roomId).emit('code-output', errorOutput);
    }
  });
  // AI Analytics Events
  socket.on('analyze-frame', async (payload) => {
    const { roomId, image_data } = payload;
    const { analyzeFrame } = require('./services/aiProxyService'); // Late import

    const result = await analyzeFrame(image_data, roomId);

    if (result) {
      // Broadcast result to everyone in room (candidate + interviewer)
      // Ideally, send only to Interviewer, but for now broadcast is fine
      io.to(roomId).emit('ai-result', result);
    }
  });

  // Question Bank Events
  socket.on('send-questions', async (payload) => {
    const { roomId, questions } = payload;
    // Notify candidate that questions have been sent
    socket.to(roomId).emit('receive-questions', questions);

    // Also update the interview document in DB to store these questions
    try {
      const Interview = require('./models/Interview');
      await Interview.findOneAndUpdate(
        { _id: roomId }, // assuming roomId is the interview ID
        { $set: { questions: questions.map(q => ({ ...q, status: 'pending' })) } }
      );
    } catch (err) {
      console.error('Error saving questions to interview:', err);
    }
  });

  socket.on('submit-answers', async (payload) => {
    const { roomId, answers } = payload; // answers is an array of { questionId, answer }

    try {
      const Interview = require('./models/Interview');
      const interview = await Interview.findById(roomId);

      if (interview) {
        // Map answers back to the stored questions
        interview.questions = interview.questions.map(q => {
          const submitted = answers.find(a => a.questionId === q.questionId.toString() || a.questionId === q._id.toString());
          if (submitted) {
            return { ...q, candidateAnswer: submitted.answer, status: 'submitted' };
          }
          return q;
        });
        await interview.save();

        // Notify interviewer that answers are in
        socket.to(roomId).emit('answers-received', interview.questions);
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
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
});

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('AI Interviewer API is running');
});

// Define Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', apiLimiter, require('./routes/userRoutes'));
app.use('/api/profile', apiLimiter, require('./routes/profileRoutes'));
app.use('/api/notifications', apiLimiter, require('./routes/notificationRoutes'));
app.use('/api/organization', apiLimiter, require('./routes/organizationRoutes'));
app.use('/api/notes', apiLimiter, require('./routes/noteRoutes'));
app.use('/api/jobs', apiLimiter, require('./routes/jobRoutes'));
app.use('/api/applications', apiLimiter, require('./routes/applicationRoutes'));
app.use('/api/ai', apiLimiter, require('./routes/aiRoutes'));
app.use('/api/scores', apiLimiter, require('./routes/scoreRoutes'));
app.use('/api/admin', apiLimiter, require('./routes/adminRoutes'));
app.use('/api/interviews', apiLimiter, require('./routes/interviewRoutes'));
app.use('/api/ranking', apiLimiter, require('./routes/rankingRoutes'));
app.use('/api/questions', apiLimiter, require('./routes/questionRoutes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
