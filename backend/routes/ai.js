const express = require('express');
const router = express.Router();

router.post('/suggest', async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || tasks.length === 0) {
    return res.json({ suggestion: 'No tasks yet. Add one to get started!' });
  }

  const priorityScore = { critical: 0, high: 1, medium: 2, low: 3, minimal: 4 };

  const pending = tasks.filter(t => t.completed === 0);

  if (pending.length === 0) {
    return res.json({ suggestion: 'You completed all your tasks. Amazing work! 🎉' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scoreTask = (t) => {
    let score = 0;
    if (t.deadline) {
      const d = new Date(t.deadline);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d - today) / (1000 * 60 * 60 * 24));
      if (diff <= 0) score -= 1000;
      else if (diff === 1) score -= 800;
      else if (diff <= 3) score -= 600;
      else if (diff <= 7) score -= 400;
      else score -= 200;
    }
    score += (priorityScore[t.priority] || 2) * 100;
    if (t.estimated_hours > 0) score += Math.min(t.estimated_hours / 60, 5) * 10;
    return score;
  };

  const sorted = [...pending].sort((a, b) => scoreTask(a) - scoreTask(b));
  const top = sorted[0];

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0];

  let reason = '';
  if (top.deadline === todayStr) {
    reason = 'Due today — cannot wait any longer!';
  } else if (top.deadline === tomorrowStr) {
    reason = 'Due tomorrow, time is running out!';
  } else if (top.deadline) {
    reason = 'Due on ' + top.deadline + ', better start early.';
  } else if (top.priority === 'critical') {
    reason = 'Marked as critical — needs immediate attention.';
  } else if (top.priority === 'high') {
    reason = 'High priority task that should be handled soon.';
  } else if (top.priority === 'medium') {
    reason = 'Next in line — time to get it done!';
  } else {
    reason = 'This one has been waiting long enough.';
  }

  const motivations = [
    'Lets go, you got this! 🚀',
    'Once you start, the hard part is over! 💪',
    'Focus up and knock it out! 🎯',
    'You can do it — start now! ⚡',
    'Do not leave it for tomorrow! 🔥',
    'Starting is already half the battle! 😄',
    'Small steps lead to big results! 🌟',
    'It will feel great once it is done! 💫',
    'Do it for yourself — you will be proud! 🏆',
    'Grab a coffee and get started! ☕',
    'Close the procrastination tab and open this one! 💻',
    'Is this task going to complete itself? Nope — that is you! 😎',
    'Come on, you got this! 🙌',
    'A little effort, a big win! 💦',
    'Start now, relax tonight! 🌙',
  ];

  const motivation = motivations[Math.floor(Math.random() * motivations.length)];
  const suggestion = 'Focus on "' + top.title + '" first. ' + reason + ' ' + motivation;

  res.json({ suggestion });
});

module.exports = router;