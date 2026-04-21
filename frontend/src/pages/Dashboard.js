import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [deadline, setDeadline] = useState('');
    const [estimatedHourVal, setEstimatedHourVal] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const res = await axios.get(`http://localhost:3000/tasks/${userId}`);
        setTasks(res.data);
    };

    const handleAddTask = async () => {
        if (!title) return;
        await axios.post('http://localhost:3000/tasks', {
            user_id: userId, title, description, priority, deadline,
            estimated_hours: (parseInt(estimatedHourVal || 0) * 60) + parseInt(estimatedMinutes || 0)
        });
        setTitle(''); setDescription(''); setDeadline(''); setEstimatedHourVal(''); setEstimatedMinutes('');
        setShowForm(false);
        fetchTasks();
    };

    const handleComplete = async (id) => {
        await axios.patch(`http://localhost:3000/tasks/${id}/complete`);
        fetchTasks();
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/tasks/${id}`);
        fetchTasks();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const completedCount = tasks.filter(t => t.completed === 1).length;
    const pendingCount = tasks.filter(t => t.completed === 0).length;

    return (
        <div className="dashboard">
            <div className="sidebar">
                <div className="sidebar-logo">TaskAI</div>
                <nav>
                    <div className="nav-item active">▦ Dashboard</div>
                    <div className="nav-item" onClick={handleLogout}>⎋ Çıkış</div>
                </nav>
            </div>

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

                {aiSuggestion && (
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
                        <select value={priority} onChange={e => setPriority(e.target.value)}>
                            <option value="critical">🔴 Kritik</option>
                            <option value="high">🟠 Yüksek</option>
                            <option value="medium">🟡 Orta</option>
                            <option value="low">🟢 Düşük</option>
                            <option value="minimal">⚪ Çok Düşük</option>
                        </select>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                        <div className="time-inputs">
                            <input type="number" placeholder="Saat" min="0" value={estimatedHourVal} onChange={e => setEstimatedHourVal(e.target.value)} />
                            <input type="number" placeholder="Dakika" min="0" max="59" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setShowForm(false)}>İptal</button>
                            <button className="add-btn" onClick={handleAddTask}>Kaydet</button>
                        </div>
                    </div>
                )}

                <div className="task-list">
                    {tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-check" onClick={() => handleComplete(task.id)}>
                                {task.completed ? '✓' : ''}
                            </div>
                            <div className="task-info">
                                <div className="task-name">{task.title}</div>
                                <div className="task-meta">
                                    {task.deadline && `deadline: ${task.deadline}`}
                                    {task.estimated_hours > 0 && ` · ${Math.floor(task.estimated_hours / 60) > 0 ? Math.floor(task.estimated_hours / 60) + ' saat ' : ''}${task.estimated_hours % 60 > 0 ? task.estimated_hours % 60 + ' dk' : ''}`}
                                </div>                            </div>
                            <span className={`badge ${task.priority}`}>{task.priority.toUpperCase()}</span>
                            <button className="delete-btn" onClick={() => handleDelete(task.id)}>✕</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;