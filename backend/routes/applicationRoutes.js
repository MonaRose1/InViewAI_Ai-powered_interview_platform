const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    applyForJob,
    getMyApplications,
    getJobApplications,
    getApplications,
    updateApplicationStatus
} = require('../controllers/applicationController');

router.post('/', protect, authorize('candidate'), applyForJob);
router.get('/', protect, authorize('admin', 'interviewer'), getApplications);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('admin', 'interviewer'), getJobApplications);
router.put('/:id/status', protect, authorize('admin', 'interviewer'), updateApplicationStatus);

module.exports = router;
