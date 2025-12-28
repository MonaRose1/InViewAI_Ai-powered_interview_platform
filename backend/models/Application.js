const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    cvUrl: { type: String },
    coverLetter: { type: String },
    startDate: { type: Date },
    referralCode: { type: String },
    status: {
        type: String,
        enum: ['applied', 'pending', 'shortlisted', 'rejected', 'interview_scheduled', 'interviewed'],
        default: 'pending'
    },
    rankingScore: { type: Number, default: 0, index: true },
    scoreBreakdown: {
        aiScore: { type: Number, default: 0 },
        manualScore: { type: Number, default: 0 }
    },
    appliedAt: { type: Date, default: Date.now }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Application', applicationSchema);
