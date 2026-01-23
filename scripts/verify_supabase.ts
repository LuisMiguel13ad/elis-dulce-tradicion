
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('orders').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase connection failed:', error.message);
            process.exit(1);
        }

        console.log('Supabase connection successful! Order count available.');
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

checkConnection();
