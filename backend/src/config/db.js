// backend/src/config/db.js
// Pool de conexiones MySQL – diseñado para XAMPP local
const mysql = require('mysql2/promise');
const path = require('path');

// Carga .env desde la raíz del backend (no depende del cwd)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:        Number(process.env.DB_PORT)   || 3306,
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME     || 'rc_soluciones',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // Buenas prácticas para evitar problemas de timezone y charset
  charset:           'utf8mb4',
  timezone:          'local',
});

// Verificación de conexión al inicio (no bloquea el arranque)
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado a', process.env.DB_NAME || 'rc_soluciones');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión MySQL:', err.message);
    console.error('   Asegúrate de que XAMPP/MySQL esté corriendo y la base "rc_soluciones" exista.');
  });

module.exports = pool;
