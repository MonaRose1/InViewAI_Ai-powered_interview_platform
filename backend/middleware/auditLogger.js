const Log = require('../models/Log');

const auditLog = (action, resource) => async (req, res, next) => {
    // Capture original send to log response status if needed, 
    // but for now we just log the attempt/success.

    // We execute the log asynchronously so it doesn't block the request
    try {
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : 'guest';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        await Log.create({
            action,
            user: userId,
            role: userRole,
            resource,
            details: {
                method: req.method,
                url: req.originalUrl,
                body: req.method !== 'GET' ? req.body : undefined,
                params: req.params,
                query: req.query
            },
            ip
        });
    } catch (error) {
        console.error("Audit Log Error:", error);
        // Do not block the request if logging fails
    }

    next();
};

module.exports = auditLog;
