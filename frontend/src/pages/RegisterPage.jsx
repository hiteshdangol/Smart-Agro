import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/RegisterPage.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axiosInstance.post('/auth/register', { name, email, password });
      localStorage.setItem('token', response.data.token);
      showToast('Registration successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Smart Agro</h1>
        <p className="register-subtitle">Join our farming community</p>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleRegister}>Register</button>
        <p className="register-footer">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
