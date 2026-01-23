
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectSchema() {
    console.log('🔍 Inspecting Database Schema...');

    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .eq('table_schema', 'public');

    // Supabase JS client might not allow querying information_schema directly via .from()
    // It's better to use RPC if available or just try to list tables differently.
    // Actually, usually we can't query system tables via the JS client unless exposed.

    // Fallback: Try to query likely tables
    const tables = ['profiles', 'user_profiles', 'users', 'roles'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table '${table}': ${error.message} (${error.code})`);
        } else {
            console.log(`✅ Table '${table}' EXISTS.`);
        }
    }
}

inspectSchema();
