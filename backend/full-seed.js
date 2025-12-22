const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const bcrypt = require('bcryptjs');

dotenv.config();

const fullSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');

        // 1. Ensure Interviewer exists
        let interviewer = await User.findOne({ role: 'interviewer' });
        if (!interviewer) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            interviewer = await User.create({
                name: 'Interviewer One',
                email: 'interviewer@test.com',
                password: hashedPassword,
                role: 'interviewer'
            });
            console.log('Interviewer created: interviewer@test.com / password123');
        }

        // 2. Ensure Candidate exists
        let candidate = await User.findOne({ role: 'candidate' });
        if (!candidate) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            candidate = await User.create({
                name: 'John Doe',
                email: 'candidate@test.com',
                password: hashedPassword,
                role: 'candidate'
            });
            console.log('Candidate created: candidate@test.com / password123');
        }

        // 3. Ensure Job exists
        let job = await Job.findOne();
        if (!job) {
            job = await Job.create({
                title: 'Full Stack Developer',
                department: 'Engineering',
                description: 'Join our team to build amazing AI tools.',
                requirements: ['React', 'Node.js'],
                status: 'open'
            });
            console.log('Job created');
        }

        // 4. Create Application
        let app = await Application.findOne({ candidate: candidate._id, job: job._id });
        if (!app) {
            app = await Application.create({
                candidate: candidate._id,
                job: job._id,
                status: 'applied',
                appliedAt: new Date()
            });
            console.log('Application created');
        }

        // 5. Create Interview
        const existingInterview = await Interview.findOne({ application: app._id });
        if (!existingInterview) {
            await Interview.create({
                application: app._id,
                candidate: candidate._id,
                interviewer: interviewer._id,
                job: job._id,
                scheduledTime: new Date(Date.now() + 3600000), // In 1 hour
                status: 'scheduled'
            });
            app.status = 'interview_scheduled';
            await app.save();
            console.log('Scheduled meeting created!');
        } else {
            console.log('Meeting already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fullSeed();
