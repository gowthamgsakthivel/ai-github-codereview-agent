// Sample code with deliberate vulnerabilities for workshop PR review demo
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const router = express.Router();
const db = new sqlite3.Database(':memory:');

// ❌ SECURITY ISSUE: Hardcoded JWT Secret
const JWT_SECRET = "supersecret12345_do_not_share";

// ❌ SECURITY ISSUE: SQL Injection vulnerability via raw string interpolation
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Unsanitized user input directly in query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    // ❌ BUG: No error checking if db connection fails
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    return res.json({ token });
  });
});

// ❌ BUG & SECURITY: Missing authentication middleware & IDOR vulnerability
router.get('/user-profile', (req, res) => {
  const userId = req.query.id;
  
  db.get(`SELECT id, username, email, credit_card_number FROM users WHERE id = ${userId}`, (err, row) => {
    // ❌ SECURITY: Exposing sensitive credit card details in response
    res.json(row);
  });
});

module.exports = router;
