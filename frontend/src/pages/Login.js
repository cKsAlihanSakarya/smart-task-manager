import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3000/auth/login', { email, password });
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('email', res.data.email);
      navigate('/dashboard');
    } catch (err) {
      setError('Email veya şifre hatalı.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">TaskAI</h1>
        <p className="auth-tagline">// smart task manager</p>
        {error && <p className="error-msg">{error}</p>}
        <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Giriş Yap</button>
        <p className="auth-switch">Hesabın yok mu? <span onClick={() => navigate('/register')}>Kayıt ol</span></p>
      </div>
    </div>
  );
}

export default Login;