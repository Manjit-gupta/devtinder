const nodemailer = require('nodemailer');

/**
 * Creates and configures the Nodemailer transporter.
 */
const createTransporter = async () => {
    // If user provided custom SMTP creds in .env, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback for development/testing: auto-generate Ethereal credentials
    // These emails will not be sent to real inboxes, but you can view them via the logged URL
    const testAccount = await nodemailer.createTestAccount();
    console.log("No SMTP details found in .env. Falling back to Ethereal Mail...");
    
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

/**
 * Send an email
 * @param {Object} options Options containing { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = await createTransporter();
        
        const info = await transporter.sendMail({
            from: '"DevTinder Network" <no-reply@devtinder.com>',
            to,
            subject,
            html,
        });

        console.log(`Mail sent successfully to ${to}`);
        
        // If using ethereal, Nodemailer provides a direct URL to preview the email
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`Preview Email URL: ${previewUrl}`);
        }
        
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendEmail };
