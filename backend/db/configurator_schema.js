import db from './sqlite-connection.js';

console.log('🔧 Running migration: Advanced Product Configurator Schema...\n');

try {
  // 1. Attributes Table (e.g., Size, Flavor, Filling)
  db.exec(`
    CREATE TABLE IF NOT EXISTS attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name_es TEXT NOT NULL,
      name_en TEXT NOT NULL,
      is_visual INTEGER DEFAULT 0, -- Does this attribute affect the preview image?
      sort_order INTEGER DEFAULT 0
    )
  `);
  console.log('✅ Created attributes table');

  // 2. Attribute Options Table (e.g., "8 inches", "Chocolate", "Vanilla")
  db.exec(`
    CREATE TABLE IF NOT EXISTS attribute_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attribute_id INTEGER NOT NULL,
      value TEXT NOT NULL, -- Internal value
      label_es TEXT NOT NULL,
      label_en TEXT NOT NULL,
      price_adjustment REAL DEFAULT 0,
      image_layer_path TEXT, -- Path to transparent PNG for this option (if visual)
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (attribute_id) REFERENCES attributes(id)
    )
  `);
  console.log('✅ Created attribute_options table');

  // 3. Product Rules / Dependencies Table
  // "If attribute X has value Y, then attribute A must/must-not have value B"
  // Simple version: incompatible pairs
  db.exec(`
    CREATE TABLE IF NOT EXISTS incompatible_pairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      option_id_1 INTEGER NOT NULL,
      option_id_2 INTEGER NOT NULL,
      reason_es TEXT,
      reason_en TEXT,
      FOREIGN KEY (option_id_1) REFERENCES attribute_options(id),
      FOREIGN KEY (option_id_2) REFERENCES attribute_options(id)
    )
  `);
  console.log('✅ Created incompatible_pairs table');

  // 4. Production Capacity / Slots
  // Simple capacity: max orders per hour per day of week, or specific date overrides
  db.exec(`
    CREATE TABLE IF NOT EXISTS production_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT, -- Specific date YYYY-MM-DD, or null for recurring
      day_of_week INTEGER, -- 0-6 (Sun-Sat), used if date is null
      hour_start INTEGER NOT NULL, -- 0-23
      max_capacity INTEGER DEFAULT 4,
      is_blocked INTEGER DEFAULT 0
    )
  `);
  console.log('✅ Created production_slots table');
  
  // 5. Order Items (linking orders to specific configured choices)
  // We need a way to store the specific configuration chosen for an order
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER, -- Optional link to base product
      configuration_json TEXT, -- JSON string of selected options { "size": "8", "flavor": "choc" }
      price_at_time REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
  console.log('✅ Created order_items table');


  // --- SEED DATA ---
  
  // Check if attributes exist
  const attrCount = db.prepare('SELECT COUNT(*) as count FROM attributes').get().count;
  
  if (attrCount === 0) {
    console.log('🌱 Seeding configuration data...');
    
    // Attributes
    const insertAttr = db.prepare('INSERT INTO attributes (code, name_es, name_en, is_visual, sort_order) VALUES (?, ?, ?, ?, ?)');
    const sizeAttrId = insertAttr.run('size', 'Tamaño', 'Size', 1, 1).lastInsertRowid;
    const flavorAttrId = insertAttr.run('flavor', 'Sabor de Pan', 'Cake Flavor', 0, 2).lastInsertRowid;
    const fillingAttrId = insertAttr.run('filling', 'Relleno', 'Filling', 0, 3).lastInsertRowid;
    const frostingAttrId = insertAttr.run('frosting', 'Betún/Cobertura', 'Frosting', 1, 4).lastInsertRowid;
    
    // Options
    const insertOpt = db.prepare('INSERT INTO attribute_options (attribute_id, value, label_es, label_en, price_adjustment, image_layer_path, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    // Sizes
    const size8Id = insertOpt.run(sizeAttrId, '8in', '8 pulgadas', '8 inches', 0, '/assets/layers/size-8.png', 1).lastInsertRowid;
    const size10Id = insertOpt.run(sizeAttrId, '10in', '10 pulgadas', '10 inches', 15, '/assets/layers/size-10.png', 2).lastInsertRowid;
    const sheetId = insertOpt.run(sizeAttrId, 'sheet_full', 'Plancha Completa', 'Full Sheet', 100, '/assets/layers/sheet-full.png', 3).lastInsertRowid;
    
    // Flavors
    insertOpt.run(flavorAttrId, 'vanilla', 'Vainilla', 'Vanilla', 0, null, 1);
    const chocFlavorId = insertOpt.run(flavorAttrId, 'chocolate', 'Chocolate', 'Chocolate', 0, null, 2).lastInsertRowid;
    
    // Fillings
    const fruitFillingId = insertOpt.run(fillingAttrId, 'fresh_fruit', 'Fruta Fresca', 'Fresh Fruit', 5, null, 1).lastInsertRowid;
    insertOpt.run(fillingAttrId, 'mocha', 'Mocha', 'Mocha', 0, null, 2);
    
    // Frostings (Visual)
    insertOpt.run(frostingAttrId, 'whipped', 'Crema Batida', 'Whipped Cream', 0, '/assets/layers/frosting-white.png', 1);
    const fondantId = insertOpt.run(frostingAttrId, 'fondant', 'Fondant', 'Fondant', 20, '/assets/layers/frosting-smooth.png', 2).lastInsertRowid;

    // Rules: No Fresh Fruit filling with Sheet Cake (example rule: structural integrity/sogginess?)
    // Actually let's do: No Fondant on Whipped Cream (Wait, fondant covers cake). 
    // Let's do: Sheet Cake cannot have Fondant (Example constraint)
    const insertRule = db.prepare('INSERT INTO incompatible_pairs (option_id_1, option_id_2, reason_es, reason_en) VALUES (?, ?, ?, ?)');
    insertRule.run(sheetId, fondantId, 'El fondant no está disponible para planchas completas', 'Fondant is not available for full sheet cakes');

    console.log('✅ Seeded attributes and rules');
  }

  // Seed Capacity (Default slots)
  const slotCount = db.prepare('SELECT COUNT(*) as count FROM production_slots').get().count;
  if (slotCount === 0) {
    console.log('🌱 Seeding production slots...');
    const insertSlot = db.prepare('INSERT INTO production_slots (day_of_week, hour_start, max_capacity) VALUES (?, ?, ?)');
    // Mon-Sun (0-6), 8am to 6pm
    for (let d = 0; d <= 6; d++) {
      for (let h = 8; h <= 18; h++) {
        insertSlot.run(d, h, 4); // 4 cakes per hour default
      }
    }
    console.log('✅ Seeded production slots');
  }

} catch (error) {
  console.error('❌ Error running migration:', error);
}

console.log('\n✅ Advanced schema migration complete!');
db.close();

