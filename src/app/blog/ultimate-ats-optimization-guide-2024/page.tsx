import { Calendar, Clock, User, Share2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Ultimate Guide to ATS Optimization in 2024 | HireGenie",
  description: "Master ATS systems with our comprehensive 2024 guide. Learn proven strategies to beat applicant tracking systems and land more interviews.",
  keywords: ["ATS optimization", "applicant tracking system", "resume ATS", "ATS keywords", "beat ATS", "ATS tips 2024"],
  alternates: {
    canonical: "/blog/ultimate-ats-optimization-guide-2024",
  },
  openGraph: {
    title: "The Ultimate Guide to ATS Optimization in 2024 | HireGenie",
    description: "Master ATS systems with our comprehensive 2024 guide. Learn proven strategies to beat applicant tracking systems and land more interviews.",
    url: "https://hiregenie.io/blog/ultimate-ats-optimization-guide-2024",
    type: "article",
    images: [
      {
        url: "/og-image-ats-guide.png",
        width: 1200,
        height: 630,
        alt: "Ultimate ATS Optimization Guide 2024",
      },
    ],
  },
  twitter: {
    title: "The Ultimate Guide to ATS Optimization in 2024 | HireGenie",
    description: "Master ATS systems with our comprehensive 2024 guide. Learn proven strategies to beat applicant tracking systems and land more interviews.",
    images: ["/twitter-image-ats-guide.png"],
  },
};

