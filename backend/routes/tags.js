const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Etiketleri getir
router.get('/:userId', (req, res) => {
  const tags = db.prepare('SELECT * FROM tags WHERE user_id = ?').all(req.params.userId);
  res.json(tags);
});

// Etiket ekle
router.post('/', (req, res) => {
  const { user_id, name, color } = req.body;
  if (!user_id || !name) return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });

  try {
    const result = db.prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)').run(user_id, name, color || 'blue');
    res.json({ message: 'Etiket eklendi!', tagId: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: 'Bu etiket zaten mevcut.' });
  }
});

// Etiket sil
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.json({ message: 'Etiket silindi.' });
});

module.exports = router;