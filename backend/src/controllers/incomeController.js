// backend/src/controllers/incomeController.js
const pool = require('../config/db');

// GET /api/incomes — listar todos los ingresos con su categoría
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT i.*, c.name AS category_name
      FROM incomes i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.date DESC, i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /incomes error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/incomes/:id — un ingreso específico
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM incomes WHERE id = ?', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/incomes — crear ingreso
exports.create = async (req, res) => {
  const { amount, description, date, category_id } = req.body;
  if (!amount || !description || !date) {
    return res.status(400).json({ error: 'Campos requeridos: amount, description, date' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO incomes (amount, description, date, category_id) VALUES (?, ?, ?, ?)',
      [amount, description, date, category_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Ingreso creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/incomes/:id — actualizar ingreso
exports.update = async (req, res) => {
  const { amount, description, date, category_id } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE incomes SET amount=?, description=?, date=?, category_id=? WHERE id=?',
      [amount, description, date, category_id || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    res.json({ message: 'Ingreso actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/incomes/:id — eliminar ingreso
exports.remove = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM incomes WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    res.json({ message: 'Ingreso eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
