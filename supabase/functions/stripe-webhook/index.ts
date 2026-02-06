import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Stripe } from "npm:stripe@^14.0.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
          return new Response("ok", { headers: corsHeaders });
    }

             try {
                   // Validate environment variables
      if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
              throw new Error("Missing Stripe configuration");
      }
                   if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
                           throw new Error("Missing Supabase configuration");
                   }

      const stripe = new Stripe(STRIPE_SECRET_KEY, {
              apiVersion: "2023-10-16",
      });

      // Get the signature from headers - CRITICAL for security
      const signature = req.headers.get("stripe-signature");
                   if (!signature) {
                           console.error("No Stripe signature found in request");
                           return new Response(
                                     JSON.stringify({ error: "Missing Stripe signature" }),
                             { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                   );
                   }

      // Get raw body for signature verification
      const body = await req.text();

      // Verify the webhook signature - this prevents spoofed requests
      let event: Stripe.Event;
                   try {
                           event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
                   } catch (err) {
                           console.error("Webhook signature verification failed:", err.message);
                           return new Response(
                                     JSON.stringify({ error: "Invalid signature" }),
                             { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                   );
                   }

      console.log("Received verified Stripe event:", event.type);

      // Initialize Supabase client with service role for database operations
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Handle different event types
      switch (event.type) {
        case "payment_intent.succeeded": {
                  const paymentIntent = event.data.object as Stripe.PaymentIntent;
                  console.log("Payment succeeded:", paymentIntent.id);

                  // Update order payment status if order_id is in metadata
                  if (paymentIntent.metadata?.order_id) {
                              const { error } = await supabase
                                .from("orders")
                                .update({
                                                payment_status: "paid",
                                                payment_intent_id: paymentIntent.id,
                                                updated_at: new Date().toISOString(),
                                })
                                .eq("id", paymentIntent.metadata.order_id);

                    if (error) {
                                  console.error("Failed to update order:", error);
                    } else {
                                  console.log("Order updated successfully:", paymentIntent.metadata.order_id);
                    }
                  }
                  break;
        }

        case "payment_intent.payment_failed": {
                  const paymentIntent = event.data.object as Stripe.PaymentIntent;
                  console.log("Payment failed:", paymentIntent.id);

                  if (paymentIntent.metadata?.order_id) {
                              const { error } = await supabase
                                .from("orders")
                                .update({
                                                payment_status: "failed",
                                                updated_at: new Date().toISOString(),
                                })
                                .eq("id", paymentIntent.metadata.order_id);

                    if (error) {
                                  console.error("Failed to update order:", error);
                    }
                  }
                  break;
        }

        case "charge.refunded": {
                  const charge = event.data.object as Stripe.Charge;
                  console.log("Charge refunded:", charge.id);

                  // Find order by payment intent and update refund status
                  if (charge.payment_intent) {
                              const { error } = await supabase
                                .from("orders")
                                .update({
                                                refund_status: "processed",
                                                updated_at: new Date().toISOString(),
                                })
                                .eq("payment_intent_id", charge.payment_intent);

                    if (error) {
                                  console.error("Failed to update refund status:", error);
                    }
                  }
                  break;
        }

        case "charge.dispute.created": {
                  const dispute = event.data.object as Stripe.Dispute;
                  console.error("Dispute created:", dispute.id);
                  // Log dispute for manual review - this is serious
                  // In production, you might want to send an alert email to the owner
                  break;
        }

        default:
                  console.log("Unhandled event type:", event.type);
      }

      // Return 200 to acknowledge receipt of the event
      return new Response(
              JSON.stringify({ received: true, type: event.type }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );

             } catch (error) {
                   console.error("Webhook error:", error);
                   return new Response(
                           JSON.stringify({ error: error.message }),
                     { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                         );
             }
});
