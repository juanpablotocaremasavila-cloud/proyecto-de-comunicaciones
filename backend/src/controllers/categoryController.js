// backend/src/controllers/categoryController.js
const pool = require('../config/db');

// GET /api/categories — todas las categorías
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY type, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/categories/:type — categorías por tipo (income / expense)
exports.getByType = async (req, res) => {
  const { type } = req.params;
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Tipo debe ser "income" o "expense"' });
  }
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE type = ? ORDER BY name', [type]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
