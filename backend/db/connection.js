import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from backend root
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  // Connection pooling optimization
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
  // Statement timeout (optional)
  statement_timeout: 10000, // 10 seconds
  // Query timeout (optional)
  query_timeout: 30000, // 30 seconds
});

// Test connection
pool.on('connect', () => {
  // console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
