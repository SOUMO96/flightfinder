# Email Service Setup - EmailJS

## Quick Setup (5 minutes)

### 1. Create EmailJS Account
- Go to [EmailJS.com](https://www.emailjs.com/)
- Sign up for free account

### 2. Create Email Service
- Add Gmail service in EmailJS dashboard
- Connect your Gmail account

### 3. Create Email Template
- Template ID: `template_verification`
- Subject: `FlightFinder - Verification Code`
- Content:
```
Hello,

Your FlightFinder verification code is: {{verification_code}}

This code will expire in 10 minutes.

Best regards,
FlightFinder Team
```

### 4. Get Your Keys
- Copy your Public Key from EmailJS dashboard
- Copy your Service ID (should be `service_flightfinder`)

### 5. Update Code
Replace in `auth.html`:
```javascript
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with actual key
```

Replace in `auth.js`:
```javascript
await emailjs.send('service_flightfinder', 'template_verification', templateParams, 'YOUR_PUBLIC_KEY');
```

## Alternative: Nodemailer (Backend Required)

If you prefer server-side email:

```javascript
// In server.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
});

app.post('/send-verification', async (req, res) => {
    const { email, code } = req.body;
    
    await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'FlightFinder - Verification Code',
        text: `Your verification code is: ${code}`
    });
    
    res.json({ success: true });
});
```

## Current Status
- ✅ EmailJS integration added
- ⏳ Requires EmailJS account setup
- ⏳ Need to replace placeholder keys
