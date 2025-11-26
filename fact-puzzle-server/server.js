// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());

// --- HELPER FUNCTIONS ---

// 1. Read Database
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [] }; // Create empty DB if missing
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
};

// 2. Write Database
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- ROUTES ---

// 1. SIGN UP
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const db = readDB();

  // Check if user exists
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(), // Generate simple ID
    username,
    email,
    password,
    solved: []
  };

  db.users.push(newUser);
  writeDB(db);

  res.json(newUser);
});

// 2. LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// 3. UPDATE PROFILE
app.post('/update-profile', (req, res) => {
  const { id, username, email } = req.body;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex > -1) {
    db.users[userIndex].username = username;
    db.users[userIndex].email = email;
    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 4. SAVE PUZZLE
app.post('/save-puzzle', (req, res) => {
  const { id, fact } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex > -1) {
    // Add fact if not already there
    if (!db.users[userIndex].solved.includes(fact)) {
      db.users[userIndex].solved.push(fact);
      writeDB(db);
    }
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 5. CHANGE PASSWORD
app.post('/change-password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex(u => u.id === id);
  
  if (userIndex > -1) {
    if (db.users[userIndex].password !== currentPassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }
    db.users[userIndex].password = newPassword;
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});