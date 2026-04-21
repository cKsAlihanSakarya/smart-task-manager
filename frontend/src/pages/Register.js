import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3000/auth/register', { email, password });
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Bu email zaten kayıtlı.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">TaskAI</h1>
        <p className="auth-tagline">// smart task manager</p>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleRegister}>Kayıt Ol</button>
        <p className="auth-switch">Zaten hesabın var mı? <span onClick={() => navigate('/login')}>Giriş yap</span></p>
      </div>
    </div>
  );
}

export default Register;