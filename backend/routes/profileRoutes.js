const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Admin = require('../models/Admin');
const multer = require('multer');
const path = require('path');

// Helper to get model by role
const getModelByRole = (role) => {
    if (role === 'candidate') return Candidate;
    if (role === 'interviewer') return Interviewer;
    if (role === 'admin') return Admin;
    return null;
};

// Multer Config (Memory Storage for MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only .pdf, .doc, .docx, .jpg, .jpeg, .png files are allowed!'));
    }
});

// @route   GET /api/profile/resume-bin/:id (Candidate only)
router.get('/resume-bin/:id', async (req, res) => {
    try {
        const user = await Candidate.findById(req.params.id);
        if (!user || !user.resumeData) return res.status(404).send('Resume not found');

        res.set('Content-Type', user.resumeMimeType || 'application/pdf');
        res.send(user.resumeData);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// @route   GET /api/profile/avatar-bin/:role/:id
router.get('/avatar-bin/:role/:id', async (req, res) => {
    try {
        const Model = getModelByRole(req.params.role);
        if (!Model) return res.status(400).send('Invalid role');

        const user = await Model.findById(req.params.id);
        if (!user || !user.avatarData) return res.status(404).send('Avatar not found');

        res.set('Content-Type', user.avatarMimeType || 'image/jpeg');
        res.send(user.avatarData);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// @route   GET /api/profile
router.get('/', protect, async (req, res) => {
    try {
        const Model = getModelByRole(req.user.role);
        const user = await Model.findById(req.user.id).select('-password -activeSessions -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/personal
router.put('/personal', protect, async (req, res) => {
    try {
        const { name, phone, location, timezone, bio } = req.body;
        const Model = getModelByRole(req.user.role);
        const user = await Model.findByIdAndUpdate(
            req.user.id,
            { name, phone, location, timezone, bio },
            { new: true, runValidators: true }
        ).select('-password -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/candidate
router.put('/candidate', protect, async (req, res) => {
    if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Not authorized' });
    try {
        const { skills, softSkills, preferredRoles, workType, expectedSalary } = req.body;
        const user = await Candidate.findByIdAndUpdate(
            req.user.id,
            { skills, softSkills, preferredRoles, workType, salaryExpectation: expectedSalary },
            { new: true }
        ).select('-password -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/avatar
router.put('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        const Model = getModelByRole(req.user.role);
        const updateData = {};

        if (req.file) {
            updateData.avatarData = req.file.buffer;
            updateData.avatarMimeType = req.file.mimetype;
            // Also update URL for backward compatibility
            updateData.avatar = `/api/profile/avatar-bin/${req.user.role}/${req.user.id}`;
        }

        const user = await Model.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/resume
router.put('/resume', protect, upload.single('file'), async (req, res) => {
    if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Not authorized' });
    try {
        const updateData = { updatedAt: Date.now() };
        if (req.file) {
            updateData.resumeData = req.file.buffer;
            updateData.resumeMimeType = req.file.mimetype;
            updateData.resumeFileName = req.file.originalname;
            updateData.resumeUploadDate = Date.now();
            updateData.resumeUrl = `/api/profile/resume-bin/${req.user.id}`;
        }

        const user = await Candidate.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/password
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const Model = getModelByRole(req.user.role);

        // 1. Find user (we need the password field for comparison)
        const user = await Model.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // 3. --- PASSWORD SECURITY CHECKS (Same as Registration) ---
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ message: 'New password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({ message: 'New password must contain at least one lowercase letter' });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            return res.status(400).json({ message: 'New password must contain at least one special character (symbol)' });
        }

        // 4. Update and Save (The model's .pre('save') hook will handle hashing)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('[PWD_UPDATE_ERROR]', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/goals (Candidate only)
router.put('/goals', protect, async (req, res) => {
    if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Not authorized' });
    try {
        const { topJobRoles, workType, salaryExpectation, skills } = req.body;
        const user = await Candidate.findByIdAndUpdate(
            req.user.id,
            { topJobRoles, workType, salaryExpectation, skills },
            { new: true }
        ).select('-password -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/profile/interviewer (Interviewer only)
router.put('/interviewer', protect, async (req, res) => {
    if (req.user.role !== 'interviewer') return res.status(403).json({ message: 'Not authorized' });
    try {
        const { expertise } = req.body;
        const user = await Interviewer.findByIdAndUpdate(
            req.user.id,
            { expertise },
            { new: true }
        ).select('-password -resumeData -avatarData');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
