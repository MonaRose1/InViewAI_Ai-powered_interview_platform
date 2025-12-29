const mongoose = require('mongoose');

const aiResultSchema = new mongoose.Schema({
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    videoUrl: { type: String }, // Optional path to recording
    audioUrl: { type: String },
    overallConfidence: { type: Number },
    overallStress: { type: Number },
    emotions: { type: Map, of: Number }, // e.g. { happy: 0.8, neutral: 0.2 }
    flags: [{ timeoffset: Number, type: String, note: String }], // e.g. "Long pause"
    sessionHistory: [{
        timestamp: { type: Date, default: Date.now },
        confidence: Number,
        stress: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIResult', aiResultSchema);
