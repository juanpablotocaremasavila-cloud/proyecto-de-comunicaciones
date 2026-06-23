// backend/src/app.js
// ─────────────────────────────────────────────
// Punto de entrada MVC – RC Soluciones Backend
// ─────────────────────────────────────────────
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');

// Rutas
const incomeRoutes   = require('./routes/incomeRoutes');
const expenseRoutes  = require('./routes/expenseRoutes');
const alertRoutes    = require('./routes/alertRoutes');
const goalRoutes     = require('./routes/goalRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const summaryRoutes  = require('./routes/summaryRoutes');

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());          // reemplaza body-parser
app.use(express.urlencoded({ extended: true }));

// ── Log de peticiones (desarrollo) ──
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} │ ${req.method} ${req.url}`);
  next();
});

// ── API Routes ──
app.use('/api/incomes',    incomeRoutes);
app.use('/api/expenses',   expenseRoutes);
app.use('/api/alerts',     alertRoutes);
app.use('/api/goals',      goalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/summary',    summaryRoutes);

// ── Health check ──
app.get('/api/ping', (_req, res) => res.json({ status: 'ok', msg: 'pong', timestamp: new Date() }));

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Error handler global ──
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Start ──
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 RC Soluciones Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'rc_soluciones'}`);
  console.log(`   Endpoints disponibles:`);
  console.log(`     GET/POST        /api/incomes`);
  console.log(`     GET/POST        /api/expenses`);
  console.log(`     GET/POST        /api/alerts`);
  console.log(`     GET/POST        /api/goals`);
  console.log(`     GET             /api/categories`);
  console.log(`     GET             /api/summary`);
  console.log(`     GET             /api/ping\n`);
});
