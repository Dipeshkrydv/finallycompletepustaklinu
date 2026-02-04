import nodemailer from 'nodemailer';

const emailUser = process.env.GMAIL_USER;
const emailPass = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

export const sendEmail = async (to, subject, text, html) => {
    if (!emailUser || !emailPass) {
        console.error('[EMAIL ERROR] Missing GMAIL_USER or GMAIL_PASS/GMAIL_APP_PASSWORD in .env. Email will NOT send.');
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
