const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002; // Changed to avoid conflict

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
🚀 FlightFinder Demo Server Started!

📱 Access the app at: http://localhost:${PORT}
🔐 Authentication: http://localhost:${PORT}/auth.html
✈️  Flight Search: http://localhost:${PORT}/app

📧 Email Service: Demo mode (codes shown in browser)
🔧 To enable real emails: npm run email (in separate terminal)

Ready to test! 🎉
    `);
});
