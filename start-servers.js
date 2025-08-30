const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FlightFinder servers...\n');

// Start main server
const mainServer = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

// Start email server
const emailServer = spawn('node', ['email-server.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

console.log('✅ Main server started on port 3000');
console.log('✅ Email server started on port 3001');
console.log('\n📧 Make sure to configure your email credentials in .env file');
console.log('🌐 Open http://localhost:3000 in your browser\n');

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    mainServer.kill();
    emailServer.kill();
    process.exit();
});

mainServer.on('close', (code) => {
    console.log(`Main server exited with code ${code}`);
});

emailServer.on('close', (code) => {
    console.log(`Email server exited with code ${code}`);
});
