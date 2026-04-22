import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Statistics({ userId }) {
  const [stats, setStats] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    const res = await axios.get(`http://localhost:3000/stats/${userId}`);
    setStats(res.data);
    getAiAnalysis(res.data);
  };

  const getAiAnalysis = async (data) => {
    try {
      const res = await axios.post('http://localhost:3000/ai/analysis', { stats: data });
      setAiAnalysis(res.data.analysis);
    } catch (err) {
      console.error('AI analysis failed.');
    }
  };

  const getTagStyle = (color) => {
    const colors = {
      blue:   { bg: 'rgba(74,143,232,0.15)',  fill: '#4a8fe8' },
      green:  { bg: 'rgba(61,186,122,0.15)',  fill: '#3dba7a' },
      purple: { bg: 'rgba(127,119,221,0.15)', fill: '#7f77dd' },
      coral:  { bg: 'rgba(216,90,48,0.15)',   fill: '#d85a30' },
      yellow: { bg: 'rgba(240,180,41,0.15)',  fill: '#f0b429' },
    };
    return colors[color] || colors.blue;
  };

  const priorityColors = {
    critical: '#f08080',
    high: '#f0a060',
    medium: '#f0c060',
    low: '#3dba7a',
    minimal: '#a0a0b0',
  };

  if (!stats) return (
    <div className="main-content">
      <div style={{ color: '#5a6e88', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
        Loading statistics...
      </div>
    </div>
  );

  const maxWeek = Math.max(...stats.weekDays.map(d => d.count), 1);
  const maxPriority = Math.max(...Object.values(stats.byPriority), 1);
  const maxTag = stats.tagStats.length > 0 ? Math.max(...stats.tagStats.map(t => t.count), 1) : 1;

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Statistics</h2>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value accent">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value green">{stats.completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value yellow">{stats.completionRate}%</div>
        </div>
      </div>

      {aiAnalysis && (
        <div style={{
          background: 'rgba(74,143,232,0.08)', border: '1px solid rgba(74,143,232,0.25)',
          borderRadius: '10px', padding: '14px 16px', display: 'flex', gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <div>
            <div style={{ fontSize: '9px', color: '#4a8fe8', letterSpacing: '1px', marginBottom: '4px' }}>WEEKLY ANALYSIS</div>
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>{aiAnalysis}</div>
          </div>
        </div>
      )}

      <div className="task-form" style={{ padding: '16px' }}>
        <div style={{ fontSize: '10px', color: '#5a6e88', letterSpacing: '1px', marginBottom: '14px' }}>TASKS COMPLETED THIS WEEK</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {stats.weekDays.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '10px', color: '#d8e2f0' }}>{d.count}</div>
              <div style={{ width: '100%', height: '60px', background: '#243044', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{
                  width: '100%',
                  height: `${(d.count / maxWeek) * 100}%`,
                  background: '#4a8fe8',
                  borderRadius: '4px',
                  minHeight: d.count > 0 ? '4px' : '0'
                }} />
              </div>
              <div style={{ fontSize: '9px', color: '#5a6e88' }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="task-form" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#5a6e88', letterSpacing: '1px', marginBottom: '14px' }}>BY PRIORITY</div>
          {Object.entries(stats.byPriority).map(([priority, count]) => (
            <div key={priority} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#d8e2f0', width: '65px', textAlign: 'right', flexShrink: 0, textTransform: 'capitalize' }}>{priority}</div>
              <div style={{ flex: 1, background: '#243044', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(count / maxPriority) * 100}%`,
                  height: '100%',
                  background: priorityColors[priority],
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{ fontSize: '10px', color: '#5a6e88', width: '20px' }}>{count}</div>
            </div>
          ))}
        </div>

        <div className="task-form" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#5a6e88', letterSpacing: '1px', marginBottom: '14px' }}>BY LABEL</div>
          {stats.tagStats.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#5a6e88', textAlign: 'center', padding: '16px 0' }}>
              No labels yet.
            </div>
          ) : (
            stats.tagStats.map((tag, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTagStyle(tag.color).fill, flexShrink: 0 }} />
                <div style={{ fontSize: '11px', color: '#d8e2f0', width: '70px', flexShrink: 0 }}>#{tag.name}</div>
                <div style={{ flex: 1, background: '#243044', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(tag.count / maxTag) * 100}%`,
                    height: '100%',
                    background: getTagStyle(tag.color).fill,
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: '#5a6e88', width: '20px' }}>{tag.count}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistics;