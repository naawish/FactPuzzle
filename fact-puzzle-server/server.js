// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const USERDATA_DIR = path.join(__dirname, 'userdata');

// Increase limit to handle image uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// 1. Create userdata folder if it doesn't exist
if (!fs.existsSync(USERDATA_DIR)) {
  fs.mkdirSync(USERDATA_DIR);
}

app.use('/userdata', express.static(USERDATA_DIR));

// --- HELPER FUNCTIONS ---
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    // Initialize with empty array if file missing
    return { users: [] }; 
  }
  try {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB file:", err);
    return { users: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- ROUTES ---

// SIGN UP
app.post('/signup', (req, res) => {
  console.log("Signup Request:", req.body.email); // Debug Log
  const { username, email, password } = req.body;
  const db = readDB();

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password,
    profilePicture: null, 
    solved: []
  };

  db.users.push(newUser);
  writeDB(db);
  console.log("User Created:", newUser.email); // Debug Log
  res.json(newUser);
});

// LOGIN (DEBUGGING ADDED)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Login Attempt: ${email} with pass: ${password}`); // Debug Log

  const db = readDB();
  
  // Log all current users in DB to check consistency
  // console.log("Current Users in DB:", db.users.map(u => `${u.email} : ${u.password}`));

  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    console.log("Login Success");
    res.json(user);
  } else {
    console.log("Login Failed: Credentials do not match any user.");
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// UPDATE PROFILE 
app.post('/update-profile', (req, res) => {
  const { id, username, email, profileImageBase64 } = req.body;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex > -1) {
    db.users[userIndex].username = username;
    db.users[userIndex].email = email;

    if (profileImageBase64) {
      const fileName = `${id}.png`;
      const filePath = path.join(USERDATA_DIR, fileName);
      const base64Data = profileImageBase64.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, base64Data, 'base64');
      db.users[userIndex].profilePicture = `/userdata/${fileName}`;
    }

    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// SAVE PUZZLE
app.post('/save-puzzle', (req, res) => {
  const { id, fact } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex > -1) {
    // Check if fact exists (string or object)
    const alreadyExists = db.users[userIndex].solved.some(item => {
      if (typeof item === 'string') return item === fact;
      return item.text === fact;
    });

    if (!alreadyExists) {
      const newEntry = { text: fact, date: new Date().toISOString() };
      db.users[userIndex].solved.unshift(newEntry);
      writeDB(db);
    }
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// CHANGE PASSWORD
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});