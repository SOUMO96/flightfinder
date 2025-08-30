const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'flightfinder_secret_key_2024';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'flightfinder_db'
};

let db;

async function initDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

// Encryption functions
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Admin middleware
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid admin token' });
        
        try {
            const [rows] = await db.execute('SELECT * FROM admin_users WHERE id = ?', [decoded.id]);
            if (rows.length === 0) {
                return res.status(403).json({ error: 'Admin not found' });
            }
            req.admin = decoded;
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Database error' });
        }
    });
}

// Routes

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        
        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Encrypt sensitive data
        const encryptedEmail = encrypt(email);
        const encryptedPhone = phone ? encrypt(phone) : null;

        // Insert user
        const [result] = await db.execute(
            'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
            [encryptedEmail, passwordHash, firstName, lastName, encryptedPhone]
        );

        // Generate token
        const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            success: true, 
            token, 
            user: { id: result.insertId, email, firstName, lastName } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user (need to decrypt emails to compare)
        const [users] = await db.execute('SELECT * FROM users WHERE is_active = TRUE');
        let user = null;
        
        for (const u of users) {
            try {
                const decryptedEmail = decrypt(u.email);
                if (decryptedEmail === email) {
                    user = u;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            // Increment login attempts
            await db.execute('UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?', [user.id]);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Reset login attempts and update last login
        await db.execute(
            'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE id = ?', 
            [user.id]
        );

        // Generate token
        const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                email, 
                firstName: user.first_name, 
                lastName: user.last_name 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Save search history
app.post('/api/search-history', authenticateToken, async (req, res) => {
    try {
        const { departure, arrival, date } = req.body;
        
        await db.execute(
            'INSERT INTO search_history (user_id, departure_city, arrival_city, departure_date) VALUES (?, ?, ?, ?)',
            [req.user.id, departure, arrival, date]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Search history error:', error);
        res.status(500).json({ error: 'Failed to save search history' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await db.execute('SELECT * FROM admin_users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid admin credentials' });
        }

        const admin = rows[0];
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid admin credentials' });
        }

        await db.execute('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id]);

        const token = jwt.sign({ id: admin.id, username, isAdmin: true }, JWT_SECRET, { expiresIn: '8h' });

        res.json({ success: true, token, admin: { id: admin.id, username, email: admin.email } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Admin login failed' });
    }
});

// Admin dashboard - get stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
        const [searchCount] = await db.execute('SELECT COUNT(*) as count FROM search_history WHERE search_timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        const [recentUsers] = await db.execute('SELECT first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 10');

        res.json({
            totalUsers: userCount[0].count,
            monthlySearches: searchCount[0].count,
            recentUsers: recentUsers
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Serve main site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

// Start server
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 FlightFinder Server running on http://localhost:${PORT}`);
        console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
        console.log(`🔒 Database: Encrypted user data storage enabled`);
    });
}

startServer();
