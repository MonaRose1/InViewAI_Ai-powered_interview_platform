const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');

        // Find an interviewer
        const interviewer = await User.findOne({ role: 'interviewer' });
        if (!interviewer) {
            console.log('No interviewer found. Please register an interviewer first.');
            process.exit(1);
        }

        // Find or create a candidate
        let candidate = await User.findOne({ role: 'candidate' });
        if (!candidate) {
            candidate = await User.create({
                name: 'Test Candidate',
                email: 'candidate@test.com',
                password: 'password123',
                role: 'candidate'
            });
        }

        // Find or create a job
        let job = await Job.findOne();
        if (!job) {
            job = await Job.create({
                title: 'Senior Software Engineer',
                department: 'Engineering',
                description: 'We are looking for a skilled React developer.',
                requirements: ['React', 'Node.js', 'MongoDB'],
                status: 'open'
            });
        }

        // Create a pending application
        const existingApp = await Application.findOne({ candidate: candidate._id, job: job._id });
        if (!existingApp) {
            await Application.create({
                candidate: candidate._id,
                job: job._id,
                status: 'applied',
                appliedAt: new Date()
            });
            console.log('Sample application created!');
        } else {
            console.log('Sample application already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
