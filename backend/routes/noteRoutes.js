const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Note = require('../models/Note');

// @route   GET /api/notes
// @desc    Get interviewer notes
// @access  Private (Interviewer only)
router.get('/', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const notes = await Note.find({ interviewer: req.user.id })
            .populate('relatedCandidate', 'name email')
            .sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private (Interviewer only)
router.post('/', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const { title, content, tags, relatedCandidate, relatedInterview } = req.body;

        const note = await Note.create({
            interviewer: req.user.id,
            title,
            content,
            tags,
            relatedCandidate,
            relatedInterview
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private (Interviewer only)
router.put('/:id', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, interviewer: req.user.id },
            { title, content, tags },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private (Interviewer only)
router.delete('/:id', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            interviewer: req.user.id
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
