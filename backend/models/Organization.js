const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    website: { type: String },
    logo: { type: String },

    // Settings
    settings: {
        aiScoringWeights: {
            answerQuality: { type: Number, default: 40 },
            eyeContact: { type: Number, default: 30 },
            engagement: { type: Number, default: 30 }
        },
        biasSensitivity: { type: Boolean, default: false },
        interviewBranding: { type: Boolean, default: true }
    },

    // Subscription
    plan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter' },
    interviewsLimit: { type: Number, default: 50 },
    interviewsUsed: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

organizationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Organization', organizationSchema);
