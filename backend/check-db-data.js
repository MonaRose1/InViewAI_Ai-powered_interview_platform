const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');

        const data = {
            users: await User.countDocuments(),
            jobs: await Job.countDocuments(),
            apps: await Application.countDocuments(),
            interviews: await Interview.countDocuments()
        };
        console.log('COUNTS:', JSON.stringify(data));

        const interviewers = await User.find({ role: 'interviewer' }, 'name email');
        console.log('INTERVIEWERS:', JSON.stringify(interviewers));

        const appliedApps = await Application.find({ status: 'applied' });
        console.log('PENDING_APPS:', appliedApps.length);

        const interviews = await Interview.find({});
        console.log('INTERVIEWS:', JSON.stringify(interviews));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
