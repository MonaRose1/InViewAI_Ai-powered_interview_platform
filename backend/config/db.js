const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer', {
            serverSelectionTimeoutMS: 5000, // Wait 5 seconds instead of 30
            connectTimeoutMS: 10000,
        });
        console.log(`[DATABASE] Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('[DATABASE] Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
