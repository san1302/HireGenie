"use client";

import Link from "next/link";
import { Check, Star, Sparkles, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  
  const toggleBillingPeriod = () => {
    setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly");
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Choose the plan that works best for your job search needs. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center space-x-4 mb-2">
            <span className={`text-sm ${billingPeriod === "monthly" ? "text-blue-600 font-medium" : "text-gray-500"}`}>
              Monthly
            </span>
            <button 
              onClick={toggleBillingPeriod}
              className="relative rounded-full w-14 h-7 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center px-1 transition-colors"
            >
              <span 
                className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  billingPeriod === "yearly" ? "translate-x-7" : ""
                }`}
              />
            </button>
            <div className="flex items-center">
              <span className={`text-sm ${billingPeriod === "yearly" ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                Yearly
              </span>
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 p-8 flex flex-col h-full transform hover:-translate-y-1 transition-transform">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free</h3>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 ml-1">/forever</span>
              </div>
              <p className="text-gray-500 text-sm">Perfect for occasional job seekers</p>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mb-6">
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">2 cover letters</span> per month
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Basic templates</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Standard</span> export options
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Community</span> support
                  </span>
                </li>
              </ul>
            </div>
            
            <Button 
              asChild 
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-800"
            >
              <Link href="/pricing">Get Started</Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 flex flex-col h-full relative transform hover:-translate-y-1 transition-transform z-10 scale-105 md:scale-110">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center">
                <Star className="w-3 h-3 mr-1" />
                MOST POPULAR
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pro</h3>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold">${billingPeriod === "monthly" ? "9" : "7"}</span>
                <span className="text-gray-500 ml-1">/{billingPeriod === "monthly" ? "month" : "month, billed yearly"}</span>
              </div>
              <p className="text-gray-500 text-sm">For active job seekers and professionals</p>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mb-6">
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Unlimited</span> cover letters
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Advanced</span> tone control
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Premium</span> templates
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">PDF</span> export
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Priority</span> support
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">AI-powered</span> improvement suggestions
                  </span>
                </li>
              </ul>
            </div>
            
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/pricing">Subscribe Now</Link>
            </Button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 p-8 flex flex-col h-full transform hover:-translate-y-1 transition-transform">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Lifetime</h3>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  Best Value
                </span>
              </div>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-500 ml-1">/one-time</span>
              </div>
              <p className="text-gray-500 text-sm">For career-focused professionals</p>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mb-6">
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Everything</span> in Pro plan
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Lifetime</span> access
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Early access</span> to new features
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Personal</span> onboarding call
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    <span className="font-medium">Resume</span> review service
                  </span>
                </li>
              </ul>
            </div>
            
            <Button 
              asChild 
              className="w-full bg-gray-900 hover:bg-black text-white"
            >
              <Link href="/pricing">Get Lifetime Access</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center justify-center">
              <Zap className="text-blue-500 w-5 h-5 mr-2" />
              Enterprise plans available
            </h3>
            <p className="text-gray-600 mb-4">
              Need custom features or higher volume? We offer tailored enterprise plans for teams and organizations.
            </p>
            <Button 
              asChild 
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 