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
  if (!user_id || !title) return res.status(400).json({ error: 'Required fields missing.' });

  const cleanTagId = tag_id && tag_id !== '' && tag_id !== 'null' ? tag_id : null;

  const result = db.prepare(
    'INSERT INTO daily_tasks (user_id, title, tag_id) VALUES (?, ?, ?)'
  ).run(user_id, title, cleanTagId);

  res.json({ message: 'Daily task added!', taskId: result.lastInsertRowid });
});

router.patch('/:id/complete', (req, res) => {
  const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

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
  res.json({ message: 'Daily task deleted.' });
});

router.post('/motivasyon', async (req, res) => {
  const { streak } = req.body;

  const messages = {
    0: [
      'Take one small step today — a big journey starts here! 🌱',
      'Everything begins with a first step. Start today! 🚀',
      'Daily habits change lives — begin with the easiest one! ✨',
      'Even completing 1 task today makes tomorrow easier! 💪',
    ],
    low: [
      'Great start! Keep the streak alive! 🔥',
      'The first days are the hardest — you made it! Keep going! ⚡',
      'Small but mighty! Keep it up and it becomes a habit! 🌟',
      'You started — that is already the most important step! 🎯',
    ],
    mid: [
      streak + ' days strong — do not stop now! 🔥',
      'You are building momentum — keep it rolling! 💫',
      'Getting stronger every single day! 💪',
      'The habit is forming — stay consistent! 🏆',
    ],
    high: [
      streak + ' days in a row — you are a legend! 👑',
      streak + '-day streak? That is not luck, that is discipline! 🔥',
      'Very few people reach this level — you should be proud! 🏆',
      streak + ' days — this is not just a habit anymore, it is your lifestyle! ⚡',
    ]
  };

  let category = '0';
  if (streak >= 1 && streak <= 3) category = 'low';
  else if (streak >= 4 && streak <= 7) category = 'mid';
  else if (streak > 7) category = 'high';

  const list = messages[category];
  const mesaj = list[Math.floor(Math.random() * list.length)];

  res.json({ mesaj });
});

module.exports = router;