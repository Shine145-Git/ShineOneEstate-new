const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT,
    secure: false, // Brevo uses STARTTLS (port 587)
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

// Send email utility
async function sendEmail(to, subject = '', text = '', html = '') {
    if (!to) {
        console.error('❌ No recipient provided for email. Skipping send.');
        return;
    }

    try {
        console.log(`\n--- Sending Email ---\nTo: ${to}\nSubject: ${subject}\nText: ${text}\nHTML: ${html}\n-------------------`);

        const info = await transporter.sendMail({
            from: `"Neo Urban" <${process.env.SENDER_EMAIL}>`,
            to,
            subject,
            text,
            html,
        });

        console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ Error sending email to ${to} with subject "${subject}":`, error.message);
    }
}

module.exports = sendEmail;
