// EmailJS Setup Script
// Run this in browser console after setting up EmailJS account

// 1. Go to https://www.emailjs.com/ and create account
// 2. Add Gmail service with ID: service_flightfinder
// 3. Create template with ID: template_verification
// 4. Get your public key and update auth.html

const emailjsConfig = {
    serviceId: 'service_flightfinder',
    templateId: 'template_verification',
    publicKey: 'user_flightfinder2024'
};

// Template content for EmailJS:
const emailTemplate = `
Subject: FlightFinder - Email Verification Code

Hello,

Welcome to FlightFinder! 

Your email verification code is: {{verification_code}}

Please enter this code in the FlightFinder app to verify your email address.

This code will expire in 10 minutes for security reasons.

If you didn't request this code, please ignore this email.

Best regards,
The FlightFinder Team

---
This is an automated message from FlightFinder.
`;

console.log('EmailJS Configuration:');
console.log('Service ID:', emailjsConfig.serviceId);
console.log('Template ID:', emailjsConfig.templateId);
console.log('Public Key:', emailjsConfig.publicKey);
console.log('\nTemplate Content:');
console.log(emailTemplate);

// Test function
async function testEmailService(testEmail) {
    try {
        const templateParams = {
            to_email: testEmail,
            verification_code: '123456',
            app_name: 'FlightFinder',
            user_email: testEmail
        };
        
        const response = await emailjs.send(
            emailjsConfig.serviceId, 
            emailjsConfig.templateId, 
            templateParams
        );
        
        console.log('✅ Email test successful:', response);
        return true;
    } catch (error) {
        console.error('❌ Email test failed:', error);
        return false;
    }
}

// Export for testing
window.testFlightFinderEmail = testEmailService;
