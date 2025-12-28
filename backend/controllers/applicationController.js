const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Candidate
const applyForJob = async (req, res) => {
    const { jobId, cvUrl } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const existingApplication = await Application.findOne({
            candidate: req.user._id,
            job: jobId
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        const application = await Application.create({
            candidate: req.user._id,
            job: jobId,
            cvUrl,
            status: 'applied'
        });

        // Increment applicant count
        job.applicantsCount = job.applicantsCount + 1;
        await job.save();

        // Create notification for candidate
        await Notification.create({
            user: req.user._id,
            onModel: 'Candidate',
            title: 'Application Submitted',
            message: `You have successfully applied for ${job.title}.`,
            type: 'success',
            link: '/candidate/applications'
        });

        res.status(201).json(application);
    } catch (error) {
        console.error('Error in applyForJob:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get current user's applications
// @route   GET /api/applications/my
// @access  Private/Candidate
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ candidate: req.user._id })
            .populate('job', 'title department status');
        res.json(applications);
    } catch (error) {
        console.error('[GET_MY_APPS_ERROR]', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get applications for a specific job (Admin/Interviewer)
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin/Interviewer
const getJobApplications = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate('candidate', 'name email');
        res.json(applications);
    } catch (error) {
        console.error('[GET_JOB_APPS_ERROR]', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin/Interviewer
const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const application = await Application.findById(req.params.id);

        if (application) {
            application.status = status;
            const updatedApplication = await application.save();

            // Notify candidate about status update
            const job = await Job.findById(application.job);
            await Notification.create({
                user: application.candidate,
                onModel: 'Candidate',
                title: 'Application Update',
                message: `Your application for ${job?.title || 'a position'} has been updated to "${status}".`,
                type: 'info',
                link: '/candidate/applications'
            });

            res.json(updatedApplication);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all pending applications (Admin/Interviewer)
// @route   GET /api/applications
// @access  Private/Admin/Interviewer
const getApplications = async (req, res) => {
    try {
        // Fetch ALL applications
        const applications = await Application.find({})
            .populate('candidate', 'name email phone avatar resumeUrl')
            .populate('job', 'title department company location')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    applyForJob,
    getMyApplications,
    getJobApplications,
    getApplications,
    updateApplicationStatus
};
