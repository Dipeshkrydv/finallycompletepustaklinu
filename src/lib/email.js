import nodemailer from 'nodemailer';

const emailUser = process.env.GMAIL_USER || 'toshbritech624@gmail.com'; // Default per user request
const emailPass = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

export const sendEmail = async (to, subject, text, html) => {
    if (!emailPass) {
        console.error('[EMAIL ERROR] No GMAIL_PASS or GMAIL_APP_PASSWORD found in .env. Email will NOT send.');
        // Don't crash, just log and return false so Automation Controller logs it as FAILED
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Pustaklinu Admin" <${emailUser}>`,
            to,
            subject,
            text, // plain text body
            html: html || text.replace(/\n/g, '<br/>'), // html body
        });
        console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return false;
    }
};
