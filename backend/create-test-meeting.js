const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');

dotenv.config();

const createTestMeeting = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');

        const interviewer = await User.findOne({ role: 'interviewer' });
        const app = await Application.findOne({ status: 'applied' }).populate('candidate job');

        if (!interviewer || !app) {
            console.log('MISSING_DATA: No interviewer or pending application found.');
            process.exit(1);
        }

        const interview = await Interview.create({
            application: app._id,
            candidate: app.candidate._id,
            interviewer: interviewer._id,
            job: app.job._id,
            scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
            status: 'scheduled'
        });

        app.status = 'interview_scheduled';
        await app.save();

        console.log('SUCCESS: Interview created for', interviewer.email);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createTestMeeting();
