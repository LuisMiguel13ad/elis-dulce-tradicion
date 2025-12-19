# Migration Path & Database Management

Guide for managing database migrations, version upgrades, and data transformations.

## Migration System

### Migration Files

Migrations are stored in `backend/db/migrations/` and follow this naming convention:

```
001_initial_schema.sql
002_add_user_profiles.sql
003_add_reviews_table.sql
004_add_search_optimization.sql
...
```

### Running Migrations

#### Automatic Migration

```bash
cd backend
npm run migrate
```

This will:
1. Check for pending migrations
2. Apply them in order
3. Record applied migrations in `migrations` table

#### Manual Migration

```bash
node backend/scripts/migrate.js
```

### Migration Runner Script

The migration runner (`backend/scripts/migrate.js`) provides:

- **Automatic tracking**: Records applied migrations
- **Ordered execution**: Applies migrations in filename order
- **Error handling**: Rolls back on failure
- **Status reporting**: Shows pending/applied migrations

### Creating New Migrations

1. **Create migration file**:
   ```bash
   touch backend/db/migrations/005_add_new_feature.sql
   ```

2. **Write migration SQL**:
   ```sql
   -- Migration: 005_add_new_feature.sql
   -- Description: Add new feature table
   -- Created: 2024-12-09

   CREATE TABLE IF NOT EXISTS new_feature (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE INDEX IF NOT EXISTS idx_new_feature_name ON new_feature(name);
   ```

3. **Test migration**:
   ```bash
   npm run migrate
   ```

4. **Verify**:
   - Check migration applied: `SELECT * FROM migrations;`
   - Verify schema changes
   - Test application functionality

## Migration Best Practices

### 1. Always Use IF NOT EXISTS

```sql
-- ✅ Good
CREATE TABLE IF NOT EXISTS orders (...);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ❌ Bad
CREATE TABLE orders (...); -- Will fail if exists
```

### 2. Make Migrations Reversible

Document rollback steps:

```sql
-- Migration: 006_add_column.sql
-- Rollback: ALTER TABLE orders DROP COLUMN IF EXISTS new_column;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS new_column VARCHAR(100);
```

### 3. Test on Copy of Production Data

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore to test database
psql $TEST_DATABASE_URL < backup.sql

# Run migration
npm run migrate

# Verify
psql $TEST_DATABASE_URL -c "\d orders"
```

### 4. Use Transactions

The migration runner automatically wraps migrations in transactions, but for manual migrations:

```sql
BEGIN;

-- Migration SQL here

COMMIT;
-- Or ROLLBACK; on error
```

### 5. Add Indexes After Data Migration

```sql
-- ✅ Good: Add data first, then index
INSERT INTO new_table SELECT * FROM old_table;
CREATE INDEX idx_new_table_name ON new_table(name);

-- ❌ Bad: Index slows down inserts
CREATE INDEX idx_new_table_name ON new_table(name);
INSERT INTO new_table SELECT * FROM old_table;
```

## Data Migration Procedures

### Migrating Existing Orders

```sql
-- Example: Migrate orders to new schema
BEGIN;

-- Add new column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS new_field VARCHAR(100);

-- Migrate data
UPDATE orders 
SET new_field = old_field 
WHERE new_field IS NULL;

-- Verify
SELECT COUNT(*) FROM orders WHERE new_field IS NULL; -- Should be 0

COMMIT;
```

### Data Transformation Scripts

Create scripts in `backend/scripts/` for complex data migrations:

```javascript
// backend/scripts/migrate-orders.js
import pool from '../db/connection.js';

async function migrateOrders() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Transform data
    const result = await client.query(`
      UPDATE orders
      SET status = CASE
        WHEN status = 'pending_payment' THEN 'pending'
        WHEN status = 'in_kitchen' THEN 'in_progress'
        ELSE status
      END
      WHERE status IN ('pending_payment', 'in_kitchen');
    `);
    
    console.log(`Migrated ${result.rowCount} orders`);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

migrateOrders();
```

## Backup Procedures

### Automated Backups

#### Supabase Automated Backups

Supabase provides automatic daily backups. To restore:

1. Go to Supabase Dashboard → Database → Backups
2. Select backup date
3. Click "Restore" (creates new database)
4. Update `DATABASE_URL` if needed

#### Manual Backups

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Specific table backup
pg_dump $DATABASE_URL -t orders > orders_backup.sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Weekly CSV Exports

```bash
# Export orders
psql $DATABASE_URL -c "COPY orders TO STDOUT CSV HEADER" > orders_export.csv

