// database/database.js
const { Sequelize } = require('sequelize');

// Crie a conexão com o banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/database.sqlite',  // Caminho para o arquivo do banco de dados SQLite
});

module.exports = sequelize;
