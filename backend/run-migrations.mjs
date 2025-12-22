import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to Supabase PostgreSQL');
    
    // Check existing tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    console.log('Existing tables:', tables.rows.map(r => r.tablename));
    
    // Run initial schema migration
    const migrationPath = './db/migrations/001_initial_schema.sql';
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log('\nRunning 001_initial_schema.sql...');
      
      // Split by semicolons but handle $$ blocks
      const statements = [];
      let current = '';
      let inBlock = false;
      
      for (const line of sql.split('\n')) {
        if (line.includes('$$')) {
          inBlock = !inBlock;
        }
        current += line + '\n';
        if (!inBlock && line.trim().endsWith(';')) {
          statements.push(current);
          current = '';
        }
      }
      if (current.trim()) statements.push(current);
      
      for (const stmt of statements) {
        if (stmt.trim() && !stmt.trim().startsWith('--')) {
          try {
            await client.query(stmt);
          } catch (err) {
            if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
              console.log('Warning:', err.message.substring(0, 80));
            }
          }
        }
      }
      console.log('✅ 001_initial_schema.sql completed');
    }
    
    // Run consent fields migration
    const consentPath = './db/migrations/002_add_consent_fields.sql';
    if (fs.existsSync(consentPath)) {
      const sql = fs.readFileSync(consentPath, 'utf8');
      console.log('\nRunning 002_add_consent_fields.sql...');
      for (const stmt of sql.split(';')) {
        if (stmt.trim() && !stmt.trim().startsWith('--')) {
          try {
            await client.query(stmt);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.log('Warning:', err.message.substring(0, 80));
            }
          }
        }
      }
      console.log('✅ 002_add_consent_fields.sql completed');
    }
    
    // Run state machine migration
    const statePath = './db/migrations/add-order-state-machine-columns.sql';
    if (fs.existsSync(statePath)) {
      const sql = fs.readFileSync(statePath, 'utf8');
      console.log('\nRunning add-order-state-machine-columns.sql...');
      for (const stmt of sql.split(';')) {
        if (stmt.trim() && !stmt.trim().startsWith('--')) {
          try {
            await client.query(stmt);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.log('Warning:', err.message.substring(0, 80));
            }
          }
        }
      }
      console.log('✅ add-order-state-machine-columns.sql completed');
    }
    
    // Verify tables exist
    const newTables = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    console.log('\n📊 Tables after migration:', newTables.rows.map(r => r.tablename));
    
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
