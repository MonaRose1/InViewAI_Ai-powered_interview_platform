const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer');
        console.log('Connected.');

        // 1. Create User
        const userEmail = `debug_${Date.now()}@test.com`;
        console.log(`Creating user ${userEmail}...`);
        const user = await User.create({
            name: 'Debug User',
            email: userEmail,
            password: 'password123',
            role: 'candidate'
        });
        console.log('User created:', user._id);

        // 2. Create Job
        console.log('Creating job...');
        const job = await Job.create({
            title: 'Debug Job',
            description: 'Test Description',
            requirements: ['Req1'],
            createdBy: user._id
        });
        console.log('Job created:', job._id);

        // 3. Simulate Apply
        console.log('Attempting to apply...');
        // Logic from controller
        const existingApplication = await Application.findOne({
            candidate: user._id,
            job: job._id
        });

        if (existingApplication) {
            console.log('Application already exists (unexpected)');
        }

        const application = await Application.create({
            candidate: user._id,
            job: job._id,
            cvUrl: 'http://test.com/cv.pdf',
            status: 'applied'
        });
        console.log('Application created:', application._id);

        // Increment applicant count
        console.log('Incrementing job applicant count...');
        job.applicantsCount = job.applicantsCount + 1;
        await job.save();
        console.log('Job saved.');

        console.log('SUCCESS: Flow completed without error.');

    } catch (error) {
        console.error('FAILURE: An error occurred:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

run();
