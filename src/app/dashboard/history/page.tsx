import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CoverLetterCard from "@/components/cover-letter-card";
import { 
  FileText, 
  Calendar,
  Target,
  Clock,
  Download,
  Eye,
  Search,
  Filter
} from "lucide-react";

// TypeScript interfaces
interface CoverLetter {
  id: string;
  cover_letter_content: string;
  job_description: string;
  resume_filename: string | null;
  tone: string;
  ats_score: number | null;
  created_at: string;
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's cover letter history
  const { data: coverLetters, error } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cover letters:", error);
  }

  const letters = coverLetters || [];

  // Calculate summary stats
  const totalLetters = letters.length;
  const avgScore = letters.length > 0 
    ? Math.round(letters.filter(l => l.ats_score).reduce((acc, l) => acc + (l.ats_score || 0), 0) / letters.filter(l => l.ats_score).length) || 0
    : 0;
  const thisMonth = letters.filter(l => {
    const date = new Date(l.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Cover Letter History
                  </h1>
                  <p className="text-gray-600">
                    View and manage your generated cover letters
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <FileText className="h-3 w-3 mr-1" />
                {totalLetters} Total
              </Badge>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Generated
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{totalLetters}</div>
                <p className="text-xs text-gray-500">Cover letters</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average ATS Score
                </CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{avgScore}/100</div>
                <p className="text-xs text-gray-500">Performance rating</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{thisMonth}</div>
                <p className="text-xs text-gray-500">New generations</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Cover Letters List */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900">
                      Your Cover Letters
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Click on any cover letter to expand and view details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {letters.length > 0 ? (
                    <div className="space-y-4">
                      {letters.map((letter) => (
                        <CoverLetterCard key={letter.id} letter={letter} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No cover letters yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Generate your first cover letter to see it here
                      </p>
                      <Button asChild>
                        <a href="/dashboard">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Cover Letter
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Stats */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best ATS Score</span>
                    <span className="font-medium">
                      {letters.length > 0 && letters.some(l => l.ats_score) 
                        ? Math.max(...letters.filter(l => l.ats_score).map(l => l.ats_score!))
                        : 'N/A'
                      }/100
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Most Used Tone</span>
                    <span className="font-medium capitalize">
                      {letters.length > 0 
                        ? letters.reduce((acc, curr) => 
                            letters.filter(l => l.tone === acc).length >= letters.filter(l => l.tone === curr.tone).length ? acc : curr.tone
                          , letters[0].tone)
                        : 'None'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Generated</span>
                    <span className="font-medium">
                      {letters.length > 0 
                        ? new Date(letters[0].created_at).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    Bulk View
                  </Button>
                  <Button asChild className="w-full">
                    <a href="/dashboard">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate New
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-teal-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Review high-scoring letters to understand what works</p>
                    <p>• Copy and modify successful letters for similar roles</p>
                    <p>• Track performance patterns over time</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionCheck>
  );
} 