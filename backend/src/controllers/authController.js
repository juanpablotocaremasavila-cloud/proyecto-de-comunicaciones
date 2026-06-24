// backend/src/controllers/authController.js
const pool = require('../config/db');
const crypto = require('crypto');

// Simple SHA-256 hash (no bcrypt dependency needed)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// POST /api/auth/register — crear usuario
exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren usuario y contraseña' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }
  try {
    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?', [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }
    const password_hash = hashPassword(password);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, password_hash]
    );
    res.status(201).json({ id: result.insertId, username, message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login — iniciar sesión
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren usuario y contraseña' });
  }
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash FROM users WHERE username = ?', [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const user = rows[0];
    const inputHash = hashPassword(password);
    if (inputHash !== user.password_hash) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    res.json({
      id: user.id,
      username: user.username,
      message: 'Inicio de sesión exitoso',
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
