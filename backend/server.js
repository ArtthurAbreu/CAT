// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

// Rota para listar todos os servidores cadastrados
app.get('/servidores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Servidores');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar servidores' });
  }
});

// Endpoint para excluir servidores
// Endpoint para excluir servidores
app.delete('/servidores/:id', async (req, res) => {
  const { id } = req.params;
  try {
      // Primeiro, exclua as avaliações associadas ao servidor
      await pool.query('DELETE FROM Avaliacoes WHERE servidor_id = $1', [id]);

      // Em seguida, exclua o servidor
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
    const result = await pool.query('SELECT * FROM Avaliacoes');
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