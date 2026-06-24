// Deprecated: original monolithic server moved to src/server.js (MVC architecture).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool – reads credentials from .env (Clever Cloud)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'btnvghl93jqid9fdbeiy-mysql.services.clever-cloud.com',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'uoocqh3it2ekh6g4',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'btnvghl93jqid9fdbeiy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
});

// Helper to run queries and handle errors uniformly
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ---------- CRUD Routes ---------- //
// Incomes
app.get('/api/incomes', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM incomes ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/incomes', async (req, res) => {
  const { amount, description, date } = req.body;
  try {
    const result = await query(
      'INSERT INTO incomes (amount, description, date) VALUES (?, ?, ?)',
      [amount, description, date]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/expenses', async (req, res) => {
  const { amount, description, date } = req.body;
  try {
    const result = await query(
      'INSERT INTO expenses (amount, description, date) VALUES (?, ?, ?)',
      [amount, description, date]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/alerts', async (req, res) => {
  const { service, due_date, note } = req.body;
  try {
    const result = await query(
      'INSERT INTO alerts (service, due_date, note) VALUES (?, ?, ?)',
      [service, due_date, note]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Goals
app.get('/api/goals', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM goals ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/goals', async (req, res) => {
  const { title, target_amount, saved_amount = 0, target_date } = req.body;
  try {
    const result = await query(
      'INSERT INTO goals (title, target_amount, saved_amount, target_date) VALUES (?, ?, ?, ?)',
      [title, target_amount, saved_amount, target_date]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/api/ping', (req, res) => res.json({ msg: 'pong' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