export default function ATSOptimizationGuide() {
  return (
    <>
      <Navbar />
      <article className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              
              <Badge className="mb-6 bg-white/20 text-white">ATS Optimization</Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                The Ultimate Guide to ATS Optimization in 2024
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 max-w-3xl">
                Master the art of beating Applicant Tracking Systems with our comprehensive guide. 
                Learn the latest strategies that actually work in 2024.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>HireGenie Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>January 15, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>12 min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              
              {/* Table of Contents */}
              <Card className="mb-12 bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-2xl">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-blue-600">
                    <li><a href="#what-is-ats" className="hover:underline">What is an ATS and Why It Matters</a></li>
                    <li><a href="#how-ats-works" className="hover:underline">How ATS Systems Work in 2024</a></li>
                    <li><a href="#keyword-optimization" className="hover:underline">Keyword Optimization Strategies</a></li>
                    <li><a href="#resume-formatting" className="hover:underline">Resume Formatting Best Practices</a></li>
                    <li><a href="#cover-letter-ats" className="hover:underline">ATS-Optimized Cover Letters</a></li>
                    <li><a href="#common-mistakes" className="hover:underline">Common ATS Mistakes to Avoid</a></li>
                    <li><a href="#testing-tools" className="hover:underline">Tools to Test Your ATS Score</a></li>
                    <li><a href="#action-plan" className="hover:underline">Your ATS Optimization Action Plan</a></li>
                  </ol>
                </CardContent>
              </Card>

              {/* Introduction */}
              <div className="mb-12">
                <p className="text-xl text-gray-700 mb-6">
                  Did you know that over 98% of Fortune 500 companies use Applicant Tracking Systems (ATS) to screen resumes? 
                  If your resume isn't optimized for these systems, it might never reach human eyes.
                </p>
                
                <p className="mb-6">
                  In this comprehensive guide, we'll reveal the exact strategies that helped thousands of job seekers 
                  beat ATS systems and land more interviews in 2024. Whether you're a recent graduate or a seasoned 
                  professional, this guide will transform how you approach job applications.
                </p>
              </div>

              {/* Section 1: What is ATS */}
              <section id="what-is-ats" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">What is an ATS and Why It Matters</h2>
                
                <p className="mb-6">
                  An Applicant Tracking System (ATS) is software that helps employers manage their recruitment process. 
                  Think of it as a digital gatekeeper that screens resumes before they reach human recruiters.
                </p>

                <Card className="mb-6 bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">!</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Key Statistic</h4>
                        <p className="text-blue-800">
                          Studies show that 75% of resumes are rejected by ATS systems before reaching human recruiters. 
                          This means 3 out of 4 qualified candidates never get a chance to interview.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Popular ATS Systems in 2024</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span><strong>Workday:</strong> Used by 45% of Fortune 500 companies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span><strong>Greenhouse:</strong> Popular among tech companies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span><strong>Lever:</strong> Favored by startups and scale-ups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span><strong>Taleo:</strong> Oracle's enterprise solution</span>
                  </li>
                </ul>
              </section>

              {/* Section 2: How ATS Works */}
              <section id="how-ats-works" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">How ATS Systems Work in 2024</h2>
                
                <p className="mb-6">
                  Understanding how ATS systems process your resume is crucial for optimization. Here's the step-by-step process:
                </p>

                <div className="space-y-6 mb-8">
                  <Card className="border-l-4 border-l-blue-600">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Step 1: Document Parsing</h4>
                      <p className="text-gray-700">
                        The ATS scans your resume and extracts text, attempting to identify different sections like 
                        experience, education, and skills.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-600">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Step 2: Keyword Matching</h4>
                      <p className="text-gray-700">
                        The system searches for specific keywords from the job description and calculates a match score.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-600">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Step 3: Ranking and Filtering</h4>
                      <p className="text-gray-700">
                        Based on the match score, your resume gets ranked against other candidates. Only top-scoring 
                        resumes proceed to human review.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Section 3: Keyword Optimization */}
              <section id="keyword-optimization" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Keyword Optimization Strategies</h2>
                
                <p className="mb-6">
                  Keywords are the foundation of ATS optimization. Here's how to identify and implement them effectively:
                </p>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900">1. Job Description Analysis</h3>
                <p className="mb-6">
                  Start by thoroughly analyzing the job description. Look for:
                </p>
                <ul className="space-y-2 mb-6 ml-6">
                  <li>• Required skills and qualifications</li>
                  <li>• Industry-specific terminology</li>
                  <li>• Repeated phrases and keywords</li>
                  <li>• Software and tools mentioned</li>
                  <li>• Certifications and degrees</li>
                </ul>

                <h3 className="text-2xl font-semibold mb-4 text-gray-900">2. Strategic Keyword Placement</h3>
                <p className="mb-6">
                  Once you've identified keywords, place them strategically throughout your resume:
                </p>
                
                <Card className="mb-6 bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-green-900 mb-4">Best Practices for Keyword Placement:</h4>
                    <ul className="space-y-2 text-green-800">
                      <li>• <strong>Skills Section:</strong> Create a dedicated skills section with relevant keywords</li>
                      <li>• <strong>Job Titles:</strong> Use exact job titles from the posting when possible</li>
                      <li>• <strong>Experience Descriptions:</strong> Naturally incorporate keywords into your accomplishments</li>
                      <li>• <strong>Summary:</strong> Include 3-5 key terms in your professional summary</li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* CTA Section */}
              <Card className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Resume?</h3>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Don't let ATS systems hold you back. Try HireGenie's AI-powered optimization tool 
                    and get your ATS score instantly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                      <Link href="/dashboard">Try Free ATS Checker</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      <Link href="/pricing">View Pricing</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Continue with more sections... */}
              <section id="resume-formatting" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Resume Formatting Best Practices</h2>
                
                <p className="mb-6">
                  Even the best keywords won't help if your resume isn't formatted correctly for ATS parsing. 
                  Follow these formatting guidelines:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Do This
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-green-800">
                        <li>• Use standard section headings (Experience, Education, Skills)</li>
                        <li>• Save as .docx or .pdf format</li>
                        <li>• Use simple, clean fonts (Arial, Calibri, Times New Roman)</li>
                        <li>• Maintain consistent formatting throughout</li>
                        <li>• Use bullet points for easy scanning</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-900 flex items-center gap-2">
                        <span className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">✗</span>
                        Avoid This
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-red-800">
                        <li>• Complex tables and columns</li>
                        <li>• Images, graphics, or logos</li>
                        <li>• Unusual fonts or formatting</li>
                        <li>• Text boxes or text as images</li>
                        <li>• Headers and footers with important info</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Action Plan */}
              <section id="action-plan" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Your ATS Optimization Action Plan</h2>
                
                <p className="mb-6">
                  Ready to put everything into action? Follow this step-by-step checklist:
                </p>

                <div className="space-y-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Analyze the Job Description</h4>
                          <p className="text-gray-700">
                            Identify 10-15 key terms and phrases that appear in the job posting.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Update Your Resume</h4>
                          <p className="text-gray-700">
                            Incorporate keywords naturally into your experience, skills, and summary sections.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Test Your ATS Score</h4>
                          <p className="text-gray-700">
                            Use HireGenie's free ATS checker to see how your resume performs.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Optimize Your Cover Letter</h4>
                          <p className="text-gray-700">
                            Apply the same keyword optimization strategies to your cover letter.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                          5
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Track Your Results</h4>
                          <p className="text-gray-700">
                            Monitor your application response rates and adjust your strategy accordingly.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Final CTA */}
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-3xl font-bold mb-4">Start Getting More Interviews Today</h3>
                  <p className="text-purple-100 mb-6 max-w-2xl mx-auto text-lg">
                    Don't let ATS systems prevent you from landing your dream job. Join thousands of successful 
                    job seekers who've mastered ATS optimization with HireGenie.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-50">
                      <Link href="/dashboard">Get Started Free</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                      <Link href="/blog">Read More Articles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}