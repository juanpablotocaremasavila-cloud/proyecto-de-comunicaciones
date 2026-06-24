/* backend/schema.sql */
-- ============================================================
-- MySQL schema for RC Soluciones
-- Clever Cloud MySQL 8.4 (addon: btnvghl93jqid9fdbeiy)
-- La base de datos ya existe en Clever Cloud, no usar CREATE DATABASE.
-- Ejecutar con:
--   mysql -h HOST -u USER -p DB_NAME < schema.sql
-- ============================================================

-- ────────────────────────────────────────────
-- Tabla: categorías de ingreso / gasto
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100)  NOT NULL,
  type      ENUM('income','expense') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categorías por defecto
INSERT IGNORE INTO categories (id, name, type) VALUES
  (1, 'Salario',    'income'),
  (2, 'Venta',      'income'),
  (3, 'Otro ingreso','income'),
  (4, 'Mercado',    'expense'),
  (5, 'Transporte', 'expense'),
  (6, 'Servicios',  'expense'),
  (7, 'Arriendo',   'expense'),
  (8, 'Educación',  'expense'),
  (9, 'Otro gasto', 'expense');

-- ────────────────────────────────────────────
-- Tabla: ingresos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incomes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  amount      DECIMAL(12,2) NOT NULL,
  description VARCHAR(255)  NOT NULL,
  category_id INT           DEFAULT NULL,
  date        DATE          NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_income_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────
-- Tabla: gastos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  amount      DECIMAL(12,2) NOT NULL,
  description VARCHAR(255)  NOT NULL,
  category_id INT           DEFAULT NULL,
  date        DATE          NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────
-- Tabla: alertas de servicios
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  service    VARCHAR(100) NOT NULL,
  due_date   DATE         NOT NULL,
  note       TEXT,
  is_paid    TINYINT(1)   DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────
-- Tabla: metas financieras
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(150)  NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount  DECIMAL(12,2) DEFAULT 0,
  target_date   DATE          NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────
-- Tabla: usuarios (para futura autenticación)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────
-- Índices para consultas frecuentes
-- ────────────────────────────────────────────
CREATE INDEX idx_incomes_date      ON incomes(date);
CREATE INDEX idx_incomes_category  ON incomes(category_id);
CREATE INDEX idx_expenses_date     ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_alerts_due_date   ON alerts(due_date);
CREATE INDEX idx_goals_target_date ON goals(target_date);

-- ────────────────────────────────────────────
-- Vista: resumen financiero mensual
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  DATE_FORMAT(date, '%Y-%m') AS month,
  'income'                   AS type,
  SUM(amount)                AS total,
  COUNT(*)                   AS transactions
FROM incomes
GROUP BY DATE_FORMAT(date, '%Y-%m')
UNION ALL
SELECT
  DATE_FORMAT(date, '%Y-%m') AS month,
  'expense'                  AS type,
  SUM(amount)                AS total,
  COUNT(*)                   AS transactions
FROM expenses
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month DESC, type;
