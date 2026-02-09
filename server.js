import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

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
    db.run(`CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        name TEXT NOT NULL,
        brand TEXT,
        serving_size REAL,
        calories INTEGER,
        proteins REAL,
        carbs REAL,
        fats REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err.message);
        } else {
            console.log('📊 Meals table ready.');
        }
    });
}

// Routes
// Get all meals for a specific date
app.get('/api/meals/:date', (req, res) => {
    const { date } = req.params;
    console.log(`🔍 Fetching meals for date: ${date}`);
    db.all('SELECT * FROM meals WHERE date = ?', [date], (err, rows) => {
        if (err) {
            console.error('❌ Database error (GET):', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a meal entry
app.post('/api/meals', (req, res) => {
    console.log('📥 POST /api/meals received body:', req.body);
    const { date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats } = req.body;

    if (!date || !meal_type || !name) {
        console.warn('⚠️ Validation failed: date, meal_type, or name missing');
        res.status(400).json({ error: 'Missing required fields: date, meal_type, and name are required' });
        return;
    }

    const sql = `INSERT INTO meals (date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('❌ Database error (POST):', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`✅ Meal added with ID: ${this.lastID}`);
        res.json({
            id: this.lastID,
            message: 'Meal added successfully'
        });
    });
});

// Delete a meal entry
app.delete('/api/meals/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ Deleting meal ID: ${id}`);
    db.run('DELETE FROM meals WHERE id = ?', id, function (err) {
        if (err) {
            console.error('❌ Database error (DELETE):', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Meal deleted', changes: this.changes });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log('📡 Listening on all interfaces (0.0.0.0)');
});
