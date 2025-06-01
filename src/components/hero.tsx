'use client';

import Link from "next/link";
import { ArrowRight, Check, FileText, Target, TrendingUp, Users, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase/client";
import { useEffect, useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [atsScore, setAtsScore] = useState(0);
  const [recentActivity, setRecentActivity] = useState(247);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();

    // Animate ATS score counter
    const scoreTimer = setInterval(() => {
      setAtsScore(prev => {
        if (prev < 87) return prev + 1;
        return 87;
      });
    }, 50);

    // Update recent activity counter periodically
    const activityTimer = setInterval(() => {
      setRecentActivity(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);

    return () => {
      clearInterval(scoreTimer);
      clearInterval(activityTimer);
    };
  }, []);

  const handleTryItNow = () => {
    if (isLoggedIn === null) {
      return;
    }
    
    if (isLoggedIn) {
      router.push('/dashboard#generate');
    } else {
      router.push('/sign-in?returnTo=/dashboard#generate');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "LIKELY TO PASS";
    if (score >= 60) return "NEEDS REVIEW";
    return "LIKELY REJECTED";
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-20 sm:pt-32 sm:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Beat ATS Filters –
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}
                  Land 3x More{" "}
                </span>
                Interviews
              </h1>

              <p className="text-xl text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                AI-powered cover letters with <strong>real-time ATS scoring</strong>. 
                Know your exact chances before you apply.
              </p>

              {/* ATS Score Highlight */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-8 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Average ATS Score</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(atsScore)}`}>
                      {atsScore}/100
                    </div>
                    <div className="text-xs text-gray-500">vs 62 industry avg</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                <Button
                  size="lg"
                  onClick={handleTryItNow}
                  disabled={isLoggedIn === null}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-medium disabled:opacity-50"
                >
                  {isLoggedIn === null ? 'Loading...' : 'Check Your ATS Score Free'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>87% average ATS score</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>38 seconds to perfect</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>

              {/* Live Activity Counter */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{recentActivity} cover letters generated in the last hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>12,847+ job seekers trust us</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg px-3 py-1 text-sm font-medium">
                    🚀 Enhanced AI
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    38 seconds total
                  </div>
                </div>
                
                {/* Input Section */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Resume Upload (10s)</div>
                    <div className="flex items-center p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <FileText className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700 text-sm">John_Smith_Resume.pdf</span>
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Job Description (5s)</div>
                    <div className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm">
                      Senior Software Engineer with 5+ years experience in React, Node.js...
                      <Check className="w-4 h-4 text-green-500 float-right mt-1" />
                    </div>
                  </div>
                </div>
                
                {/* Generated Results */}
                <div className="space-y-4">
                  {/* ATS Analysis - Made Primary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200 relative">
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      NEW!
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-blue-600 mr-2" />
                        <div className="text-sm text-gray-700 font-bold">ATS Compatibility Score</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                          ✓ {getScoreStatus(atsScore)}
                        </div>
                        <div className={`text-xl font-bold ${getScoreColor(atsScore)}`}>
                          {atsScore}/100
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Keyword Match</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="h-2 bg-green-500 rounded-full transition-all duration-1000" style={{ width: atsScore >= 30 ? '92%' : '0%' }}></div>
                          </div>
                          <span className="text-xs font-medium">92%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Parseability</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="h-2 bg-green-500 rounded-full transition-all duration-1000 delay-300" style={{ width: atsScore >= 50 ? '89%' : '0%' }}></div>
                          </div>
                          <span className="text-xs font-medium">89%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Format Quality</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="h-2 bg-yellow-500 rounded-full transition-all duration-1000 delay-500" style={{ width: atsScore >= 70 ? '78%' : '0%' }}></div>
                          </div>
                          <span className="text-xs font-medium">78%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center mt-3 pt-2 border-t border-green-200">
                      <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-xs text-gray-600 font-medium">Beats 94% of other applicants</span>
                    </div>
                  </div>

                  {/* Cover Letter - Made Secondary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600 font-medium">Generated Cover Letter (23s)</div>
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">✓ Ready</div>
                    </div>
                    <div className="text-gray-800">
                      <p className="font-medium text-sm mb-1">Dear Hiring Manager,</p>
                      <p className="text-xs leading-relaxed">
                        I am writing to express my interest in the Senior Software
                        Engineer position at Acme Inc. With over 5 years of
                        experience in React and Node.js development...
                      </p>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        [ Tailored to match 92% of job requirements ]
                      </p>
                    </div>
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
