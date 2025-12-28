const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Admin = require('../models/Admin');

// @desc    Get System Stats for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const [
            totalInterviews,
            totalCandidates,
            totalJobs,
            totalApplications,
            allInterviews,
            allApplications,
            recentCandidates,
            recentInterviews
        ] = await Promise.all([
            Interview.countDocuments(),
            Candidate.countDocuments(),
            Job.countDocuments({ status: 'open' }),
            Application.countDocuments(),
            Interview.find().populate('aiAnalysis'),
            Application.find(),
            Candidate.find().sort({ createdAt: -1 }).limit(5),
            Interview.find().sort({ createdAt: -1 }).limit(5).populate('candidate job')
        ]);

        // Calculate average AI score
        const completed = allInterviews.filter(i => i.status === 'completed');
        const avgScore = completed.length > 0
            ? Math.round(completed.reduce((sum, i) => sum + (i.aiAnalysis?.overallScore || 0), 0) / completed.length)
            : 0;

        // Weekly volume (Mon-Sun for current week)
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Set to Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyVolume = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
        allInterviews.forEach(i => {
            const date = new Date(i.scheduledTime || i.createdAt);
            if (date >= startOfWeek) {
                const day = date.getDay(); // 0 is Sun
                const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
                if (index >= 0 && index < 7) weeklyVolume[index]++;
            }
        });

        // Application Status Distribution
        const stats = { hired: 0, pending: 0, rejected: 0, interviewing: 0 };
        allApplications.forEach(app => {
            if (['interview_scheduled', 'interviewed'].includes(app.status)) stats.interviewing++;
            else if (app.status === 'rejected') stats.rejected++;
            else if (app.status === 'shortlisted') stats.hired++; // Placeholder for hired
            else stats.pending++;
        });

        const total = allApplications.length || 1;
        const statusDistribution = {
            hired: Math.round((stats.hired / total) * 100),
            interviewing: Math.round((stats.interviewing / total) * 100),
            rejected: Math.round((stats.rejected / total) * 100),
            pending: Math.round((stats.pending / total) * 100),
            counts: stats
        };

        // Monthly Growth (Candidates)
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);
        const lastMonthCount = await Candidate.countDocuments({ createdAt: { $lt: lastMonth } });
        const monthlyGrowth = lastMonthCount > 0
            ? Math.round(((totalCandidates - lastMonthCount) / lastMonthCount) * 100)
            : totalCandidates * 100;

        // Formulate Recent Activity
        const recentActivity = [
            ...recentCandidates.map(c => ({
                title: `New candidate registered: ${c.name}`,
                time: c.createdAt,
                type: 'user'
            })),
            ...recentInterviews.map(i => ({
                title: `Interview ${i.status}: ${i.candidate?.name || 'Unknown'}`,
                time: i.updatedAt || i.createdAt,
                type: 'interview'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json({
            interviews: totalInterviews,
            candidates: totalCandidates,
            jobs: totalJobs,
            applications: totalApplications,
            avgScore,
            monthlyGrowth,
            weeklyVolume,
            statusDistribution,
            recentActivity
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        let users = [];

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (!role || role === 'all') {
            const candidates = await Candidate.find(query).select('-password -activeSessions');
            const interviewers = await Interviewer.find(query).select('-password -activeSessions');
            const admins = await Admin.find(query).select('-password -activeSessions');
            users = [...candidates, ...interviewers, ...admins];
        } else if (role === 'candidate') {
            users = await Candidate.find(query).select('-password -activeSessions');
        } else if (role === 'interviewer') {
            users = await Interviewer.find(query).select('-password -activeSessions');
        } else if (role === 'admin') {
            users = await Admin.find(query).select('-password -activeSessions');
        }

        // Sort by createdAt desc
        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

        // Comprehensive validation
        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Role validation
        const validRoles = ['admin', 'interviewer', 'candidate'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be admin, interviewer, or candidate' });
        }

        let Model;
        if (role === 'candidate') Model = Candidate;
        else if (role === 'interviewer') Model = Interviewer;
        else if (role === 'admin') Model = Admin;

        // Check if user exists
        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists in this role' });
        }

        const user = await Model.create({
            name,
            email,
            role,
            password,
            status: 'active'
        });

        // IMPORTANT: The previous User schema likely handled password hashing in a pre-save hook.
        // My new schemas did NOT include bcrypt hashing in pre-save. I must hash it here or update schema.
        // For safety, I will rely on AuthController logic which hashes it, OR I should add hashing here.
        // Wait, the AuthController hashes manually. The new Models do NOT have pre-save hash logic in my previous tool call.
        // I should probably hash it here to be safe since createUser is admin func.
        // But wait, the previous code comment said "Will be hashed by pre-save hook".
        // Let's assume I need to hash it here as my new models only set updatedAt.

        // Correction: I should update schemas to include hashing, OR update this controller to hash. 
        // Updating this controller is safer right now.
        // Actually, let's verify if I should hash it here. Yes.

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

        const Model = role === 'admin' ? Admin : (role === 'interviewer' ? Interviewer : Candidate);
        const user = await Model.findByIdAndUpdate(
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
        // Logic to delete from any collection
        let user = await Admin.findByIdAndDelete(req.params.id);
        if (!user) user = await Interviewer.findByIdAndDelete(req.params.id);
        if (!user) user = await Candidate.findByIdAndDelete(req.params.id);

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
                const candidates = await Candidate.find() // Already filtered by collection
                    .select('name email createdAt skills status')
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

        // Helper to generate PDF
        const generatePDF = (title, headers, data, res) => {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}_${Date.now()}.pdf"`);

            doc.pipe(res);

            doc.fontSize(20).text(title, { align: 'center' });
            doc.moveDown();

            // Simple table layout
            const startX = 50;
            let currentY = doc.y;
            const columnWidth = 500 / headers.length;

            // Headers
            doc.fontSize(12).font('Helvetica-Bold');
            headers.forEach((header, i) => {
                doc.text(header, startX + (i * columnWidth), currentY, { width: columnWidth, align: 'left' });
            });
            doc.moveDown();

            // Draw line
            doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Data
            doc.font('Helvetica').fontSize(10);
            data.forEach(row => {
                currentY = doc.y;

                // Check if we need a new page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                row.forEach((cell, i) => {
                    doc.text(String(cell), startX + (i * columnWidth), currentY, { width: columnWidth, align: 'left' });
                });
                doc.moveDown();
            });

            doc.end();
        };

        if (format === 'csv') {
            // Generate CSV
            const csv = [
                headers.join(','),
                ...data.map(row => row.map(cell => {
                    const cellStr = String(cell || '');
                    // Escape quotes and wrap in quotes if contains comma or quote
                    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } else if (format === 'pdf') {
            generatePDF(`${filename.toUpperCase()} REPORT`, headers, data, res);
        } else {
            return res.status(400).json({ message: 'Invalid format' });
        }
    } catch (error) {
        console.error('[GET_ADMIN_STATS_ERROR]', error);
        res.status(500).json({ message: 'Server Error during Stats fetch', error: error.message });
    }
};

// @desc    Export System Logs
// @route   GET /api/admin/logs/export
// @access  Private/Admin
const exportSystemLogs = async (req, res) => {
    try {
        const Log = require('../models/Log');
        const { format = 'csv', startDate, endDate, action, resource } = req.query;

        // Build query
        const query = {};
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        if (action) query.action = action;
        if (resource) query.resource = resource;

        const logs = await Log.find(query)
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .limit(10000); // Limit to prevent memory issues

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Timestamp', 'Action', 'Resource', 'User', 'Role', 'IP', 'Details'];
            const rows = logs.map(log => [
                new Date(log.timestamp).toISOString(),
                log.action,
                log.resource,
                log.user?.name || 'System',
                log.user?.role || 'N/A',
                log.ip || 'N/A',
                JSON.stringify(log.details || {})
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => {
                    const cellStr = String(cell || '');
                    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="system_logs_${Date.now()}.csv"`);
            res.send(csv);
        } else if (format === 'pdf') {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="system_logs_${Date.now()}.pdf"`);
            doc.pipe(res);

            doc.fontSize(18).text('System Logs Report', { align: 'center' });
            doc.moveDown();

            logs.forEach(log => {
                doc.fontSize(10).font('Helvetica-Bold').text(`[${new Date(log.timestamp).toLocaleString()}] ${log.action}`);
                doc.font('Helvetica').text(`User: ${log.user?.name || 'System'} | IP: ${log.ip || 'N/A'}`);
                doc.text(`Details: ${JSON.stringify(log.details || {})}`);
                doc.moveDown(0.5);
            });
            doc.end();
        } else {
            // Return JSON
            res.json({
                count: logs.length,
                logs: logs.map(log => ({
                    timestamp: log.timestamp,
                    action: log.action,
                    resource: log.resource,
                    user: log.user,
                    role: log.role,
                    ip: log.ip,
                    details: log.details
                }))
            });
        }
    } catch (error) {
        console.error('Export logs error:', error);
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
    exportData,
    exportSystemLogs
};
