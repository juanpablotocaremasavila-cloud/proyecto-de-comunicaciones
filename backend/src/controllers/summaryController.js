// backend/src/controllers/summaryController.js
const pool = require('../config/db');

// GET /api/summary — resumen financiero general
exports.getSummary = async (req, res) => {
  try {
    const [[incRow]] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM incomes'
    );
    const [[expRow]] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses'
    );
    const [[alertRow]] = await pool.execute(
      'SELECT COUNT(*) AS pending FROM alerts WHERE is_paid = 0'
    );
    const [[goalRow]] = await pool.execute(
      'SELECT COUNT(*) AS total, COALESCE(SUM(saved_amount), 0) AS total_saved, COALESCE(SUM(target_amount), 0) AS total_target FROM goals'
    );

    const totalIncome  = Number(incRow.total);
    const totalExpense = Number(expRow.total);

    res.json({
      totalIncome,
      totalExpense,
      balance:       totalIncome - totalExpense,
      pendingAlerts: alertRow.pending,
      goals: {
        count:       goalRow.total,
        totalSaved:  Number(goalRow.total_saved),
        totalTarget: Number(goalRow.total_target),
      },
    });
  } catch (err) {
    console.error('GET /summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/summary/monthly — resumen mensual desde la vista
exports.getMonthly = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM v_monthly_summary');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
