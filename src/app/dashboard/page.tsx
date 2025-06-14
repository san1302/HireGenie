import DashboardNavbar from "@/components/dashboard-navbar";
import ManageSubscription from "@/components/manage-subscription";
import { SubscriptionCheck } from "@/components/subscription-check";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import {
  FileText,
  TrendingUp,
  Clock,
  Award,
  User,
  Sparkles,
  Crown,
  Plus
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
    .maybeSingle();
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* Free Plan Usage Alert */}
          {isFreePlan && usageResult.success && (
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Free Plan - {usageResult.remainingCount} letters remaining
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        You've used {usageResult.usageCount} out of 2 free cover letters this month
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {usageResult.remainingCount === 0 ? (
                      <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
                        <Link href="/pricing">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Link>
                      </Button>
                    ) : usageResult.remainingCount === 1 ? (
                      <Button variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
                        <Link href="/pricing">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade for Unlimited
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
                {usageResult.remainingCount > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(usageResult.usageCount / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Welcome back! 👋
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Let's create some amazing cover letters
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                <Sparkles className="h-3 w-3 mr-1" />
                {stats.planType} Plan
              </Badge>
              <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
                {result?.url && <ManageSubscription redirectUrl={result?.url!} />}
              </Suspense>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Cover Letters
                </CardTitle>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
                <p className="text-xs text-gray-500">Generated this month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Last Activity
                </CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.lastGenerated}</div>
                <p className="text-xs text-gray-500">Last generation</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Average ATS Score
                </CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.successRate}</div>
                <p className="text-xs text-gray-500">ATS compatibility</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Generated
                </CardTitle>
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.coverLettersGenerated}</div>
                <p className="text-xs text-gray-500">All time total</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8">

            {/* Cover Letter Generator - Full Width */}
            <div className="w-full">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm" id="generate">
                {/* <CardHeader className="pb-4 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        AI Cover Letter Generator
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600">
                        Upload your resume and job description to generate a personalized cover letter
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-fit">
                      Enhanced
                    </Badge>
                  </div>
                </CardHeader> */}
                {/* <CardContent className="pt-0"> */}
                <CoverLetterGenerator
                  userUsage={usageResult}
                  hasActiveSubscription={!!subscription}
                />
                {/* </CardContent> */}
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-6 right-6 sm:hidden z-40">
          <Link href="#generate">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-6 w-6 text-white" />
            </Button>
          </Link>
        </div>
      </div>
    </SubscriptionCheck>
  );
}
