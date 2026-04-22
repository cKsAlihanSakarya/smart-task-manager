import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Calendar({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await axios.get(`http://localhost:3000/tasks/${userId}`);
    setTasks(res.data);
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const getTasksForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline === dateStr && t.completed === 0);
  };

  const getDotColor = (day) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return null;
    if (dayTasks.some(t => t.priority === 'critical' || t.priority === 'high')) return 'danger';
    if (dayTasks.some(t => t.priority === 'medium')) return 'warning';
    return 'success';
  };

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const priorityLabel = {
    critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW', minimal: 'MINIMAL'
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

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Calendar</h2>
      </div>

      <div className="task-form" style={{ padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
          {monthNames[month]} {year}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} style={{ fontSize: '10px', color: '#5a6e88', textAlign: 'center', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array(adjustedFirstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate();
            const dotColor = getDotColor(day);
            const isSelected = selectedDay === day;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  textAlign: 'center',
                  padding: '6px 2px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: dotColor ? 'pointer' : 'default',
                  background: isSelected ? '#4a8fe8' : isToday ? 'rgba(74,143,232,0.15)' : 'transparent',
                  color: isSelected ? 'white' : isToday ? '#4a8fe8' : '#d8e2f0',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {day}
                {dotColor && (
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%', margin: '2px auto 0',
                    background: dotColor === 'danger' ? '#f08080' : dotColor === 'warning' ? '#f0b429' : '#3dba7a'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
          {[['#f08080','High'], ['#f0b429','Medium'], ['#3dba7a','Low']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#5a6e88' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {selectedDay && (
        <>
          <div style={{ fontSize: '11px', color: '#5a6e88', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            {monthNames[month]} {selectedDay} — Tasks
          </div>
          {selectedTasks.length === 0 ? (
            <div style={{ color: '#5a6e88', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
              No tasks for this day.
            </div>
          ) : (
            <div className="task-list">
              {selectedTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <div className="task-name">{task.title}</div>
                    <div className="task-meta">
                      {task.tag_name && <span style={{ marginRight: '6px' }}>#{task.tag_name}</span>}
                      {task.estimated_hours > 0 && `${Math.floor(task.estimated_hours / 60) > 0 ? Math.floor(task.estimated_hours / 60) + 'h ' : ''}${task.estimated_hours % 60 > 0 ? task.estimated_hours % 60 + 'm' : ''}`}
                      {task.reminder_enabled ? ' · ⏰ ' + task.reminder_time : ''}
                    </div>
                  </div>
                  {task.tag_name && (
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                      ...getTagStyle(task.tag_color)
                    }}>#{task.tag_name}</span>
                  )}
                  <span className={`badge ${task.priority}`}>{priorityLabel[task.priority]}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Calendar;