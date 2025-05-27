import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { createClient } from "../../supabase/server";
import { Toaster } from "@/components/ui/toaster";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import Hero from "@/components/hero";
import Features from "@/components/features";
import HowItWorks from "@/components/how-it-works";
import ComingSoon from "@/components/coming-soon";
import WaitlistForm from "@/components/waitlist-form";
import Pricing from "@/components/pricing";
import PricingServer from "@/components/pricing-server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <Features />
      {/* How It Works */}
      <HowItWorks />
      {/* Coming Soon */}
      <ComingSoon />
      {/* Cover Letter Generator */}
      <section id="generator" className="bg-white">
        <CoverLetterGenerator />
      </section>
      {/* Pricing Section */}
      <Pricing />
      {/* Live Pricing Section */}
      <PricingServer />
      {/* Waitlist Form */}
      <WaitlistForm />
      <Footer />
      <Toaster />
    </div>
  );
}
