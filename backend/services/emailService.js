const nodemailer = require('nodemailer');

// Use environment variables for credentials in production
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'mock_user@gmail.com',
        pass: process.env.EMAIL_PASS || 'mock_pass'
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER) {
            console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
            return true;
        }

        const info = await transporter.sendMail({
            from: '"InView AI" <no-reply@inviewai.com>',
            to,
            subject,
            html
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Email Error:", error);
        return false;
    }
};

const sendWelcomeEmail = async (user) => {
    const subject = "Welcome to InView AI - Your Interview Platform";
    const html = \`
        <h1>Welcome, \${user.name}!</h1>
        <p>Your account has been successfully created. You can now login to apply for jobs or manage interviews.</p>
        <p>Role: <strong>\${user.role}</strong></p>
    \`;
    return sendEmail(user.email, subject, html);
};

const sendInterviewInvite = async (candidate, interviewInfo) => {
    const subject = "Interview Scheduled: " + interviewInfo.jobTitle;
    const html = \`
        <h1>Good news, \${candidate.name}!</h1>
        <p>You have been scheduled for an interview for the <strong>\${interviewInfo.jobTitle}</strong> position.</p>
        <p><strong>Date:</strong> \${new Date(interviewInfo.date).toLocaleString()}</p>
        <p><a href="\${process.env.CLIENT_URL}/candidate/interviews">Click here to view details</a></p>
    \`;
    return sendEmail(candidate.email, subject, html);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendInterviewInvite
};
