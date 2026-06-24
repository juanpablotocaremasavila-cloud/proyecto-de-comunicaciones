// backend/migrate.js
// Ejecuta el schema.sql contra la base de datos de Clever Cloud
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset:  'utf8mb4',
    ssl:      { rejectUnauthorized: false },
    multipleStatements: true,   // necesario para ejecutar el schema completo
  });

  console.log('✅ Conectado a Clever Cloud MySQL');

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('📄 Ejecutando schema.sql...');
  await connection.query(schema);
  console.log('✅ Schema ejecutado correctamente – tablas creadas');

  // Verificar tablas
  const [tables] = await connection.query('SHOW TABLES');
  console.log('\n📋 Tablas en la base de datos:');
  tables.forEach(row => {
    const name = Object.values(row)[0];
    console.log(`   • ${name}`);
  });

  await connection.end();
  console.log('\n🎉 Migración completada exitosamente');
}

migrate().catch(err => {
  console.error('❌ Error en la migración:', err.message);
  process.exit(1);
});
