const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const Notification = require('../models/Notification');
const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Admin = require('../models/Admin');
// const User = require('../models/User'); // Deleted

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, read: false },
            { read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/notifications
// @desc    Create notification (internal use)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, message, type, link } = req.body;

        const notification = await Notification.create({
            user: req.user.id,
            onModel: req.user.role === 'admin' ? 'Admin' : (req.user.role === 'interviewer' ? 'Interviewer' : 'Candidate'),
            title,
            message,
            type,
            link
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/notifications/broadcast
// @desc    Create broadcast notification for all users
// @access  Private/Admin
// @route   POST /api/notifications/broadcast
// @desc    Create broadcast notification for all users
// @access  Private/Admin
router.post('/broadcast', protect, adminOnly, async (req, res) => {
    try {
        const { title, message, type, link } = req.body;

        const candidates = await Candidate.find({ /* status: 'active' */ }); // Status field might not exist in all schemas yet, assuming active
        const interviewers = await Interviewer.find({});
        const admins = await Admin.find({});

        const allUsers = [...candidates, ...interviewers, ...admins];

        const notifications = allUsers.map(user => ({
            user: user._id,
            onModel: user.role === 'admin' ? 'Admin' : (user.role === 'interviewer' ? 'Interviewer' : 'Candidate'),
            title,
            message,
            type: type || 'info',
            link
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ message: `Broadcast sent to ${allUsers.length} users` });
    } catch (error) {
        console.error('[BROADCAST_GEN_ERROR]', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
