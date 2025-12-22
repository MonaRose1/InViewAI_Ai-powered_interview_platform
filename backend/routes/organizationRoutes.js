const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Organization = require('../models/Organization');

// @route   GET /api/organization
// @desc    Get organization settings
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        let org = await Organization.findOne();

        // Create default organization if none exists
        if (!org) {
            org = await Organization.create({
                name: 'InViewAI Inc.',
                website: 'https://inviewai.com'
            });
        }

        res.json(org);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/organization
// @desc    Update organization settings
// @access  Private (Admin only)
router.put('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, website, logo } = req.body;

        let org = await Organization.findOne();

        if (!org) {
            org = await Organization.create({ name, website, logo });
        } else {
            org.name = name || org.name;
            org.website = website || org.website;
            org.logo = logo || org.logo;
            await org.save();
        }

        res.json(org);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/organization/ai-settings
// @desc    Update AI configuration
// @access  Private (Admin only)
router.put('/ai-settings', protect, authorize('admin'), async (req, res) => {
    try {
        const { answerQuality, eyeContact, engagement, biasSensitivity } = req.body;

        let org = await Organization.findOne();

        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        org.settings.aiScoringWeights = {
            answerQuality: answerQuality || org.settings.aiScoringWeights.answerQuality,
            eyeContact: eyeContact || org.settings.aiScoringWeights.eyeContact,
            engagement: engagement || org.settings.aiScoringWeights.engagement
        };

        if (biasSensitivity !== undefined) {
            org.settings.biasSensitivity = biasSensitivity;
        }

        await org.save();
        res.json(org);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
