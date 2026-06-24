// backend/src/config/db.js
// Pool de conexiones MySQL – Clever Cloud remote database
const mysql = require('mysql2/promise');
const path = require('path');

// Carga .env desde la raíz del backend (solo para desarrollo local)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Clever Cloud usa MYSQL_ADDON_* | local usa DB_*
const pool = mysql.createPool({
  host:              process.env.MYSQL_ADDON_HOST     || process.env.DB_HOST     || 'localhost',
  port:        Number(process.env.MYSQL_ADDON_PORT    || process.env.DB_PORT)    || 3306,
  user:              process.env.MYSQL_ADDON_USER     || process.env.DB_USER     || 'root',
  password:          process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD || '',
  database:          process.env.MYSQL_ADDON_DB       || process.env.DB_NAME     || 'btnvghl93jqid9fdbeiy',
  waitForConnections: true,
  connectionLimit:    3,
  queueLimit:         0,
  // Buenas prácticas para evitar problemas de timezone y charset
  charset:           'utf8mb4',
  timezone:          'local',
  // SSL requerido para conexiones remotas a Clever Cloud
  ssl:               { rejectUnauthorized: false },
});

// Verificación de conexión al inicio (no bloquea el arranque)
const dbName = process.env.MYSQL_ADDON_DB || process.env.DB_NAME || 'btnvghl93jqid9fdbeiy';
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado a Clever Cloud:', dbName);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión MySQL:', err.message);
    console.error('   Verifica las credenciales de Clever Cloud y que el addon esté activo.');
  });

module.exports = pool;
