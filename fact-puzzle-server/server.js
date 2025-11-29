// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database'); // Import the SQLite connection

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- ROUTES ---

// 1. SIGN UP
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const id = Date.now().toString(); // Simple ID generation

  const sql = `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [id, username, email, password], function(err) {
    if (err) {
      // SQLite error 19 means "Unique Constraint Failed" (Email already exists)
      if (err.errno === 19) {
        return res.status(400).json({ error: "Email already in use" });
      }
      return res.status(500).json({ error: err.message });
    }
    
    // Return User Object (Empty solved array for new user)
    res.json({ id, username, email, password, solved: [] });
  });
});

// 2. LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sqlUser = `SELECT * FROM users WHERE email = ? AND password = ?`;
  
  db.get(sqlUser, [email, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // User found! Now fetch their solved puzzles
    const sqlFacts = `SELECT fact_text as text, date FROM solved_facts WHERE user_id = ? ORDER BY id DESC`;
    
    db.all(sqlFacts, [user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Combine User info + Solved Array
      // The app expects 'solved' to be an array of { text, date }
      const userData = {
        ...user,
        solved: rows // rows is already [{text: "...", date: "..."}]
      };
      
      res.json(userData);
    });
  });
});

// 3. UPDATE PROFILE
app.post('/update-profile', (req, res) => {
  const { id, username, email } = req.body;
  const sql = `UPDATE users SET username = ?, email = ? WHERE id = ?`;

  db.run(sql, [username, email, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Fetch updated user to return to app
    // We re-fetch to ensure data consistency
    // (In a simple app, we can just echo back the data, but let's be safe)
    // For simplicity here, we'll echo back with the existing solved list provided by client state usually,
    // but the app expects the FULL object.
    
    // Let's just return the success and let the App update its local state, 
    // or fetch the user again. The context usually handles the local update.
    // Based on previous code, we return the updated object.
    res.json({ id, username, email });
  });
});

// 4. SAVE PUZZLE
app.post('/save-puzzle', (req, res) => {
  const { id, fact } = req.body;
  
  // Handle both string format and object format
  const factText = typeof fact === 'string' ? fact : fact.text;
  const date = new Date().toISOString();

  // Check duplicate (Optional, but good for data hygiene)
  const checkSql = `SELECT id FROM solved_facts WHERE user_id = ? AND fact_text = ?`;
  
  db.get(checkSql, [id, factText], (err, row) => {
    if (!row) {
      const insertSql = `INSERT INTO solved_facts (user_id, fact_text, date) VALUES (?, ?, ?)`;
      db.run(insertSql, [id, factText, date], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Return success. Ideally we return the full updated list, 
        // but for performance, we just tell the client "OK" 
        // and the client updates its own list.
        // However, to match previous behavior, let's return the full user object (expensive but safe for now)
        // OR simply return success and let the client Context handle the array add.
        // Your AuthContext updates local state manually, so we just need a 200 OK.
        res.json({ success: true });
      });
    } else {
      res.json({ success: true, message: "Already saved" });
    }
  });
});

// 5. CHANGE PASSWORD
app.post('/change-password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  // Verify old password first
  db.get(`SELECT password FROM users WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });

    if (row.password !== currentPassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Update
    db.run(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// 6. SUBMIT FEEDBACK
app.post('/submit-feedback', (req, res) => {
  const { userId, username, text } = req.body;
  const date = new Date().toISOString();

  const sql = `INSERT INTO feedbacks (user_id, username, message, date) VALUES (?, ?, ?, ?)`;

  db.run(sql, [userId, username, text, date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SQLite Server running on port ${PORT}`);
});