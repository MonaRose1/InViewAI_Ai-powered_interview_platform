const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002';

router.post('/evaluate-answer', protect, async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/evaluate-answer`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({ message: "AI Evaluation Failed", details: error.message });
    }
});

module.exports = router;
