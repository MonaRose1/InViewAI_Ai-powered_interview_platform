const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Interviewer = require('./models/Interviewer');

dotenv.config();

const fixInterviewer = async () => {
    try {
        await connectDB();

        const user = await Interviewer.findOne({ email: 'interviewchecker@gmail.com' });
        if (user) {
            console.log('USER_FOUND:', JSON.stringify(user));
            if (user.role !== 'interviewer') {
                user.role = 'interviewer';
                await user.save();
                console.log('ROLE_UPDATED_TO_INTERVIEWER');
            }
        } else {
            console.log('USER_NOT_FOUND');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixInterviewer();
