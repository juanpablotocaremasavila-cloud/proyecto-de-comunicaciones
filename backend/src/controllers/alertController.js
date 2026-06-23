// backend/src/controllers/alertController.js
const pool = require('../config/db');

// GET /api/alerts
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM alerts ORDER BY due_date ASC, created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /alerts error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/alerts/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/alerts
exports.create = async (req, res) => {
  const { service, due_date, note } = req.body;
  if (!service || !due_date) {
    return res.status(400).json({ error: 'Campos requeridos: service, due_date' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO alerts (service, due_date, note) VALUES (?, ?, ?)',
      [service, due_date, note || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Alerta creada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/alerts/:id
exports.update = async (req, res) => {
  const { service, due_date, note, is_paid } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE alerts SET service=?, due_date=?, note=?, is_paid=? WHERE id=?',
      [service, due_date, note || null, is_paid ? 1 : 0, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json({ message: 'Alerta actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/alerts/:id/pay — marcar como pagada
exports.markPaid = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE alerts SET is_paid = 1 WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json({ message: 'Alerta marcada como pagada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/alerts/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM alerts WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json({ message: 'Alerta eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
