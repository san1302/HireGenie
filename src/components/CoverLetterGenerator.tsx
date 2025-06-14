"use client";

import React, { useState } from "react";
import { 
  Upload, 
  FileText, 
  Settings, 
  Check, 
  Loader, 
  Copy, 
  Download,
  AlertCircle,
  RefreshCw,
  X,
  Target,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Crown,
  MessageCircle,
  AlignLeft,
  File
} from "lucide-react";
import { useToast } from "./ui/use-toast";

// TypeScript interface for ATS analysis
interface ATSRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  fix: string;
  impact: string;
}

interface ATSAnalysis {
  success: boolean;
  overallScore?: number;
  passFailStatus?: 'PASS' | 'FAIL' | 'REVIEW';
  breakdown?: {
    parseability: number;
    keywordMatch: number;
    skillsAlignment: number;
    formatCompatibility: number;
    contactInfo: number;
    bonusFeatures: number;
  };
  recommendations?: ATSRecommendation[];
  missingKeywords?: string[];
  matchedKeywords?: string[];
  skillsFound?: string[];
  skillsMissing?: string[];
  bonusItems?: string[];
  criticalIssues?: string[];
  sectionsFound?: string[];
  missingCriticalSections?: string[];
  sectionOrder?: string[];
  error?: string;
  details?: string;
}

interface CoverLetterGeneratorProps {
  userUsage?: {
    usageCount: number;
    hasReachedLimit: boolean;
  };
  hasActiveSubscription?: boolean;
}

