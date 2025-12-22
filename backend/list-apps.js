const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Application = require('./models/Application');
const User = require('./models/User');
const Job = require('./models/Job');

dotenv.config();

const listApps = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');
        const apps = await Application.find({}).populate('candidate').populate('job');
        console.log('ALL_APPS:', JSON.stringify(apps));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listApps();
