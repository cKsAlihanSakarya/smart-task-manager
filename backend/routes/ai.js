const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/suggest', async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || tasks.length === 0) {
    return res.json({ suggestion: 'Henüz görev eklenmemiş.' });
  }

  const taskList = tasks.map(t => 
    `- ${t.title} (öncelik: ${t.priority}, deadline: ${t.deadline || 'yok'}, tahmini süre: ${t.estimated_hours || 0} dakika, tamamlandı: ${t.completed ? 'evet' : 'hayır'})`
  ).join('\n');

  const prompt = `
Sen bir görev yönetimi asistanısın. Kullanıcının aşağıdaki görevlerine bakarak hangi görevi önce yapması gerektiğini Türkçe olarak öner. 
Sadece 2-3 cümle yaz, kısa ve net ol. Neden o görevi önerdiğini açıkla.

Görevler:
${taskList}
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ suggestion: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI önerisi alınamadı.' });
  }
});

module.exports = router;