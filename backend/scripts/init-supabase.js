import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDb() {
  console.log('🔄 Initializing Supabase database...');
  
  try {
    const schemaPath = join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons to run individual queries (basic approach)
    // Or just run the whole block if pg supports it (it usually does for simple schemas)
    await pool.query(schema);
    
    console.log('✅ Schema applied successfully!');
    
    // Check if we have tables
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Tables created:');
    res.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDb();

