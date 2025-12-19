import fs from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
dotenv.config({ path: join(__dirname, '../.env') });

const sql = fs.readFileSync(join(__dirname, '../db/schema.sql'), 'utf8');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('🔗 Connecting to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Applying schema to Supabase...');
    await client.query(sql);
    console.log('✅ Schema applied successfully!');
  } catch (err) {
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      console.log('⚠️ Some tables already exist - this is okay, continuing...');
    } else {
      console.error('❌ Error applying schema:', err.message);
      throw err;
    }
  } finally {
    client.release();
    await pool.end();
  }
})().catch(err => {
  console.error('❌ Failed to apply schema:', err);
  process.exit(1);
});

