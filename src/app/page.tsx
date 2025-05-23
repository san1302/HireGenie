import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  FileText,
  Upload,
  Zap,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import Hero from "@/components/hero";
import Features from "@/components/features";
import HowItWorks from "@/components/how-it-works";
import ComingSoon from "@/components/coming-soon";

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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your job search needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-1">$0</div>
                <p className="text-gray-500 text-sm">Forever</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    2 cover letters per month
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Basic templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Standard export options</span>
                </li>
              </ul>

              <Button asChild className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                <Link href="/pricing">Get Started</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500 relative transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-1">$9</div>
                <p className="text-gray-500 text-sm">per month</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Unlimited cover letters</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Advanced tone control</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Premium templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">PDF export</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>

              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Link href="/pricing">Subscribe Now</Link>
              </Button>
            </div>

            {/* Lifetime Plan */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Lifetime</h3>
                <div className="text-3xl font-bold mb-1">$199</div>
                <p className="text-gray-500 text-sm">one-time payment</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Everything in Pro plan</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Lifetime access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    Early access to new features
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    Personal onboarding call
                  </span>
                </li>
              </ul>

              <Button asChild className="w-full bg-gray-800 text-white hover:bg-gray-900">
                <Link href="/pricing">Get Lifetime Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Waitlist Form */}
      <section
        id="waitlist"
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Join the Waitlist</h2>
            <p className="max-w-2xl mx-auto opacity-90">
              Be the first to know when HireGenie.io launches. Early access
              members will receive special benefits.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white"
                required
              />
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Join Now
              </Button>
            </form>
            <div className="mt-6 text-center text-sm opacity-80">
              <p>Join 1,240+ others waiting for access</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who are saving time and getting more
            interviews with HireGenie.io.
          </p>
          <Link
            href="#generator"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try It Now
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
      <Footer />
      <Toaster />
    </div>
  );
}
