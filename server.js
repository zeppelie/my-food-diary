import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err.message);
        } else {
            console.log('📊 Meals table ready.');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS search_cache (
        query TEXT PRIMARY KEY,
        results TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating search_cache table:', err.message);
        } else {
            console.log('💾 Search cache table ready.');
        }
    });
}

// Serve static files from the React app build directory
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

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
    const { date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats, image_url } = req.body;

    if (!date || !meal_type || !name) {
        console.warn('⚠️ Validation failed: date, meal_type, or name missing');
        res.status(400).json({ error: 'Missing required fields: date, meal_type, and name are required' });
        return;
    }

    const sql = `INSERT INTO meals (date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [date, meal_type, name, brand, serving_size, calories, proteins, carbs, fats, image_url];

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

// Search Cache Routes
// Get cached search results
app.get('/api/search/cache', (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const searchStr = q.toLowerCase().trim();
    console.log(`🔍 Checking cache for: ${searchStr}`);

    // 1. Try exact match in search_cache
    db.get('SELECT results FROM search_cache WHERE query = ?', [searchStr], (err, row) => {
        if (err) {
            console.error('❌ Cache error (GET):', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            console.log(`✅ Cache exact hit for: ${searchStr}`);
            return res.json({ results: JSON.parse(row.results), source: 'exact' });
        }

        // 2. Try prefix match in search_cache (e.g. typing "poll" finds "pollo" results from a previous search)
        db.get('SELECT results FROM search_cache WHERE query LIKE ? ORDER BY length(query) ASC LIMIT 1', [`${searchStr}%`], (err, prefixRow) => {
            if (prefixRow) {
                console.log(`✅ Cache prefix hit for: ${searchStr}`);
                // Only return if results exist
                const results = JSON.parse(prefixRow.results);
                if (results && results.length > 0) {
                    return res.json({ results, source: 'prefix' });
                }
            }

            // 3. Try searching in meals history (items user has actually added)
            // We need to normalize nutrients back to 100g for the UI
            const historySql = `
                SELECT name, brand, calories, proteins, carbs, fats, serving_size, image_url 
                FROM meals 
                WHERE LOWER(name) LIKE ? OR LOWER(brand) LIKE ?
                GROUP BY name, brand 
                LIMIT 10
            `;
            db.all(historySql, [`%${searchStr}%`, `%${searchStr}%`], (err, historyRows) => {
                if (historyRows && historyRows.length > 0) {
                    console.log(`✅ History hit for: ${searchStr}`);
                    const results = historyRows.map((row, index) => {
                        const factor = 100 / (row.serving_size || 100);
                        return {
                            id: `hist-${index}-${Date.now()}`,
                            name: row.name,
                            brand: row.brand || '',
                            calories: Math.round((row.calories || 0) * factor),
                            macros: {
                                proteins: parseFloat(((row.proteins || 0) * factor).toFixed(1)),
                                carbs: parseFloat(((row.carbs || 0) * factor).toFixed(1)),
                                fats: parseFloat(((row.fats || 0) * factor).toFixed(1))
                            },
                            imageUrl: row.image_url || null
                        };
                    });
                    return res.json({ results, source: 'history' });
                }

                console.log(`? Cache miss for: ${searchStr}`);
                res.json({ results: null });
            });
        });
    });
});

// Save search results to cache
app.post('/api/search/cache', (req, res) => {
    const { query, results } = req.body;

    if (!query || !results) {
        return res.status(400).json({ error: 'Query and results are required' });
    }

    console.log(`💾 Caching results for: ${query}`);
    const sql = `INSERT OR REPLACE INTO search_cache (query, results) VALUES (?, ?)`;
    const params = [query.toLowerCase().trim(), JSON.stringify(results)];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('❌ Cache error (POST):', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Search results cached' });
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('(.*)', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log('📡 Listening on all interfaces (0.0.0.0)');
});
