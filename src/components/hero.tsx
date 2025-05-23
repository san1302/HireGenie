import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
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
                <Link href="#generator">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-medium"
                  >
                    Try It Now
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
              <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 text-indigo-600 rounded-lg px-3 py-1 text-sm font-medium">
                    AI Powered
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Resume</div>
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">John_Smith_Resume.pdf</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">
                    Job Description
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm">
                    Senior Software Engineer with 5+ years experience in React,
                    Node.js...
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                  <div className="text-sm text-gray-500 mb-2">
                    Generated Cover Letter
                  </div>
                  <div className="text-gray-800">
                    <p className="font-medium mb-2">Dear Hiring Manager,</p>
                    <p className="text-sm">
                      I am writing to express my interest in the Senior Software
                      Engineer position at Acme Inc. With over 5 years of
                      experience in React and Node.js development...
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      [ Preview truncated ]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
