const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');  // Importe a conexão com o banco de dados

// Defina o modelo de Usuário
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
