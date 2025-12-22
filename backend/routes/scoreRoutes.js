const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitManualScore, getInterviewScore } = require('../controllers/scoreController');

router.post('/', protect, authorize('interviewer', 'admin'), submitManualScore);
router.get('/:interviewId', protect, authorize('interviewer', 'admin'), getInterviewScore);

module.exports = router;
