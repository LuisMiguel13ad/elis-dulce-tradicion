/**
 * Database Migration Runner
 * Tracks and applies database migrations in order
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Create migrations table if it doesn't exist
 */
async function ensureMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY name');
  return result.rows.map((row) => row.name);
}

/**
 * Get list of migration files
 */
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '../db/migrations');
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }
  
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

/**
 * Apply a single migration
 */
async function applyMigration(filename) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const filePath = path.join(__dirname, '../db/migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute migration SQL
    await client.query(sql);
    
    // Record migration
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [filename]);
    
    await client.query('COMMIT');
    console.log(`✅ Applied migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed to apply migration ${filename}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback a migration (manual process)
 */
async function rollbackMigration(filename) {
  console.warn(`⚠️  Rollback not automated. Manual rollback required for: ${filename}`);
  console.warn('Please create a rollback script or manually reverse the migration.');
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('🔄 Starting database migrations...\n');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get applied and pending migrations
    const applied = await getAppliedMigrations();
    const allMigrations = getMigrationFiles();
    const pending = allMigrations.filter((m) => !applied.includes(m));
    
    if (pending.length === 0) {
      console.log('✅ No pending migrations. Database is up to date.');
      return;
    }
    
    console.log(`📋 Found ${pending.length} pending migration(s):\n`);
    pending.forEach((m) => console.log(`  - ${m}`));
    console.log();
    
    // Apply pending migrations in order
    for (const migration of pending) {
      await applyMigration(migration);
    }
    
    console.log(`\n✅ Successfully applied ${pending.length} migration(s).`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export { migrate, rollbackMigration };
