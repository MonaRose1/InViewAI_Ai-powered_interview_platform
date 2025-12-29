const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const interviewerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'interviewer', immutable: true },

    // Profile Information
    phone: { type: String },
    location: { type: String },
    timezone: { type: String, default: 'UTC' },
    bio: { type: String },
    avatar: { type: String },
    avatarData: { type: Buffer },
    avatarMimeType: { type: String },

    // Interviewer-specific
    expertise: [{ type: String }],
    defaultDuration: { type: String, default: '60 mins' },
    autoAccept: { type: Boolean, default: false },
    maxPerDay: { type: Number, default: 4 },
    availability: {
        type: Map,
        of: [{
            start: String,
            end: String
        }]
    },

    // Preferences
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        inAppNotifications: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        soundAlerts: { type: Boolean, default: true },
        language: { type: String, default: 'en' }
    },

    // Security
    twoFactorEnabled: { type: Boolean, default: false },
    activeSessions: [{
        token: String,
        device: String,
        lastActive: Date
    }],

    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

interviewerSchema.pre('save', async function () {
    this.updatedAt = Date.now();
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

interviewerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Interviewer', interviewerSchema);
