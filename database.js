const Database = require("better-sqlite3");
const path = require("path");

// If Render provides a persistent DB URL, use it.
// Otherwise store DB inside /tmp (only writable dir on free tier)
const dbPath = process.env.DATABASE_URL || path.join("/tmp", "database.db");

const db = new Database(dbPath);

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT
  )
`).run();

module.exports = db;
