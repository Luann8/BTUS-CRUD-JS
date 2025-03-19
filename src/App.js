import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [area, setArea] = useState('');
  const [people, setPeople] = useState('');
  const [appliance, setAppliance] = useState('');
  const [calculatedBTU, setCalculatedBTU] = useState(null);
  const [obs, setObs] = useState('');
  const [history, setHistory] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAction, setEditAction] = useState('');
  const [editObs, setEditObs] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await fetch('/history', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history || []);
      } else {
        setHistory([]);
        console.error('Erro ao buscar histórico:', data.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao buscar histórico:', err);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchHistory();
    }
  }, [loggedIn]);

  const calculateBTU = (area, people, appliance) => {
    return area * 600 + people * 500 + appliance * 1500;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!area || !people || !appliance) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    const btu = calculateBTU(Number(area), Number(people), Number(appliance));
    setCalculatedBTU(btu);
  };

  const handleSave = async () => {
    if (calculatedBTU === null) {
      alert('Por favor, calcule um BTU antes de salvar.');
      return;
    }

    const action = `${user.username} calculou BTU: ${calculatedBTU} (Área: ${area}m², Pessoas: ${people}, Aparelhos: ${appliance})`;
    try {
      const response = await fetch('/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, obs }),
      });
      const data = await response.json();

      if (response.ok) {
        setHistory([{ id: data.id, action, obs, timestamp: new Date().toISOString() }, ...history]);
        setCalculatedBTU(null);
        setArea('');
        setPeople('');
        setAppliance('');
        setObs('');
      } else {
        alert(data.message || 'Erro ao salvar o cálculo.');
      }
    } catch (err) {
      console.error('Erro ao salvar cálculo:', err);
      alert('Erro ao conectar ao servidor.');
    }
  };

  const handleEdit = (id, action, obs) => {
    setEditId(id);
    setEditAction(action);
    setEditObs(obs || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editAction) {
      alert('A ação não pode estar vazia.');
      return;
    }

    try {
      const response = await fetch(`/history/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: editAction, obs: editObs }),
      });
      const data = await response.json();

      if (response.ok) {
        setHistory(history.map(item =>
          item.id === editId ? { ...item, action: editAction, obs: editObs } : item
        ));
        setEditId(null);
        setEditAction('');
        setEditObs('');
      } else {
        alert(data.message || 'Erro ao atualizar o histórico.');
      }
    } catch (err) {
      console.error('Erro ao atualizar histórico:', err);
      alert('Erro ao conectar ao servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cálculo?')) return;

    try {
      const response = await fetch(`/history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      } else {
        alert(data.message || 'Erro ao deletar o histórico.');
      }
    } catch (err) {
      console.error('Erro ao deletar histórico:', err);
      alert('Erro ao conectar ao servidor.');
    }
  };

  const handleLogin = (userData) => {
    setLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setLoggedIn(false);
      setUser(null);
      setCalculatedBTU(null);
      setHistory([]);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      alert('Erro ao desconectar do servidor.');
    }
  };

  if (!loggedIn) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Calculadora de BTUs</h1>
        </header>
        <main className="app-main">
          <section className="auth-section">
            {showRegister ? (
              <div className="auth-wrapper">
                <Register onRegister={() => setShowRegister(false)} />
                <button
                  onClick={() => setShowRegister(false)}
                  className="toggle-auth-btn"
                >
                  Já tem conta? Faça login
                </button>
              </div>
            ) : (
              <div className="auth-wrapper">
                <Login onLogin={handleLogin} />
                <button
                  onClick={() => setShowRegister(true)}
                  className="toggle-auth-btn"
                >
                  Não tem conta? Registre-se
                </button>
              </div>
            )}
          </section>
        </main>
        {/* Removi o footer aqui */}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Calculadora de BTUs</h1>
        <div className="user-info">
          <span>Bem-vindo, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <main className="app-main">
        <section className="calculator-section">
          <h2 className="section-title">Calcule seu BTU</h2>
          <p className="section-subtitle">
            Insira os dados abaixo para calcular a potência ideal do ar-condicionado.
          </p>
          <form onSubmit={handleCalculate} className="calculator-form">
            <div className="calculator-inputs">
              <div className="form-group">
                <label>Área (m²):</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  min="1"
                  placeholder="Digite a área"
                />
              </div>
              <div className="form-group">
                <label>Pessoas:</label>
                <input
                  type="number"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  required
                  min="1"
                  placeholder="Quantidade de pessoas"
                />
              </div>
              <div className="form-group">
                <label>Aparelhos:</label>
                <input
                  type="number"
                  value={appliance}
                  onChange={(e) => setAppliance(e.target.value)}
                  required
                  min="0"
                  placeholder="Nº de aparelhos"
                />
              </div>
            </div>
            <button type="submit" className="calculate-btn">Calcular BTU</button>
          </form>

          {calculatedBTU !== null && (
            <div className="result-container">
              <h3 className="result-title">Resultado do Cálculo</h3>
              <p>BTU Calculado: <strong>{calculatedBTU}</strong></p>
              <div className="form-group obs-group">
                <label>Observação:</label>
                <input
                  type="text"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Adicione uma observação (opcional)"
                />
              </div>
              <button onClick={handleSave} className="save-btn">Salvar Cálculo</button>
            </div>
          )}
        </section>

        <section className="history-section">
          <h2 className="section-title">Histórico de Cálculos</h2>
          <p className="section-subtitle">Pode colocar comentários nos cálculos.</p>
          <p className="section-subtitle">Veja seus cálculos anteriores, já fez {history.length} cálculos.</p>
          
          {history.length > 0 ? (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id}>
                  {editId === item.id ? (
                    <form onSubmit={handleUpdate} className="edit-form">
                      <input
                        type="text"
                        value={editAction}
                        onChange={(e) => setEditAction(e.target.value)}
                        required
                        placeholder="Descrição do cálculo"
                      />
                      <input
                        type="text"
                        value={editObs}
                        onChange={(e) => setEditObs(e.target.value)}
                        placeholder="Observação (opcional)"
                      />
                      <button type="submit" className="edit-save-btn">Salvar</button>
                      <button type="button" onClick={() => setEditId(null)} className="edit-cancel-btn">Cancelar</button>
                    </form>
                  ) : (
                    <>
                      <div className="history-item-content">
                        <p>{item.action}</p>
                        {item.obs && <span className="obs">Obs: {item.obs}</span>}
                        <small>{new Date(item.timestamp).toLocaleString()}</small>
                      </div>
                      <div className="history-item-actions">
                        <button
                          onClick={() => handleEdit(item.id, item.action, item.obs)}
                          className="edit-btn"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="delete-btn"
                          title="Deletar"
                        >
                          ✗
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-history">Nenhum cálculo salvo ainda.</p>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2025 Calculadora de BTUs. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
