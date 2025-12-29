const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { generateInterviewReport } = require('../services/reportService');

// @desc    Get all interviews assigned to the current interviewer
// @route   GET /api/interviews
// @access  Private/Interviewer
const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ interviewer: req.user._id })
            .populate('candidate', 'name email')
            .populate({
                path: 'application',
                populate: {
                    path: 'job',
                    select: 'title department'
                }
            })
            .sort({ scheduledTime: 1 });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all interviews for the current candidate
// @route   GET /api/interviews/candidate
// @access  Private/Candidate
const getCandidateInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ candidate: req.user._id })
            .populate('interviewer', 'name email')
            .populate({
                path: 'application',
                populate: {
                    path: 'job',
                    select: 'title department'
                }
            })
            .sort({ scheduledTime: 1 });
        res.json(interviews);
    } catch (error) {
        console.error('[GET_CANDIDATE_INTERVIEWS_ERROR]', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private/Interviewer/Admin
const getInterviewById = async (req, res) => {
    try {
        let interview = await Interview.findById(req.params.id)
            .populate('candidate', 'name email avatar')
            .populate('interviewer', 'name email')
            .populate('job', 'title department')
            .populate({
                path: 'application',
                populate: {
                    path: 'job',
                    select: 'title department description'
                }
            })
            .populate('aiResult')
            .populate('manualScore');

        // If not found by ID, try finding by application reference
        if (!interview) {
            interview = await Interview.findOne({ application: req.params.id })
                .populate('candidate', 'name email avatar')
                .populate('interviewer', 'name email')
                .populate('job', 'title department')
                .populate({
                    path: 'application',
                    populate: {
                        path: 'job',
                        select: 'title department description'
                    }
                })
                .populate('aiResult')
                .populate('manualScore');
        }

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update interview status
// @route   PUT /api/interviews/:id/status
// @access  Private/Interviewer/Admin
const updateInterviewStatus = async (req, res) => {
    const { status, metLink } = req.body;

    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.status = status || interview.status;
        if (metLink) interview.meetLink = metLink;

        const updatedInterview = await interview.save();

        // Also update application status if interview is completed
        if (status === 'completed' && interview.application) {
            await Application.findByIdAndUpdate(interview.application, { status: 'interviewed' });

            // Notify candidate
            await Notification.create({
                user: interview.candidate,
                onModel: 'Candidate',
                title: 'Interview Completed',
                message: 'Your interview has been completed. You can check the feedback soon.',
                type: 'success',
                link: '/candidate/status'
            });
        }

        res.json(updatedInterview);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Private/Admin/Interviewer
const createInterview = async (req, res) => {
    const { applicationId, scheduledTime } = req.body;

    try {
        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const interview = await Interview.create({
            application: applicationId,
            candidate: application.candidate,
            interviewer: req.user._id,
            job: application.job._id,
            scheduledTime,
            status: 'scheduled'
        });

        // Update application status
        application.status = 'interview_scheduled';
        await application.save();

        // Notify candidate
        await Notification.create({
            user: application.candidate,
            onModel: 'Candidate',
            title: 'Interview Scheduled',
            message: `An interview for ${application.job?.title || 'the position'} has been scheduled for ${new Date(scheduledTime).toLocaleString()}.`,
            type: 'info',
            link: '/candidate/status'
        });

        res.status(201).json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    End interview
// @route   POST /api/interviews/:id/end
// @access  Private/Interviewer/Admin
const endInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.status = 'completed';
        interview.endTime = Date.now();
        await interview.save();

        if (interview.application) {
            await Application.findByIdAndUpdate(interview.application, { status: 'interviewed' });
        }

        // Notify candidate
        await Notification.create({
            user: interview.candidate,
            onModel: 'Candidate',
            title: 'Interview Completed',
            message: 'Your interview session has ended.',
            type: 'success',
            link: '/candidate/status'
        });

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update interview notes
// @route   PUT /api/interviews/:id/notes
// @access  Private/Interviewer/Admin
const updateNotes = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.notes = req.body.notes || '';
        await interview.save();

        res.json({ message: 'Notes saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update interview questions (with answers/analysis)
// @route   PUT /api/interviews/:id/questions
// @access  Private/Interviewer/Admin
const updateInterviewQuestions = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.questions = req.body.questions || interview.questions;
        await interview.save();

        res.json({ message: 'Questions updated successfully', questions: interview.questions });
    } catch (error) {
        console.error('Update questions error:', error);
        res.status(500).json({ message: 'Failed to update questions' });
    }
};

// @desc    Download Interview Report PDF
// @route   GET /api/interviews/:id/report
// @access  Private/Interviewer/Admin
const getInterviewReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('candidate', 'name email')
            .populate('job', 'title')
            .populate('aiResult')
            .populate('manualScore');

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // --- CALCULATE INSIGHTS STEP-BY-STEP ---
        let confidenceLevel = 'Developing';
        const aiConf = interview.aiResult?.overallConfidence || 0;
        if (aiConf > 70) {
            confidenceLevel = 'High';
        } else if (aiConf > 40) {
            confidenceLevel = 'Moderate';
        }

        let nervousnessLevel = 'Low';
        const aiStress = interview.aiResult?.overallStress || 0;
        if (aiStress > 60) {
            nervousnessLevel = 'High';
        } else if (aiStress > 30) {
            nervousnessLevel = 'Moderate';
        }

        // Prepare data for report generator
        const reportData = {
            candidateName: interview.candidate?.name || 'Unknown',
            jobTitle: interview.job?.title || 'Unknown Position',
            aiScore: aiConf,
            codeScore: interview.manualScore?.technicalScore || 0,
            totalScore: interview.score || 0,
            insights: {
                confidence: confidenceLevel,
                nervousness: nervousnessLevel,
                eyeContact: 'Checked via behavioral history'
            },
            codeSubmission: interview.notes || 'No specific technical notes recorded.'
        };

        generateInterviewReport(reportData, res);
    } catch (error) {
        console.error('[REPORT_GEN_ERROR]', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};

module.exports = {
    getMyInterviews,
    getInterviewById,
    getCandidateInterviews,
    createInterview,
    updateInterviewStatus,
    endInterview,
    updateNotes,
    updateInterviewQuestions,
    getInterviewReport
};
