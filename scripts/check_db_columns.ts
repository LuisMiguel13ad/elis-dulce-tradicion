
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rnszrscxwkdwvvlsihqc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuc3pyc2N4d2tkd3Z2bHNpaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzgwNzcsImV4cCI6MjA4MDYxNDA3N30.BKsyb-2ST8EQyZUAsmYf6p5PeTRq1SFkztIUx4GXM94";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkColumns() {
    console.log("Fetching one order to see available columns...");
    const { data, error } = await supabase.from("orders").select("*").limit(1);

    if (error) {
        console.error("Error connecting:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("✅ Successfully stored order columns:");
        console.log(Object.keys(data[0]).join(", "));

        const hasStripeId = "stripe_payment_id" in data[0];
        const hasPaymentStatus = "payment_status" in data[0];

        console.log("\n--- Verification ---");
        console.log(`payment_status exists? ${hasPaymentStatus ? "YES" : "NO"}`);
        console.log(`stripe_payment_id exists? ${hasStripeId ? "YES" : "NO [MISSING]"}`);
    } else {
        console.log("No orders found in DB to check columns.");
    }
}

checkColumns();
