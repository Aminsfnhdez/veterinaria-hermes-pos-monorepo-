import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }
  
  console.log('DATABASE_URL found (masked):', databaseUrl.replace(/:[^:]+@/, ':***@'));
  
  // Forzar SSL sin verificación de certificado
  console.log('\n1. Test connection with SELECT 1...');
  const pool = new pg.Pool({ 
    connectionString: databaseUrl + '?sslmode=require',
  });
  
  try {
    const result = await pool.query('SELECT 1 AS test');
    console.log('   ✓ SELECT 1 result:', result.rows[0]);
  } catch (err) {
    console.error('   ✗ Connection error:', err.message);
    await pool.end();
    process.exit(1);
  }
  
  console.log('\n2. Create pgcrypto extension...');
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('   ✓ pgcrypto created or already exists');
  } catch (err) {
    console.error('   ✗ pgcrypto error:', err.message);
    await pool.end();
    process.exit(1);
  }
  
  console.log('\n3. Execute schema.sql...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', '..', 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('   ✓ schema.sql executed');
  } catch (err) {
    console.error('   ✗ schema.sql error:', err.message);
    await pool.end();
    process.exit(1);
  }
  
  console.log('\n4. Execute seed.sql...');
  try {
    const seedSql = fs.readFileSync(path.join(__dirname, '..', '..', 'seed.sql'), 'utf8');
    await pool.query(seedSql);
    console.log('   ✓ seed.sql executed');
  } catch (err) {
    console.error('   ✗ seed.sql error:', err.message);
    await pool.end();
    process.exit(1);
  }
  
  console.log('\n5. Verificar conteos...');
  
  // Usuarios
  const userResult = await pool.query('SELECT COUNT(*) AS total_usuarios FROM usuario');
  console.log('   Usuarios:', userResult.rows[0].total_usuarios);
  
  // Clientes
  const clientResult = await pool.query('SELECT COUNT(*) AS total_clientes FROM cliente');
  console.log('   Clientes:', clientResult.rows[0].total_clientes);
  
  // Productos
  const productResult = await pool.query('SELECT COUNT(*) AS total_productos FROM producto');
  console.log('   Productos:', productResult.rows[0].total_productos);
  
  await pool.end();
  
  console.log('\n✓ BASE DE DATOS CONFIGURADA');
}

main();