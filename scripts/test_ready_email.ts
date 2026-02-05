
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://rnszrscxwkdwvvlsihqc.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("Missing VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testReadyEmail() {
    console.log("📧 Testing 'send-ready-notification' Edge Function...");

    // 1. Get Elena's order (Test 1)
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .ilike('customer_name', '%Elena%')
        .limit(1);

    if (!orders || orders.length === 0) {
        console.error("❌ Elena's order not found to test with.");
        return;
    }

    const order = orders[0];
    console.log(`Found Order: ${order.order_number} (${order.customer_name})`);

    // 2. Invoke Function
    const { data, error } = await supabase.functions.invoke('send-ready-notification', {
        body: { order }
    });

    if (error) {
        console.error("❌ Function Invocation Error:", error);
    } else {
        console.log("✅ Function Success! Response:", data);
    }
}

testReadyEmail();
