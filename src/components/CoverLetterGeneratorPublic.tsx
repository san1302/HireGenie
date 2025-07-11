"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { 
  Upload, 
  FileText, 
  Check, 
  Loader, 
  Copy, 
  Download,
  AlertCircle,
  RefreshCw,
  X,
  Crown,
  Sparkles,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  User,
  LogIn
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EnhancedProgress } from "./ui/progress";
import { FreemiumFeature, PremiumATSBreakdown, PremiumDownload } from "./FreemiumFeature";
import { trackEvent, trackCoverLetterGenerated, trackSignUp } from "./analytics";

// Types
type GenerationStep = 'analyzing' | 'processing' | 'generating' | 'optimizing' | 'finalizing' | 'complete';
type ActiveTab = "upload" | "paste";

interface ProgressStep {
  id: GenerationStep;
  label: string;
  description: string;
  progress: number;
}

interface ATSAnalysis {
  success: boolean;
  overallScore: number;
  passFailStatus: 'PASS' | 'FAIL' | 'REVIEW';
  breakdown: {
    parseability: number;
    keywordMatch: number;
    skillsAlignment: number;
    formatCompatibility: number;
    contactInfo: number;
    bonusFeatures: number;
  };
  recommendations: Array<{
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    issue: string;
    fix: string;
    impact: string;
  }>;
  missingKeywords: string[];
  matchedKeywords: string[];
  skillsFound: string[];
  skillsMissing: string[];
  criticalIssues: string[];
}

