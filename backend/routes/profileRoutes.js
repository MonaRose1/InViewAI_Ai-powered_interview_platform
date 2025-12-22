const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer Config - Use memory storage to store files in database
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only .pdf, .doc and .docx files are allowed!'));
    }
});

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -activeSessions');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/personal
// @desc    Update personal information
// @access  Private
router.put('/personal', protect, async (req, res) => {
    try {
        const { name, phone, location, timezone, bio } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, location, timezone, bio },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/candidate
// @desc    Update candidate-specific information (skills, etc.)
// @access  Private
router.put('/candidate', protect, async (req, res) => {
    try {
        const { skills, softSkills, preferredRoles, workType, expectedSalary, noticePeriod } = req.body;

        const updateData = {};
        if (skills !== undefined) updateData.skills = skills;
        if (softSkills !== undefined) updateData.softSkills = softSkills;
        if (preferredRoles !== undefined) updateData.preferredRoles = preferredRoles;
        if (workType !== undefined) updateData.workType = workType;
        if (expectedSalary !== undefined) updateData.expectedSalary = expectedSalary;
        if (noticePeriod !== undefined) updateData.noticePeriod = noticePeriod;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
    try {
        const { emailNotifications, inAppNotifications, theme, soundAlerts, language } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                preferences: {
                    emailNotifications,
                    inAppNotifications,
                    theme,
                    soundAlerts,
                    language
                }
            },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', protect, async (req, res) => {
    try {
        const { avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const bcrypt = require('bcryptjs');

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new password' });
        }

        // Password validation rules
        const passwordRules = {
            minLength: newPassword.length >= 8,
            hasUppercase: /[A-Z]/.test(newPassword),
            hasLowercase: /[a-z]/.test(newPassword),
            hasNumber: /\d/.test(newPassword),
            hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
        };

        const failedRules = [];
        if (!passwordRules.minLength) failedRules.push('at least 8 characters');
        if (!passwordRules.hasUppercase) failedRules.push('one uppercase letter');
        if (!passwordRules.hasLowercase) failedRules.push('one lowercase letter');
        if (!passwordRules.hasNumber) failedRules.push('one number');
        if (!passwordRules.hasSymbol) failedRules.push('one special character');

        if (failedRules.length > 0) {
            return res.status(400).json({
                message: `Password must contain ${failedRules.join(', ')}`
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Check if new password is same as current
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/goals
// @desc    Update candidate career goals
// @access  Private
router.put('/goals', protect, async (req, res) => {
    try {
        const { topJobRoles, workType, salaryExpectation, skills } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                topJobRoles,
                workType,
                salaryExpectation,
                skills
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/interviewer
// @desc    Update interviewer settings
// @access  Private
router.put('/interviewer', protect, async (req, res) => {
    try {
        const { expertise } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { expertise },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/profile/sessions/logout
// @desc    Logout from a specific session
// @access  Private
router.post('/sessions/logout', protect, async (req, res) => {
    try {
        const { sessionToken } = req.body;
        const user = await User.findById(req.user.id);

        // Remove the specific session
        user.activeSessions = user.activeSessions.filter(s => s.token !== sessionToken);
        await user.save();

        res.json({ message: 'Successfully logged out from the device' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/profile/sessions/logout-all
// @desc    Logout from all other sessions
// @access  Private
router.post('/sessions/logout-all', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });

        const currentToken = authHeader.split(' ')[1];

        // Keep only the current session
        user.activeSessions = user.activeSessions.filter(s => s.token === currentToken);
        await user.save();

        res.json({ message: 'Successfully logged out from all other devices' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/profile/sessions
// @desc    Get active sessions
// @access  Private
router.get('/sessions', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('activeSessions');
        res.json(user.activeSessions || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/resume', protect, upload.single('file'), async (req, res) => {
    try {
        let parsedData = req.body.parsedData;
        if (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData);
        }

        const updateData = {
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.resumeUrl = `/uploads/resumes/${req.file.filename}`;
            updateData.resumeFileName = req.file.originalname;
            updateData.resumeUploadDate = Date.now();
        }

        if (parsedData) {
            updateData.skills = parsedData.technical_skills;
            updateData.softSkills = parsedData.soft_skills;
            updateData.totalYearsExperience = parsedData.total_years_experience;
            updateData.professionalHeadline = parsedData.professional_headline;
            updateData.experience = parsedData.education;
            updateData.topJobRoles = parsedData.top_3_job_roles;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
