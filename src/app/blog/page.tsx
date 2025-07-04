import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - HireGenie | Job Search Tips & ATS Optimization",
  description: "Expert advice on job searching, ATS optimization, cover letter writing, and career advancement. Get hired faster with proven strategies.",
  keywords: ["job search blog", "ATS optimization tips", "cover letter advice", "career guidance", "job application strategies"],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog - HireGenie | Job Search Tips & ATS Optimization",
    description: "Expert advice on job searching, ATS optimization, cover letter writing, and career advancement. Get hired faster with proven strategies.",
    url: "https://hiregenie.io/blog",
    images: [
      {
        url: "/og-image-blog.png",
        width: 1200,
        height: 630,
        alt: "HireGenie Blog - Job Search Tips",
      },
    ],
  },
  twitter: {
    title: "Blog - HireGenie | Job Search Tips & ATS Optimization",
    description: "Expert advice on job searching, ATS optimization, cover letter writing, and career advancement. Get hired faster with proven strategies.",
    images: ["/twitter-image-blog.png"],
  },
};

// Blog post data - will be moved to CMS or database later
const blogPosts = [
  {
    id: "ultimate-ats-optimization-guide-2024",
    title: "The Ultimate Guide to ATS Optimization in 2024",
    excerpt: "Master the art of beating Applicant Tracking Systems with our comprehensive guide. Learn the latest strategies that actually work.",
    publishDate: "2024-01-15",
    readTime: "12 min",
    category: "ATS Optimization",
    featured: true,
    author: "HireGenie Team",
    slug: "ultimate-ats-optimization-guide-2024"
  },
  {
    id: "cover-letter-templates-that-work",
    title: "Cover Letter Templates That Actually Work in 2024",
    excerpt: "Stop using generic templates. Download our proven cover letter templates that have helped thousands land interviews.",
    publishDate: "2024-01-10",
    readTime: "8 min",
    category: "Cover Letters",
    featured: false,
    author: "HireGenie Team",
    slug: "cover-letter-templates-that-work"
  },
  {
    id: "how-to-write-cover-letter-2024",
    title: "How to Write a Cover Letter in 2024: Step-by-Step Guide",
    excerpt: "Learn the exact formula for writing compelling cover letters that get noticed by recruiters and hiring managers.",
    publishDate: "2024-01-05",
    readTime: "10 min",
    category: "Cover Letters",
    featured: false,
    author: "HireGenie Team",
    slug: "how-to-write-cover-letter-2024"
  }
];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const otherPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Job Search <span className="text-blue-600">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert advice on ATS optimization, cover letter writing, and career advancement. 
              Get hired faster with proven strategies from industry professionals.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <div className="relative">
                <Badge className="absolute top-4 left-4 z-10 bg-blue-600 text-white">Featured</Badge>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
                      <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
                        {featuredPost.category}
                      </Badge>
                      <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                      <p className="text-blue-100 mb-6 text-lg">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-blue-100 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(featuredPost.publishDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                      <Link 
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Read Full Article <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="md:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-white text-2xl font-bold">ATS</span>
                        </div>
                        <p className="text-gray-600">Complete ATS Optimization Guide</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Other Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishDate).toLocaleDateString()}
                    </div>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                    >
                      Read More <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Stay Updated with Job Search Tips</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get weekly insights on ATS optimization, cover letter strategies, and career advancement delivered to your inbox.
            </p>
            <div className="flex max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder:text-gray-500"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}