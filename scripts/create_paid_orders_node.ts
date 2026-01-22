
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rnszrscxwkdwvvlsihqc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuc3pyc2N4d2tkd3Z2bHNpaHFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAzODA3NywiZXhwIjoyMDgwNjE0MDc3fQ.GO8qJjpT_dBasYFVH2H_moiiITl5vFuQd_YRP7P7jYA";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const generateOrderNumber = () => `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

const testOrders = [
    { customer: "Elena Tests", size: "10 inch Round", filling: "Tres Leches", price: 65.00, theme: "Butterflies" },
    { customer: "Marco Payment", size: "1/4 Sheet", filling: "Strawberry", price: 45.00, theme: "Soccer" },
    { customer: "Sofia Stripe", size: "8 inch Round", filling: "Mocha", price: 40.00, theme: "Elegant" },
    { customer: "Lucas Card", size: "Half Sheet", filling: "Peach", price: 85.00, theme: "Cars" },
    { customer: "Ana Verified", size: "12 inch Round", filling: "Pineapple", price: 75.00, theme: "Floral" },
];

async function createPaidOrders() {
    console.log("Creating 5 PAId test orders (Real DB Insert)...");

    for (const t of testOrders) {
        const order = {
            order_number: generateOrderNumber(),
            customer_name: t.customer,
            customer_email: "test@example.com",
            customer_phone: "555-000-0000",
            date_needed: new Date().toISOString().split('T')[0], // Today
            time_needed: "14:00",
            cake_size: t.size,
            filling: t.filling,
            theme: t.theme,
            total_amount: t.price,
            status: "pending",
            payment_status: "paid",
            stripe_payment_id: `pi_simulated_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            delivery_option: "pickup",
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from("orders").insert([order]).select();

        if (error) {
            console.error("Error creating order:", error.message);
        } else {
            console.log(`✅ Created Order ${order.order_number} for ${order.customer_name} (Paid: $${order.total_amount})`);
        }
    }
}

createPaidOrders();
