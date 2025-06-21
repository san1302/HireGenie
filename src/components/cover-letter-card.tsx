"use client";

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  FileText,
  MapPin,
  Building,
  Calendar,
  Target,
  Download,
  Edit,
  MoreHorizontal,
  Loader2,
  TrendingUp,
  Clock,
  Briefcase,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { useJobInfo, JobInfo, getCardStyling, getATSScoreColor, getATSScoreLabel } from "@/hooks/useJobInfo";
import { getProgressColor } from "@/components/CoverLetterGenerator/helpers";

interface CoverLetter {
  id: string;
  cover_letter_content: string;
  job_description: string;
  resume_filename: string | null;
  tone: string;
  ats_score: number | null;
  ats_analysis: any; // The JSON analysis data
  created_at: string;
}

interface CoverLetterCardProps {
  letter: CoverLetter;
}

// Utility function to get word count
const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Utility function to format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays/7)} weeks ago`;
  return date.toLocaleDateString();
};

// Utility function to format score values
const formatScore = (value: unknown): string => {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) return '0';
  
  // Round to 1 decimal place if there's a meaningful decimal, otherwise show as integer
  return numValue % 1 === 0 ? Math.round(numValue).toString() : numValue.toFixed(1);
};

// Utility function to get progress bar color based on score
const getScoreProgressColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function CoverLetterCard({ letter }: CoverLetterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showATSModal, setShowATSModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const { jobInfo, isLoading, extractJobInfo } = useJobInfo();
  
  // Extract job info when component mounts
  useEffect(() => {
    if (letter.job_description) {
      extractJobInfo(letter.job_description);
    }
  }, [letter.job_description, extractJobInfo]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter.cover_letter_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleExportPDF = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const companyName = jobInfo?.company !== "Company Not Specified" ? jobInfo?.company : "Company";
    const jobTitle = jobInfo?.jobTitle !== "Position Not Specified" ? jobInfo?.jobTitle : "Position";
    const filename = `${companyName}_${jobTitle}_Cover_Letter_${timestamp}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Create a formatted HTML document for PDF printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <meta charset="UTF-8">
            <style>
              @page {
                margin: 1in;
                size: letter;
              }
              body { 
                font-family: 'Times New Roman', serif; 
                font-size: 12pt; 
                line-height: 1.6; 
                margin: 0;
                padding: 0;
                color: #000;
              }
              .content { 
                white-space: pre-wrap; 
                word-wrap: break-word;
                max-width: 100%;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
              }
              .metadata {
                font-size: 10pt;
                color: #666;
                margin-bottom: 20px;
              }
              .no-print { 
                display: block;
                margin-top: 30px; 
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              @media print { 
                .no-print { display: none; }
                body { margin: 0; }
              }
              .print-button {
                padding: 12px 24px; 
                background: #4F46E5; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 14px;
                margin-right: 10px;
              }
              .print-button:hover {
                background: #3730A3;
              }
              .close-button {
                padding: 12px 24px; 
                background: #6B7280; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 14px;
              }
              .close-button:hover {
                background: #4B5563;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${jobTitle} at ${companyName}</h2>
              <div class="metadata">
                Generated: ${new Date().toLocaleDateString()} | 
                ATS Score: ${letter.ats_score}% | 
                Tone: ${letter.tone}
              </div>
            </div>
            <div class="content">${letter.cover_letter_content.replace(/\n/g, '<br>')}</div>
            <div class="no-print">
              <h3 style="margin-bottom: 15px; color: #374151;">Ready to Save as PDF</h3>
              <p style="margin-bottom: 20px; color: #6B7280;">Click "Save as PDF" to download your cover letter, or "Close" to return.</p>
              <button onclick="window.print()" class="print-button">
                Save as PDF
              </button>
              <button onclick="window.close()" class="close-button">
                Close
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("Unable to open print window. Please check your browser's popup settings.");
    }
  };

  const cardStyling = getCardStyling(letter.ats_score);
  const wordCount = getWordCount(letter.cover_letter_content);

  // Parse ATS analysis data
  const atsAnalysis = letter.ats_analysis ? (typeof letter.ats_analysis === 'string' ? JSON.parse(letter.ats_analysis) : letter.ats_analysis) : null;

  return (
    <>
      <Card className={`border-0 shadow-sm ${cardStyling.bg} ${cardStyling.border} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Dynamic Title based on extracted job info */}
              <div className="flex items-center gap-2 mb-2">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg text-gray-900 truncate">
                      {jobInfo?.jobTitle !== "Position Not Specified" 
                        ? jobInfo?.jobTitle 
                        : `Cover Letter #${letter.id.slice(-8)}`}
                    </CardTitle>
                    {jobInfo?.company !== "Company Not Specified" && (
                      <>
                        <span className="text-gray-400">at</span>
                        <span className="font-medium text-gray-700 truncate">{jobInfo?.company}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Enhanced Metadata */}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(letter.created_at)}</span>
                </div>
                
                {jobInfo?.location !== "Not specified" && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{jobInfo?.location}</span>
                  </div>
                )}
                
                {jobInfo?.industry !== "Not specified" && (
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span className="truncate">{jobInfo?.industry}</span>
                  </div>
                )}
              </div>

              {/* Performance Badge */}
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${cardStyling.badgeColor} border`}>
                  {cardStyling.badge}
                </Badge>
                
                {jobInfo?.experienceLevel !== "Not specified" && (
                  <Badge variant="outline" className="text-xs">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {jobInfo?.experienceLevel}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {letter.ats_score && (
                <div className="text-right">
                  <div className={`text-xl font-bold ${getATSScoreColor(letter.ats_score)}`}>
                    {letter.ats_score}%
                  </div>
                  <div className="text-xs text-gray-500">ATS Score</div>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Key Metrics Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/60 rounded-lg mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{wordCount}</div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-semibold ${getATSScoreColor(letter.ats_score)}`}>
                {letter.ats_score || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">ATS Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 capitalize">{letter.tone}</div>
              <div className="text-xs text-gray-500">Tone</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {jobInfo?.workType !== "Not specified" ? jobInfo?.workType : 'Standard'}
              </div>
              <div className="text-xs text-gray-500">Type</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCopy}
              className="flex-1"
            >
              <Copy className="h-3 w-3 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowATSModal(true)}
              className="flex-1"
            >
              <Target className="h-3 w-3 mr-2" />
              View ATS Analysis
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleExportPDF}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-2" />
              Export as PDF
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowInsightsModal(true)}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Insights
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Delete Letter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {/* Enhanced Job Information */}
              {jobInfo && (
                <div className="bg-blue-50/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Job Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Position:</span>
                      <span className="ml-2 font-medium">{jobInfo.jobTitle}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <span className="ml-2 font-medium">{jobInfo.company}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2 font-medium">{jobInfo.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Industry:</span>
                      <span className="ml-2 font-medium">{jobInfo.industry}</span>
                    </div>
                    {jobInfo.department !== "Not specified" && (
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <span className="ml-2 font-medium">{jobInfo.department}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2 font-medium capitalize">{jobInfo.experienceLevel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Analysis */}
              {letter.ats_score && (
                <div className="bg-green-50/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Performance Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ATS Compatibility</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              letter.ats_score >= 85 ? 'bg-green-500' :
                              letter.ats_score >= 70 ? 'bg-blue-500' :
                              letter.ats_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${letter.ats_score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getATSScoreColor(letter.ats_score)}`}>
                          {letter.ats_score}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: <span className={`font-medium ${getATSScoreColor(letter.ats_score)}`}>
                        {getATSScoreLabel(letter.ats_score)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Full Cover Letter Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Full Cover Letter
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto border border-gray-200">
                  {letter.cover_letter_content}
                </div>
              </div>
              
              {/* Original Job Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Original Job Description
                </h4>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-600 max-h-40 overflow-y-auto border border-blue-200">
                  {letter.job_description}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ATS Analysis Modal */}
      <Dialog open={showATSModal} onOpenChange={setShowATSModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Detailed ATS Analysis
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of your cover letter's ATS compatibility
            </DialogDescription>
          </DialogHeader>
          
          {atsAnalysis && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${getATSScoreColor(letter.ats_score)}`}>
                  {letter.ats_score}%
                </div>
                <div className="text-lg font-medium text-gray-700">
                  {getATSScoreLabel(letter.ats_score)}
                </div>
              </div>

              {/* Score Breakdown */}
              {atsAnalysis.breakdown && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Score Breakdown
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(atsAnalysis.breakdown).map(([key, value]) => {
                      const scoreValue = typeof value === 'number' ? value : parseFloat(String(value));
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getScoreProgressColor(scoreValue)}`}
                                style={{ width: `${Math.min(scoreValue, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">{formatScore(value)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skills Found */}
                {atsAnalysis.skillsFound && atsAnalysis.skillsFound.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Skills Found ({atsAnalysis.skillsFound.length})
                    </h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {atsAnalysis.skillsFound.map((skill: string, index: number) => (
                        <div key={index} className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Missing */}
                {atsAnalysis.skillsMissing && atsAnalysis.skillsMissing.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      Skills Missing ({atsAnalysis.skillsMissing.length})
                    </h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {atsAnalysis.skillsMissing.map((skill: string, index: number) => (
                        <div key={index} className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2 text-blue-700">
                    <Info className="h-4 w-4" />
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {atsAnalysis.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="bg-white rounded p-3 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-800 mb-2">{rec.issue}</div>
                        <div className="text-sm text-blue-600">{rec.fix}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Performance Insights Modal */}
      <Dialog open={showInsightsModal} onOpenChange={setShowInsightsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </DialogTitle>
            <DialogDescription>
              Actionable insights to improve your cover letter performance
            </DialogDescription>
          </DialogHeader>
          
          {atsAnalysis && (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{letter.ats_score}%</div>
                  <div className="text-sm text-gray-600">Current Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {atsAnalysis.skillsFound ? atsAnalysis.skillsFound.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Skills Matched</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {atsAnalysis.skillsMissing ? atsAnalysis.skillsMissing.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Skills Missing</div>
                </div>
              </div>

              {/* Key Strengths */}
              {atsAnalysis.insights?.strengths && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {atsAnalysis.insights.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Opportunities */}
              {atsAnalysis.insights?.opportunities && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
                    <TrendingUp className="h-4 w-4" />
                    Improvement Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {atsAnalysis.insights.opportunities.map((opportunity: string, index: number) => (
                      <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 mt-1 flex-shrink-0" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Match Quality */}
              {atsAnalysis.matchQuality && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Match Quality: Grade {atsAnalysis.matchQuality.grade}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Context Accuracy</div>
                      <div className="text-lg font-medium">
                        {Math.round((atsAnalysis.matchQuality.metrics.contextAccuracy || 0) * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Required Coverage</div>
                      <div className="text-lg font-medium">
                        {Math.round((atsAnalysis.matchQuality.metrics.requiredCoverage || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  Quick Action Items
                </h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    📝 <strong>Add missing skills:</strong> Focus on the top 3 missing skills that are most relevant to your experience
                  </div>
                  <div className="text-sm">
                    🎯 <strong>Improve keyword density:</strong> Include more variations of matched keywords throughout your letter
                  </div>
                  <div className="text-sm">
                    📊 <strong>Target score improvement:</strong> Aim for {Math.min(letter.ats_score! + 15, 100)}% in your next version
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 