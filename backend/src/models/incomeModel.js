// backend/src/models/incomeModel.js
// Modelo de referencia – las consultas están en los controladores.
// Este archivo documenta la estructura de la tabla para referencia rápida.

module.exports = {
  table: 'incomes',
  columns: {
    id:          'INT AUTO_INCREMENT PRIMARY KEY',
    amount:      'DECIMAL(12,2) NOT NULL',
    description: 'VARCHAR(255) NOT NULL',
    category_id: 'INT DEFAULT NULL → FK categories(id)',
    date:        'DATE NOT NULL',
    created_at:  'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  },
};
