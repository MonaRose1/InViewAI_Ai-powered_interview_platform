const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
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

module.exports = router;