export default function CoverLetterGeneratorPublic() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Auth state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form state
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Standard");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('analyzing');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [error, setError] = useState("");

  // Progress steps configuration
  const progressSteps: ProgressStep[] = [
    { id: 'analyzing', label: 'Analyzing Resume', description: 'Extracting skills and experience from your resume...', progress: 15 },
    { id: 'processing', label: 'Processing Job Description', description: 'Identifying key requirements and qualifications...', progress: 35 },
    { id: 'generating', label: 'Generating Content', description: 'Creating your personalized cover letter...', progress: 60 },
    { id: 'optimizing', label: 'ATS Optimization', description: 'Optimizing for applicant tracking systems...', progress: 85 },
    { id: 'finalizing', label: 'Finalizing', description: 'Adding finishing touches and final review...', progress: 95 },
    { id: 'complete', label: 'Complete', description: 'Your cover letter is ready!', progress: 100 }
  ];
  
  // Results state
  const [coverLetter, setCoverLetter] = useState("");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // UI state
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN') {
        const provider = session?.user?.app_metadata?.provider;
        trackSignUp(provider === 'google' ? 'google' : 'email');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // File handling
  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
    setFileName(file.name);
    setActiveTab("upload");
    trackEvent('resume_upload', { file_type: file.type });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Generation function
  const handleGenerate = async () => {
    if (!resumeFile && !resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume or paste resume text.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required", 
        description: "Please paste the job description to generate a tailored cover letter.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError("");
    setCurrentProgress(0);
    
    try {
      // Enhanced step progression with realistic timing
      const progressStepFlow = async () => {
        // Step 1: Analyzing
        setGenerationStep('analyzing');
        setCurrentProgress(15);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 2: Processing
        setGenerationStep('processing');
        setCurrentProgress(35);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Step 3: Generating
        setGenerationStep('generating');
        setCurrentProgress(60);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 4: Optimizing
        setGenerationStep('optimizing');
        setCurrentProgress(85);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 5: Finalizing
        setGenerationStep('finalizing');
        setCurrentProgress(95);
        await new Promise(resolve => setTimeout(resolve, 500));
      };

      // Start progress flow
      progressStepFlow();
      
      const formData = new FormData();

      if (resumeFile) {
        formData.append("resume_file", resumeFile);
      } else if (resumeText.trim()) {
        formData.append("resume_text", resumeText);
      }

      formData.append("job_description", jobDescription);
      formData.append("tone", tone);
      formData.append("length", length);
      formData.append("output_format", "txt");
      formData.append("public_mode", "true"); // Flag for public access

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      setAtsAnalysis(data.atsAnalysis);
      setHasGenerated(true);
      setGenerationStep('complete');
      setCurrentProgress(100);

      // Track successful generation
      trackCoverLetterGenerated(data.atsAnalysis?.overallScore);
      
      // Show signup prompt for non-users after successful generation
      if (!user) {
        setTimeout(() => {
          setShowSignupPrompt(true);
        }, 2000);
      }

    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      trackEvent('cover_letter_copy');
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Download function (requires signup)
  const handleDownload = () => {
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }

    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    trackEvent('cover_letter_download', { format: 'txt' });
  };

  const getCurrentStep = () => {
    return progressSteps.find(step => step.id === generationStep) || progressSteps[0];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Main Tool Card - Clean Dashboard Style */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Generate Your Cover Letter
          </CardTitle>
          <CardDescription className="text-gray-600">
            Upload your resume and paste the job description to create a personalized, ATS-optimized cover letter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Step 1: Upload Your Resume</Label>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload" className="text-sm">Upload File</TabsTrigger>
                <TabsTrigger value="paste" className="text-sm">Paste Text</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-0">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{fileName}</span>
                      <button
                        onClick={() => {
                          setResumeFile(null);
                          setFileName("");
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-2 text-sm">
                        Drag and drop your resume or{" "}
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                          browse files
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (max 10MB)</p>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="paste" className="mt-0">
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <Label htmlFor="job-description" className="text-sm font-medium">
              Step 2: Paste Job Description
            </Label>
            <Textarea
              id="job-description"
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (e.target.value) {
                  trackEvent('job_description_input');
                }
              }}
              className="min-h-[100px] text-sm"
            />
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone" className="text-xs font-medium text-gray-700">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="Confident">Confident</SelectItem>
                  <SelectItem value="Conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="length" className="text-xs font-medium text-gray-700">Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Concise">Concise</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-2 space-y-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!resumeFile && !resumeText.trim()) || !jobDescription.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  {getCurrentStep().label}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
            
            {/* Enhanced Progress Display */}
            {isGenerating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <EnhancedProgress 
                  value={currentProgress} 
                  status={getCurrentStep().description}
                  className="mb-2"
                />
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>This typically takes 10-15 seconds</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section - Clean Layout */}
      {hasGenerated && coverLetter && (
        <div className="mt-6 space-y-6">
          {/* Cover Letter */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Your Cover Letter</CardTitle>
                <CardDescription className="text-sm">AI-generated and ATS-optimized</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-1 h-8 text-xs"
                >
                  {copySuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
                <PremiumDownload 
                  isUserPremium={!!user}
                  onUpgrade={() => setShowSignupPrompt(true)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </PremiumDownload>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="prose prose-sm max-w-none">
                  <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
                    {coverLetter}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ATS Analysis */}
          {atsAnalysis && (
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-green-600" />
                  ATS Analysis
                </CardTitle>
                <CardDescription className="text-sm">
                  How well your cover letter performs with ATS systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Free: Basic Score Display */}
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(atsAnalysis.overallScore)}`}>
                      {Math.round(atsAnalysis.overallScore)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Overall ATS Score</div>
                    
                    {/* Free: Basic Status */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Check className="w-4 h-4" />
                      {atsAnalysis.overallScore >= 70 ? 'Good ATS Compatibility' : 'Needs Improvement'}
                    </div>
                  </div>

                  {/* Free: Basic Tips (3 only) */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-gray-900">Quick Improvement Tips:</h4>
                    <div className="space-y-2">
                      {atsAnalysis.recommendations && atsAnalysis.recommendations.slice(0, 3).map((recommendation, index) => (
                        <div key={index} className="text-xs text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
                          <div className="font-medium">{recommendation.issue}</div>
                          <div className="text-blue-600 mt-1">{recommendation.fix}</div>
                        </div>
                      ))}
                      
                      {/* Show more recommendations teaser - Dashboard style */}
                      {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 3 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <Crown className="w-3 h-3 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {atsAnalysis.recommendations.length - 3} more improvement tips available
                                </p>
                                <p className="text-xs text-gray-600">Unlock detailed recommendations with Pro</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSignupPrompt(true)}
                              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              Upgrade
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Premium: Detailed Breakdown */}
                  <PremiumATSBreakdown 
                    isUserPremium={!!user}
                    onUpgrade={() => setShowSignupPrompt(true)}
                  >
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Detailed ATS Breakdown
                      </h4>
                      
                      {/* Detailed Score Breakdown */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Keyword Match</span>
                            <span className={`text-sm font-medium ${getScoreColor(atsAnalysis.breakdown.keywordMatch)}`}>
                              {Math.round(atsAnalysis.breakdown.keywordMatch)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Format Score</span>
                            <span className={`text-sm font-medium ${getScoreColor(atsAnalysis.breakdown.formatCompatibility)}`}>
                              {Math.round(atsAnalysis.breakdown.formatCompatibility)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Skills Match</span>
                            <span className={`text-sm font-medium ${getScoreColor(atsAnalysis.breakdown.skillsAlignment)}`}>
                              {Math.round(atsAnalysis.breakdown.skillsAlignment)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Parseability</span>
                            <span className={`text-sm font-medium ${getScoreColor(atsAnalysis.breakdown.parseability)}`}>
                              {Math.round(atsAnalysis.breakdown.parseability)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Contact Info</span>
                            <span className={`text-sm font-medium ${getScoreColor(atsAnalysis.breakdown.contactInfo)}`}>
                              {Math.round(atsAnalysis.breakdown.contactInfo)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Bonus Features</span>
                            <span className={`text-sm font-medium ${getScoreColor(atsAnalysis.breakdown.bonusFeatures)}`}>
                              {Math.round(atsAnalysis.breakdown.bonusFeatures)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Keywords Analysis */}
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-xs text-gray-700 mb-2">Matched Keywords</h5>
                          <div className="flex flex-wrap gap-1">
                            {atsAnalysis.matchedKeywords?.slice(0, 5).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                                {keyword}
                              </Badge>
                            ))}
                            {atsAnalysis.matchedKeywords && atsAnalysis.matchedKeywords.length > 5 && (
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                +{atsAnalysis.matchedKeywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-xs text-gray-700 mb-2">Missing Keywords</h5>
                          <div className="flex flex-wrap gap-1">
                            {atsAnalysis.missingKeywords?.slice(0, 5).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                                {keyword}
                              </Badge>
                            ))}
                            {atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 5 && (
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                +{atsAnalysis.missingKeywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PremiumATSBreakdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Enhanced Signup Prompt Modal - Dashboard Style */}
      {showSignupPrompt && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                Unlock Pro Features
              </CardTitle>
              <CardDescription className="text-base">
                You've experienced the power of our AI. Unlock everything with a free account!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Feature Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    What You Get (Free)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-1 h-1 rounded-full bg-green-600"></div>
                      <span>Basic cover letter generation</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-1 h-1 rounded-full bg-green-600"></div>
                      <span>Overall ATS score</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-1 h-1 rounded-full bg-green-600"></div>
                      <span>3 improvement tips</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-1 h-1 rounded-full bg-green-600"></div>
                      <span>Copy to clipboard</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                    Pro Features
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-purple-600">
                      <div className="w-1 h-1 rounded-full bg-purple-600"></div>
                      <span>Download PDF, DOCX, TXT</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <div className="w-1 h-1 rounded-full bg-purple-600"></div>
                      <span>Detailed ATS breakdown</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <div className="w-1 h-1 rounded-full bg-purple-600"></div>
                      <span>Complete keyword analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <div className="w-1 h-1 rounded-full bg-purple-600"></div>
                      <span>AI writing assistant</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <div className="w-1 h-1 rounded-full bg-purple-600"></div>
                      <span>History & templates</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-gray-900">Start Free Today</div>
                  <div className="text-sm text-gray-600">No credit card required • Upgrade anytime</div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push('/sign-up')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create Free Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/sign-in')}
                    className="flex-1"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowSignupPrompt(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Continue without account
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}