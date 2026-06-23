// backend/test_all.js
// Test completo de todos los endpoints API
// Requiere: backend corriendo en localhost:4000 + MySQL con schema cargado
const axios = require('axios');

const API = 'http://localhost:4000/api';
let createdIds = {};

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
  } catch (e) {
    console.error(`  ❌ ${name}: ${e.response?.data?.error || e.message}`);
  }
}

async function run() {
  console.log('\n🧪 RC Soluciones API — Test Suite\n');

  // ── Health check ──
  console.log('── Ping ──');
  await test('GET /api/ping', async () => {
    const r = await axios.get(`${API}/ping`);
    if (r.data.status !== 'ok') throw new Error('Ping fallido');
  });

  // ── Categories ──
  console.log('── Categories ──');
  await test('GET /api/categories', async () => {
    const r = await axios.get(`${API}/categories`);
    console.log(`     → ${r.data.length} categorías encontradas`);
  });
  await test('GET /api/categories/income', async () => {
    const r = await axios.get(`${API}/categories/income`);
    console.log(`     → ${r.data.length} categorías de ingreso`);
  });

  // ── Incomes ──
  console.log('── Incomes ──');
  await test('POST /api/incomes', async () => {
    const r = await axios.post(`${API}/incomes`, {
      amount: 1500000,
      description: 'Salario Junio',
      date: '2026-06-15',
      category_id: 1
    });
    createdIds.income = r.data.id;
    console.log(`     → ID creado: ${r.data.id}`);
  });
  await test('GET /api/incomes', async () => {
    const r = await axios.get(`${API}/incomes`);
    console.log(`     → ${r.data.length} ingresos`);
  });

  // ── Expenses ──
  console.log('── Expenses ──');
  await test('POST /api/expenses', async () => {
    const r = await axios.post(`${API}/expenses`, {
      amount: 85000,
      description: 'Mercado semanal',
      date: '2026-06-16',
      category_id: 4
    });
    createdIds.expense = r.data.id;
    console.log(`     → ID creado: ${r.data.id}`);
  });
  await test('GET /api/expenses', async () => {
    const r = await axios.get(`${API}/expenses`);
    console.log(`     → ${r.data.length} gastos`);
  });

  // ── Alerts ──
  console.log('── Alerts ──');
  await test('POST /api/alerts', async () => {
    const r = await axios.post(`${API}/alerts`, {
      service: 'Energía eléctrica',
      due_date: '2026-06-30',
      note: 'Recibo de junio'
    });
    createdIds.alert = r.data.id;
    console.log(`     → ID creado: ${r.data.id}`);
  });
  await test('PATCH /api/alerts/:id/pay', async () => {
    await axios.patch(`${API}/alerts/${createdIds.alert}/pay`);
    console.log(`     → Alerta ${createdIds.alert} marcada como pagada`);
  });

  // ── Goals ──
  console.log('── Goals ──');
  await test('POST /api/goals', async () => {
    const r = await axios.post(`${API}/goals`, {
      title: 'Vacaciones familiares',
      target_amount: 2000000,
      saved_amount: 300000,
      target_date: '2026-12-15'
    });
    createdIds.goal = r.data.id;
    console.log(`     → ID creado: ${r.data.id}`);
  });
  await test('PATCH /api/goals/:id/save', async () => {
    await axios.patch(`${API}/goals/${createdIds.goal}/save`, { amount: 150000 });
    console.log(`     → +$150,000 agregados a la meta`);
  });

  // ── Summary ──
  console.log('── Summary ──');
  await test('GET /api/summary', async () => {
    const r = await axios.get(`${API}/summary`);
    console.log(`     → Ingresos: $${r.data.totalIncome}, Gastos: $${r.data.totalExpense}, Balance: $${r.data.balance}`);
  });

  // ── Cleanup (delete test records) ──
  console.log('── Cleanup ──');
  if (createdIds.income)  await test('DELETE income',  () => axios.delete(`${API}/incomes/${createdIds.income}`));
  if (createdIds.expense) await test('DELETE expense', () => axios.delete(`${API}/expenses/${createdIds.expense}`));
  if (createdIds.alert)   await test('DELETE alert',   () => axios.delete(`${API}/alerts/${createdIds.alert}`));
  if (createdIds.goal)    await test('DELETE goal',    () => axios.delete(`${API}/goals/${createdIds.goal}`));

  console.log('\n✅ Test suite finalizado.\n');
}

run();
