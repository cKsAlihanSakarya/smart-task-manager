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
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">TaskAI</h1>
        <p className="auth-tagline">// smart task manager</p>
        {error && <p className="error-msg">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Sign In</button>
        <p className="auth-switch">Don't have an account? <span onClick={() => navigate('/register')}>Sign up</span></p>
      </div>
    </div>
  );
}

export default Login;