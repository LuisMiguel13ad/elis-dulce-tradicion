import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CRON_SECRET = Deno.env.get("CRON_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify cron secret to prevent unauthorized invocations
    const cronSecret = req.headers.get("x-cron-secret");
    if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role key to bypass RLS for system operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results = {
      autoCompleted: [] as string[],
      autoCancelled: [] as string[],
      errors: [] as string[],
    };

    // --- Auto-complete orders that have been "ready" for 24+ hours ---
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: readyOrders, error: readyError } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, customer_language, date_needed, time_needed, delivery_option, ready_at")
      .eq("status", "ready")
      .not("ready_at", "is", null)
      .lt("ready_at", twentyFourHoursAgo);

    if (readyError) {
      results.errors.push(`Failed to query ready orders: ${readyError.message}`);
    } else if (readyOrders && readyOrders.length > 0) {
      for (const order of readyOrders) {
        try {
          // Update order status to completed
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("status", "ready"); // Optimistic lock: only update if still "ready"

          if (updateError) {
            results.errors.push(
              `Failed to auto-complete order ${order.order_number}: ${updateError.message}`
            );
            continue;
          }

          // Record in status history
          await supabase.from("order_status_history").insert({
            order_id: order.id,
            previous_status: "ready",
            status: "completed",
            notes: "Auto-completed after 24 hours",
            metadata: { auto: true, reason: "24_hour_timeout" },
          });

          results.autoCompleted.push(order.order_number);

          // Send email notification via existing Edge Function
          try {
            await supabase.functions.invoke("send-status-update", {
              body: {
                order: {
                  order_number: order.order_number,
                  customer_name: order.customer_name,
                  customer_email: order.customer_email,
                  customer_language: order.customer_language,
                  old_status: "ready",
                  new_status: "completed",
                  date_needed: order.date_needed,
                  time_needed: order.time_needed,
                  delivery_option: order.delivery_option,
                },
                oldStatus: "ready",
              },
            });
          } catch (_emailErr) {
            // Email failure should not block the transition
            results.errors.push(
              `Email failed for auto-completed order ${order.order_number}`
            );
          }
        } catch (err) {
          results.errors.push(
            `Error processing order ${order.order_number}: ${(err as Error).message}`
          );
        }
      }
    }

    // --- Auto-cancel unpaid orders older than 30 minutes ---
    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();

    const { data: unpaidOrders, error: unpaidError } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, customer_language, date_needed, time_needed, delivery_option")
      .eq("status", "pending")
      .neq("payment_status", "paid")
      .lt("created_at", thirtyMinutesAgo);

    if (unpaidError) {
      results.errors.push(
        `Failed to query unpaid orders: ${unpaidError.message}`
      );
    } else if (unpaidOrders && unpaidOrders.length > 0) {
      for (const order of unpaidOrders) {
        try {
          // Update order status to cancelled
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
              cancellation_reason:
                "Auto-cancelled: Payment not completed within 30 minutes",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("status", "pending"); // Optimistic lock

          if (updateError) {
            results.errors.push(
              `Failed to auto-cancel order ${order.order_number}: ${updateError.message}`
            );
            continue;
          }

          // Record in status history
          await supabase.from("order_status_history").insert({
            order_id: order.id,
            previous_status: "pending",
            status: "cancelled",
            notes: "Auto-cancelled: Payment not completed within 30 minutes",
            metadata: { auto: true, reason: "payment_timeout" },
          });

          results.autoCancelled.push(order.order_number);

          // Send email notification
          try {
            await supabase.functions.invoke("send-status-update", {
              body: {
                order: {
                  order_number: order.order_number,
                  customer_name: order.customer_name,
                  customer_email: order.customer_email,
                  customer_language: order.customer_language,
                  old_status: "pending",
                  new_status: "cancelled",
                  date_needed: order.date_needed,
                  time_needed: order.time_needed,
                  delivery_option: order.delivery_option,
                  notes:
                    "Payment was not completed within 30 minutes. Please place a new order.",
                },
                oldStatus: "pending",
              },
            });
          } catch (_emailErr) {
            results.errors.push(
              `Email failed for auto-cancelled order ${order.order_number}`
            );
          }
        } catch (err) {
          results.errors.push(
            `Error processing order ${order.order_number}: ${(err as Error).message}`
          );
        }
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      autoCompleted: results.autoCompleted.length,
      autoCancelled: results.autoCancelled.length,
      errors: results.errors.length,
      details: results,
    };

    console.log("Scheduled order transitions:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scheduled-order-transitions:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
