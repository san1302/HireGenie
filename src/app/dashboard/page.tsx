import DashboardNavbar from "@/components/dashboard-navbar";
import ManageSubscription from "@/components/manage-subscription";
import { SubscriptionCheck } from "@/components/subscription-check";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Award,
  Settings,
  User,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Crown
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { manageSubscriptionAction, checkUserUsage } from "../actions";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const result = await manageSubscriptionAction(user?.id);

  if (!result) {
    return redirect("/pricing");
  }

  // Check user usage for free plan users
  const usageResult = await checkUserUsage(user.id);

  // Fetch real statistics from database
  const { data: coverLetters, error } = await supabase
    .from("cover_letters")
    .select("ats_score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cover letters for stats:", error);
  }

  const letters = coverLetters || [];
  
  // Calculate real statistics
  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const calculateAverageScore = (letters: any[]) => {
    const lettersWithScores = letters.filter(l => l.ats_score !== null);
    if (lettersWithScores.length === 0) return "N/A";
    
    const average = lettersWithScores.reduce((acc, l) => acc + l.ats_score, 0) / lettersWithScores.length;
    return `${Math.round(average)}%`;
  };

  const getThisMonthCount = (letters: any[]) => {
    const now = new Date();
    return letters.filter(l => {
      const letterDate = new Date(l.created_at);
      return letterDate.getMonth() === now.getMonth() && letterDate.getFullYear() === now.getFullYear();
    }).length;
  };

  // Get subscription info for plan type
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id.toString())
    .eq("status", "active")
    .single();
  console.log("subscription:  ", subscription);
  
  const isFreePlan = !subscription;
  const stats = {
    coverLettersGenerated: letters.length,
    lastGenerated: getTimeAgo(letters[0]?.created_at || null),
    successRate: calculateAverageScore(letters),
    planType: subscription ? "Pro" : "Free",
    thisMonth: getThisMonthCount(letters)
  };

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          
          {/* Free Plan Usage Alert */}
          {isFreePlan && usageResult.success && (
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Free Plan - {usageResult.remainingCount} letters remaining
                      </h3>
                      <p className="text-sm text-gray-600">
                        You've used {usageResult.usageCount} out of 2 free cover letters this month
                      </p>
                    </div>
                  </div>
                  {usageResult.remainingCount === 0 ? (
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Link href="/pricing">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                  ) : usageResult.remainingCount === 1 ? (
                    <Button variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Link href="/pricing">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade for Unlimited
                      </Link>
                    </Button>
                  ) : null}
                </div>
                {usageResult.remainingCount > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" 
                        style={{ width: `${(usageResult.usageCount / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back! 👋
                  </h1>
                  <p className="text-gray-600">
                    Let's create some amazing cover letters
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Sparkles className="h-3 w-3 mr-1" />
                {stats.planType} Plan
              </Badge>
              <Suspense fallback={<div>Loading...</div>}>
                {result?.url && <ManageSubscription redirectUrl={result?.url!} />}
              </Suspense>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Cover Letters
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
                <p className="text-xs text-gray-500">Generated this month</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Last Activity
                </CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.lastGenerated}</div>
                <p className="text-xs text-gray-500">Last generation</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average ATS Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.successRate}</div>
                <p className="text-xs text-gray-500">ATS compatibility</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Generated
                </CardTitle>
                <Award className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.coverLettersGenerated}</div>
                <p className="text-xs text-gray-500">All time total</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Cover Letter Generator - Main Section */}
            <div className="xl:col-span-3">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm" id="generate">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        AI Cover Letter Generator
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Upload your resume and job description to generate a personalized cover letter
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Enhanced
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CoverLetterGenerator 
                    userUsage={usageResult}
                    hasActiveSubscription={!!subscription}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Quick Actions */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/history">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View History
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/analytics">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plan</span>
                      <span className="font-medium text-gray-900">{stats.planType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    For best results, make sure your resume is up-to-date and the job description includes specific requirements and keywords.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionCheck>
  );
}
