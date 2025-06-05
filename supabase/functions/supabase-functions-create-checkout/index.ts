import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Polar } from "npm:@polar-sh/sdk";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-customer-email',
};

const polar = new Polar({
  accessToken: Deno.env.get('POLAR_ACCESS_TOKEN'),
  server: "sandbox",
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productPriceId, successUrl, customerEmail, metadata } = await req.json();

    console.log("🔍 CREATE-CHECKOUT DEBUG - Received payload:", JSON.stringify({ productPriceId, successUrl, customerEmail, metadata }, null, 2));

    if (!productPriceId || !successUrl || !customerEmail || !metadata) {
      throw new Error('Missing required parameters');
    }

    console.log("🔍 CREATE-CHECKOUT DEBUG - Metadata being sent to Polar:", JSON.stringify(metadata, null, 2));

    const checkoutPayload = {
      productPriceId,
      successUrl,
      customerEmail,
      metadata,
    };

    console.log("🔍 CREATE-CHECKOUT DEBUG - Full checkout payload:", JSON.stringify(checkoutPayload, null, 2));

    const result = await polar.checkouts.create({
      products: [productPriceId],
      customer_email: customerEmail,
      success_url: successUrl,
      metadata: metadata,
    });

    console.log("🔍 CREATE-CHECKOUT DEBUG - Polar response:", JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify({
        sessionId: result.id,
        url: result.url,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}); 