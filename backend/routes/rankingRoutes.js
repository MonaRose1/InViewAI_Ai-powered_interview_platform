const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { updateJobRankings } = require('../services/rankingService');

// Update Ranking Configuration
router.post('/:jobId/config', async (req, res) => {
    try {
        const { aiWeight, manualWeight } = req.body;
        const job = await Job.findByIdAndUpdate(
            req.params.jobId,
            {
                rankingConfig: { aiWeight, manualWeight }
            },
            { new: true }
        );

        // Trigger re-calculation
        await updateJobRankings(req.params.jobId);

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Ranked Candidates
router.get('/:jobId', async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate('candidate', 'name email avatar') // Assuming User model has these
            .sort({ rankingScore: -1 }); // Descending order

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
