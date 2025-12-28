const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const targetRole = role || 'candidate';

        let Model;
        if (targetRole === 'candidate') Model = Candidate;
        else if (targetRole === 'interviewer') Model = Interviewer;
        else if (targetRole === 'admin') Model = Admin;
        else return res.status(400).json({ message: 'Invalid role specified' });

        const userExists = await Model.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists in this role' });
        }

        const user = await Model.create({
            name,
            email,
            password,
            role: targetRole
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);

        // 1. Check Hidden Admin (Env) logic - Creates an Admin doc if missing
        if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
            if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
                let adminUser = await Admin.findOne({ email });

                if (!adminUser) {
                    adminUser = await Admin.create({
                        name: 'Super Admin',
                        email: email,
                        password: password,
                        role: 'admin'
                    });
                }
                return res.json({
                    _id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: adminUser.role,
                    token: generateToken(adminUser._id),
                });
            }
        }

        // 2. Search in Collections strategies
        // Priority: Admin -> Interviewer -> Candidate
        let user = await Admin.findOne({ email });
        let role = 'admin';

        if (!user) {
            user = await Interviewer.findOne({ email });
            role = 'interviewer';
        }

        if (!user) {
            user = await Candidate.findOne({ email });
            role = 'candidate';
        }

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // role field from model
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ message: 'Server Error during Login', error: error.message });
    }
};

module.exports = { registerUser, loginUser };
