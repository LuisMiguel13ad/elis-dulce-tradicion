import db from './sqlite-connection.js';

console.log('🔧 Running migration: Add reference_image_path to orders table...\n');

try {
  // Check if column exists
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasColumn = tableInfo.some(col => col.name === 'reference_image_path');

  if (!hasColumn) {
    db.exec('ALTER TABLE orders ADD COLUMN reference_image_path TEXT');
    console.log('✅ Added reference_image_path column to orders table');
  } else {
    console.log('ℹ️  Column reference_image_path already exists');
  }

} catch (error) {
  console.error('❌ Error running migration:', error);
}

console.log('\n✅ Migration complete!');
db.close();

