const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {ipcMain} = require("electron");

const DB_PATH = path.join(__dirname, 'fnkwjecjnsocfbno');
const DB_KEY = 'my_secret_password'; // Store in memory, never in a file

function initDB() {
    const db = new sqlite3.Database(DB_PATH);
    db.serialize(() => {
        db.run(`PRAGMA key='${DB_KEY}'`);
        db.run(`CREATE TABLE IF NOT EXISTS queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT,
            payload TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
    return db;
}

module.exports = { initDB };