const express = require('express');
const path = require('path');

const app = express();
const DEMO_PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Demo mode - serve files without database
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

// Start demo server
app.listen(DEMO_PORT, () => {
    console.log(`🎭 FlightFinder DEMO running on http://localhost:${DEMO_PORT}`);
    console.log(`📧 Email verification codes will show in browser console`);
    console.log(`🔧 No database required - perfect for testing`);
});
