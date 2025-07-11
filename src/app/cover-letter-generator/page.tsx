import { Suspense } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CoverLetterGeneratorPublic from "@/components/CoverLetterGeneratorPublic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Cover Letter Generator - Create ATS-Optimized Cover Letters | HireGenie",
  description: "Generate professional, ATS-optimized cover letters in under 2 minutes with our free AI tool. Upload your resume and job description to get personalized cover letters that beat applicant tracking systems.",
  keywords: [
    "cover letter generator", 
    "ai cover letter generator", 
    "free cover letter generator",
    "ats cover letter",
    "cover letter maker",
    "ai cover letter",
    "job application",
    "resume cover letter"
  ],
  alternates: {
    canonical: "/cover-letter-generator",
  },
  openGraph: {
    title: "Free AI Cover Letter Generator - Create ATS-Optimized Cover Letters | HireGenie",
    description: "Generate professional, ATS-optimized cover letters in under 2 minutes with our free AI tool. Upload your resume and job description to get personalized cover letters that beat applicant tracking systems.",
    url: "https://hiregenie.io/cover-letter-generator",
    type: "website",
    images: [
      {
        url: "/og-image-cover-letter-generator.png",
        width: 1200,
        height: 630,
        alt: "Free AI Cover Letter Generator - HireGenie",
      },
    ],
  },
  twitter: {
    title: "Free AI Cover Letter Generator - Create ATS-Optimized Cover Letters | HireGenie",
    description: "Generate professional, ATS-optimized cover letters in under 2 minutes with our free AI tool. Upload your resume and job description to get personalized cover letters that beat applicant tracking systems.",
    images: ["/twitter-image-cover-letter-generator.png"],
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function CoverLetterGeneratorPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Clean Hero Section */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Free AI Cover Letter Generator
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Create ATS-optimized cover letters in under 2 minutes. No login required.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm mb-8">
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">100% Free</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-700">ATS-Optimized</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-gray-700">No Login Required</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="font-medium text-gray-700">2-Minute Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tool - Clean Card Layout */}
        <div className="container mx-auto px-4 pb-8">
          <Suspense fallback={
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            </div>
          }>
            <CoverLetterGeneratorPublic />
          </Suspense>
        </div>

        {/* Collapsible SEO Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl mx-auto">
            <details className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="font-medium">Learn more about our AI cover letter generator</span>
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              
              <div className="mt-8 space-y-8">
                {/* How It Works */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">1</div>
                        <div>
                          <h3 className="font-medium text-gray-900">Upload Resume</h3>
                          <p className="text-gray-600 text-sm">Upload your file or paste resume text</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">2</div>
                        <div>
                          <h3 className="font-medium text-gray-900">Add Job Description</h3>
                          <p className="text-gray-600 text-sm">Paste the job posting for tailored results</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">3</div>
                        <div>
                          <h3 className="font-medium text-gray-900">Generate & Download</h3>
                          <p className="text-gray-600 text-sm">Get your ATS-optimized cover letter instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">ATS-optimized formatting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">AI-powered content generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Industry-specific optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Multiple download formats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Real-time ATS score analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Professional templates</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Frequently Asked Questions</h2>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Is this really free?</h3>
                      <p className="text-gray-600">Yes! Generate and copy cover letters for free. Sign up to save and download.</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">How does ATS optimization work?</h3>
                      <p className="text-gray-600">Our AI analyzes job descriptions and optimizes keywords and formatting for ATS systems.</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Can I edit the generated letter?</h3>
                      <p className="text-gray-600">Yes! You can modify and personalize the generated content before downloading.</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">What file formats are supported?</h3>
                      <p className="text-gray-600">Upload PDF, DOC, DOCX resumes. Download cover letters as TXT, DOC, or PDF.</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}