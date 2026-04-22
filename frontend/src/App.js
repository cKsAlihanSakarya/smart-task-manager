import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Daily from './pages/Daily';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import './App.css';
import Statistics from './pages/Statistics';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname;

  const items = [
    { path: '/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/daily', icon: '◈', label: 'Daily Tasks' },
    { path: '/calendar', icon: '▦', label: 'Calendar' },
    { path: '/statistics', icon: '📊', label: 'Statistics' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">TaskAI</div>
      <nav>
        {items.map(item => (
          <div
            key={item.path}
            className={`nav-item ${active === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon} {item.label}
          </div>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', borderTop: '1px solid #3a4a63', paddingTop: '8px' }}>
        <div
          className={`nav-item ${active === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          ⚙ Settings
        </div>
        <div className="nav-item" onClick={onLogout}>
          ⎋ Sign Out
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email');

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const displayName = localStorage.getItem('displayName') || email;

  if (!userId && !isAuthPage) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/statistics" element={<Statistics userId={userId} />} />
      </Routes>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar onLogout={handleLogout} />
      <Routes>
        <Route path="/dashboard" element={<Dashboard userId={userId} email={email} displayName={displayName} />} />
        <Route path="/daily" element={<Daily userId={userId} />} />
        <Route path="/calendar" element={<Calendar userId={userId} />} />
        <Route path="/statistics" element={<Statistics userId={userId} />} />
        <Route path="/settings" element={<Settings userId={userId} email={email} />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;