const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    relatedCandidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedInterview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

noteSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Note', noteSchema);
