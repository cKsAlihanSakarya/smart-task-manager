const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId);

  // Genel istatistikler
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed === 1).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Önceliğe göre dağılım
  const byPriority = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
    minimal: tasks.filter(t => t.priority === 'minimal').length,
  };

  // Etikete göre dağılım
  const tagStats = db.prepare(`
    SELECT tags.name, tags.color, COUNT(tasks.id) as count
    FROM tags
    LEFT JOIN tasks ON tasks.tag_id = tags.id AND tasks.user_id = ?
    WHERE tags.user_id = ?
    GROUP BY tags.id
  `).all(userId, userId);

  // Bu hafta tamamlanan görevler (günlere göre)
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = tasks.filter(t =>
      t.completed === 1 && t.created_at && t.created_at.startsWith(dateStr)
    ).length;
    weekDays.push({ day: dayName, date: dateStr, count });
  }

  res.json({ total, completed, completionRate, byPriority, tagStats, weekDays });
});

module.exports = router;