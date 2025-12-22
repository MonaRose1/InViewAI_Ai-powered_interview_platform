const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'interviewer', 'candidate'], default: 'candidate' },

    // Profile Information
    phone: { type: String },
    location: { type: String },
    timezone: { type: String, default: 'UTC' },
    bio: { type: String },
    avatar: { type: String },

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

    // Candidate-specific
    resumeUrl: { type: String }, // Legacy field for backward compatibility
    resumeContent: { type: String }, // Base64 encoded resume content
    resumeMimeType: { type: String }, // e.g., 'application/pdf'
    resumeFileName: { type: String },
    resumeUploadDate: { type: Date },
    skills: [{ type: String }],
    softSkills: [{ type: String }],
    experience: [{ type: String }], // Education/Work details
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

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
userSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('User', userSchema);
