import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Email Transporter (Using Ethereal for dev/testing if no SMTP provided)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'fake_user@ethereal.email',
        pass: process.env.SMTP_PASS || 'fake_pass'
    }
});

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = join(__dirname, 'diary.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        is_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        reset_token TEXT,
        reset_token_expiry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Meals table (added user_id)
    db.run(`CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        name TEXT NOT NULL,
        brand TEXT,
        serving_size REAL,
        calories INTEGER,
        proteins REAL,
        carbs REAL,
        fats REAL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS search_cache (
        query TEXT PRIMARY KEY,
        results TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthenticated' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Serve static files
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// Email Helpers
const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${APP_URL}/api/auth/verify/${token}`;
    await transporter.sendMail({
        from: '"Girt Support" <support@girt.com>',
        to: email,
        subject: "Verify your Girt account",
        html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Welcome to Girt!</h2>
                <p>Please verify your email by clicking the button below:</p>
                <a href="${verifyUrl}" style="background: #4facfe; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                <p>Or copy this link: ${verifyUrl}</p>
               </div>`
    });
};

const sendResetEmail = async (email, token) => {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: '"Girt Support" <support@girt.com>',
        to: email,
        subject: "Reset your Girt password",
        html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Click the button below to set a new password:</p>
                <a href="${resetUrl}" style="background: #4facfe; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p>This link expires in 1 hour.</p>
               </div>`
    });
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

        db.run('INSERT INTO users (email, password, name, verification_token) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, verificationToken], function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
                    return res.status(500).json({ error: err.message });
                }

                sendVerificationEmail(email, verificationToken).catch(console.error);
                res.status(201).json({ message: 'User created. Please check your email to verify your account.' });
            });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/verify/:token', (req, res) => {
    const { token } = req.params;
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(400).send('<h1>Verification failed</h1><p>Invalid or expired link.</p>');

        db.run('UPDATE users SET is_verified = 1, verification_token = NULL WHERE email = ?', [decoded.email], function (err) {
            if (err) return res.status(500).send('Database error');
            res.send('<h1>Account Verified!</h1><p>You can now close this tab and log in.</p>');
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        if (!user.is_verified) return res.status(403).json({ error: 'Please verify your email before logging in.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
});

app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.json({ message: 'If an account exists with this email, a reset link will be sent.' });

        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        db.run('UPDATE users SET reset_token = ? WHERE id = ?', [resetToken, user.id], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            sendResetEmail(email, resetToken).catch(console.error);
            res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
        });
    });
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(400).json({ error: 'Invalid or expired token' });

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run('UPDATE users SET password = ?, reset_token = NULL WHERE id = ? AND reset_token = ?',
                [hashedPassword, decoded.id, token], function (err) {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    if (this.changes === 0) return res.status(400).json({ error: 'Invalid or already used token' });
                    res.json({ message: 'Password updated successfully. You can now log in.' });
                });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// Protected Meal Routes
app.get('/api/meals/:date', authenticateToken, (req, res) => {
    const { date } = req.params;
    db.all('SELECT * FROM meals WHERE date = ? AND user_id = ?', [date, req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/meals', authenticateToken, (req, res) => {
    const { date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats, image_url } = req.body;
    const sql = `INSERT INTO meals (user_id, date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [req.user.id, date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats, image_url];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Meal added' });
    });
});

app.delete('/api/meals/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM meals WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// Cache routes (unprotected for speed)
app.get('/api/search/cache', (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    const searchStr = q.toLowerCase().trim();
    db.get('SELECT results FROM search_cache WHERE query = ?', [searchStr], (err, row) => {
        if (row) return res.json({ results: JSON.parse(row.results), source: 'exact' });
        res.json({ results: null });
    });
});

app.post('/api/search/cache', (req, res) => {
    const { query, results } = req.body;
    db.run(`INSERT OR REPLACE INTO search_cache (query, results) VALUES (?, ?)`, [query.toLowerCase().trim(), JSON.stringify(results)], () => {
        res.json({ message: 'Cached' });
    });
});

app.use((req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