export default function CoverLetterGenerator({ userUsage, hasActiveSubscription }: CoverLetterGeneratorProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Standard");
  const [outputFormat, setOutputFormat] = useState("txt");
  const [coverLetter, setCoverLetter] = useState("");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [showATSDetails, setShowATSDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const { toast } = useToast();

  // Check if the generator should be locked
  const isLocked = !hasActiveSubscription && userUsage?.hasReachedLimit;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    setFileProcessing(true);
    setError("");
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      setFileName("");
      setResumeFile(null);
      setFileProcessing(false);
      return;
    }
    
    // Check file type
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError("Please upload a PDF or Word document");
      setFileName("");
      setResumeFile(null);
      setFileProcessing(false);
      return;
    }
    
    setFileName(file.name);
    setResumeFile(file);
    
    // Simulate brief processing time for better UX
    setTimeout(() => {
      setFileProcessing(false);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const clearSelectedFile = () => {
    setFileName("");
    setResumeFile(null);
    setError("");
    
    // Reset the file input value
    const fileInput = document.getElementById("resume-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    if (activeTab === "upload" && !resumeFile) {
      setError("Please upload your resume");
      return false;
    }
    
    if (activeTab === "paste" && !resumeText.trim()) {
      setError("Please paste your resume content");
      return false;
    }
    
    if (!jobDescription.trim()) {
      setError("Please provide the job description");
      return false;
    }
    
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    setIsGenerating(true);
    setError("");
    setFileProcessing(true);
    setAtsAnalysis(null); // Reset ATS analysis
    
    try {
      const formData = new FormData();

      if (activeTab === "upload" && resumeFile) {
        formData.append("resume_file", resumeFile);
      } else if (activeTab === "paste") {
        formData.append("resume_text", resumeText);
      }

      formData.append("job_description", jobDescription);
      formData.append("tone", tone);
      formData.append("length", length);
      formData.append("output_format", outputFormat);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      setFileProcessing(false);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter || sampleCoverLetter);
      
      // Set ATS analysis data
      if (data.atsAnalysis) {
        setAtsAnalysis(data.atsAnalysis);
      }
      
      toast({
        title: "Analysis complete!",
        description: "Your cover letter and ATS score are ready!",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setError(error instanceof Error ? error.message : "Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Cover letter copied to clipboard",
      });
    } catch (err) {
      setError("Failed to copy text");
    }
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `cover-letter-${timestamp}`;
    
    if (outputFormat === 'pdf') {
      // Create PDF
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 40px;">
          <div style="white-space: pre-wrap;">${coverLetter}</div>
        </div>
      `;
      
      // Use the browser's print functionality to generate PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cover Letter</title>
              <style>
                body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6; margin: 40px; }
                .content { white-space: pre-wrap; }
                @media print { 
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="content">${coverLetter}</div>
              <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer;">
                  Save as PDF
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                  Close
                </button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else if (outputFormat === 'docx') {
      // Create a simplified DOCX-like format using RTF
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${coverLetter.replace(/\n/g, '\\par ')}}`;
      const blob = new Blob([rtfContent], { type: 'application/rtf' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `${baseFilename}.rtf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (outputFormat === 'html') {
      // Create HTML format
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Cover Letter</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
        .letter-content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="letter-content">${coverLetter}</div>
</body>
</html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `${baseFilename}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Default TXT format
      const element = document.createElement("a");
      const file = new Blob([coverLetter], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${baseFilename}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleReset = () => {
    setCoverLetter("");
    setAtsAnalysis(null);
    setResumeFile(null);
    setFileName("");
    setResumeText("");
    setJobDescription("");
    setLength("Standard");
    setOutputFormat("txt");
    setShowATSDetails(false);
  };

  // ATS Score Color Helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Sample cover letter for the UI
  const sampleCoverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Senior Software Engineer position at Acme Inc. With over 5 years of experience in React and Node.js development, I am confident in my ability to become a valuable member of your team.

Throughout my career, I have focused on building scalable web applications and implementing best practices in software development. My experience aligns perfectly with the requirements outlined in your job description, particularly in frontend development and API integration.

At my previous role at XYZ Company, I led the development of a customer-facing portal that improved user engagement by 40%. I collaborated closely with design and product teams to ensure seamless integration of features while maintaining code quality and performance.

I am particularly excited about the opportunity to work on innovative projects at Acme Inc. Your company's commitment to technological advancement and user-centered design resonates with my professional values.

I would welcome the opportunity to discuss how my background, skills, and experiences would benefit your team. Thank you for considering my application.

Sincerely,
John Smith`;

  return (
    <section id="cover-letter-tool" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Generate Your Cover Letter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and paste the job description to create a
            personalized cover letter in seconds
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mx-auto overflow-hidden relative">
          {/* Locked State Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
              <div className="text-center p-8 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Upgrade to Continue Generating
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  You've used all <span className="font-semibold">{userUsage?.usageCount || 2} free cover letters</span> this month. 
                  Upgrade to Pro for unlimited generations and premium features.
                </p>
                
                <div className="space-y-3">
                  <a 
                    href="/pricing"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade to Pro
                  </a>
                  
                  <div className="text-xs text-gray-500">
                    ✨ Unlimited cover letters • Advanced ATS analysis • Priority support
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className={`flex flex-col md:flex-row ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Left Side - Input */}
            <div className="md:w-1/3 p-6 md:border-r border-gray-200">
              <div className="mb-6">
                <div className="flex space-x-4 border-b border-gray-200">
                  <button 
                    className={`pb-2 px-1 ${activeTab === "upload" ? "border-b-2 border-indigo-600 text-indigo-600 font-medium" : "text-gray-500"}`} 
                    onClick={() => setActiveTab("upload")}
                  >
                    Resume Upload
                  </button>
                  <button 
                    className={`pb-2 px-1 ${activeTab === "paste" ? "border-b-2 border-indigo-600 text-indigo-600 font-medium" : "text-gray-500"}`} 
                    onClick={() => setActiveTab("paste")}
                  >
                    Paste Resume
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {activeTab === "upload" ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resume
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging 
                        ? "border-blue-500 bg-blue-50" 
                        : fileName 
                          ? "border-green-300 hover:border-green-400" 
                          : "border-gray-300 hover:border-indigo-500"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      id="resume-upload" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleFileChange} 
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className={`h-10 w-10 mb-2 ${
                        isDragging ? "text-blue-500" : fileName ? "text-green-500" : "text-gray-400"
                      }`} />
                      <p className="text-sm text-gray-600 mb-1">
                        {isDragging 
                          ? "Drop your file here" 
                          : fileName 
                            ? fileName 
                            : "Upload your resume"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Drag & drop or click to browse • PDF, DOC, DOCX files up to 5MB
                      </p>
                      {!fileName && !isDragging && (
                        <button 
                          className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            document.getElementById("resume-upload")?.click();
                          }}
                          type="button"
                        >
                          Browse Files
                        </button>
                      )}
                    </label>
                    {fileName && !fileProcessing && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 mr-2">
                            File selected
                          </span>
                        </div>
                        <button 
                          onClick={clearSelectedFile}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          type="button"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {fileProcessing && (
                      <div className="mt-3 flex items-center justify-center">
                        <Loader className="h-4 w-4 text-blue-500 mr-1 animate-spin" />
                        <span className="text-sm text-blue-600">
                          Processing file...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Resume Content
                  </label>
                  <textarea 
                    className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" 
                    placeholder="Paste your resume content here..." 
                    value={resumeText} 
                    onChange={(e) => setResumeText(e.target.value)}
                  ></textarea>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea 
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" 
                  placeholder="Paste the job description you're applying for..." 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Customization Header */}
                <div className="flex items-center mb-3">
                  <Settings className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Customization Options</span>
                </div>
                
                {/* Tone Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Tone
                  </label>
                  <select 
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    value={tone} 
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Enthusiastic">Enthusiastic</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>

                {/* Length Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                    <AlignLeft className="h-3 w-3 mr-1" />
                    Length
                  </label>
                  <select 
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    value={length} 
                    onChange={(e) => setLength(e.target.value)}
                  >
                    <option value="Concise">Concise (2-3 paragraphs)</option>
                    <option value="Standard">Standard (3-4 paragraphs)</option>
                    <option value="Detailed">Detailed (4-5 paragraphs)</option>
                    <option value="Comprehensive">Comprehensive (5+ paragraphs)</option>
                  </select>
                </div>

                {/* Output Format Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                    <File className="h-3 w-3 mr-1" />
                    Download Format
                  </label>
                  <select 
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    value={outputFormat} 
                    onChange={(e) => setOutputFormat(e.target.value)}
                  >
                    <option value="txt">Plain Text (.txt)</option>
                    <option value="html">HTML Document (.html)</option>
                    <option value="docx">Word Document (.rtf)</option>
                    <option value="pdf">PDF Document (Print)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mb-6">
                <button 
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors flex items-center ${isGenerating ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"}`} 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Generating...
                    </>
                  ) : "Generate Letter"}
                </button>
              </div>
            </div>
            
            {/* Right Side - Output */}
            <div className="md:w-2/3 p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Cover Letter
              </h3>
              
              {coverLetter && !isGenerating ? (
                <>
                  <div className="bg-white border border-gray-200 rounded-lg p-5 h-[400px] overflow-y-auto cover-letter-content">
                    <div className="whitespace-pre-wrap text-gray-700">{coverLetter}</div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <button 
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                      onClick={handleReset}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </button>
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleCopy} 
                        className="px-3 py-1 text-sm border border-gray-200 rounded hover:border-gray-300 text-gray-600 flex items-center"
                      >
                        {copySuccess ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copySuccess ? "Copied!" : "Copy"}
                      </button>
                      <button 
                        onClick={handleDownload} 
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download {outputFormat.toUpperCase()}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Cover Letter Placeholder */}
                  <div className="bg-white border border-gray-200 border-dashed rounded-lg p-8 h-[400px] flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    {isGenerating ? (
                      <>
                        <Loader className="h-8 w-8 animate-spin mb-2 text-indigo-500" />
                        <p className="text-gray-500 mb-2">
                          Generating your cover letter...
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-2">
                          Your generated cover letter will appear here
                        </p>
                        <p className="text-sm text-gray-400">
                          Fill in your resume and job description, then click
                          "Generate Letter"
                        </p>
                      </>
                    )}
                  </div>

                  {/* ATS Analysis Placeholder */}
                  <div className="bg-white border border-gray-200 border-dashed rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-gray-300 mr-2" />
                        <h4 className="text-lg font-medium text-gray-400">ATS Compatibility Analysis</h4>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
                          Score will appear here
                        </div>
                      </div>
                    </div>

                    {/* Preview of what will be shown */}
                    <div className="space-y-4 opacity-40">
                      {/* Overall Score Preview */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Overall ATS Score</span>
                          <span>--</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className="h-3 bg-gray-200 rounded-full w-0"></div>
                        </div>
                      </div>

                      {/* Score Breakdown Preview */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-400 mb-3">Analysis Breakdown:</div>
                        
                        {[
                          { label: "Parseability (30%)", width: 0 },
                          { label: "Keyword Match (35%)", width: 0 },
                          { label: "Skills Alignment (20%)", width: 0 },
                          { label: "Format & Structure (10%)", width: 0 },
                          { label: "Contact Info (3%)", width: 0 },
                          { label: "Bonus Features (2%)", width: 0 }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">{item.label}</span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-100 rounded-full h-2 mr-2">
                                <div className="h-2 rounded-full bg-gray-200" style={{ width: `${item.width}%` }}></div>
                              </div>
                              <span className="text-sm font-medium text-gray-400 w-8">--</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Keywords Preview */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="text-sm font-medium text-gray-400 mb-2">Keywords Analysis:</div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-400 mb-1 block">Missing Keywords:</span>
                            <div className="flex flex-wrap gap-1">
                              {[1, 2, 3].map((i) => (
                                <span key={i} className="px-2 py-1 bg-gray-50 text-gray-300 text-xs rounded border border-gray-100">
                                  keyword {i}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 mb-1 block">Matched Keywords:</span>
                            <div className="flex flex-wrap gap-1">
                              {[1, 2].map((i) => (
                                <span key={i} className="px-2 py-1 bg-gray-50 text-gray-300 text-xs rounded border border-gray-100">
                                  match {i}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-400">
                        Detailed ATS analysis will appear here after generation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ATS Score Section */}
              {atsAnalysis && atsAnalysis.success && (
                <div className="mt-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-indigo-600 mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">ATS Compatibility Score</h4>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Pass/Fail Status */}
                        {atsAnalysis.passFailStatus && (
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            atsAnalysis.passFailStatus === 'PASS' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : atsAnalysis.passFailStatus === 'FAIL'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {atsAnalysis.passFailStatus === 'PASS' ? '✓ LIKELY TO PASS' : 
                             atsAnalysis.passFailStatus === 'FAIL' ? '✗ LIKELY REJECTED' : 
                             '? NEEDS REVIEW'}
                          </div>
                        )}
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(atsAnalysis.overallScore || 0)}`}>
                          {atsAnalysis.overallScore}/100
                        </div>
                      </div>
                    </div>

                    {/* Critical Issues Alert */}
                    {atsAnalysis.criticalIssues && atsAnalysis.criticalIssues.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">Critical Issues Detected</span>
                        </div>
                        <ul className="space-y-1">
                          {atsAnalysis.criticalIssues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Overall Score Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Overall ATS Score</span>
                        <span>{atsAnalysis.overallScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(atsAnalysis.overallScore || 0)}`}
                          style={{ width: `${atsAnalysis.overallScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    {atsAnalysis.breakdown && (
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Parseability (30%)</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.parseability)}`}
                                style={{ width: `${atsAnalysis.breakdown.parseability}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{atsAnalysis.breakdown.parseability}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Keyword Match (35%)</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.keywordMatch)}`}
                                style={{ width: `${atsAnalysis.breakdown.keywordMatch}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{atsAnalysis.breakdown.keywordMatch}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Skills Alignment (20%)</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.skillsAlignment)}`}
                                style={{ width: `${atsAnalysis.breakdown.skillsAlignment}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{atsAnalysis.breakdown.skillsAlignment}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Format & Structure (10%)</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.formatCompatibility)}`}
                                style={{ width: `${atsAnalysis.breakdown.formatCompatibility}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{atsAnalysis.breakdown.formatCompatibility}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Contact Info (3%)</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.contactInfo)}`}
                                style={{ width: `${atsAnalysis.breakdown.contactInfo}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{atsAnalysis.breakdown.contactInfo}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bonus Features (2%)</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.bonusFeatures)}`}
                                style={{ width: `${atsAnalysis.breakdown.bonusFeatures}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{atsAnalysis.breakdown.bonusFeatures}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Toggle Details Button */}
                    <button
                      onClick={() => setShowATSDetails(!showATSDetails)}
                      className="w-full flex items-center justify-center py-2 text-sm text-indigo-600 hover:text-indigo-700 border-t border-gray-200 mt-4 pt-4"
                    >
                      {showATSDetails ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show Detailed Analysis
                        </>
                      )}
                    </button>

                    {/* Detailed Analysis */}
                    {showATSDetails && (
                      <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                        {/* Enhanced Recommendations */}
                        {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                              Recommendations
                            </h5>
                            <div className="space-y-3">
                              {atsAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                  rec.priority === 'CRITICAL' 
                                    ? 'bg-red-50 border-red-400'
                                    : rec.priority === 'HIGH'
                                      ? 'bg-orange-50 border-orange-400'
                                      : rec.priority === 'MEDIUM'
                                        ? 'bg-yellow-50 border-yellow-400'
                                        : 'bg-blue-50 border-blue-400'
                                }`}>
                                  <div className="flex items-start justify-between mb-1">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                      rec.priority === 'CRITICAL' 
                                        ? 'bg-red-100 text-red-800'
                                        : rec.priority === 'HIGH'
                                          ? 'bg-orange-100 text-orange-800'
                                          : rec.priority === 'MEDIUM'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {rec.priority}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 mb-1">{rec.issue}</p>
                                  <p className="text-sm text-gray-700 mb-1"><strong>Fix:</strong> {rec.fix}</p>
                                  <p className="text-xs text-gray-600"><strong>Impact:</strong> {rec.impact}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Structural Analysis */}
                        {(atsAnalysis.sectionsFound || atsAnalysis.missingCriticalSections || atsAnalysis.sectionOrder) && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-1 text-purple-500" />
                              Resume Structure Analysis
                            </h5>
                            
                            {/* Sections Found */}
                            {atsAnalysis.sectionsFound && atsAnalysis.sectionsFound.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-xs font-medium text-gray-700 mb-2">Detected Sections</h6>
                                <div className="flex flex-wrap gap-1">
                                  {atsAnalysis.sectionsFound.map((section, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 capitalize">
                                      {section}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Critical Sections */}
                            {atsAnalysis.missingCriticalSections && atsAnalysis.missingCriticalSections.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-xs font-medium text-gray-700 mb-2">Missing Critical Sections</h6>
                                <div className="flex flex-wrap gap-1">
                                  {atsAnalysis.missingCriticalSections.map((section, index) => (
                                    <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200 capitalize">
                                      {section}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section Order */}
                            {atsAnalysis.sectionOrder && atsAnalysis.sectionOrder.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-xs font-medium text-gray-700 mb-2">Section Order</h6>
                                <div className="flex flex-wrap gap-1">
                                  {atsAnalysis.sectionOrder.map((section, index) => (
                                    <div key={index} className="flex items-center">
                                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 capitalize">
                                        {index + 1}. {section}
                                      </span>
                                      {index < atsAnalysis.sectionOrder!.length - 1 && (
                                        <span className="mx-1 text-gray-400">→</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Recommended order: Contact → Summary → Experience → Education → Skills → Certifications
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Missing Keywords */}
                        {atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Missing Keywords</h5>
                            <div className="flex flex-wrap gap-1">
                              {atsAnalysis.missingKeywords.slice(0, 10).map((keyword, index) => (
                                <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                                  {keyword}
                                </span>
                              ))}
                              {atsAnalysis.missingKeywords.length > 10 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                                  +{atsAnalysis.missingKeywords.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Matched Keywords */}
                        {atsAnalysis.matchedKeywords && atsAnalysis.matchedKeywords.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Matched Keywords</h5>
                            <div className="flex flex-wrap gap-1">
                              {atsAnalysis.matchedKeywords.slice(0, 10).map((keyword, index) => (
                                <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                                  {keyword}
                                </span>
                              ))}
                              {atsAnalysis.matchedKeywords.length > 10 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                                  +{atsAnalysis.matchedKeywords.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bonus Items */}
                        {atsAnalysis.bonusItems && atsAnalysis.bonusItems.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                              <Award className="h-4 w-4 mr-1 text-yellow-500" />
                              Bonus Features Found
                            </h5>
                            <ul className="space-y-1">
                              {atsAnalysis.bonusItems.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-yellow-500 mr-2">★</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ATS Error Display */}
              {atsAnalysis && !atsAnalysis.success && (
                <div className="mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="text-sm font-medium text-yellow-800">ATS Analysis Unavailable</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      {atsAnalysis.error || "Unable to analyze ATS compatibility at this time."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
