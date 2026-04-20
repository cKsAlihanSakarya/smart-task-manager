const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Tüm görevleri getir
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY completed ASC, deadline ASC').all(userId);
  res.json(tasks);
});

// Görev ekle
router.post('/', (req, res) => {
  const { user_id, title, description, priority, deadline, estimated_hours } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: 'Kullanıcı ve görev adı zorunludur.' });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (user_id, title, description, priority, deadline, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(user_id, title, description, priority, deadline, estimated_hours);
  res.json({ message: 'Görev eklendi!', taskId: result.lastInsertRowid });
});

// Görevi tamamla / tamamlamayı geri al
router.patch('/:id/complete', (req, res) => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return res.status(404).json({ error: 'Görev bulunamadı.' });
  }

  const newStatus = task.completed === 0 ? 1 : 0;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newStatus, id);
  res.json({ message: 'Görev güncellendi!', completed: newStatus });
});

// Görev sil
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ message: 'Görev silindi!' });
});

module.exports = router;