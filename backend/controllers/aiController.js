const AIResult = require('../models/AIResult');

// @desc    Analyze video frames (Mock)
// @route   POST /api/ai/analyze-frames
// @access  Private
const analyzeFrames = async (req, res) => {
    try {
        const { interviewId, timestamp } = req.body;
        // In a real app, req.body.frames would contain base64 images

        // Mock Random Analysis
        const result = {
            interviewId,
            timestamp: timestamp || new Date(),
            confidence: Math.random() * 100,
            stress: Math.random() * 100,
            emotions: {
                happy: Math.random(),
                neutral: Math.random(),
                anxious: Math.random()
            },
            flags: Math.random() > 0.9 ? ["Eye gaze diversion detected"] : []
        };

        // Optionally save to DB (skipping for high-frequency mock to avoid DB bloat)
        // await AIResult.create({ ...result, interview: interviewId });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI Service Error' });
    }
};

// @desc    Get analysis results
// @route   GET /api/ai/results/:interviewId
// @access  Private
const getInterviewResults = async (req, res) => {
    try {
        const results = await AIResult.find({ interview: req.params.interviewId });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    analyzeFrames,
    getInterviewResults
};
