import React, { useEffect, useState } from "react";
import "./index.css";

const API = "/api";

// ── Fetch helpers ──
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
};
const postJSON = async (url, data) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json;
};
const deleteJSON = async (url) => {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
};
const patchJSON = async (url, data = {}) => {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
};

// ══════════════════════════════════════════
// LOGIN PAGE COMPONENT
// ══════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dataConsent, setDataConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos");
      return;
    }

    if (isRegister && !dataConsent) {
      setError("Debes aceptar el tratamiento de datos para registrarte");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const data = await postJSON(`${API}/auth/register`, { username: username.trim(), password });
        setSuccess("¡Cuenta creada! Ahora inicia sesión.");
        setIsRegister(false);
        setPassword("");
      } else {
        const data = await postJSON(`${API}/auth/login`, { username: username.trim(), password });
        localStorage.setItem("user", JSON.stringify(data));
        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
      </div>

      <div className="login-card">
        <div className="login-brand">
          <img src="/rc_soluciones_logo.png" alt="RC Soluciones" className="login-logo" />
          <h1 className="login-title">RC Soluciones</h1>
          <p className="login-tagline">"Controla tu dinero, construye tu futuro"</p>
        </div>

        <h2 className="login-heading">
          {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
        </h2>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              id="login-username"
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              id="login-password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {isRegister && (
            <label className={`consent-label ${dataConsent ? "consent-accepted" : ""}`}>
              <input
                id="data-consent"
                type="checkbox"
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
              />
              <span className="consent-check">{dataConsent ? "✅" : "⬜"}</span>
              <span className="consent-text">
                Acepto y <strong>permito el tratamiento de mis datos personales</strong> de acuerdo con la política de privacidad de RC Soluciones.
              </span>
            </label>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-login"
            disabled={loading || (isRegister && !dataConsent)}
          >
            {loading ? "Procesando..." : isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          <button
            id="toggle-register"
            className="link-btn"
            onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN APP COMPONENT
// ══════════════════════════════════════════
export default function App() {
  // ── Auth state ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  // ── Data state ──
  const [incomes, setIncomes]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [goals, setGoals]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError]       = useState(null);

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

  // ── Data fetching (sequential to respect connection limits) ──
  const fetchAll = async () => {
    try {
      setError(null);
      const inc = await fetchJSON(`${API}/incomes`);
      const exp = await fetchJSON(`${API}/expenses`);
      const al  = await fetchJSON(`${API}/alerts`);
      const go  = await fetchJSON(`${API}/goals`);
      const cat = await fetchJSON(`${API}/categories`);
      const sum = await fetchJSON(`${API}/summary`);
      setIncomes(inc);
      setExpenses(exp);
      setAlerts(al);
      setGoals(go);
      setCategories(cat);
    } catch (e) {
      console.error("Error cargando datos:", e.message);
      setError(e.message);
    }
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  // ── CRUD helpers ──
  const addIncome = async () => {
    if (!newIncome.amount || !newIncome.description || !newIncome.date) return;
    await postJSON(`${API}/incomes`, newIncome);
    setNewIncome({ amount: "", description: "", date: "", category_id: "" });
    fetchAll();
  };
  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.date) return;
    await postJSON(`${API}/expenses`, newExpense);
    setNewExpense({ amount: "", description: "", date: "", category_id: "" });
    fetchAll();
  };
  const addAlert = async () => {
    if (!newAlert.service || !newAlert.due_date) return;
    await postJSON(`${API}/alerts`, newAlert);
    setNewAlert({ service: "", due_date: "", note: "" });
    fetchAll();
  };
  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount || !newGoal.target_date) return;
    await postJSON(`${API}/goals`, newGoal);
    setNewGoal({ title: "", target_amount: "", saved_amount: "0", target_date: "" });
    fetchAll();
  };
  const deleteItem = async (endpoint, id) => {
    await deleteJSON(`${API}/${endpoint}/${id}`);
    fetchAll();
  };
  const markAlertPaid = async (id) => {
    await patchJSON(`${API}/alerts/${id}/pay`);
    fetchAll();
  };
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
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

  // ── If not logged in, show login page ──
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/rc_soluciones_logo.png" alt="RC Soluciones" className="sidebar-logo" />
          <h1 className="sidebar-title">RC Soluciones</h1>
          <p className="sidebar-tagline">"Controla tu dinero, construye tu futuro"</p>
        </div>

        <div className="sidebar-user">
          <span className="user-icon">👤</span>
          <span className="user-name">{user.username}</span>
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
              id={`nav-${t.key}`}
              className={`nav-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <button id="theme-toggle" className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
        <button id="logout-btn" className="logout-btn" onClick={logout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span>⚠️ Error: {error}</span>
            <button className="btn btn-sm btn-primary" onClick={fetchAll}>Reintentar</button>
          </div>
        )}

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
                <input id="income-amount" type="number" placeholder="Monto" value={newIncome.amount}
                  onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} />
                <input id="income-description" placeholder="Descripción" value={newIncome.description}
                  onChange={e => setNewIncome({ ...newIncome, description: e.target.value })} />
                <input id="income-date" type="date" value={newIncome.date}
                  onChange={e => setNewIncome({ ...newIncome, date: e.target.value })} />
                <select id="income-category" value={newIncome.category_id}
                  onChange={e => setNewIncome({ ...newIncome, category_id: e.target.value })}>
                  <option value="">Categoría (opcional)</option>
                  {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button id="add-income-btn" className="btn btn-primary" onClick={addIncome}>Añadir Ingreso</button>
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
                <input id="expense-amount" type="number" placeholder="Monto" value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
                <input id="expense-description" placeholder="Descripción" value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                <input id="expense-date" type="date" value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
                <select id="expense-category" value={newExpense.category_id}
                  onChange={e => setNewExpense({ ...newExpense, category_id: e.target.value })}>
                  <option value="">Categoría (opcional)</option>
                  {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button id="add-expense-btn" className="btn btn-primary" onClick={addExpense}>Añadir Gasto</button>
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
                <input id="alert-service" placeholder="Servicio (ej: Agua, Luz)" value={newAlert.service}
                  onChange={e => setNewAlert({ ...newAlert, service: e.target.value })} />
                <input id="alert-due-date" type="date" value={newAlert.due_date}
                  onChange={e => setNewAlert({ ...newAlert, due_date: e.target.value })} />
                <input id="alert-note" placeholder="Nota (opcional)" value={newAlert.note}
                  onChange={e => setNewAlert({ ...newAlert, note: e.target.value })} />
                <button id="add-alert-btn" className="btn btn-primary" onClick={addAlert}>Añadir Alerta</button>
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
                <input id="goal-title" placeholder="Título de la meta" value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} />
                <input id="goal-target" type="number" placeholder="Monto objetivo" value={newGoal.target_amount}
                  onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })} />
                <input id="goal-saved" type="number" placeholder="Ahorrado hasta ahora" value={newGoal.saved_amount}
                  onChange={e => setNewGoal({ ...newGoal, saved_amount: e.target.value })} />
                <input id="goal-date" type="date" value={newGoal.target_date}
                  onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} />
                <button id="add-goal-btn" className="btn btn-primary" onClick={addGoal}>Añadir Meta</button>
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
