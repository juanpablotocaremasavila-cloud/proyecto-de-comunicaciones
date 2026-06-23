// backend/src/controllers/goalController.js
const pool = require('../config/db');

// GET /api/goals
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM goals ORDER BY target_date ASC, created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /goals error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/goals/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/goals
exports.create = async (req, res) => {
  const { title, target_amount, saved_amount = 0, target_date } = req.body;
  if (!title || !target_amount || !target_date) {
    return res.status(400).json({ error: 'Campos requeridos: title, target_amount, target_date' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO goals (title, target_amount, saved_amount, target_date) VALUES (?, ?, ?, ?)',
      [title, target_amount, saved_amount, target_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Meta creada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/goals/:id
exports.update = async (req, res) => {
  const { title, target_amount, saved_amount, target_date } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE goals SET title=?, target_amount=?, saved_amount=?, target_date=? WHERE id=?',
      [title, target_amount, saved_amount, target_date, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json({ message: 'Meta actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/goals/:id/save — agregar al monto ahorrado
exports.addSaving = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Se requiere un monto positivo' });
  }
  try {
    const [result] = await pool.execute(
      'UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ?',
      [amount, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json({ message: `Se agregaron $${amount} a la meta` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/goals/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM goals WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json({ message: 'Meta eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
