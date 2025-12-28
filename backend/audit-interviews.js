const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Interview = require('./models/Interview');
const User = require('./models/User');

dotenv.config();

const auditInterviews = async () => {
    try {
        await connectDB();

        const interviews = await Interview.find({}).populate('interviewer', 'name email');
        console.log('AUDIT_START');
        interviews.forEach(i => {
            console.log(`ST:${i.status}|EM:${i.interviewer?.email}`);
        });
        console.log('AUDIT_END');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

auditInterviews();
