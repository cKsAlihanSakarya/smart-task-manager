const express = require('express');
const router = express.Router();

router.post('/suggest', async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || tasks.length === 0) {
    return res.json({ suggestion: 'No tasks yet. Add one to get started!' });
  }

  const pending = tasks.filter(t => t.completed === 0);

  if (pending.length === 0) {
    return res.json({ suggestion: 'You completed all your tasks. Amazing work! 🎉' });
  }

  const taskList = pending.map(t => {
    const hours = Math.floor((t.estimated_hours || 0) / 60);
    const mins = (t.estimated_hours || 0) % 60;
    const duration = hours > 0 && mins > 0 ? `${hours}h ${mins}m`
                   : hours > 0 ? `${hours}h`
                   : mins > 0 ? `${mins}m`
                   : 'not specified';
    return `- ${t.title} (priority: ${t.priority}, deadline: ${t.deadline || 'none'}, duration: ${duration})`;
  }).join('\n');

  const prompt = `<s>[INST] You are a task management assistant. Reply in English only.

From the task list below, pick the single most important task and write EXACTLY this — nothing more:
"You should work on [TASK NAME] first. [One sentence why]. [One motivational sentence]."

Tasks:
${taskList} [/INST]</s>`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    let suggestion = data.response.trim();

    // Görev listesi gelirse kes
    const taskNames = pending.map(t => t.title);
    let cutIndex = suggestion.length;
    for (const name of taskNames) {
      const idx = suggestion.indexOf(name + ' (');
      if (idx !== -1 && idx < cutIndex) cutIndex = idx;
    }
    suggestion = suggestion.substring(0, cutIndex).trim();

    // Köşeli parantez içindeki fazla kısmı temizle
    suggestion = suggestion.replace(/\[.*?\]/g, '').trim();

    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI suggestion failed.' });
  }
});

router.post('/analysis', async (req, res) => {
  const { stats } = req.body;

  const prompt = `<s>[INST] You are a productivity assistant. Reply in English only.

The user has the following task statistics:
- Total tasks: ${stats.total}
- Completed: ${stats.completed}
- Completion rate: ${stats.completionRate}%
- Critical tasks: ${stats.byPriority.critical}
- High priority: ${stats.byPriority.high}
- Pending tasks: ${stats.total - stats.completed}

Write EXACTLY 2-3 sentences analyzing their productivity. Be specific, encouraging and actionable. Nothing more. [/INST]</s>`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    let analysis = data.response.trim().replace(/\[.*?\]/g, '').trim();
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI analysis failed.' });
  }
});

module.exports = router;