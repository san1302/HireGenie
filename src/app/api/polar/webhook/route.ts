// src/app/api/polar/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import crypto from "crypto";

const storeWebhookEvent = async (supabase: any, body: any) => {
    try {
        const { data, error: insertError } = await supabase
            .from("webhook_events")
            .insert({
                event_type: body.type,
                type: body.type,
                polar_event_id: body.data.id,
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                data: body.data,
            })
            .select();

        if (insertError) {
            console.error('Error storing webhook event:', insertError);
        }

        return data;
    } catch (err) {
        console.error('Error in storeWebhookEvent:', err);
    }
};

const webhookHandler = async (body: any) => {
    const supabase = await createClient();

    // Secure logging - avoid logging sensitive data in production
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
        console.log("🔍 WEBHOOK DEBUG - Event type:", body.type);
        console.log("🔍 WEBHOOK DEBUG - Event ID:", body.data?.id);
        console.log("🔍 WEBHOOK DEBUG - User ID:", body.data?.metadata?.user_id);
    } else {
        console.log("📥 Processing webhook:", { type: body.type, id: body.data?.id });
    }

    switch (body.type) {
        case 'subscription.created':
            console.log("🚀 Processing subscription.created event");
            
            // Insert new subscription
            const { data, error } = await supabase.from("subscriptions").insert({
                polar_id: body.data.id,
                polar_price_id: body.data.price_id,
                currency: body.data.currency,
                interval: body.data.recurring_interval,
                user_id: body.data.metadata.user_id,
                status: body.data.status,
                current_period_start: new Date(body.data.current_period_start).getTime(),
                current_period_end: new Date(body.data.current_period_end).getTime(),
                cancel_at_period_end: body.data.cancel_at_period_end,
                amount: body.data.amount,
                started_at: new Date(body.data.started_at).getTime(),
                ended_at: body.data.ended_at
                    ? new Date(body.data.ended_at).getTime()
                    : null,
                canceled_at: body.data.canceled_at
                    ? new Date(body.data.canceled_at).getTime()
                    : null,
                customer_cancellation_reason: body.data.customer_cancellation_reason || null,
                customer_cancellation_comment: body.data.customer_cancellation_comment || null,
                metadata: body.data.metadata || {},
                custom_field_data: body.data.custom_field_data || {},
                customer_id: body.data.customer_id
            }).select();

            console.log("💾 Database insert result:", { data, error });

            if (error) {
                console.error('❌ Error inserting subscription:', error);
                throw error;
            }
            break;

        case 'subscription.updated':
            // Find existing subscription
            const { data: existingSub } = await supabase
                .from("subscriptions")
                .select()
                .eq("polar_id", body.data.id)
                .single();

            if (existingSub) {
                await supabase
                    .from("subscriptions")
                    .update({
                        amount: body.data.amount,
                        status: body.data.status,
                        current_period_start: new Date(body.data.current_period_start).getTime(),
                        current_period_end: new Date(body.data.current_period_end).getTime(),
                        cancel_at_period_end: body.data.cancel_at_period_end,
                        metadata: body.data.metadata || {},
                        custom_field_data: body.data.custom_field_data || {}
                    })
                    .eq("polar_id", body.data.id);
            }
            break;

        case 'subscription.active':
            const { data: activeSub } = await supabase
                .from("subscriptions")
                .select()
                .eq("polar_id", body.data.id)
                .single();

            if (activeSub) {
                // Update subscription to active
                await supabase
                    .from("subscriptions")
                    .update({
                        status: body.data.status,
                        started_at: new Date(body.data.started_at).getTime()
                    })
                    .eq("polar_id", body.data.id);
            }

            break;

        case 'subscription.canceled':
            const canceledSub = await supabase
                .from("subscriptions")
                .select()
                .eq("polar_id", body.data.id)
                .single();

            if (canceledSub) {
                // Update subscription to canceled
                await supabase
                    .from("subscriptions")
                    .update({
                        status: body.data.status,
                        canceled_at: body.data.canceled_at
                            ? new Date(body.data.canceled_at).getTime()
                            : null,
                        customer_cancellation_reason: body.data.customer_cancellation_reason || null,
                        customer_cancellation_comment: body.data.customer_cancellation_comment || null
                    })
                    .eq("polar_id", body.data.id);

            }
            break;

        case 'subscription.uncanceled':

            const uncanceledSub = await supabase
                .from("subscriptions")
                .select()
                .eq("polar_id", body.data.id)
                .single();

            if (uncanceledSub) {
                // Update subscription to uncanceled
                await supabase
                    .from("subscriptions")
                    .update({
                        status: body.data.status,
                        cancel_at_period_end: false,
                        canceled_at: null,
                        customer_cancellation_reason: null,
                        customer_cancellation_comment: null
                    })
                    .eq("polar_id", body.data.id);
            }
            break;

        case 'subscription.revoked':
            const revokedSub = await supabase
                .from("subscriptions")
                .select()
                .eq("polar_id", body.data.id)
                .single();

            if (revokedSub) {
                // Update subscription to revoked
                await supabase
                    .from("subscriptions")
                    .update({
                        status: 'revoked',
                        ended_at: body.data.ended_at
                            ? new Date(body.data.ended_at).getTime()
                            : null
                    })
                    .eq("polar_id", body.data.id);
            }
            break;

        case 'order.created':
            console.log("order.created:", body);
            // Orders are handled through the subscription events
            break;

        default:
            console.log(`Unhandled event type: ${body?.type}`);
            break;
    }
}

