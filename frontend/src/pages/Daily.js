import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Daily({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState('');
  const [tagId, setTagId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchTags();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get(`http://localhost:3000/daily/${userId}`);
    setTasks(res.data);
  };

  const fetchTags = async () => {
    const res = await axios.get(`http://localhost:3000/tags/${userId}`);
    setTags(res.data);
  };

  const handleAdd = async () => {
    if (!title) return;
    await axios.post('http://localhost:3000/daily', {
      user_id: userId,
      title,
      tag_id: tagId || null
    });
    setTitle('');
    setTagId('');
    setShowForm(false);
    fetchTasks();
  };

  const handleComplete = async (id) => {
    await axios.patch(`http://localhost:3000/daily/${id}/complete`);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/daily/${id}`);
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

  const completedCount = tasks.filter(t => t.completed === 1).length;
  const bestStreak = tasks.length > 0 ? Math.min(...tasks.map(t => t.streak)) : 0;

  const filteredTasks = activeFilter
    ? tasks.filter(t => t.tag_id === activeFilter)
    : tasks;

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Günlük Görevler</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>＋ Ekle</button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Bugün</div>
          <div className="stat-value accent">{completedCount}/{tasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">En uzun streak</div>
          <div className="stat-value yellow">{bestStreak} gün</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tamamlanan</div>
          <div className="stat-value green">{completedCount}</div>
        </div>
      </div>

      {showForm && (
        <div className="task-form">
          <input
            placeholder="Günlük görev adı"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          {tags.length > 0 && (
            <select value={tagId} onChange={e => setTagId(e.target.value)}>
              <option value="">Etiket seç (opsiyonel)</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>#{tag.name}</option>
              ))}
            </select>
          )}
          <div className="form-actions">
            <button onClick={() => setShowForm(false)}>İptal</button>
            <button className="add-btn" onClick={handleAdd}>Kaydet</button>
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
        {filteredTasks.length === 0 && (
          <div style={{ color: '#5a6e88', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
            Henüz günlük görev eklenmemiş.
          </div>
        )}
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-check" onClick={() => handleComplete(task.id)}>
              {task.completed ? '✓' : ''}
            </div>
            <div className="task-info">
              <div className="task-name">{task.title}</div>
              {task.streak > 0 && (
                <div className="task-meta">🔥 {task.streak} gün streak</div>
              )}
            </div>
            {task.tag_name && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                ...getTagStyle(task.tag_color)
              }}>#{task.tag_name}</span>
            )}
            <button className="delete-btn" onClick={() => handleDelete(task.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Daily;