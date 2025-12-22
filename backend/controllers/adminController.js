const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const User = require('../models/User');

// @desc    Get System Stats for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const [
            totalInterviews,
            totalCandidates,
            totalJobs,
            completedInterviews
        ] = await Promise.all([
            Interview.countDocuments(),
            User.countDocuments({ role: 'candidate' }),
            Job.countDocuments({ status: 'active' }),
            Interview.find({ status: 'completed' }).populate('aiAnalysis')
        ]);

        // Calculate average AI score from completed interviews
        const avgScore = completedInterviews.length > 0
            ? Math.round(
                completedInterviews.reduce((sum, interview) => {
                    const score = interview.aiAnalysis?.overallScore || 0;
                    return sum + score;
                }, 0) / completedInterviews.length
            )
            : 0;

        // Weekly interviews (last 7 days)
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weeklyInterviews = await Interview.countDocuments({
            createdAt: { $gte: weekStart }
        });

        // Monthly growth calculation
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 1);
        const lastMonthCandidates = await User.countDocuments({
            role: 'candidate',
            createdAt: { $lt: monthStart }
        });
        const monthlyGrowth = lastMonthCandidates > 0
            ? Math.round(((totalCandidates - lastMonthCandidates) / lastMonthCandidates) * 100)
            : 0;

        res.json({
            interviews: totalInterviews,
            candidates: totalCandidates,
            jobs: totalJobs,
            avgScore,
            weeklyInterviews,
            monthlyGrowth
        });
    } catch (error) {
        console.error('Admin stats error FULL DETAILS:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;

        const query = {};
        if (role && role !== 'all') query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -activeSessions')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        // Validation
        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            role,
            password, // Will be hashed by pre-save hook
            status: 'active'
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { name, email, role, status } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, status },
            { new: true, runValidators: true }
        ).select('-password -activeSessions');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all applications with filters
// @route   GET /api/admin/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
    try {
        const { status, search, startDate, endDate } = req.query;

        const query = {};
        if (status && status !== 'all') query.status = status;
        if (startDate || endDate) {
            query.appliedAt = {};
            if (startDate) query.appliedAt.$gte = new Date(startDate);
            if (endDate) query.appliedAt.$lte = new Date(endDate);
        }

        const applications = await Application.find(query)
            .populate('candidate', 'name email')
            .populate('job', 'title department')
            .sort({ appliedAt: -1 });

        // Filter by search if provided
        let results = applications;
        if (search) {
            results = applications.filter(app =>
                app.candidate?.name.toLowerCase().includes(search.toLowerCase()) ||
                app.job?.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(results);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update application
// @route   PUT /api/admin/applications/:id
// @access  Private/Admin
const updateApplication = async (req, res) => {
    try {
        const { status } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
            .populate('candidate', 'name email')
            .populate('job', 'title');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all interviews with filters
// @route   GET /api/admin/interviews
// @access  Private/Admin
const getInterviews = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        const query = {};
        if (status && status !== 'all') query.status = status;
        if (startDate || endDate) {
            query.scheduledTime = {};
            if (startDate) query.scheduledTime.$gte = new Date(startDate);
            if (endDate) query.scheduledTime.$lte = new Date(endDate);
        }

        const interviews = await Interview.find(query)
            .populate('candidate', 'name email')
            .populate('interviewer', 'name')
            .populate('job', 'title')
            .populate('aiAnalysis')
            .sort({ scheduledTime: -1 });

        res.json(interviews);
    } catch (error) {
        console.error('Get interviews error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update interview
// @route   PUT /api/admin/interviews/:id
// @access  Private/Admin
const updateInterview = async (req, res) => {
    try {
        const { scheduledTime, status } = req.body;

        const updateData = {};
        if (scheduledTime) updateData.scheduledTime = scheduledTime;
        if (status) updateData.status = status;

        const interview = await Interview.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate('candidate', 'name email')
            .populate('interviewer', 'name')
            .populate('job', 'title');

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.json(interview);
    } catch (error) {
        console.error('Update interview error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete/Cancel interview
// @route   DELETE /api/admin/interviews/:id
// @access  Private/Admin
const deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findByIdAndDelete(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.json({ message: 'Interview cancelled successfully' });
    } catch (error) {
        console.error('Delete interview error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export data as CSV or PDF
// @route   GET /api/admin/export/:type
// @access  Private/Admin
const exportData = async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'csv' } = req.query;

        let data = [];
        let headers = [];
        let filename = '';

        switch (type) {
            case 'interviews':
                const interviews = await Interview.find()
                    .populate('candidate', 'name email')
                    .populate('interviewer', 'name')
                    .populate('job', 'title')
                    .populate('aiAnalysis')
                    .sort({ scheduledTime: -1 });

                headers = ['Date', 'Candidate', 'Email', 'Position', 'Interviewer', 'Status', 'Score'];
                data = interviews.map(i => [
                    new Date(i.scheduledTime).toLocaleDateString(),
                    i.candidate?.name || 'N/A',
                    i.candidate?.email || 'N/A',
                    i.job?.title || 'N/A',
                    i.interviewer?.name || 'Not Assigned',
                    i.status,
                    i.aiAnalysis?.overallScore || 'N/A'
                ]);
                filename = 'interviews';
                break;

            case 'candidates':
                const candidates = await User.find({ role: 'candidate' })
                    .select('name email createdAt skills')
                    .sort({ createdAt: -1 });

                headers = ['Name', 'Email', 'Joined Date', 'Skills', 'Status'];
                data = candidates.map(c => [
                    c.name,
                    c.email,
                    new Date(c.createdAt).toLocaleDateString(),
                    c.skills?.join(', ') || 'None',
                    c.status || 'active'
                ]);
                filename = 'candidates';
                break;

            case 'applications':
                const applications = await Application.find()
                    .populate('candidate', 'name email')
                    .populate('job', 'title')
                    .sort({ appliedAt: -1 });

                headers = ['Date', 'Candidate', 'Email', 'Position', 'Status', 'Score'];
                data = applications.map(a => [
                    new Date(a.appliedAt).toLocaleDateString(),
                    a.candidate?.name || 'N/A',
                    a.candidate?.email || 'N/A',
                    a.job?.title || 'N/A',
                    a.status,
                    Math.round(a.rankingScore || 0)
                ]);
                filename = 'applications';
                break;

            default:
                return res.status(400).json({ message: 'Invalid export type' });
        }

        if (format === 'csv') {
            // Generate CSV
            const csv = [
                headers.join(','),
                ...data.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } else {
            // For PDF, return JSON for now (can be enhanced with PDF library)
            res.json({
                message: 'PDF export coming soon. Please use CSV for now.',
                data: { headers, rows: data }
            });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAdminStats,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getApplications,
    updateApplication,
    getInterviews,
    updateInterview,
    deleteInterview,
    exportData
};
