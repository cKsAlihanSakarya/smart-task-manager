import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ userId, email }) {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [estimatedHourVal, setEstimatedHourVal] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [tagId, setTagId] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const aiEnabled = localStorage.getItem('aiEnabled') !== 'false';

  useEffect(() => {
    fetchTasks();
    fetchTags();
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get(`http://localhost:3000/tasks/${userId}`);
    setTasks(res.data);
    if (res.data.length > 0 && aiEnabled) getAiSuggestion(res.data);
  };

  const fetchTags = async () => {
    const res = await axios.get(`http://localhost:3000/tags/${userId}`);
    setTags(res.data);
  };

  const getAiSuggestion = async (taskList) => {
    try {
      const res = await axios.post('http://localhost:3000/ai/suggest', { tasks: taskList });
      setAiSuggestion(res.data.suggestion);
    } catch (err) {
      console.error('AI önerisi alınamadı:', err.message);
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    tasks.forEach(task => {
      if (task.reminder_enabled && task.reminder_time && !task.completed) {
        const reminderFull = `${task.reminder_time}`;
        if (reminderFull === nowStr) {
          alert(`⏰ Hatırlatıcı: "${task.title}" görevi için belirlediğin zaman geldi!`);
        }
      }
    });
  };

  const handleAddTask = async () => {
    if (!title) return;
    const reminderFull = reminderEnabled && reminderDate && reminderTime
      ? `${reminderDate}T${reminderTime}`
      : null;

    await axios.post('http://localhost:3000/tasks', {
      user_id: userId, title, description, priority, deadline,
      estimated_hours: (parseInt(estimatedHourVal || 0) * 60) + parseInt(estimatedMinutes || 0),
      tag_id: tagId || null,
      reminder_enabled: reminderEnabled ? 1 : 0,
      reminder_time: reminderFull
    });

    setTitle(''); setDescription(''); setDeadline('');
    setEstimatedHourVal(''); setEstimatedMinutes('');
    setTagId(''); setReminderEnabled(false);
    setReminderTime(''); setReminderDate('');
    setShowForm(false);
    fetchTasks();
  };

  const handleComplete = async (e, id) => {
    e.stopPropagation();
    await axios.patch(`http://localhost:3000/tasks/${id}/complete`);
    fetchTasks();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await axios.delete(`http://localhost:3000/tasks/${id}`);
    fetchTasks();
  };

  const getTagStyle = (color) => {
    const colors = {
      blue:   { background: 'rgba(74,143,232,0.15)',  color: '#4a8fe8' },
      green:  { background: 'rgba(61,186,122,0.15)',  color: '#3dba7a' },
      purple: { background: 'rgba(127,119,221,0.15)', color: '#7f77dd' },
      coral:  { background: 'rgba(216,90,48,0.15)',   color: '#d85a30' },
      yellow: { background: 'rgba(240,180,41,0.15)',  color: '#f0b429' },
    };
    return colors[color] || colors.blue;
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const urgentTasks = tasks.filter(t =>
    !t.completed && (t.deadline === today || t.deadline === tomorrow)
  );

  const filteredTasks = activeFilter
    ? tasks.filter(t => t.tag_id === activeFilter)
    : tasks;

  const completedCount = tasks.filter(t => t.completed === 1).length;
  const pendingCount = tasks.filter(t => t.completed === 0).length;

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Merhaba, {email} 👋</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>＋ Yeni Görev</button>
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-label">Toplam</div><div className="stat-value accent">{tasks.length}</div></div>
        <div className="stat-card"><div className="stat-label">Bekleyen</div><div className="stat-value yellow">{pendingCount}</div></div>
        <div className="stat-card"><div className="stat-label">Tamamlanan</div><div className="stat-value green">{completedCount}</div></div>
      </div>

      {urgentTasks.length > 0 && (
        <div style={{
          background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.3)',
          borderRadius: '10px', padding: '12px 16px', fontSize: '13px',
          color: '#f0b429', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          ⚠️ <span>
            <strong>{urgentTasks.length} görevin</strong> deadline'ı yaklaşıyor: {urgentTasks.map(t => t.title).join(', ')}
          </span>
        </div>
      )}

      {aiSuggestion && aiEnabled && (
        <div className="ai-banner">
          <span className="ai-icon">🤖</span>
          <div>
            <div className="ai-label">AI ÖNERİSİ</div>
            <div className="ai-text">{aiSuggestion}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="task-form">
          <input placeholder="Görev adı" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Açıklama" value={description} onChange={e => setDescription(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="critical">🔴 Kritik</option>
              <option value="high">🟠 Yüksek</option>
              <option value="medium">🟡 Orta</option>
              <option value="low">🟢 Düşük</option>
              <option value="minimal">⚪ Çok Düşük</option>
            </select>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div className="time-inputs">
            <input type="number" placeholder="Saat" min="0" value={estimatedHourVal} onChange={e => setEstimatedHourVal(e.target.value)} />
            <input type="number" placeholder="Dakika" min="0" max="59" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
          </div>
          {tags.length > 0 && (
            <select value={tagId} onChange={e => setTagId(e.target.value)}>
              <option value="">Etiket seç (opsiyonel)</option>
              {tags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
            </select>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={e => setReminderEnabled(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: '#4a8fe8' }}
            />
            Hatırlatıcı kur
          </label>

          {reminderEnabled && (
            <div style={{
              background: '#243044', border: '1px solid rgba(74,143,232,0.3)',
              borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <div style={{ fontSize: '11px', color: '#5a6e88' }}>NE ZAMAN HATIRLATAYIM?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
                <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button onClick={() => setShowForm(false)}>İptal</button>
            <button className="add-btn" onClick={handleAddTask}>Kaydet</button>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div
            onClick={() => setActiveFilter(null)}
            style={{
              fontSize: '11px', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
              background: !activeFilter ? 'rgba(74,143,232,0.15)' : 'transparent',
              color: !activeFilter ? '#4a8fe8' : '#5a6e88',
              border: '1px solid ' + (!activeFilter ? 'rgba(74,143,232,0.3)' : '#3a4a63')
            }}
          >Tümü</div>
          {tags.map(tag => (
            <div
              key={tag.id}
              onClick={() => setActiveFilter(activeFilter === tag.id ? null : tag.id)}
              style={{
                fontSize: '11px', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
                border: '1px solid ' + (activeFilter === tag.id ? 'rgba(74,143,232,0.3)' : '#3a4a63'),
                ...getTagStyle(activeFilter === tag.id ? tag.color : 'none'),
                color: activeFilter === tag.id ? getTagStyle(tag.color).color : '#5a6e88',
                background: activeFilter === tag.id ? getTagStyle(tag.color).background : 'transparent',
              }}
            >#{tag.name}</div>
          ))}
        </div>
      )}

      <div className="task-list">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
          >
            <div className="task-check" onClick={(e) => handleComplete(e, task.id)}>
              {task.completed ? '✓' : ''}
            </div>
            <div className="task-info">
              <div className="task-name">{task.title}</div>
              <div className="task-meta">
                {task.deadline && `son tarih: ${task.deadline}`}
                {task.estimated_hours > 0 && ` · ${Math.floor(task.estimated_hours / 60) > 0 ? Math.floor(task.estimated_hours / 60) + ' saat ' : ''}${task.estimated_hours % 60 > 0 ? task.estimated_hours % 60 + ' dk' : ''}`}
                {task.reminder_enabled ? ' · ⏰' : ''}
              </div>
              {expandedTask === task.id && task.description && (
                <div className="task-description">{task.description}</div>
              )}
            </div>
            {task.tag_name && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                ...getTagStyle(task.tag_color)
              }}>#{task.tag_name}</span>
            )}
            <span className={`badge ${task.priority}`}>{task.priority.toUpperCase()}</span>
            <button className="delete-btn" onClick={(e) => handleDelete(e, task.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;