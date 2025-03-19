// src/components/Calculator.js
import React, { useState } from 'react';

function Calculator({ user, onSave }) {
  const [area, setArea] = useState('');
  const [roomType, setRoomType] = useState('');
  const [btu, setBtu] = useState(null);
  const [obs, setObs] = useState('');

  const calculateBTU = (area, roomType) => {
    const baseBTU = area * 600; // Base: 600 BTU por m²
    const roomMultiplier = {
      sala: 1.1,   // +10% para salas
      quarto: 0.9, // -10% para quartos
    };
    const multiplier = roomMultiplier[roomType] || 1;
    return Math.round(baseBTU * multiplier);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!area || !roomType) {
      alert('Por favor, preencha a área e selecione o tipo de cômodo.');
      return;
    }
    const calculated = calculateBTU(Number(area), roomType);
    setBtu(calculated);
  };

  const handleSave = async () => {
    if (!btu) {
      alert('Por favor, calcule o BTU antes de salvar.');
      return;
    }

    const action = `${user.username} calculou BTU: ${btu} (Área: ${area}m², Cômodo: ${roomType})`;
    try {
      const response = await fetch('/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Usa a sessão do backend
        body: JSON.stringify({ action, obs }),
      });
      const data = await response.json();

      if (response.ok) {
        onSave({ id: data.id, action, obs, timestamp: new Date().toISOString() });
        setBtu(null);
        setArea('');
        setRoomType('');
        setObs('');
      } else {
        alert(data.message || 'Erro ao salvar o cálculo.');
      }
    } catch (err) {
      console.error('Erro ao salvar cálculo:', err);
      alert('Erro ao conectar ao servidor.');
    }
  };

  return (
    <div className="Calculator">
      <h2>Calculadora de BTU</h2>
      <form onSubmit={handleCalculate}>
        <div>
          <label>Área (m²):</label>
          <input
            type="number"
            placeholder="Digite a área"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
            min="1"
          />
        </div>
        <div>
          <label>Tipo de Cômodo:</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} required>
            <option value="">Selecione o tipo de cômodo</option>
            <option value="sala">Sala</option>
            <option value="quarto">Quarto</option>
          </select>
        </div>
        <button type="submit">Calcular BTU</button>
      </form>

      {btu !== null && (
        <div>
          <p>BTU necessário: {btu}</p>
          <div>
            <label>Observação:</label>
            <input
              type="text"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Adicione uma observação (opcional)"
            />
          </div>
          <button onClick={handleSave}>Salvar Cálculo</button>
        </div>
      )}
    </div>
  );
}

export default Calculator;