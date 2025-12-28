const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getAdminStats, getUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');

// Stats
router.get('/stats', protect, adminOnly, getAdminStats);

// User Management
router.get('/users', protect, adminOnly, getUsers);
router.post('/users', protect, adminOnly, createUser);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Applications Management
const { getApplications, updateApplication } = require('../controllers/adminController');
router.get('/applications', protect, adminOnly, getApplications);
router.put('/applications/:id', protect, adminOnly, updateApplication);

// Interviews Management
const { getInterviews, updateInterview, deleteInterview } = require('../controllers/adminController');
router.get('/interviews', protect, adminOnly, getInterviews);
router.put('/interviews/:id', protect, adminOnly, updateInterview);
router.delete('/interviews/:id', protect, adminOnly, deleteInterview);

// Data Export
const { exportData, exportSystemLogs } = require('../controllers/adminController');
router.get('/export/:type', protect, adminOnly, exportData);
router.get('/logs/export', protect, adminOnly, exportSystemLogs);

module.exports = router;
