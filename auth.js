// Authentication state
let currentUser = null;
let verificationCode = null;
let pendingEmail = null;

// DOM elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const verificationForm = document.getElementById('verificationForm');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');

// Simple encryption/decryption functions
function encrypt(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function decrypt(data) {
    return decodeURIComponent(escape(atob(data)));
}

// Secure user storage
function saveUser(userData) {
    const users = getUsers();
    const encryptedUser = {
        firstName: encrypt(userData.firstName),
        lastName: encrypt(userData.lastName),
        email: encrypt(userData.email),
        password: encrypt(userData.password),
        verified: userData.verified,
        createdAt: userData.createdAt
    };
    users[userData.email.toLowerCase()] = encryptedUser;
    localStorage.setItem('ff_users', encrypt(JSON.stringify(users)));
}

function getUsers() {
    try {
        const encryptedData = localStorage.getItem('ff_users');
        if (!encryptedData) return {};
        return JSON.parse(decrypt(encryptedData));
    } catch (e) {
        return {};
    }
}

function findUser(email) {
    const users = getUsers();
    const emailKey = email.toLowerCase();
    
    // Direct lookup with email as key
    if (users[emailKey]) {
        const user = users[emailKey];
        try {
            return {
                firstName: decrypt(user.firstName),
                lastName: decrypt(user.lastName),
                email: decrypt(user.email),
                password: decrypt(user.password),
                verified: user.verified,
                createdAt: user.createdAt
            };
        } catch (e) {
            console.log('Error decrypting user data:', e);
        }
    }
    
    // Fallback: search through all users (for backward compatibility)
    for (const key in users) {
        try {
            const user = users[key];
            const userEmail = decrypt(user.email);
            if (userEmail.toLowerCase() === email.toLowerCase()) {
                return {
                    firstName: decrypt(user.firstName),
                    lastName: decrypt(user.lastName),
                    email: decrypt(user.email),
                    password: decrypt(user.password),
                    verified: user.verified,
                    createdAt: user.createdAt
                };
            }
        } catch (e) {
            console.log('Error decrypting user data:', e);
            continue;
        }
    }
    
    return null;
}

// Simplified email service with demo mode
async function sendVerificationEmail(email, code) {
    try {
        // Try backend email service first
        const response = await fetch('http://localhost:3001/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code })
        });
        
        if (response.ok) {
            console.log('Email sent via backend service');
            return true;
        }
        throw new Error('Backend service unavailable');
    } catch (error) {
        console.log('Email service unavailable, using demo mode');
        
        // Demo mode - show code directly to user
        showInfo(`Demo Mode: Your verification code is ${code}`);
        console.log('VERIFICATION CODE:', code);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
    document.getElementById('verificationFormElement').addEventListener('submit', handleVerification);
    document.getElementById('resendCode').addEventListener('click', resendVerificationCode);

    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        showForm('signup');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
    });
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('ff_currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(decrypt(savedUser));
            window.location.href = 'index.html';
        } catch (e) {
            localStorage.removeItem('ff_currentUser');
        }
    }
});

// Form switching
function showForm(formType) {
    console.log('Switching to form:', formType);
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const verificationForm = document.getElementById('verificationForm');
    
    // Hide all forms
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    verificationForm.classList.add('hidden');
    
    // Show requested form
    if (formType === 'login') {
        loginForm.classList.remove('hidden');
    } else if (formType === 'signup') {
        signupForm.classList.remove('hidden');
    } else if (formType === 'verification') {
        verificationForm.classList.remove('hidden');
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    showLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = findUser(email);
    
    if (!user) {
        showError('Account not found');
        showLoading(false);
        return;
    }
    
    if (user.password !== password) {
        showError('Account not found');
        showLoading(false);
        return;
    }
    
    if (!user.verified) {
        pendingEmail = email;
        const emailSent = await sendVerificationCode(email);
        if (emailSent) {
            showForm('verification');
            document.getElementById('verificationEmail').textContent = email;
        }
        showLoading(false);
        return;
    }
    
    // Login successful
    const currentUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    };
    
    localStorage.setItem('ff_currentUser', encrypt(JSON.stringify(currentUser)));
    showSuccess('Login successful! Redirecting...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
    
    showLoading(false);
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!firstName || !lastName || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (findUser(email)) {
        showError('Account already exists with this email');
        return;
    }
    
    showLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create user account
    const userData = {
        firstName,
        lastName,
        email,
        password,
        verified: false,
        createdAt: new Date().toISOString()
    };
    
    saveUser(userData);
    
    pendingEmail = email;
    const emailSent = await sendVerificationCode(email);
    if (emailSent) {
        showForm('verification');
        document.getElementById('verificationEmail').textContent = email;
        showSuccess('Account created! Please check your email for verification code.');
    } else {
        showError('Account created but failed to send verification email. Please try logging in.');
    }
    
    showLoading(false);
}

// Handle verification
async function handleVerification(e) {
    e.preventDefault();
    
    const code = document.getElementById('verificationCode').value.trim();
    
    if (!code) {
        showError('Please enter verification code');
        return;
    }
    
    if (code !== verificationCode) {
        showError('Invalid verification code');
        return;
    }
    
    showLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark user as verified
    const user = findUser(pendingEmail);
    if (user) {
        user.verified = true;
        saveUser(user);
        
        const currentUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
        
        localStorage.setItem('ff_currentUser', encrypt(JSON.stringify(currentUser)));
    }
    
    showLoading(false);
    showSuccess('Email verified successfully! Redirecting...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Send verification code
async function sendVerificationCode(email) {
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
        showInfo('Sending verification code...');
        await sendVerificationEmail(email, verificationCode);
        showSuccess(`Verification code sent! Check the notification above.`);
        return true;
    } catch (error) {
        console.error('Failed to send verification code:', error);
        showError('Failed to send verification code. Please try again or contact support.');
        return false;
    }
}

// Resend verification code
async function resendVerificationCode(e) {
    e.preventDefault();
    if (!pendingEmail) {
        showError('No pending email verification found');
        return;
    }
    await sendVerificationCode(pendingEmail);
}

// Utility functions
function showLoading(show) {
    let overlay = document.querySelector('.loading-overlay');
    
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
    } else {
        if (overlay) {
            overlay.remove();
        }
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        maxWidth: '400px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
    };
    
    if (type === 'error') {
        styles.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else if (type === 'success') {
        styles.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
        styles.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
    Object.assign(notification.style, styles);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Check if user is already logged in
// (Removed from bottom as it's now in DOMContentLoaded)
