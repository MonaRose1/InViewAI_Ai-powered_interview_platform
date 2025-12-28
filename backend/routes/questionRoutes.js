const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all questions (filtered by category if needed)
// @route   GET /api/questions
// @access  Private/Interviewer/Admin
router.get('/', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Interviewer/Admin
router.post('/', protect, authorize('interviewer', 'admin'), async (req, res) => {
    const { text, type, options, correctAnswer, category, difficulty } = req.body;

    try {
        const question = await Question.create({
            text,
            type,
            options,
            correctAnswer,
            category,
            difficulty,
            createdBy: req.user._id,
            onModel: req.user.role === 'admin' ? 'Admin' : 'Interviewer'
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Interviewer/Admin
router.put('/:id', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        Object.assign(question, req.body);
        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Interviewer/Admin
router.delete('/:id', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await question.deleteOne();
        res.json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
