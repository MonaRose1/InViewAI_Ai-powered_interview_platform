const Job = require('../models/Job');
const Application = require('../models/Application');

const calculateScore = (aiScore, manualScore, config) => {
    // Normalize weights to 0-1 range
    const totalWeight = config.aiWeight + config.manualWeight;
    if (totalWeight === 0) return 0;

    const normalizedAiWeight = config.aiWeight / totalWeight;
    const normalizedManualWeight = config.manualWeight / totalWeight;

    // Calculate weighted score
    const weightedScore = (aiScore * normalizedAiWeight) + (manualScore * normalizedManualWeight);
    return Math.round(weightedScore * 10) / 10; // Round to 1 decimal
};

const updateJobRankings = async (jobId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) throw new Error('Job not found');

        const applications = await Application.find({ job: jobId });

        const updates = applications.map(app => {
            // Mocking scores for demo if they don't exist
            // In a real scenario, these would come from the Interview/Score models
            // For now, we'll assume they are stored in scoreBreakdown or generate randoms for existing data
            const currentAi = app.scoreBreakdown?.aiScore || Math.floor(Math.random() * 40) + 60; // 60-100
            const currentManual = app.scoreBreakdown?.manualScore || Math.floor(Math.random() * 40) + 60; // 60-100

            const newScore = calculateScore(currentAi, currentManual, job.rankingConfig);

            return {
                updateOne: {
                    filter: { _id: app._id },
                    update: {
                        rankingScore: newScore,
                        scoreBreakdown: {
                            aiScore: currentAi,
                            manualScore: currentManual
                        }
                    }
                }
            };
        });

        if (updates.length > 0) {
            await Application.bulkWrite(updates);
        }

        return { success: true, count: updates.length };

    } catch (error) {
        console.error('Ranking Update Failed:', error);
        throw error;
    }
};

module.exports = {
    calculateScore,
    updateJobRankings
};
