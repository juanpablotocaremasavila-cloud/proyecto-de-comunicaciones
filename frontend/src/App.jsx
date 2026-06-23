import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import logo from "/rc_soluciones_logo.png";

const API = "http://localhost:4000/api";

export default function App() {
  // ── State ──
  const [incomes, setIncomes]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [goals, setGoals]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary]   = useState(null);

  // Form state
  const [newIncome,  setNewIncome]  = useState({ amount: "", description: "", date: "", category_id: "" });
  const [newExpense, setNewExpense] = useState({ amount: "", description: "", date: "", category_id: "" });
  const [newAlert,   setNewAlert]   = useState({ service: "", due_date: "", note: "" });
  const [newGoal,    setNewGoal]    = useState({ title: "", target_amount: "", saved_amount: "0", target_date: "" });

  // Active tab
  const [tab, setTab] = useState("dashboard");

  // Theme
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Data fetching ──
  const fetchAll = async () => {
    try {
      const [inc, exp, al, go, cat, sum] = await Promise.all([
        axios.get(`${API}/incomes`),
        axios.get(`${API}/expenses`),
        axios.get(`${API}/alerts`),
        axios.get(`${API}/goals`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/summary`),
      ]);
      setIncomes(inc.data);
      setExpenses(exp.data);
      setAlerts(al.data);
      setGoals(go.data);
      setCategories(cat.data);
      setSummary(sum.data);
    } catch (e) {
      console.error("Error cargando datos:", e.message);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── CRUD helpers ──
  const addIncome = async () => {
    if (!newIncome.amount || !newIncome.description || !newIncome.date) return;
    await axios.post(`${API}/incomes`, newIncome);
    setNewIncome({ amount: "", description: "", date: "", category_id: "" });
    fetchAll();
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.date) return;
    await axios.post(`${API}/expenses`, newExpense);
    setNewExpense({ amount: "", description: "", date: "", category_id: "" });
    fetchAll();
  };

  const addAlert = async () => {
    if (!newAlert.service || !newAlert.due_date) return;
    await axios.post(`${API}/alerts`, newAlert);
    setNewAlert({ service: "", due_date: "", note: "" });
    fetchAll();
  };

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount || !newGoal.target_date) return;
    await axios.post(`${API}/goals`, newGoal);
    setNewGoal({ title: "", target_amount: "", saved_amount: "0", target_date: "" });
    fetchAll();
  };

  const deleteItem = async (endpoint, id) => {
    await axios.delete(`${API}/${endpoint}/${id}`);
    fetchAll();
  };

  const markAlertPaid = async (id) => {
    await axios.patch(`${API}/alerts/${id}/pay`);
    fetchAll();
  };

  // ── Derived data ──
  const incomeCategories  = categories.filter(c => c.type === "income");
  const expenseCategories = categories.filter(c => c.type === "expense");
  const totalIncome  = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // ── Format helpers ──
  const money = (n) => `$${Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO") : "";

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="RC Soluciones" className="sidebar-logo" />
          <h1 className="sidebar-title">RC Soluciones</h1>
          <p className="sidebar-tagline">“Controla tu dinero, construye tu futuro”</p>
        </div>
        <nav className="sidebar-nav">
          {[
            { key: "dashboard", icon: "📊", label: "Dashboard" },
            { key: "incomes",   icon: "💰", label: "Ingresos" },
            { key: "expenses",  icon: "🛒", label: "Gastos" },
            { key: "alerts",    icon: "🔔", label: "Alertas" },
            { key: "goals",     icon: "🎯", label: "Metas" },
          ].map(t => (
            <button
              key={t.key}
              className={`nav-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        {/* ═══ DASHBOARD ═══ */}
        {tab === "dashboard" && (
          <section className="page">
            <h2 className="page-title">📊 Panel de Control Financiero</h2>
            <div className="kpi-grid">
              <div className="kpi-card kpi-income">
                <span className="kpi-icon">💰</span>
                <div><p className="kpi-label">Total Ingresos</p><p className="kpi-value">{money(totalIncome)}</p></div>
              </div>
              <div className="kpi-card kpi-expense">
                <span className="kpi-icon">🛒</span>
                <div><p className="kpi-label">Total Gastos</p><p className="kpi-value">{money(totalExpense)}</p></div>
              </div>
              <div className="kpi-card kpi-balance">
                <span className="kpi-icon">{balance >= 0 ? "✅" : "⚠️"}</span>
                <div><p className="kpi-label">Balance</p><p className="kpi-value">{money(balance)}</p></div>
              </div>
              <div className="kpi-card kpi-alerts">
                <span className="kpi-icon">🔔</span>
                <div><p className="kpi-label">Alertas Pendientes</p><p className="kpi-value">{alerts.filter(a => !a.is_paid).length}</p></div>
              </div>
            </div>
            <div className="dashboard-lists">
              <div className="dash-section">
                <h3>Últimos Ingresos</h3>
                {incomes.slice(0, 5).map(i => (
                  <div key={i.id} className="dash-row">
                    <span>{i.description}</span>
                    <span className="text-green">{money(i.amount)}</span>
                  </div>
                ))}
                {incomes.length === 0 && <p className="empty-msg">Sin ingresos registrados</p>}
              </div>
              <div className="dash-section">
                <h3>Últimos Gastos</h3>
                {expenses.slice(0, 5).map(e => (
                  <div key={e.id} className="dash-row">
                    <span>{e.description}</span>
                    <span className="text-red">{money(e.amount)}</span>
                  </div>
                ))}
                {expenses.length === 0 && <p className="empty-msg">Sin gastos registrados</p>}
              </div>
            </div>
          </section>
        )}

        {/* ═══ INGRESOS ═══ */}
        {tab === "incomes" && (
          <section className="page">
            <h2 className="page-title">💰 Ingresos</h2>
            <div className="form-card">
              <h3>Agregar Ingreso</h3>
              <div className="form-grid">
                <input type="number" placeholder="Monto" value={newIncome.amount}
                  onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} />
                <input placeholder="Descripción" value={newIncome.description}
                  onChange={e => setNewIncome({ ...newIncome, description: e.target.value })} />
                <input type="date" value={newIncome.date}
                  onChange={e => setNewIncome({ ...newIncome, date: e.target.value })} />
                <select value={newIncome.category_id}
                  onChange={e => setNewIncome({ ...newIncome, category_id: e.target.value })}>
                  <option value="">Categoría (opcional)</option>
                  {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="btn btn-primary" onClick={addIncome}>Añadir Ingreso</button>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Monto</th><th></th></tr></thead>
                <tbody>
                  {incomes.map(i => (
                    <tr key={i.id}>
                      <td>{fmtDate(i.date)}</td>
                      <td>{i.description}</td>
                      <td>{i.category_name || "—"}</td>
                      <td className="text-green">{money(i.amount)}</td>
                      <td><button className="btn-icon btn-danger" onClick={() => deleteItem("incomes", i.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {incomes.length === 0 && <p className="empty-msg">No hay ingresos. ¡Agrega uno!</p>}
            </div>
          </section>
        )}

        {/* ═══ GASTOS ═══ */}
        {tab === "expenses" && (
          <section className="page">
            <h2 className="page-title">🛒 Gastos</h2>
            <div className="form-card">
              <h3>Agregar Gasto</h3>
              <div className="form-grid">
                <input type="number" placeholder="Monto" value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
                <input placeholder="Descripción" value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                <input type="date" value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
                <select value={newExpense.category_id}
                  onChange={e => setNewExpense({ ...newExpense, category_id: e.target.value })}>
                  <option value="">Categoría (opcional)</option>
                  {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="btn btn-primary" onClick={addExpense}>Añadir Gasto</button>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Monto</th><th></th></tr></thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td>{fmtDate(e.date)}</td>
                      <td>{e.description}</td>
                      <td>{e.category_name || "—"}</td>
                      <td className="text-red">{money(e.amount)}</td>
                      <td><button className="btn-icon btn-danger" onClick={() => deleteItem("expenses", e.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expenses.length === 0 && <p className="empty-msg">No hay gastos registrados.</p>}
            </div>
          </section>
        )}

        {/* ═══ ALERTAS ═══ */}
        {tab === "alerts" && (
          <section className="page">
            <h2 className="page-title">🔔 Alertas de Servicios</h2>
            <div className="form-card">
              <h3>Agregar Alerta</h3>
              <div className="form-grid">
                <input placeholder="Servicio (ej: Agua, Luz)" value={newAlert.service}
                  onChange={e => setNewAlert({ ...newAlert, service: e.target.value })} />
                <input type="date" value={newAlert.due_date}
                  onChange={e => setNewAlert({ ...newAlert, due_date: e.target.value })} />
                <input placeholder="Nota (opcional)" value={newAlert.note}
                  onChange={e => setNewAlert({ ...newAlert, note: e.target.value })} />
                <button className="btn btn-primary" onClick={addAlert}>Añadir Alerta</button>
              </div>
            </div>
            <div className="alert-grid">
              {alerts.map(a => (
                <div key={a.id} className={`alert-card ${a.is_paid ? "paid" : "pending"}`}>
                  <div className="alert-header">
                    <strong>{a.service}</strong>
                    <span className={`badge ${a.is_paid ? "badge-paid" : "badge-pending"}`}>
                      {a.is_paid ? "✅ Pagado" : "⏳ Pendiente"}
                    </span>
                  </div>
                  <p className="alert-date">Vence: {fmtDate(a.due_date)}</p>
                  {a.note && <p className="alert-note">{a.note}</p>}
                  <div className="alert-actions">
                    {!a.is_paid && <button className="btn btn-sm btn-success" onClick={() => markAlertPaid(a.id)}>Marcar Pagado</button>}
                    <button className="btn btn-sm btn-danger" onClick={() => deleteItem("alerts", a.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="empty-msg">No hay alertas. ¡Todo al día!</p>}
            </div>
          </section>
        )}

        {/* ═══ METAS ═══ */}
        {tab === "goals" && (
          <section className="page">
            <h2 className="page-title">🎯 Metas del Hogar</h2>
            <div className="form-card">
              <h3>Agregar Meta</h3>
              <div className="form-grid">
                <input placeholder="Título de la meta" value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} />
                <input type="number" placeholder="Monto objetivo" value={newGoal.target_amount}
                  onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })} />
                <input type="number" placeholder="Ahorrado hasta ahora" value={newGoal.saved_amount}
                  onChange={e => setNewGoal({ ...newGoal, saved_amount: e.target.value })} />
                <input type="date" value={newGoal.target_date}
                  onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} />
                <button className="btn btn-primary" onClick={addGoal}>Añadir Meta</button>
              </div>
            </div>
            <div className="goals-grid">
              {goals.map(g => {
                const pct = g.target_amount > 0 ? Math.min(100, (g.saved_amount / g.target_amount) * 100) : 0;
                return (
                  <div key={g.id} className="goal-card">
                    <h4>{g.title}</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <p className="goal-stats">
                      {money(g.saved_amount)} / {money(g.target_amount)} ({pct.toFixed(0)}%)
                    </p>
                    <p className="goal-date">Meta: {fmtDate(g.target_date)}</p>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteItem("goals", g.id)}>Eliminar</button>
                  </div>
                );
              })}
              {goals.length === 0 && <p className="empty-msg">No hay metas. ¡Crea tu primera meta para el hogar!</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
