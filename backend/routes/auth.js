const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Kayıt ol
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre zorunludur.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const result = stmt.run(email, password);
    res.json({ message: 'Kayıt başarılı!', userId: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
  }
});

// Giriş yap
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre zorunludur.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Email veya şifre hatalı.' });
  }

  res.json({ message: 'Giriş başarılı!', userId: user.id, email: user.email });
});

module.exports = router;