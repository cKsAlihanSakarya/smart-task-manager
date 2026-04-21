import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Settings({ userId, email }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [showTagForm, setShowTagForm] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => { fetchTags(); }, []);

  const fetchTags = async () => {
    const res = await axios.get(`http://localhost:3000/tags/${userId}`);
    setTags(res.data);
  };

  const handleAddTag = async () => {
    if (!newTag) return;
    await axios.post('http://localhost:3000/tags', { user_id: userId, name: newTag, color: newTagColor });
    setNewTag('');
    setShowTagForm(false);
    fetchTags();
  };

  const handleDeleteTag = async (id) => {
    await axios.delete(`http://localhost:3000/tags/${id}`);
    fetchTags();
  };

  const colorOptions = [
    { value: 'blue', label: 'Mavi', bg: 'rgba(74,143,232,0.15)', color: '#4a8fe8' },
    { value: 'green', label: 'Yeşil', bg: 'rgba(61,186,122,0.15)', color: '#3dba7a' },
    { value: 'purple', label: 'Mor', bg: 'rgba(127,119,221,0.15)', color: '#7f77dd' },
    { value: 'coral', label: 'Mercan', bg: 'rgba(216,90,48,0.15)', color: '#d85a30' },
    { value: 'yellow', label: 'Sarı', bg: 'rgba(240,180,41,0.15)', color: '#f0b429' },
  ];

  const getTagStyle = (color) => {
    const c = colorOptions.find(o => o.value === color) || colorOptions[0];
    return { background: c.bg, color: c.color };
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : 'TA';

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Ayarlar</h2>
      </div>

      <div className="task-form" style={{ gap: '0' }}>
        <div style={{ fontSize: '11px', color: '#5a6e88', letterSpacing: '1px', marginBottom: '12px' }}>PROFİL</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'rgba(74,143,232,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 600, color: '#4a8fe8'
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{email}</div>
            <div style={{ fontSize: '11px', color: '#5a6e88' }}>TaskAI üyesi</div>
          </div>
        </div>
      </div>

      <div className="task-form">
        <div style={{ fontSize: '11px', color: '#5a6e88', letterSpacing: '1px', marginBottom: '12px' }}>ETİKETLER</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {tags.map(tag => (
            <div key={tag.id} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px',
              fontSize: '12px', ...getTagStyle(tag.color)
            }}>
              #{tag.name}
              <span
                onClick={() => handleDeleteTag(tag.id)}
                style={{ cursor: 'pointer', fontSize: '10px', opacity: 0.7 }}
              >✕</span>
            </div>
          ))}
          <div
            onClick={() => setShowTagForm(!showTagForm)}
            style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
              border: '1px dashed #3a4a63', color: '#5a6e88', cursor: 'pointer'
            }}
          >+ yeni etiket</div>
        </div>

        {showTagForm && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="Etiket adı"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              style={{ flex: 1, minWidth: '120px', background: '#243044', border: '1px solid #3a4a63', borderRadius: '8px', padding: '8px 12px', color: '#d8e2f0', fontSize: '13px' }}
            />
            <select
              value={newTagColor}
              onChange={e => setNewTagColor(e.target.value)}
              style={{ background: '#243044', border: '1px solid #3a4a63', borderRadius: '8px', padding: '8px 12px', color: '#d8e2f0', fontSize: '13px' }}
            >
              {colorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="add-btn" onClick={handleAddTag}>Ekle</button>
          </div>
        )}
      </div>

      <div className="task-form">
        <div style={{ fontSize: '11px', color: '#5a6e88', letterSpacing: '1px', marginBottom: '12px' }}>TERCİHLER</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #3a4a63' }}>
          <div>
            <div style={{ fontSize: '13px' }}>AI önerileri</div>
            <div style={{ fontSize: '11px', color: '#5a6e88' }}>Dashboard'da AI banner göster</div>
          </div>
          <div
            onClick={() => {
              const val = !aiEnabled;
              setAiEnabled(val);
              localStorage.setItem('aiEnabled', val);
            }}
            style={{
              width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
              background: aiEnabled ? '#4a8fe8' : '#3a4a63',
              position: 'relative', transition: 'background 0.2s'
            }}
          >
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '3px',
              left: aiEnabled ? '19px' : '3px', transition: 'left 0.2s'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;