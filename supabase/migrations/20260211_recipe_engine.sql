-- =====================================================
-- Recipe Engine Schema
-- =====================================================
-- Links products and custom cake components to ingredients

-- 1. Recipe for standard menu items
CREATE TABLE IF NOT EXISTS product_recipes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, ingredient_id)
);

-- 2. Recipe for custom cake components (Sizes & Fillings)
CREATE TABLE IF NOT EXISTS order_component_recipes (
  id SERIAL PRIMARY KEY,
  component_type VARCHAR(50) NOT NULL, -- 'size', 'filling'
  component_value VARCHAR(100) NOT NULL, -- e.g., '8"', 'strawberry'
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_type, component_value, ingredient_id)
);

-- Seed Sample Recipes (Estimates for 8" cake)
-- Size: 8" Standard
INSERT INTO order_component_recipes (component_type, component_value, ingredient_id, quantity_required)
SELECT 'size', '8"', id, 2.0 FROM ingredients WHERE name = 'All-Purpose Flour'
ON CONFLICT DO NOTHING;

INSERT INTO order_component_recipes (component_type, component_value, ingredient_id, quantity_required)
SELECT 'size', '8"', id, 1.0 FROM ingredients WHERE name = 'Granulated Sugar'
ON CONFLICT DO NOTHING;

INSERT INTO order_component_recipes (component_type, component_value, ingredient_id, quantity_required)
SELECT 'size', '8"', id, 4.0 FROM ingredients WHERE name = 'Eggs'
ON CONFLICT DO NOTHING;

-- Filling: Chocolate
INSERT INTO order_component_recipes (component_type, component_value, ingredient_id, quantity_required)
SELECT 'filling', 'chocolate', id, 0.5 FROM ingredients WHERE name = 'Chocolate Chips'
ON CONFLICT DO NOTHING;
