const express = require('express');
const router = express.Router();
const db = require('../db/database');

const today = () => new Date().toISOString().split('T')[0];

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const todayStr = today();

  db.prepare(
    'UPDATE daily_tasks SET completed = 0 WHERE user_id = ? AND last_completed_date != ? AND completed = 1'
  ).run(userId, todayStr);

  const tasks = db.prepare(`
    SELECT daily_tasks.*, tags.name as tag_name, tags.color as tag_color
    FROM daily_tasks
    LEFT JOIN tags ON daily_tasks.tag_id = tags.id
    WHERE daily_tasks.user_id = ?
  `).all(userId);

  res.json(tasks);
});

router.post('/', (req, res) => {
  const { user_id, title, tag_id } = req.body;
  if (!user_id || !title) return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });

  const cleanTagId = tag_id && tag_id !== '' && tag_id !== 'null' ? tag_id : null;

  const result = db.prepare(
    'INSERT INTO daily_tasks (user_id, title, tag_id) VALUES (?, ?, ?)'
  ).run(user_id, title, cleanTagId);

  res.json({ message: 'Günlük görev eklendi!', taskId: result.lastInsertRowid });
});

router.patch('/:id/complete', (req, res) => {
  const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Görev bulunamadı.' });

  const todayStr = today();

  if (task.completed === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newStreak = task.last_completed_date === yesterdayStr ? task.streak + 1 : 1;
    db.prepare(
      'UPDATE daily_tasks SET completed = 1, last_completed_date = ?, streak = ? WHERE id = ?'
    ).run(todayStr, newStreak, task.id);

    res.json({ completed: 1, streak: newStreak });
  } else {
    db.prepare('UPDATE daily_tasks SET completed = 0 WHERE id = ?').run(task.id);
    res.json({ completed: 0, streak: task.streak });
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM daily_tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Günlük görev silindi.' });
});

module.exports = router;