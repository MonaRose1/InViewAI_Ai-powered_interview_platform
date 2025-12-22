const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8002';

const analyzeFrame = async (frameData, sessionId) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/analyze-frame`, {
            session_id: sessionId,
            image_data: frameData
        });
        return response.data;
    } catch (error) {
        console.error('AI Proxy Error:', error.message);
        return null;
    }
};

const analyzeAnswer = async (question, answer) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/analyze-answer`, {
            question,
            answer
        });
        return response.data;
    } catch (error) {
        console.error('AI Answer Analysis Error:', error.message);
        return null;
    }
};

module.exports = {
    analyzeFrame,
    analyzeAnswer
};
