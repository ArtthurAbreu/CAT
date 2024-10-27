const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Cria o app Express
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configuração de conexão ao banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cat_db',
  password: 'postgres',
  port: 5432,
});

// Rota para cadastrar usuários
app.post('/signup', async (req, res) => {
  const { nome, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO Users (nome, email, password) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Rota para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.status(200).json({ message: 'Login bem-sucedido', user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (err) {
    console.error('Erro ao efetuar login:', err);
    res.status(500).json({ error: 'Erro ao efetuar login' });
  }
});

// Rota para cadastrar servidores
app.post('/servidores', async (req, res) => {
  const { nome, cargo, setor } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Servidores (nome, cargo, setor) VALUES ($1, $2, $3) RETURNING *',
      [nome, cargo, setor]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar servidor' });
  }
});

// Rota para listar todos os servidores
app.get('/servidores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Servidores');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar servidores' });
  }
});

// Rota para excluir servidores
app.delete('/servidores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Avaliacoes WHERE servidor_id = $1', [id]);
    const result = await pool.query('DELETE FROM Servidores WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir servidor:', err);
    res.status(500).json({ error: 'Erro ao excluir servidor' });
  }
});

// Rota para buscar avaliações
app.get('/avaliacoes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.nota, a.comentarios, s.nome AS servidor_nome
      FROM Avaliacoes a
      JOIN Servidores s ON a.servidor_id = s.id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

// Rota para cadastrar uma nova avaliação
app.post('/avaliacoes', async (req, res) => {
  const { servidor_id, nota, comentarios } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Avaliacoes (servidor_id, nota, comentarios) VALUES ($1, $2, $3) RETURNING *',
      [servidor_id, nota, comentarios]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar avaliação' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
