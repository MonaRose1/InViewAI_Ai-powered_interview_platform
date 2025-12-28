const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String },
    description: { type: String, required: true },
    requirements: { type: [String] },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    applicantsCount: { type: Number, default: 0 },
    rankingConfig: {
        aiWeight: { type: Number, default: 50 },
        manualWeight: { type: Number, default: 50 }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
