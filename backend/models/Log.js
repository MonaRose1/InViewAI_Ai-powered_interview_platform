const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'REGISTER', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'SCHEDULE']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: false,
        enum: ['Candidate', 'Interviewer', 'Admin']
    },
    role: {
        type: String, // 'admin', 'interviewer', 'candidate'
        required: false
    },
    resource: {
        type: String, // 'Job', 'Interview', 'Application'
        required: true
    },
    details: {
        type: Object, // Flexible JSON for metadata
        default: {}
    },
    ip: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', LogSchema);
