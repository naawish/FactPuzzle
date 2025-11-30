// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to (or create) the database file
const dbPath = path.resolve(__dirname, 'factpuzzle.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create Tables if they don't exist
db.serialize(() => {
  // 1. Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  // 2. Solved Facts Table (Linked to User ID)
  db.run(`CREATE TABLE IF NOT EXISTS solved_facts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    fact_text TEXT,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 3. Feedback Table
  db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    username TEXT,
    message TEXT,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

module.exports = db;