import db from './sqlite-connection.js';

console.log('🔧 Running migration: Add products table...\n');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_es TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_es TEXT,
      description_en TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('✅ Created products table');

  // Check if table is empty, if so, seed it
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  
  if (count === 0) {
    console.log('🌱 Seeding products table...');
    const insert = db.prepare(`
      INSERT INTO products (name_es, name_en, description_es, description_en, price, image_url, category)
      VALUES (@name_es, @name_en, @description_es, @description_en, @price, @image_url, @category)
    `);

    const seedData = [
      {
        name_es: 'Pastel Tres Leches Mocha',
        name_en: 'Tres Leches Mocha Cake',
        description_es: 'Pastel tres leches con sabor a café y relleno de nuez.',
        description_en: 'Coffee-flavored tres leches cake with pecan filling.',
        price: 45.00,
        image_url: '/assets/tres-leches.jpg', // We'll need to handle local assets vs uploaded
        category: 'cakes'
      },
      {
        name_es: 'Pastel Red Velvet',
        name_en: 'Red Velvet Cake',
        description_es: 'Pastel aterciopelado con relleno cremoso de queso.',
        description_en: 'Velvety textured cake with rich cream cheese filling.',
        price: 50.00,
        image_url: '/assets/custom-cake.jpg',
        category: 'cakes'
      }
    ];

    for (const item of seedData) {
      insert.run(item);
    }
    console.log(`✅ Added ${seedData.length} seed products`);
  }

} catch (error) {
  console.error('❌ Error running migration:', error);
}

console.log('\n✅ Migration complete!');
db.close();

