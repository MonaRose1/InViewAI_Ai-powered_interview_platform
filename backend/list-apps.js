const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Application = require('./models/Application');
const Candidate = require('./models/Candidate');
const Job = require('./models/Job');

dotenv.config();

const listApps = async () => {
    try {
        await connectDB();
        const apps = await Application.find({}).populate('candidate').populate('job');
        console.log('ALL_APPS:', JSON.stringify(apps));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listApps();
