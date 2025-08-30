# Complete Email Verification Setup

## Option 1: EmailJS (Recommended - No Backend Required)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for free account
3. Verify your email

### Step 2: Add Email Service
1. Go to "Email Services" in dashboard
2. Click "Add New Service"
3. Choose "Gmail" 
4. Set Service ID: `service_flightfinder`
5. Connect your Gmail account

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Set Template ID: `template_verification`
4. Use this template:

```
Subject: FlightFinder - Email Verification Code

Hello,

Welcome to FlightFinder! 

Your email verification code is: {{verification_code}}

Please enter this code in the FlightFinder app to verify your email address.

This code will expire in 10 minutes for security reasons.

If you didn't request this code, please ignore this email.

Best regards,
The FlightFinder Team
```

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your Public Key
3. Replace `user_flightfinder2024` in `auth.html` with your actual key

## Option 2: Backend Email Service (Alternative)

### Step 1: Setup Gmail App Password
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy the 16-character password

### Step 2: Configure Environment
1. Copy `.env.example` to `.env`
2. Update with your credentials:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Step 3: Start Email Server
```bash
npm run email
```

## Testing

1. Open FlightFinder app
2. Try to sign up with your real email
3. Check your email for verification code
4. Enter code to complete verification

## Current Status
- ✅ EmailJS integration configured
- ✅ Backend email service ready
- ✅ Dual fallback system implemented
- ✅ Professional email templates
- ✅ Error handling and retry logic

The app will try EmailJS first, then fallback to backend service if needed.
