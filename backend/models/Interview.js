const mongoose = require('mongoose');

const questionSessionSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    text: { type: String, required: true },
    type: { type: String, required: true },
    options: [String],
    candidateAnswer: { type: String, default: '' },
    aiAnalysis: {
        score: { type: Number, default: 0 },
        feedback: { type: String, default: '' },
        technicalAccuracy: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'analyzed'],
        default: 'pending'
    }
}, { _id: true });

const interviewSchema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Interviewer' },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    scheduledTime: { type: Date, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
    roomId: { type: String },
    aiResult: { type: mongoose.Schema.Types.ObjectId, ref: 'AIResult' },
    manualScore: { type: mongoose.Schema.Types.ObjectId, ref: 'ManualScore' },
    questions: [questionSessionSchema],
    notes: { type: String, default: '' },
    score: { type: Number },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
