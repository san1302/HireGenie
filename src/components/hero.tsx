import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
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

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>AI-powered technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Personalized for each job</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Save hours of time</span>
                </div>
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
                  {/* Mock UI content */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
