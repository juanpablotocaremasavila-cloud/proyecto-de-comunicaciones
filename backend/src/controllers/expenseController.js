// backend/src/controllers/expenseController.js
const pool = require('../config/db');

// GET /api/expenses — listar todos los gastos con su categoría
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name AS category_name
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      ORDER BY e.date DESC, e.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /expenses error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/expenses/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM expenses WHERE id = ?', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/expenses — crear gasto
exports.create = async (req, res) => {
  const { amount, description, date, category_id } = req.body;
  if (!amount || !description || !date) {
    return res.status(400).json({ error: 'Campos requeridos: amount, description, date' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO expenses (amount, description, date, category_id) VALUES (?, ?, ?, ?)',
      [amount, description, date, category_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Gasto creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/expenses/:id
exports.update = async (req, res) => {
  const { amount, description, date, category_id } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE expenses SET amount=?, description=?, date=?, category_id=? WHERE id=?',
      [amount, description, date, category_id || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ message: 'Gasto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/expenses/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM expenses WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ message: 'Gasto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
