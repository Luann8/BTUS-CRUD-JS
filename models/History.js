import React, { useState, useEffect } from 'react';

const History = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Para enviar o cookie de sessão
        });

        const data = await response.json();

        if (response.ok && data.message === 'Histórico recuperado com sucesso') {
          setHistory(data.history);
        } else {
          setError(data.message || 'Erro ao carregar histórico');
        }
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
        setError('Erro ao conectar ao servidor, tente novamente');
      }
    };

    fetchHistory();
  }, []); // Executa uma vez ao montar o componente

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        onLogout(); // Chama o callback para deslogar
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Bem-vindo, {user.username}!</h2>
      <button
        onClick={handleLogout}
        style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', marginBottom: '20px' }}
      >
        Logout
      </button>
      <h3>Histórico</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {history.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {history.map((item, index) => (
            <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #ddd' }}>
              {item.action} - {new Date(item.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum histórico encontrado.</p>
      )}
    </div>
  );
};

export default History;