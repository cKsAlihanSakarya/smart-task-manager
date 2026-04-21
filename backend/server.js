require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

require('./db/database');

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Task Manager API çalışıyor!' });
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});