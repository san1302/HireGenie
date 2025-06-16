import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target,
  Calendar,
  FileText,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's cover letter data for analytics
  const { data: coverLetters, error } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cover letters for analytics:", error);
  }

  const letters = coverLetters || [];

  // Calculate analytics metrics
  const calculateMetrics = () => {
    if (letters.length === 0) {
      return {
        totalGenerated: 0,
        averageScore: 0,
        highestScore: 0,
        thisMonth: 0,
        lastMonth: 0,
        trendPercentage: 0,
        toneDistribution: {},
        monthlyData: [],
        recentActivity: []
      };
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = now.getFullYear();

    // Basic metrics
    const totalGenerated = letters.length;
    const lettersWithScores = letters.filter(l => l.ats_score !== null);
    const averageScore = lettersWithScores.length > 0 
      ? Math.round(lettersWithScores.reduce((acc, l) => acc + l.ats_score, 0) / lettersWithScores.length)
      : 0;
    const highestScore = lettersWithScores.length > 0 
      ? Math.max(...lettersWithScores.map(l => l.ats_score))
      : 0;

    // Monthly comparison
    const thisMonthCount = letters.filter(l => {
      const date = new Date(l.created_at);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;

    const lastMonthCount = letters.filter(l => {
      const date = new Date(l.created_at);
      return date.getMonth() === lastMonth && 
             (lastMonth === 11 ? date.getFullYear() === thisYear - 1 : date.getFullYear() === thisYear);
    }).length;

    const trendPercentage = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : thisMonthCount > 0 ? 100 : 0;

    // Tone distribution
    const toneDistribution = letters.reduce((acc, letter) => {
      acc[letter.tone] = (acc[letter.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = letters.filter(l => new Date(l.created_at) >= sevenDaysAgo);

    return {
      totalGenerated,
      averageScore,
      highestScore,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      trendPercentage,
      toneDistribution,
      recentActivity
    };
  };

  const metrics = calculateMetrics();

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container-responsive mobile-padding mobile-spacing">
          
          {/* Header Section */}
          <div className="mobile-stack gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="responsive-heading">
                    Analytics
                  </h1>
                  <p className="responsive-text text-gray-600">
                    Track your cover letter performance and insights
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Activity className="h-3 w-3 mr-1" />
                Last 30 Days
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Generated
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalGenerated}</div>
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
                <div className="text-2xl font-bold text-gray-900">{metrics.averageScore}/100</div>
                <p className="text-xs text-gray-500">Compatibility rate</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  This Month
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.thisMonth}</div>
                <p className="text-xs text-gray-500">
                  {metrics.trendPercentage >= 0 ? '+' : ''}{metrics.trendPercentage}% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Best Score
                </CardTitle>
                <Award className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.highestScore}/100</div>
                <p className="text-xs text-gray-500">Personal best</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Analytics */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Usage Over Time */}
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Usage Trends
                  </CardTitle>
                  <CardDescription>
                    Your cover letter generation activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {letters.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto" />
                          <p className="text-sm text-gray-600">Interactive charts coming soon</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{metrics.thisMonth}</p>
                          <p className="text-xs text-gray-500">This Month</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{metrics.lastMonth}</p>
                          <p className="text-xs text-gray-500">Last Month</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{metrics.recentActivity.length}</p>
                          <p className="text-xs text-gray-500">Last 7 Days</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Generate your first cover letter to see trends</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    ATS Performance
                  </CardTitle>
                  <CardDescription>
                    How well your cover letters perform with ATS systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {letters.filter(l => l.ats_score).length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-600">{metrics.averageScore}</p>
                          <p className="text-sm text-gray-500">Average Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-yellow-600">{metrics.highestScore}</p>
                          <p className="text-sm text-gray-500">Best Score</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Excellent (80-100)</span>
                          <span className="font-medium">
                            {letters.filter(l => l.ats_score >= 80).length} letters
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${letters.length > 0 ? (letters.filter(l => l.ats_score >= 80).length / letters.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Good (60-79)</span>
                          <span className="font-medium">
                            {letters.filter(l => l.ats_score >= 60 && l.ats_score < 80).length} letters
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ 
                              width: `${letters.length > 0 ? (letters.filter(l => l.ats_score >= 60 && l.ats_score < 80).length / letters.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Needs Work (&lt;60)</span>
                          <span className="font-medium">
                            {letters.filter(l => l.ats_score < 60).length} letters
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ 
                              width: `${letters.length > 0 ? (letters.filter(l => l.ats_score < 60).length / letters.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Generate cover letters to see ATS performance</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Analytics */}
            <div className="space-y-6">
              
              {/* Tone Preferences */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Tone Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(metrics.toneDistribution).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(metrics.toneDistribution)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([tone, count]) => (
                        <div key={tone} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 capitalize">{tone}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${((count as number) / letters.length) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-6">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <PieChart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.recentActivity.slice(0, 5).map((letter, index) => (
                        <div key={letter.id} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-gray-900">Cover letter generated</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(letter.created_at).toLocaleDateString()} • {letter.tone}
                              {letter.ats_score && (
                                <span className="ml-2 text-green-600">ATS: {letter.ats_score}/100</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    Performance Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-700">
                    {metrics.averageScore < 70 && (
                      <p>• Try including more job-specific keywords to improve ATS scores</p>
                    )}
                    {letters.length < 5 && (
                      <p>• Generate more cover letters to unlock detailed insights</p>
                    )}
                    {Object.keys(metrics.toneDistribution).length === 1 && (
                      <p>• Experiment with different tones for various job types</p>
                    )}
                    <p>• Aim for ATS scores above 80 for best results</p>
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