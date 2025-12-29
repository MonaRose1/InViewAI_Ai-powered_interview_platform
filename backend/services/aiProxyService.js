const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002';

const analyzeFrame = async (frameData, sessionId) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/analyze-frame`, {
            session_id: sessionId,
            image_data: frameData
        });
        return response.data;
    } catch (error) {
        console.error(`AI Proxy Error (Frame) at ${AI_SERVICE_URL}:`, error.message);
        return null;
    }
};

const evaluateAnswer = async (question, answer, jobRole = "Software Engineer") => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/evaluate-answer`, {
            question,
            answer,
            job_role: jobRole
        });
        return response.data;
    } catch (error) {
        console.error('AI Evaluation Error:', error.message);
        return null;
    }
};

const evaluateBehavior = async (sessionId, jobRole = "Software Engineer") => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/evaluate-behavior`, {
            session_id: sessionId,
            job_role: jobRole
        });
        return response.data;
    } catch (error) {
        console.error('AI Behavior Evaluation Error:', error.message);
        return null;
    }
};

module.exports = {
    analyzeFrame,
    evaluateAnswer,
    evaluateBehavior
};
