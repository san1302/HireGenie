import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { createClient } from "../../supabase/server";
import { Toaster } from "@/components/ui/toaster";
import Hero from "@/components/hero";
import Features from "@/components/features";
import HowItWorks from "@/components/how-it-works";
import ComingSoon from "@/components/coming-soon";
import WaitlistForm from "@/components/waitlist-form";
import PricingServer from "@/components/pricing-server";
import EarlyBirdBanner from "@/components/early-bird-banner";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine user status for banner
  let userStatus: 'guest' | 'free' | 'pro' = 'guest';
  
  if (user) {
    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    
    userStatus = subscription ? 'pro' : 'free';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <EarlyBirdBanner userStatus={userStatus} />
      <Navbar />
      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      {/* <Features /> */}
      {/* How It Works */}
      <HowItWorks />
      {/* Coming Soon */}
      {/* <ComingSoon /> */}
      {/* Pricing Section */}
      <PricingServer />
      {/* Waitlist Form */}
      {/* <WaitlistForm /> */}
      <Footer />
      <Toaster />
    </div>
  );
}
