import React, { useState } from 'react';
import './Register.css';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Usuário registrado com sucesso!') {
        onRegister();
      } else {
        setError(data.message || 'Erro ao registrar');
      }
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError('Erro ao conectar ao servidor');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Crie sua Conta</h2>
      {error && <p className="register-error">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="username">Nome de Usuário</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu nome de usuário"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button type="submit" className="register-btn">Registrar</button>
      </form>
    </div>
  );
};

export default Register;