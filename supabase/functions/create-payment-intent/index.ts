import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Stripe } from "npm:stripe@^14.0.0";

const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (per IP, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
      const now = Date.now();
      const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
          rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
          return true;
  }

  if (record.count >= RATE_LIMIT) {
          return false;
  }

  record.count++;
      return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
      const now = Date.now();
      for (const [ip, record] of rateLimitMap.entries()) {
              if (now > record.resetTime) {
                        rateLimitMap.delete(ip);
              }
      }
}, 60000);

Deno.serve(async (req) => {
      if (req.method === "OPTIONS") {
              return new Response("ok", { headers: corsHeaders });
      }

             // Get client IP for rate limiting
             const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                                    req.headers.get("x-real-ip") || 
                                    "unknown";

             // Check rate limit
             if (!checkRateLimit(clientIp)) {
                     return new Response(
                               JSON.stringify({ error: "Too many requests. Please try again later." }),
                         { 
                                 headers: { ...corsHeaders, "Content-Type": "application/json" },
                                     status: 429 
                         }
                             );
             }

             try {
                     const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
                     if (!STRIPE_SECRET_KEY) {
                               throw new Error("Missing Stripe Secret Key");
                     }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
                  apiVersion: "2023-10-16",
        });

        const { amount, currency, metadata, idempotencyKey } = await req.json();

        if (!amount) {
                  throw new Error("Missing amount");
        }

        // Validate amount is a positive number
        if (typeof amount !== "number" || amount <= 0) {
                  throw new Error("Invalid amount: must be a positive number");
        }

        // Generate idempotency key if not provided (prevents double charges)
        // Best practice: client should provide this based on order ID
        const effectiveIdempotencyKey = idempotencyKey || 
                  `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        // Create PaymentIntent with idempotency key
        const paymentIntent = await stripe.paymentIntents.create(
            {
                        amount: Math.round(amount * 100), // Convert to cents
                        currency: currency || "usd",
                        payment_method_types: ["card"],
                        metadata: metadata || {},
            },
            {
                        idempotencyKey: effectiveIdempotencyKey,
            }
                );

        return new Response(
                  JSON.stringify({ 
                                         clientSecret: paymentIntent.client_secret, 
                              id: paymentIntent.id,
                              idempotencyKey: effectiveIdempotencyKey 
                  }),
            {
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                        status: 200,
            }
                );
             } catch (error) {
                     console.error(error);

        // Handle Stripe-specific errors
        if (error.type === "StripeIdempotencyError") {
                  return new Response(
                              JSON.stringify({ error: "Duplicate request detected. Payment may have already been processed." }),
                      {
                                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                                    status: 409,
                      }
                            );
        }

        return new Response(
                  JSON.stringify({ error: error.message }),
            {
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                        status: 400,
            }
                );
             }
});
