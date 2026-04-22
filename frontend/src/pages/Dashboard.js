import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ userId, email }) {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedHourVal, setEstimatedHourVal] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [tagId, setTagId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [deadlineType, setDeadlineType] = useState('');
  const [customDeadline, setCustomDeadline] = useState('');
  const [reminderOption, setReminderOption] = useState('');

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
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    tasks.forEach(task => {
      if (task.reminder_enabled && task.reminder_time && !task.completed) {
        if (task.reminder_time === nowStr) {
          alert(`⏰ Hatırlatıcı: "${task.title}" görevi için belirlediğin zaman geldi!`);
        }
      }
    });
  };

  const handleAddTask = async () => {
    if (!title) return;

    const today = new Date();
    let deadlineDate = '';

    if (deadlineType === 'today') {
      deadlineDate = today.toISOString().split('T')[0];
    } else if (deadlineType === 'tomorrow') {
      const d = new Date(today); d.setDate(d.getDate() + 1);
      deadlineDate = d.toISOString().split('T')[0];
    } else if (deadlineType === 'week') {
      const d = new Date(today); d.setDate(d.getDate() + 7);
      deadlineDate = d.toISOString().split('T')[0];
    } else if (deadlineType === 'month') {
      const d = new Date(today); d.setMonth(d.getMonth() + 1);
      deadlineDate = d.toISOString().split('T')[0];
    } else if (deadlineType === 'custom') {
      deadlineDate = customDeadline;
    }

    let reminderTime = null;
    if (reminderOption && deadlineDate) {
      const deadline = new Date(deadlineDate);
      if (reminderOption === '2saat') {
        const r = new Date(); r.setHours(r.getHours() + 2);
        reminderTime = r.toISOString().slice(0, 16);
      } else if (reminderOption === '1saat') {
        const r = new Date(); r.setHours(r.getHours() + 1);
        reminderTime = r.toISOString().slice(0, 16);
      } else if (reminderOption === 'gece21') {
        const r = new Date(); r.setHours(21, 0, 0);
        reminderTime = r.toISOString().slice(0, 16);
      } else if (reminderOption === 'yarin09') {
        const r = new Date(); r.setDate(r.getDate() + 1); r.setHours(9, 0, 0);
        reminderTime = r.toISOString().slice(0, 16);
      } else if (reminderOption === '1gun') {
        const r = new Date(deadline); r.setDate(r.getDate() - 1); r.setHours(9, 0, 0);
        reminderTime = r.toISOString().slice(0, 16);
      } else if (reminderOption === '3gun') {
        const r = new Date(deadline); r.setDate(r.getDate() - 3); r.setHours(9, 0, 0);
        reminderTime = r.toISOString().slice(0, 16);
      } else if (reminderOption === '1hafta') {
        const r = new Date(deadline); r.setDate(r.getDate() - 7); r.setHours(9, 0, 0);
        reminderTime = r.toISOString().slice(0, 16);
      }
    }

    await axios.post('http://localhost:3000/tasks', {
      user_id: userId, title, description, priority,
      deadline: deadlineDate,
      estimated_hours: (parseInt(estimatedHourVal || 0) * 60) + parseInt(estimatedMinutes || 0),
      tag_id: tagId || null,
      reminder_enabled: reminderTime ? 1 : 0,
      reminder_time: reminderTime
    });

    setTitle(''); setDescription(''); setDeadlineType('');
    setCustomDeadline(''); setEstimatedHourVal('');
    setEstimatedMinutes(''); setTagId(''); setReminderOption('');
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
      blue:   { background: 'rgba(74,143,232,0.15)', color: '#4a8fe8' },
      green:  { background: 'rgba(61,186,122,0.15)', color: '#3dba7a' },
      purple: { background: 'rgba(127,119,221,0.15)', color: '#7f77dd' },
      coral:  { background: 'rgba(216,90,48,0.15)', color: '#d85a30' },
      yellow: { background: 'rgba(240,180,41,0.15)', color: '#f0b429' },
    };
    return colors[color] || colors.blue;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const urgentTasks = tasks.filter(t =>
    !t.completed && (t.deadline === todayStr || t.deadline === tomorrowStr)
  );

  const filteredTasks = activeFilter
    ? tasks.filter(t => t.tag_id === activeFilter)
    : tasks;

  const completedCount = tasks.filter(t => t.completed === 1).length;
  const pendingCount = tasks.filter(t => t.completed === 0).length;

  const deadlineOptions = [
    { label: 'Bugün', value: 'today' },
    { label: 'Yarın', value: 'tomorrow' },
    { label: '1 hafta', value: 'week' },
    { label: 'Bu ay', value: 'month' },
    { label: 'Tarih seç', value: 'custom' },
  ];

  const reminderOptions = {
    today:    [{ label: '2 saat sonra', value: '2saat' }, { label: '1 saat sonra', value: '1saat' }],
    tomorrow: [{ label: 'Bu gece 21:00', value: 'gece21' }, { label: 'Yarın sabahı 09:00', value: 'yarin09' }],
    week:     [{ label: '1 gün önce 09:00', value: '1gun' }, { label: '3 gün önce 09:00', value: '3gun' }],
    month:    [{ label: '1 gün önce 09:00', value: '1gun' }, { label: '3 gün önce 09:00', value: '3gun' }, { label: '1 hafta önce 09:00', value: '1hafta' }],
    custom:   [{ label: '1 gün önce 09:00', value: '1gun' }, { label: '3 gün önce 09:00', value: '3gun' }, { label: '1 hafta önce 09:00', value: '1hafta' }],
  };

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
          ⚠️ <span><strong>{urgentTasks.length} görevin</strong> son tarihi yaklaşıyor: {urgentTasks.map(t => t.title).join(', ')}</span>
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
          <input placeholder="Açıklama (opsiyonel)" value={description} onChange={e => setDescription(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="critical">🔴 Kritik</option>
              <option value="high">🟠 Yüksek</option>
              <option value="medium">🟡 Orta</option>
              <option value="low">🟢 Düşük</option>
              <option value="minimal">⚪ Çok Düşük</option>
            </select>
            {tags.length > 0 && (
              <select value={tagId} onChange={e => setTagId(e.target.value)}>
                <option value="">Etiket seç</option>
                {tags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
              </select>
            )}
          </div>

          <div className="time-inputs">
            <input type="number" placeholder="Saat" min="0" value={estimatedHourVal} onChange={e => setEstimatedHourVal(e.target.value)} />
            <input type="number" placeholder="Dakika" min="0" max="59" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
          </div>

          <div style={{ borderTop: '1px solid #3a4a63', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: '#5a6e88', marginBottom: '8px', letterSpacing: '0.5px' }}>SON TARİH</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {deadlineOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => { setDeadlineType(opt.value); setReminderOption(''); }}
                  style={{
                    fontSize: '11px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                    background: deadlineType === opt.value ? 'rgba(74,143,232,0.15)' : 'transparent',
                    color: deadlineType === opt.value ? '#4a8fe8' : '#5a6e88',
                    border: '1px solid ' + (deadlineType === opt.value ? 'rgba(74,143,232,0.4)' : '#3a4a63')
                  }}
                >{opt.label}</div>
              ))}
            </div>
            {deadlineType === 'custom' && (
              <input
                type="date"
                value={customDeadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setCustomDeadline(e.target.value)}
                style={{ marginTop: '8px', width: '100%', background: '#243044', border: '1px solid #3a4a63', borderRadius: '8px', padding: '8px 12px', color: '#d8e2f0', fontSize: '13px' }}
              />
            )}
          </div>

          {deadlineType && (
            <div style={{ background: '#243044', border: '1px solid rgba(74,143,232,0.3)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: '#4a8fe8', letterSpacing: '1px', marginBottom: '8px' }}>⏰ HATIRLATICI</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(reminderOptions[deadlineType] || []).map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setReminderOption(reminderOption === opt.value ? '' : opt.value)}
                    style={{
                      fontSize: '11px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                      background: reminderOption === opt.value ? 'rgba(61,186,122,0.15)' : 'transparent',
                      color: reminderOption === opt.value ? '#3dba7a' : '#5a6e88',
                      border: '1px solid ' + (reminderOption === opt.value ? 'rgba(61,186,122,0.4)' : '#3a4a63')
                    }}
                  >{opt.label}</div>
                ))}
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
                color: activeFilter === tag.id ? getTagStyle(tag.color).color : '#5a6e88',
                background: activeFilter === tag.id ? getTagStyle(tag.color).background : 'transparent',
              }}
            >#{tag.name}</div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '8px' }}></div>
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