const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'candidate', immutable: true },

    // Profile Information
    phone: { type: String },
    location: { type: String },
    timezone: { type: String, default: 'UTC' },
    bio: { type: String },
    avatar: { type: String }, // Keep for compatibility/legacy URL
    avatarData: { type: Buffer }, // Binary data for photo
    avatarMimeType: { type: String },

    // Candidate-specific
    resumeUrl: { type: String }, // Keep for compatibility/legacy URL
    resumeData: { type: Buffer }, // Binary data for PDF
    resumeMimeType: { type: String },
    resumeContent: { type: String },
    resumeFileName: { type: String },
    resumeUploadDate: { type: Date },
    skills: [{ type: String }],
    softSkills: [{ type: String }],
    experience: [{ type: String }],
    professionalHeadline: { type: String },
    totalYearsExperience: { type: Number },
    topJobRoles: [{ type: String }],
    workType: { type: String, enum: ['Remote', 'Hybrid', 'Office-based'], default: 'Remote' },
    salaryExpectation: { type: String },

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

candidateSchema.pre('save', async function () {
    this.updatedAt = Date.now();
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

candidateSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Candidate', candidateSchema);
