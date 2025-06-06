import { Polar } from "@polar-sh/sdk";

// Initialize Polar client
export const getPolarClient = () => {
  return new Polar({
    server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });
};

// Create a checkout session
export async function createCheckoutSession({
  productPriceId,
  successUrl,
  customerEmail,
  metadata,
}: {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const polar = getPolarClient();

    const result = await polar.checkouts.create({
      productPriceId,
      successUrl,
      customerEmail,
      metadata,
    });

    return { success: true, sessionId: result.id, url: result.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

// Get customer portal URL
export async function getCustomerPortalUrl(customerId: string) {
  try {
    const polar = getPolarClient();

    const result = await polar.customerSessions.create({
      customerId,
    });

    return { success: true, url: result.customerPortalUrl };
  } catch (error) {
    console.error("Error getting customer portal URL:", error);
    return { success: false, error: "Failed to get customer portal URL" };
  }
}

// Check subscription status
export async function checkSubscriptionStatus(userId: string) {
  try {
    // This would typically be a database query to check subscription status
    // For this example, we'll return a placeholder
    return { success: true, hasActiveSubscription: true };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { success: false, error: "Failed to check subscription status" };
  }
}
