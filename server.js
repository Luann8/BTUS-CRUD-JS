const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Erro ao conectar ao banco de dados:', err);
  else console.log('Conectado ao banco de dados SQLite');
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'seu-segredo-super-secreto',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - userId: ${req.session.userId || 'Nenhum'}`);
  next();
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS History (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, action TEXT NOT NULL, obs TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES Users(id))`);
});

const validateInput = (username, email, password) => {
  if (!username || !email || !password) return "Todos os campos são obrigatórios";
  if (!/\S+@\S+\.\S+/.test(email)) return "E-mail inválido";
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres";
  return null;
};

const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Não autenticado' });
  next();
};

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const validationError = validateInput(username, email, password);
  if (validationError) return res.status(400).json({ message: validationError });

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, row) => {
    if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
    if (row) return res.status(400).json({ message: 'E-mail já está em uso' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashedPassword], function (err) {
      if (err) return res.status(500).json({ message: 'Erro ao registrar usuário' });
      res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, row) => {
    if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
    if (!row || !bcrypt.compareSync(password, row.password)) return res.status(401).json({ message: 'Credenciais inválidas' });

    req.session.userId = row.id;
    req.session.username = row.username;
    console.log(`Login bem-sucedido para userId: ${row.id}, username: ${row.username}`);
    res.status(200).json({ message: 'Login bem-sucedido', user: { id: row.id, username: row.username } });
  });
});

app.post('/history', isAuthenticated, (req, res) => {
  const { action, obs } = req.body;
  if (!action) return res.status(400).json({ message: 'Ação é obrigatória' });

  db.run(`INSERT INTO History (userId, action, obs) VALUES (?, ?, ?)`, [req.session.userId, action, obs || ''], function (err) {
    if (err) return res.status(500).json({ message: 'Erro ao adicionar ao histórico' });
    console.log(`Ação adicionada para userId ${req.session.userId}: ${action}`);
    res.status(201).json({ message: 'Ação adicionada ao histórico', id: this.lastID });
  });
});

app.get('/history', isAuthenticated, (req, res) => {
  db.all(`SELECT id, action, obs, timestamp FROM History WHERE userId = ? ORDER BY timestamp DESC`, [req.session.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar histórico' });
    console.log(`Histórico retornado para userId ${req.session.userId}:`, rows);
    res.status(200).json({ message: 'Histórico recuperado com sucesso', history: rows });
  });
});

// Novo endpoint: Atualizar histórico
app.put('/history/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { action, obs } = req.body;

  if (!action) return res.status(400).json({ message: 'Ação é obrigatória' });

  db.run(`UPDATE History SET action = ?, obs = ? WHERE id = ? AND userId = ?`, [action, obs || '', id, req.session.userId], function (err) {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar histórico' });
    if (this.changes === 0) return res.status(404).json({ message: 'Item não encontrado ou não pertence ao usuário' });

    console.log(`Histórico atualizado para userId ${req.session.userId}, id ${id}`);
    res.status(200).json({ message: 'Histórico atualizado com sucesso' });
  });
});

// Novo endpoint: Deletar histórico
app.delete('/history/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM History WHERE id = ? AND userId = ?`, [id, req.session.userId], function (err) {
    if (err) return res.status(500).json({ message: 'Erro ao deletar histórico' });
    if (this.changes === 0) return res.status(404).json({ message: 'Item não encontrado ou não pertence ao usuário' });

    console.log(`Histórico deletado para userId ${req.session.userId}, id ${id}`);
    res.status(200).json({ message: 'Histórico deletado com sucesso' });
  });
});

app.post('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Erro ao fazer logout' });
    console.log('Sessão destruída');
    res.status(200).json({ message: 'Logout bem-sucedido' });
  });
});

process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) console.error('Erro ao fechar conexão com o banco:', err);
    console.log('Conexão com o banco fechada');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
