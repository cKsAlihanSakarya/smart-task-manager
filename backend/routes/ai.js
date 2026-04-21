const express = require('express');
const router = express.Router();

router.post('/suggest', async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || tasks.length === 0) {
    return res.json({ suggestion: 'Henüz görev eklenmemiş.' });
  }

  const taskList = tasks.map(t => 
    `- ${t.title} (öncelik: ${t.priority}, deadline: ${t.deadline || 'yok'}, tahmini süre: ${t.estimated_hours || 0} dakika, tamamlandı: ${t.completed ? 'evet' : 'hayır'})`
  ).join('\n');

  const prompt = `Sen bir görev yönetimi asistanısın. Kullanıcının aşağıdaki görevlerine bakarak hangi görevi önce yapması gerektiğini Türkçe olarak öner. Sadece 2-3 cümle yaz, kısa ve net ol.

Görevler:
${taskList}`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ suggestion: data.response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI önerisi alınamadı.' });
  }
});

module.exports = router;