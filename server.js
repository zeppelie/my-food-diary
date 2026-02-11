import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

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

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ token, user: { id: this.lastID, email, name } });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
});

app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    // Mocking forgot password logic
    res.json({ message: 'If an account exists with this email, a reset link will be sent.' });
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