/**
 * Verify webhook signature from Polar
 * @param payload - The raw request body as string
 * @param signature - The signature from the webhook header
 * @param secret - The webhook secret from environment variables
 * @returns boolean indicating if signature is valid
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
        console.error('Missing signature or secret for webhook verification');
        return false;
    }

    try {
        // Polar uses HMAC SHA-256 with signature format: sha256=<hash>
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload, 'utf8')
            .digest('hex');
        
        // Remove 'sha256=' prefix if present
        const receivedSignature = signature.startsWith('sha256=') 
            ? signature.slice(7) 
            : signature;

        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(receivedSignature, 'hex')
        );
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    let eventId: string | null = null;

    try {
        // Get the webhook secret from environment variables
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('POLAR_WEBHOOK_SECRET environment variable not set');
            return NextResponse.json(
                { error: 'Webhook secret not configured' }, 
                { status: 500 }
            );
        }

        // Get the raw body for signature verification
        const rawBody = await req.text();
        const signature = req.headers.get('webhook-signature') || req.headers.get('x-signature');
        
        if (!signature) {
            console.error('Missing webhook signature header');
            return NextResponse.json(
                { error: 'Missing signature' }, 
                { status: 401 }
            );
        }

        // Verify the webhook signature
        const isValidSignature = verifyWebhookSignature(rawBody, signature, webhookSecret);
        if (!isValidSignature) {
            console.error('Invalid webhook signature - potential security threat');
            return NextResponse.json(
                { error: 'Invalid signature' }, 
                { status: 401 }
            );
        }

        // Parse the JSON body after signature verification
        const body = JSON.parse(rawBody);

        // Additional security: Validate timestamp to prevent replay attacks
        const timestamp = req.headers.get('webhook-timestamp');
        if (timestamp) {
            const webhookTime = parseInt(timestamp, 10);
            const currentTime = Math.floor(Date.now() / 1000);
            const timeDifference = Math.abs(currentTime - webhookTime);
            
            // Reject webhooks older than 5 minutes (300 seconds)
            if (timeDifference > 300) {
                console.error('Webhook timestamp too old - potential replay attack');
                return NextResponse.json(
                    { error: 'Request too old' }, 
                    { status: 401 }
                );
            }
        }

        // Log successful verification (but not the full body for security)
        console.log('✅ Webhook signature verified successfully', {
            eventType: body.type,
            eventId: body.data?.id,
            timestamp: new Date().toISOString()
        });

        // Store the incoming webhook event
        const eventData = await storeWebhookEvent(supabase, body);
        eventId = eventData?.[0]?.id;

        // Process the webhook
        await webhookHandler(body);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);

        // Update event status to error
        if (eventId) {
            await storeWebhookEvent(supabase, { error: error instanceof Error ? error.message : 'Unknown error' });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}