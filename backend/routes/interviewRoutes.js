const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { evaluateAnswer } = require('../services/aiProxyService');
const {
    getMyInterviews,
    getInterviewById,
    getCandidateInterviews,
    createInterview,
    updateInterviewStatus,
    endInterview,
    updateNotes,
    updateInterviewQuestions
} = require('../controllers/interviewController');

router.get('/', protect, authorize('interviewer', 'admin'), getMyInterviews);
router.get('/candidate', protect, authorize('candidate'), getCandidateInterviews);
router.post('/', protect, authorize('interviewer', 'admin'), createInterview);
router.get('/:id', protect, authorize('interviewer', 'admin', 'candidate'), getInterviewById);
router.put('/:id/status', protect, authorize('interviewer', 'admin'), updateInterviewStatus);
router.post('/:id/end', protect, authorize('interviewer', 'admin'), endInterview);
router.put('/:id/notes', protect, authorize('interviewer', 'admin'), updateNotes);
router.put('/:id/questions', protect, authorize('interviewer', 'admin'), updateInterviewQuestions);

// Manual AI Evaluation endpoint
router.post('/:id/evaluate-question', protect, authorize('interviewer', 'admin'), async (req, res) => {
    try {
        const { question, answer, jobRole } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ message: 'Question and answer are required' });
        }

        const aiResult = await evaluateAnswer(question, answer, jobRole || 'Software Engineer');

        if (!aiResult || !aiResult.evaluation) {
            return res.status(500).json({ message: 'AI evaluation failed' });
        }

        res.json({
            score: aiResult.evaluation.overall_score || 0,
            feedback: aiResult.evaluation.detailed_feedback || 'Analysis complete.',
            technical_accuracy: aiResult.evaluation.technical_score || 0
        });
    } catch (error) {
        console.error('[MANUAL EVAL] Error:', error.message);
        res.status(500).json({ message: 'AI evaluation failed', error: error.message });
    }
});

module.exports = router;
