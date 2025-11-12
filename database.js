const Database = require("better-sqlite3");

// create database (file auto-created if missing)
const db = new Database("./database.db");

// create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL
  )
`).run();

module.exports = db;
