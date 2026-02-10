import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'diary.db');

const db = new sqlite3.Database(dbPath);

console.log('--- MEALS TABLE CONTENT ---');
db.all('SELECT * FROM meals', [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        if (rows.length === 0) {
            console.log('No meals found in database.');
        } else {
            rows.forEach(row => {
                console.log(`[${row.date}] ${row.meal_type}: ${row.name} (${row.calories} cal)`);
            });
        }
    }
    db.close();
});