# Export customers
psql $DATABASE_URL -c "COPY (SELECT * FROM user_profiles) TO STDOUT CSV HEADER" > customers_export.csv
```

### Restore Procedures

```bash
# Restore from SQL dump
psql $DATABASE_URL < backup_20241209.sql

# Restore from compressed dump
gunzip < backup_20241209.sql.gz | psql $DATABASE_URL

# Restore specific table
psql $DATABASE_URL -c "\copy orders FROM 'orders_backup.csv' CSV HEADER"
```

## Version Upgrade Path

### Breaking Changes Log

Document breaking changes between versions:

#### v1.0.0 → v2.0.0

**Breaking Changes**:
- Order status values changed
- Payment table schema updated
- New required fields in orders table

**Migration Steps**:
1. Backup database
2. Run migration: `002_update_order_statuses.sql`
3. Update application code
4. Test thoroughly
5. Deploy

### Upgrade Checklist

- [ ] Review breaking changes
- [ ] Backup production database
- [ ] Test migration on staging
- [ ] Update application code
- [ ] Run migration on production
- [ ] Verify data integrity
- [ ] Monitor for errors
- [ ] Update documentation

## Rollback Procedures

### Automatic Rollback

Migrations are wrapped in transactions, so failures automatically rollback. However, some operations cannot be rolled back:

- `DROP TABLE` (use `DROP TABLE IF EXISTS` and recreate)
- `DROP COLUMN` (data is lost)
- `TRUNCATE` (data is lost)

### Manual Rollback

1. **Identify migration to rollback**
   ```sql
   SELECT * FROM migrations ORDER BY applied_at DESC LIMIT 5;
   ```

2. **Create rollback script**
   ```sql
   -- Rollback: 005_add_new_feature.sql
   DROP TABLE IF EXISTS new_feature;
   DELETE FROM migrations WHERE name = '005_add_new_feature.sql';
   ```

3. **Test rollback on staging first**

4. **Execute rollback on production**

## Migration Status

### Check Applied Migrations

```sql
SELECT name, applied_at 
FROM migrations 
ORDER BY applied_at DESC;
```

### Check Pending Migrations

```bash
# List migration files
ls backend/db/migrations/

# Compare with applied migrations
psql $DATABASE_URL -c "SELECT name FROM migrations;"
```

## Troubleshooting

### Migration Fails

1. **Check error message**
   ```bash
   npm run migrate 2>&1 | tee migration-error.log
   ```

2. **Common issues**:
   - Syntax error in SQL
   - Missing dependency (table/column)
   - Constraint violation
   - Permission issue

3. **Fix and retry**:
   - Fix SQL error
   - Remove failed migration record (if needed)
   - Re-run migration

### Migration Already Applied

If migration shows as applied but changes aren't present:

```sql
-- Check if migration was recorded
SELECT * FROM migrations WHERE name = '005_migration.sql';

-- If recorded but not applied, manually fix schema
-- Then verify migration SQL matches current state
```

### Data Integrity Issues

After migration, verify data:

```sql
-- Check row counts
SELECT 
  'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;

-- Check for NULLs in required fields
SELECT COUNT(*) FROM orders WHERE customer_name IS NULL;

-- Check foreign key integrity
SELECT COUNT(*) FROM payments p
LEFT JOIN orders o ON p.order_id = o.id
WHERE o.id IS NULL;
```

## Best Practices Summary

1. ✅ Always backup before migration
2. ✅ Test on staging first
3. ✅ Use transactions
4. ✅ Make migrations idempotent (IF NOT EXISTS)
5. ✅ Document rollback procedures
6. ✅ Version control all migrations
7. ✅ Review migrations in code review
8. ✅ Monitor after migration
9. ✅ Keep migration files small and focused
10. ✅ Never modify applied migrations

## Migration Timeline

- **Daily**: Automated Supabase backups
- **Weekly**: Manual CSV exports
- **Before major changes**: Full database backup
- **After migration**: Verify data integrity
- **Monthly**: Review migration history
