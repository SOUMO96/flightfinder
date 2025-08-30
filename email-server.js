const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Gmail transporter
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Send verification email
app.post('/send-verification', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code required' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || 'flightfinder@gmail.com',
            to: email,
            subject: 'FlightFinder - Email Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">FlightFinder Email Verification</h2>
                    <p>Hello,</p>
                    <p>Welcome to FlightFinder! Your email verification code is:</p>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${code}</h1>
                    </div>
                    <p>Please enter this code in the FlightFinder app to verify your email address.</p>
                    <p><strong>This code will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from FlightFinder.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Verification code sent successfully' });
        
    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Email server running on port ${PORT}`);
});
