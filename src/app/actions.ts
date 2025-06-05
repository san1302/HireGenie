"use server";

import { api } from "@/lib/polar";
import { encodedRedirect } from "@/utils/utils";
import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { headers } from "next/headers";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const returnTo = formData.get("returnTo") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Redirect to returnTo URL if provided, otherwise default to dashboard
  const redirectUrl = returnTo || "/dashboard";
  return redirect(redirectUrl);
};

export const signInWithGoogleAction = async (formData: FormData) => {
  const returnTo = formData.get("returnTo") as string;
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Build redirect URL with returnTo parameter if provided
  const redirectTo = returnTo 
    ? `${origin}/auth/callback?redirect_to=${encodeURIComponent(returnTo)}`
    : `${origin}/auth/callback?redirect_to=${encodeURIComponent('/dashboard')}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    return encodedRedirect("error", "/sign-in", "Authentication failed. Please try again.");
  }

  if (data.url) {
    redirect(data.url);
  }
};

export const signUpWithGoogleAction = async (formData: FormData) => {
  const returnTo = formData.get("returnTo") as string;
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Build redirect URL with returnTo parameter if provided
  const redirectTo = returnTo 
    ? `${origin}/auth/callback?redirect_to=${encodeURIComponent(returnTo)}`
    : `${origin}/auth/callback?redirect_to=${encodeURIComponent('/dashboard')}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    return encodedRedirect("error", "/sign-up", "Authentication failed. Please try again.");
  }

  if (data.url) {
    redirect(data.url);
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "Password updated",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkoutSessionAction = async ({
  productPriceId,
  successUrl,
  customerEmail,
  metadata,
}: {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const result = await api.checkouts.create({
      productPriceId,
      successUrl,
      customerEmail,
      metadata,
    });

    return { success: true, ...result };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
};

export const checkUserSubscription = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId.toString())
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error checking subscription status:", error);
      return {
        success: false,
        hasActiveSubscription: false,
        error: error.message,
      };
    }

    // If we have a subscription, get the plan details
    let planDetails = null;
    if (subscription) {
      try {
        // Get all plans from Polar
        const { data: plansResponse, error: plansError } = await supabase.functions.invoke('supabase-functions-get-plans');
        
        if (!plansError && plansResponse?.items) {
          // Find the matching plan by polar_price_id
          const matchingPlan = plansResponse.items.find((plan: any) => 
            plan.prices && plan.prices.some((price: any) => price.id === subscription.polar_price_id)
          );
          
          if (matchingPlan) {
            // Find the specific price within the plan
            const matchingPrice = matchingPlan.prices.find((price: any) => price.id === subscription.polar_price_id);
            
            planDetails = {
              planId: matchingPlan.id,
              planName: matchingPlan.name,
              planDescription: matchingPlan.description,
              priceId: matchingPrice?.id,
              priceAmount: matchingPrice?.priceAmount,
              priceCurrency: matchingPrice?.priceCurrency,
              interval: subscription.interval,
            };
          }
        }
      } catch (planError) {
        console.error("Error fetching plan details:", planError);
        // Don't fail the subscription check if plan lookup fails
      }
    }

    return {
      success: true,
      hasActiveSubscription: !!subscription,
      subscription: subscription || null,
      planDetails: planDetails,
    };
  } catch (error) {
    console.error("Error in checkUserSubscription:", error);
    return {
      success: false,
      hasActiveSubscription: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const manageSubscriptionAction = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId.toString())
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error checking subscription status:", error);
      return { success: false, error: "No active subscription found" };
    }

    if (!subscription?.customer_id) {
      return { success: false, error: "No customer ID found for subscription" };
    }

    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const result = await polar.customerSessions.create({
      customerId: subscription.customer_id,
    });

    return { success: true, url: result.customerPortalUrl };
  } catch (error) {
    console.error("Error managing subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error managing subscription",
    };
  }
};

export const generateCoverLetterAction = async (formData: FormData) => {
  try {
    const resumeText = formData.get("resume_text") as string;
    const jobDescription = formData.get("job_description") as string;
    const resumeFile = formData.get("resume_file") as File;

    if (!jobDescription) {
      return { success: false, error: "Job description is required" };
    }

    if (!resumeText && !resumeFile) {
      return { success: false, error: "Resume text or file is required" };
    }

    // In a real implementation, you would call an AI service here
    // For this demo, we'll generate a placeholder cover letter
    const keywords = jobDescription
      .split(" ")
      .filter((word) => word.length > 5)
      .slice(0, 5)
      .map((word) => word.replace(/[^a-zA-Z]/g, ""));

    const coverLetter = `Dear Hiring Manager,

I am writing to express my interest in the position advertised. With my background and experience, I believe I am a strong candidate for this role.

Based on the job description, I understand you're looking for someone with expertise in ${keywords.join(", ")}. Throughout my career, I have developed strong skills in these areas and have consistently delivered results.

In my previous roles, I have:
- Successfully led projects requiring ${keywords[0] || "technical expertise"}
- Developed solutions involving ${keywords[1] || "problem-solving"}
- Collaborated with teams to implement ${keywords[2] || "innovative approaches"}

I am particularly excited about the opportunity to bring my experience in ${keywords[3] || "this field"} to your organization. Your company's focus on ${keywords[4] || "excellence"} aligns perfectly with my professional values.

Thank you for considering my application. I look forward to the possibility of discussing how my background, skills, and experiences would benefit your organization.

Sincerely,
Your Name`;

    // Add a delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { success: true, coverLetter };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate cover letter",
    };
  }
};
