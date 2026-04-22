import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ userId, email, displayName }) {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedHourVal, setEstimatedHourVal] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [tagId, setTagId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [deadlineType, setDeadlineType] = useState('');
  const [customDeadline, setCustomDeadline] = useState('');
  const [reminderOption, setReminderOption] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editCustomDeadline, setEditCustomDeadline] = useState('');
  const [editTagId, setEditTagId] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editMinutes, setEditMinutes] = useState('');

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
      console.error('AI suggestion failed:', err.message);
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    tasks.forEach(task => {
      if (task.reminder_enabled && task.reminder_time && !task.completed) {
        if (task.reminder_time === nowStr) {
          alert(`⏰ Reminder: It's time for "${task.title}"!`);
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

  const handleEdit = (e, task) => {
    e.stopPropagation();
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditCustomDeadline(task.deadline || '');
    setEditTagId(task.tag_id || '');
    const h = Math.floor((task.estimated_hours || 0) / 60);
    const m = (task.estimated_hours || 0) % 60;
    setEditHours(h || '');
    setEditMinutes(m || '');
  };

  const handleSaveEdit = async (taskId) => {
    await axios.patch(`http://localhost:3000/tasks/${taskId}`, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      deadline: editCustomDeadline || null,
      estimated_hours: (parseInt(editHours || 0) * 60) + parseInt(editMinutes || 0),
      tag_id: editTagId || null,
      reminder_enabled: 0,
      reminder_time: null
    });
    setEditingTask(null);
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

  const filteredTasks = (activeFilter
    ? tasks.filter(t => t.tag_id === activeFilter)
    : tasks
  ).filter(t => showCompleted ? true : t.completed === 0);

  const completedCount = tasks.filter(t => t.completed === 1).length;
  const pendingCount = tasks.filter(t => t.completed === 0).length;

  const deadlineOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: '1 Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Pick a date', value: 'custom' },
  ];

  const reminderOptions = {
    today:    [{ label: 'In 2 hours', value: '2saat' }, { label: 'In 1 hour', value: '1saat' }],
    tomorrow: [{ label: 'Tonight at 9 PM', value: 'gece21' }, { label: 'Tomorrow at 9 AM', value: 'yarin09' }],
    week:     [{ label: '1 day before 9 AM', value: '1gun' }, { label: '3 days before 9 AM', value: '3gun' }],
    month:    [{ label: '1 day before 9 AM', value: '1gun' }, { label: '3 days before 9 AM', value: '3gun' }, { label: '1 week before 9 AM', value: '1hafta' }],
    custom:   [{ label: '1 day before 9 AM', value: '1gun' }, { label: '3 days before 9 AM', value: '3gun' }, { label: '1 week before 9 AM', value: '1hafta' }],
  };

  const priorityLabel = {
    critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW', minimal: 'MINIMAL'
  };

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Hello, {displayName} 👋</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              background: showCompleted ? 'rgba(61,186,122,0.15)' : 'transparent',
              color: showCompleted ? '#3dba7a' : '#5a6e88',
              border: '1px solid ' + (showCompleted ? 'rgba(61,186,122,0.4)' : '#3a4a63'),
              borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            {showCompleted ? '✓ Hide Completed' : '✓ Show Completed'}
          </button>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>＋ New Task</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value accent">{tasks.length}</div></div>
        <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value yellow">{pendingCount}</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value green">{completedCount}</div></div>
      </div>

      {urgentTasks.length > 0 && (
        <div style={{
          background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.3)',
          borderRadius: '10px', padding: '12px 16px', fontSize: '13px',
          color: '#f0b429', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          ⚠️ <span><strong>{urgentTasks.length} task{urgentTasks.length > 1 ? 's' : ''}</strong> with upcoming deadlines: {urgentTasks.map(t => t.title).join(', ')}</span>
        </div>
      )}

      {aiSuggestion && aiEnabled && (
        <div className="ai-banner">
          <span className="ai-icon">🤖</span>
          <div>
            <div className="ai-label">AI SUGGESTION</div>
            <div className="ai-text">{aiSuggestion}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="task-form">
          <input placeholder="Task name" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
              <option value="minimal">⚪ Minimal</option>
            </select>
            {tags.length > 0 && (
              <select value={tagId} onChange={e => setTagId(e.target.value)}>
                <option value="">Select tag</option>
                {tags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
              </select>
            )}
          </div>

          <div className="time-inputs">
            <input type="number" placeholder="Hours" min="0" value={estimatedHourVal} onChange={e => setEstimatedHourVal(e.target.value)} />
            <input type="number" placeholder="Minutes" min="0" max="59" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
          </div>

          <div style={{ borderTop: '1px solid #3a4a63', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: '#5a6e88', marginBottom: '8px', letterSpacing: '0.5px' }}>DEADLINE</div>
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
              <div style={{ fontSize: '10px', color: '#4a8fe8', letterSpacing: '1px', marginBottom: '8px' }}>⏰ REMINDER</div>
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
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button className="add-btn" onClick={handleAddTask}>Save</button>
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
          >All</div>
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
          <div key={task.id}>
            {editingTask === task.id ? (
              <div className="task-form">
                <input placeholder="Task name" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                <input placeholder="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                    <option value="minimal">⚪ Minimal</option>
                  </select>
                  {tags.length > 0 && (
                    <select value={editTagId} onChange={e => setEditTagId(e.target.value)}>
                      <option value="">Select tag</option>
                      {tags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="time-inputs">
                  <input type="number" placeholder="Hours" min="0" value={editHours} onChange={e => setEditHours(e.target.value)} />
                  <input type="number" placeholder="Minutes" min="0" max="59" value={editMinutes} onChange={e => setEditMinutes(e.target.value)} />
                </div>
                <input
                  type="date"
                  value={editCustomDeadline}
                  onChange={e => setEditCustomDeadline(e.target.value)}
                  style={{ background: '#243044', border: '1px solid #3a4a63', borderRadius: '8px', padding: '8px 12px', color: '#d8e2f0', fontSize: '13px' }}
                />
                <div className="form-actions">
                  <button onClick={() => setEditingTask(null)}>Cancel</button>
                  <button className="add-btn" onClick={() => handleSaveEdit(task.id)}>Save</button>
                </div>
              </div>
            ) : (
              <div
                className={`task-item ${task.completed ? 'completed' : ''}`}
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              >
                <div className="task-check" onClick={(e) => handleComplete(e, task.id)}>
                  {task.completed ? '✓' : ''}
                </div>
                <div className="task-info">
                  <div className="task-name">{task.title}</div>
                  <div className="task-meta">
                    {task.deadline && `due: ${task.deadline}`}
                    {task.estimated_hours > 0 && ` · ${Math.floor(task.estimated_hours / 60) > 0 ? Math.floor(task.estimated_hours / 60) + 'h ' : ''}${task.estimated_hours % 60 > 0 ? task.estimated_hours % 60 + 'm' : ''}`}
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
                <span className={`badge ${task.priority}`}>{priorityLabel[task.priority]}</span>
                <button className="delete-btn" onClick={(e) => handleEdit(e, task)}>✏️</button>
                <button className="delete-btn" onClick={(e) => handleDelete(e, task.id)}>✕</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;