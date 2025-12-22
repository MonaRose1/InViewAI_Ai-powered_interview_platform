const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixInterviewer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');

        const user = await User.findOne({ email: 'interviewchecker@gmail.com' });
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
