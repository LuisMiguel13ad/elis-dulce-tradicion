import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function addFunctions() {
  const client = await pool.connect();

  try {
    console.log('Creating PostgreSQL functions...\n');

    // Create get_available_dates function
    console.log('Creating get_available_dates function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION get_available_dates(days_ahead INTEGER DEFAULT 90)
      RETURNS TABLE(
        date DATE,
        available BOOLEAN,
        current_orders INTEGER,
        max_orders INTEGER
      ) AS $$
      DECLARE
        check_date DATE;
        cap_row RECORD;
        order_count INTEGER;
        daily_max INTEGER;
      BEGIN
        daily_max := 20;  -- Default max orders per day

        FOR i IN 0..days_ahead LOOP
          check_date := CURRENT_DATE + i;

          -- Get capacity for this date
          SELECT c.max_orders, c.current_orders
          INTO cap_row
          FROM capacity c
          WHERE c.date = check_date;

          IF FOUND THEN
            daily_max := cap_row.max_orders;
            order_count := cap_row.current_orders;
          ELSE
            -- Count orders for this date
            SELECT COUNT(*) INTO order_count
            FROM orders
            WHERE date_needed = check_date
            AND status NOT IN ('cancelled');
          END IF;

          RETURN QUERY SELECT
            check_date,
            (order_count < daily_max) AS available,
            order_count::INTEGER,
            daily_max::INTEGER;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ get_available_dates created');

    // Create find_delivery_zone function
    console.log('Creating find_delivery_zone function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION find_delivery_zone(zip_code TEXT)
      RETURNS TABLE(zone_name TEXT, delivery_fee DECIMAL) AS $$
      BEGIN
        -- Simple zone lookup based on zip code
        -- Zone 1: Norristown area (free delivery)
        IF zip_code IN ('19401', '19403', '19404') THEN
          RETURN QUERY SELECT 'zone_1'::TEXT, 0.00::DECIMAL;
        -- Zone 2: Nearby areas ($5 delivery)
        ELSIF zip_code IN ('19406', '19422', '19428', '19462') THEN
          RETURN QUERY SELECT 'zone_2'::TEXT, 5.00::DECIMAL;
        -- Zone 3: Extended area ($10 delivery)
        ELSIF zip_code IN ('19426', '19464', '19468', '19446') THEN
          RETURN QUERY SELECT 'zone_3'::TEXT, 10.00::DECIMAL;
        ELSE
          -- Outside delivery area
          RETURN QUERY SELECT NULL::TEXT, NULL::DECIMAL;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ find_delivery_zone created');

    // Create order search trigger function
    console.log('Creating search vector trigger...');
    await client.query(`
      CREATE OR REPLACE FUNCTION orders_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('english', COALESCE(NEW.order_number, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.customer_name, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.customer_email, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(NEW.customer_phone, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(NEW.dedication, '')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger if not exists
    await client.query(`
      DROP TRIGGER IF EXISTS orders_search_vector_trigger ON orders;
      CREATE TRIGGER orders_search_vector_trigger
        BEFORE INSERT OR UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION orders_search_vector_update();
    `);
    console.log('✅ Search trigger created');

    console.log('\n✅ All functions created successfully!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addFunctions();
