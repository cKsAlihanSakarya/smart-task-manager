const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Tüm görevleri getir
router.get('/:userId', (req, res) => {
  const tasks = db.prepare(`
    SELECT tasks.*, tags.name as tag_name, tags.color as tag_color
    FROM tasks
    LEFT JOIN tags ON tasks.tag_id = tags.id
    WHERE tasks.user_id = ?
    ORDER BY tasks.completed ASC, tasks.deadline ASC
  `).all(req.params.userId);
  res.json(tasks);
});

// Görev ekle
router.post('/', (req, res) => {
  console.log('Gelen veri:', req.body);
  const { user_id, title, description, priority, deadline, estimated_hours, tag_id, reminder_enabled, reminder_time } = req.body;
  if (!user_id || !title) return res.status(400).json({ error: 'Kullanıcı ve görev adı zorunludur.' });

  const cleanTagId = tag_id && tag_id !== '' && tag_id !== 'null' ? tag_id : null;
  const cleanReminderTime = reminder_time && reminder_time !== '' ? reminder_time : null;

  const result = db.prepare(`
    INSERT INTO tasks (user_id, title, description, priority, deadline, estimated_hours, tag_id, reminder_enabled, reminder_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user_id, title, description, priority, deadline, estimated_hours, cleanTagId, reminder_enabled || 0, cleanReminderTime);

  res.json({ message: 'Görev eklendi!', taskId: result.lastInsertRowid });
});

// Görevi tamamla / geri al
router.patch('/:id/complete', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Görev bulunamadı.' });

  const newStatus = task.completed === 0 ? 1 : 0;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newStatus, task.id);
  res.json({ message: 'Görev güncellendi!', completed: newStatus });
});

// Görev sil
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Görev silindi!' });
});

module.exports = router;