import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Otp, User } from '@/models/index';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
        }

        // Generate 6 digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Upsert OTP
        const existingOtp = await Otp.findOne({ where: { email } });
        if (existingOtp) {
            await existingOtp.update({ otp, expiresAt });
        } else {
            await Otp.create({ email, otp, expiresAt });
        }

        // Configure Transporter (Use placeholders if env vars are missing, or log to console if in dev)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 465, // Force SSL
            secure: true, // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Pustaklinu" <no-reply@pustaklinu.com>',
                to: email,
                subject: 'Your Verification Code - Pustaklinu',
                text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
                html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Verify your email</h2>
                    <p>Welcome to Pustaklinu! Please use the following code to verify your email address:</p>
                    <h1 style="color: #d97706; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `,
            });
            return NextResponse.json({ message: 'OTP sent successfully' });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // STRICT MODE: No bypass
            return NextResponse.json({ error: 'Failed to send email. Google Auth Rejected.' }, { status: 500 });
        }

    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
