// migrate.js
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. FILES
const jsonFile = path.join(__dirname, 'database.json');
const sqliteFile = path.join(__dirname, 'factpuzzle.sqlite');

// 2. CHECK IF JSON EXISTS
if (!fs.existsSync(jsonFile)) {
  console.error("❌ Error: database.json not found. Make sure you are in the server folder.");
  process.exit(1);
}

// 3. READ OLD DATA
console.log("... Reading database.json");
const rawData = fs.readFileSync(jsonFile);
const oldData = JSON.parse(rawData);

// 4. CONNECT TO NEW DB
const db = new sqlite3.Database(sqliteFile);

console.log("... Starting Migration");

db.serialize(() => {
  
  // --- MIGRATE USERS & SOLVED PUZZLES ---
  if (oldData.users && oldData.users.length > 0) {
    const userStmt = db.prepare("INSERT OR IGNORE INTO users (id, username, email, password) VALUES (?, ?, ?, ?)");
    const factStmt = db.prepare("INSERT INTO solved_facts (user_id, fact_text, date) VALUES (?, ?, ?)");

    let userCount = 0;
    let factCount = 0;

    oldData.users.forEach(user => {
      // Insert User
      // 'INSERT OR IGNORE' prevents crashing if you already created the account in the new DB
      userStmt.run(user.id, user.username, user.email, user.password);
      userCount++;

      // Insert Solved Facts
      if (user.solved && Array.isArray(user.solved)) {
        user.solved.forEach(item => {
          let factText = "";
          let factDate = new Date().toISOString(); // Default for old data

          // Handle mixed data types (String vs Object)
          if (typeof item === 'string') {
            factText = item;
          } else {
            factText = item.text;
            factDate = item.date;
          }

          factStmt.run(user.id, factText, factDate);
          factCount++;
        });
      }
    });

    userStmt.finalize();
    factStmt.finalize();
    console.log(`✅ Migrated ${userCount} Users.`);
    console.log(`✅ Migrated ${factCount} Solved Puzzles.`);
  } else {
    console.log("ℹ️ No users found to migrate.");
  }

  // --- MIGRATE FEEDBACK ---
  if (oldData.feedbacks && oldData.feedbacks.length > 0) {
    const fbStmt = db.prepare("INSERT INTO feedbacks (user_id, username, message, date) VALUES (?, ?, ?, ?)");
    let fbCount = 0;

    oldData.feedbacks.forEach(fb => {
      // Map JSON keys to SQL columns
      // JSON: userId, username, text, date
      // SQL: user_id, username, message, date
      fbStmt.run(fb.userId, fb.username, fb.text, fb.date);
      fbCount++;
    });

    fbStmt.finalize();
    console.log(`✅ Migrated ${fbCount} Feedback entries.`);
  } else {
    console.log("ℹ️ No feedback found to migrate.");
  }

});

db.close((err) => {
  if (err) {
    console.error("❌ Error closing database:", err.message);
  } else {
    console.log("✨ Migration Complete! You can now restart server.js");
  }
});