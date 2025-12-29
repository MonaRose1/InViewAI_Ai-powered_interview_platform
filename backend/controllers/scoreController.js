const ManualScore = require('../models/ManualScore');
const Interview = require('../models/Interview');
const AIResult = require('../models/AIResult');

// @desc    Submit manual score for an interview
// @route   POST /api/scores
// @access  Private/Interviewer
const submitManualScore = async (req, res) => {
    const { interviewId, technical, communication, problemSolving, comments } = req.body;

    try {
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Create Manual Score
        const manualScore = await ManualScore.create({
            interview: interviewId,
            interviewer: req.user._id,
            technicalScore: technical,
            communicationScore: communication,
            problemSolvingScore: problemSolving,
            comments
        });

        // Update Interview with Manual Score Ref
        interview.manualScore = manualScore._id;

        // Check for AI Result to calculate Final Score
        // Weightage: 60% Manual, 40% AI (Simple logic for now)
        const aiResult = await AIResult.findOne({ interview: interviewId });

        let finalScore = 0;
        const manualAvg = (Number(technical) + Number(communication) + Number(problemSolving)) / 3;

        if (aiResult) {
            // Assuming AI Confidence is a score 0-100
            const aiScore = aiResult.overallConfidence || 0;
            finalScore = (manualAvg * 0.6) + (aiScore * 0.4);

            // Link AI Result if not already
            interview.aiResult = aiResult._id;
        } else {
            // Only manual score available needed for now
            finalScore = manualAvg;
        }

        interview.score = Math.round(finalScore);
        interview.status = 'completed';
        await interview.save();

        // Propagation to Application for Rankings
        if (interview.application) {
            const Application = require('../models/Application');
            const { updateJobRankings } = require('../services/rankingService');

            // Re-fetch AI result to be 100% sure we have the latest after background processing
            const latestAi = await AIResult.findOne({ interview: interviewId });

            await Application.findByIdAndUpdate(interview.application, {
                'scoreBreakdown.manualScore': Math.round(manualAvg),
                'scoreBreakdown.aiScore': latestAi ? Math.round(latestAi.overallConfidence) : 0,
                rankingScore: interview.score
            });

            // Trigger re-ranking for this job to ensure everything is sorted
            if (interview.job) {
                await updateJobRankings(interview.job);
            }
        }

        res.status(201).json({ manualScore, finalScore: interview.score });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get score details for an interview
// @route   GET /api/scores/:interviewId
// @access  Private (Admin/Interviewer)
const getInterviewScore = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.interviewId)
            .populate('manualScore')
            .populate('aiResult');

        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        res.json({
            finalScore: interview.score,
            manual: interview.manualScore,
            ai: interview.aiResult
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitManualScore,
    getInterviewScore
};
