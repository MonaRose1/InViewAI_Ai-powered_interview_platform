const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledTime: { type: Date, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
    roomId: { type: String }, // For WebRTC
    aiResult: { type: mongoose.Schema.Types.ObjectId, ref: 'AIResult' },
    manualScore: { type: mongoose.Schema.Types.ObjectId, ref: 'ManualScore' },
    questions: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
            text: String,
            type: String,
            options: [String],
            candidateAnswer: String,
            aiAnalysis: {
                score: Number,
                feedback: String,
                technicalAccuracy: Number
            },
            status: { type: String, enum: ['pending', 'submitted', 'analyzed'], default: 'pending' }
        }
    ],
    notes: { type: String, default: '' },
    score: { type: Number }, // Final score
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
