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

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

        <div className="relative pt-24 pb-20 sm:pt-32 sm:pb-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                  Stop writing
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {" "}
                    cover letters{" "}
                  </span>
                  by hand
                </h1>

                <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  HireGenie.io uses AI to instantly generate personalized,
                  high-quality cover letters tailored to your resume and job
                  description.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                  <Link href="#waitlist">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-medium"
                    >
                      Join Waitlist
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-auto">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Cover Letter Generator</div>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        AI Powered
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
                      <div className="text-sm text-gray-500 mb-1">Resume</div>
                      <div className="flex items-center text-sm">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        <span>John_Smith_Resume.pdf</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-3">
                      <div className="text-sm text-gray-500 mb-1">
                        Job Description
                      </div>
                      <div className="text-sm line-clamp-2">
                        Senior Software Engineer with 5+ years experience in
                        React, Node.js...
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="font-medium mb-2">
                      Generated Cover Letter
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="mb-2">Dear Hiring Manager,</p>
                      <p className="mb-2">
                        I am writing to express my interest in the Senior
                        Software Engineer position at Acme Inc. With over 5
                        years of experience in React and Node.js development...
                      </p>
                      <p className="text-gray-400">[ Preview truncated ]</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Features That Make a Difference
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered tools help you create the perfect cover letter in
              minutes, not hours.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
            <div className="flex-1 order-2 lg:order-1">
              <h3 className="text-2xl font-bold mb-4">
                Instant Cover Letter Generator
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your resume, paste the job description, and watch as our
                AI creates a perfectly tailored cover letter that highlights
                your relevant skills and experience.
              </p>
              <ul className="space-y-3">
                {[
                  "Resume-job matching technology",
                  "Highlights your most relevant experience",
                  "Customized for each application",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80"
                  alt="Resume matching illustration"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                  alt="Tone tuner illustration"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Live Tone Tuner</h3>
              <p className="text-gray-600 mb-6">
                Adjust the tone of your cover letter to match the company
                culture. From professional and formal to friendly and
                conversational, you're in control.
              </p>
              <ul className="space-y-3">
                {[
                  "Multiple tone options",
                  "Real-time adjustments",
                  "Perfect for different industries",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Three simple steps to your perfect cover letter
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Upload className="w-8 h-8" />,
                title: "Upload Resume",
                description:
                  "Upload your existing resume or CV to our secure platform",
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Paste Job Description",
                description:
                  "Copy and paste the job description you're applying for",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Get Tailored Cover Letter",
                description:
                  "Receive your personalized cover letter in seconds",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're constantly improving HireGenie.io with new features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Interview Prep Assistant", eta: "Q3 2023" },
              { title: "Resume Analyzer & Optimizer", eta: "Q4 2023" },
              { title: "Job Match Scoring", eta: "Q1 2024" },
              { title: "Career Path Recommendations", eta: "Q2 2024" },
            ].map((feature, index) => (
              <div
                key={index}
                className="border border-gray-200 p-6 rounded-xl hover:border-blue-300 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Expected: {feature.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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

              <Button className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                Get Started
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

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Subscribe Now
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

              <Button className="w-full bg-gray-800 text-white hover:bg-gray-900">
                Get Lifetime Access
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
            href="#waitlist"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Waitlist
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
