"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  File,
  Edit,
  Undo2,
  Redo2,
  Save,
  Sparkles,
  Lightbulb,
  Zap
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
  const [editableCoverLetter, setEditableCoverLetter] = useState("");
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'analyzing' | 'generating' | 'optimizing' | 'complete'>('analyzing');
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);

  // Mobile wizard state
  const [mobileStep, setMobileStep] = useState<'resume' | 'job' | 'customize' | 'generate'>('resume');
  const [showMobileWizard, setShowMobileWizard] = useState(false);

  // AI Writing Assistant state
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showImprovementOptions, setShowImprovementOptions] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Undo/Redo functionality
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // ATS Analysis state
  const [showATSDetails, setShowATSDetails] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { toast } = useToast();

  // Check if the generator should be locked
  const isLocked = !hasActiveSubscription && userUsage?.hasReachedLimit;

  // Calculate word count
  const getWordCount = (text: string): number => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  // Get length status
  const getLengthStatus = (count: number) => {
    if (count < 150) return { message: "Too short", color: "text-red-500" };
    if (count <= 250) return { message: "Concise", color: "text-green-500" };
    if (count <= 350) return { message: "Standard", color: "text-blue-500" };
    if (count <= 450) return { message: "Detailed", color: "text-indigo-500" };
    if (count > 450) return { message: "Comprehensive", color: "text-purple-500" };
    return { message: "Good length", color: "text-gray-500" };
  };

  // Computed values for undo/redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < editHistory.length - 1;
  const wordCount = getWordCount(editableCoverLetter);
  const lengthStatus = getLengthStatus(wordCount);

  // Helper functions for ATS analysis
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Text selection handler
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = editableCoverLetter.substring(start, end);

      if (selected.trim().length > 0) {
        setSelectedText(selected);
        setSelectionStart(start);
        setSelectionEnd(end);
        setShowImprovementOptions(true);
        setImprovementSuggestions([]);
      } else {
        setShowImprovementOptions(false);
      }
    }
  };

  // Undo/Redo functions
  const addToHistory = (content: string) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(content);

    // Limit history to last 50 changes
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditableCoverLetter(editHistory[newIndex]);
      setHasBeenEdited(editHistory[newIndex] !== coverLetter);
    }
  };

  const redo = () => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditableCoverLetter(editHistory[newIndex]);
      setHasBeenEdited(editHistory[newIndex] !== coverLetter);
    }
  };

  // Add to history when content changes (debounced)
  useEffect(() => {
    if (editableCoverLetter && editableCoverLetter !== (editHistory[historyIndex] || '')) {
      const timeoutId = setTimeout(() => {
        addToHistory(editableCoverLetter);
      }, 1000); // Add to history after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [editableCoverLetter, editHistory, historyIndex]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  // AI improvement functions
  const improveText = async (improvementType: string) => {
    if (!selectedText.trim()) return;

    setIsImproving(true);
    try {
      const response = await fetch('/api/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          improvementType,
          context: editableCoverLetter
        })
      });

      if (response.ok) {
        const data = await response.json();
        setImprovementSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error improving text:', error);
      toast({
        title: "Error",
        description: "Failed to generate improvements",
        variant: "destructive"
      });
    } finally {
      setIsImproving(false);
    }
  };

  const improveSection = async (section: string, style: string) => {
    setIsImproving(true);
    try {
      const response = await fetch('/api/improve-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: editableCoverLetter,
          section,
          style,
          jobDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.improvedText) {
          addToHistory(editableCoverLetter);
          setEditableCoverLetter(data.improvedText);
          setHasBeenEdited(true);
          toast({
            title: "Section improved!",
            description: `${section} section has been enhanced.`
          });
        }
      }
    } catch (error) {
      console.error('Error improving section:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const replaceWithImprovement = (improvement: string) => {
    const newContent = editableCoverLetter.substring(0, selectionStart) +
      improvement +
      editableCoverLetter.substring(selectionEnd);

    addToHistory(editableCoverLetter);
    setEditableCoverLetter(newContent);
    setHasBeenEdited(true);
    setShowImprovementOptions(false);
    setImprovementSuggestions([]);

    toast({
      title: "Text improved!",
      description: "Selected text has been enhanced."
    });
  };

  // Check if we should show mobile wizard (screen width < 768px)
  useEffect(() => {
    const checkScreenSize = () => {
      setShowMobileWizard(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Memoized form validation to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    if (activeTab === "upload" && !resumeFile) {
      return false;
    }

    if (activeTab === "paste" && !resumeText.trim()) {
      return false;
    }

    if (!jobDescription.trim()) {
      return false;
    }

    return true;
  }, [activeTab, resumeFile, resumeText, jobDescription]);

  // Validation function that sets error messages
  const validateFormWithErrors = () => {
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

  const handleGenerate = async () => {
    if (!validateFormWithErrors()) return;
    setIsGenerating(true);
    setGenerationStep('analyzing');
    setError("");
    setFileProcessing(true);
    setAtsAnalysis(null);

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

      // Simulate step progression
      setTimeout(() => setGenerationStep('generating'), 1000);
      setTimeout(() => setGenerationStep('optimizing'), 3000);

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
      setEditableCoverLetter(data.coverLetter || sampleCoverLetter);
      setHasBeenEdited(false);

      // Set ATS analysis data
      if (data.atsAnalysis) {
        setAtsAnalysis(data.atsAnalysis);
      }

      setGenerationStep('complete');

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
      const contentToCopy = editableCoverLetter || coverLetter;
      await navigator.clipboard.writeText(contentToCopy);
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
    const contentToDownload = editableCoverLetter || coverLetter;

    if (outputFormat === 'pdf') {
      // Create PDF
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
              <div class="content">${contentToDownload}</div>
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
    } else {
      // Default TXT format
      const element = document.createElement("a");
      const file = new Blob([contentToDownload], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${baseFilename}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleReset = () => {
    setCoverLetter("");
    setEditableCoverLetter("");
    setHasBeenEdited(false);
    setAtsAnalysis(null);
    setResumeFile(null);
    setFileName("");
    setResumeText("");
    setJobDescription("");
    setLength("Standard");
    setOutputFormat("txt");
    setGenerationStep('analyzing');
    setMobileStep('resume');
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

  // Handle cover letter editing
  const handleCoverLetterEdit = (newContent: string) => {
    setEditableCoverLetter(newContent);

    // Track if content has been modified from original
    if (newContent !== coverLetter) {
      setHasBeenEdited(true);
    } else {
      setHasBeenEdited(false);
    }

    // Auto-save functionality
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
    }, 1000);
  };

  // Initialize edit history when cover letter is generated
  useEffect(() => {
    if (coverLetter && editHistory.length === 0) {
      setEditHistory([coverLetter]);
      setHistoryIndex(0);
    }
  }, [coverLetter]);

  // Mobile wizard navigation
  const mobileSteps = [
    { id: 'resume', title: 'Resume', icon: Upload },
    { id: 'job', title: 'Job Details', icon: FileText },
    { id: 'customize', title: 'Customize', icon: Settings },
    { id: 'generate', title: 'Generate', icon: Sparkles }
  ];

  const currentStepIndex = mobileSteps.findIndex(step => step.id === mobileStep);

  const nextMobileStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < mobileSteps.length) {
      setMobileStep(mobileSteps[nextIndex].id as typeof mobileStep);
    }
  };

  const prevMobileStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setMobileStep(mobileSteps[prevIndex].id as typeof mobileStep);
    }
  };

  const canProceedFromStep = (step: string) => {
    switch (step) {
      case 'resume':
        return (activeTab === 'upload' && resumeFile) || (activeTab === 'paste' && resumeText.trim());
      case 'job':
        return jobDescription.trim().length > 0;
      case 'customize':
        return true; // Always can proceed from customize
      default:
        return false;
    }
  };

  // Mobile Wizard Component
  const MobileWizard = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mx-auto overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">
            Step {currentStepIndex + 1} of {mobileSteps.length}
          </h3>
          <span className="text-xs text-gray-500">
            {Math.round(((currentStepIndex + 1) / mobileSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / mobileSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        {mobileStep === 'resume' && (
          <div>
            <div className="text-center mb-4">
              <Upload className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Your Resume</h3>
              <p className="text-sm text-gray-600">Choose how you'd like to provide your resume</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="mb-4">
              <div className="flex space-x-1 border-b border-gray-200 mb-4">
                <button
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "upload" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`}
                  onClick={() => setActiveTab("upload")}
                >
                  Upload File
                </button>
                <button
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "paste" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`}
                  onClick={() => setActiveTab("paste")}
                >
                  Paste Text
                </button>
              </div>

              {activeTab === "upload" ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                      ? "border-blue-500 bg-blue-50"
                      : fileName
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300"
                    }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="hidden"
                    id="mobile-resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="mobile-resume-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className={`h-10 w-10 mb-3 ${isDragging ? "text-blue-500" : fileName ? "text-green-500" : "text-gray-400"
                      }`} />
                    <p className="text-base text-gray-600 mb-2 font-medium">
                      {isDragging
                        ? "Drop your file here"
                        : fileName
                          ? fileName
                          : "Upload your resume"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PDF, DOC, DOCX files up to 5MB
                    </p>
                    {!fileName && !isDragging && (
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById("mobile-resume-upload")?.click();
                        }}
                        type="button"
                      >
                        Choose File
                      </button>
                    )}
                  </label>
                  {fileName && !fileProcessing && (
                    <div className="mt-3 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600 mr-3">File selected</span>
                      <button
                        onClick={clearSelectedFile}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {fileProcessing && (
                    <div className="mt-3 flex items-center justify-center">
                      <Loader className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                      <span className="text-sm text-blue-600">Processing...</span>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              )}
            </div>
          </div>
        )}

        {mobileStep === 'job' && (
          <div>
            <div className="text-center mb-4">
              <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Job Description</h3>
              <p className="text-sm text-gray-600">Paste the job posting you're applying for</p>
            </div>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="mt-2 text-xs text-gray-500">
              {jobDescription.length} characters • Include requirements, responsibilities, and company info
            </div>
          </div>
        )}

        {mobileStep === 'customize' && (
          <div>
            <div className="text-center mb-4">
              <Settings className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Customize Your Letter</h3>
              <p className="text-sm text-gray-600">Choose tone, length, and format</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Professional">Professional</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Formal">Formal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option value="Concise">Concise (2-3 paragraphs)</option>
                  <option value="Standard">Standard (3-4 paragraphs)</option>
                  <option value="Detailed">Detailed (4-5 paragraphs)</option>
                  <option value="Comprehensive">Comprehensive (5+ paragraphs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download Format
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          </div>
        )}

        {mobileStep === 'generate' && (
          <div>
            <div className="text-center mb-6">
              <Sparkles className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Generate</h3>
              <p className="text-sm text-gray-600">Review your settings and create your cover letter</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Resume:</span>
                <span className="text-gray-900 font-medium">
                  {fileName || (resumeText ? 'Pasted text' : 'Not provided')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Job description:</span>
                <span className="text-gray-900 font-medium">
                  {jobDescription ? `${jobDescription.length} characters` : 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tone:</span>
                <span className="text-gray-900 font-medium">{tone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Length:</span>
                <span className="text-gray-900 font-medium">{length}</span>
              </div>
            </div>

            <button
              className={`w-full px-4 py-4 bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center text-base font-medium ${isGenerating ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"}`}
              onClick={handleGenerate}
              disabled={isGenerating || !canProceedFromStep('job')}
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
        <button
          onClick={prevMobileStep}
          disabled={currentStepIndex === 0}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentStepIndex === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-200'
            }`}
        >
          Previous
        </button>

        {currentStepIndex < mobileSteps.length - 1 && (
          <button
            onClick={nextMobileStep}
            disabled={!canProceedFromStep(mobileStep)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!canProceedFromStep(mobileStep)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section id="cover-letter-tool" className="py-8 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="relative">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-indigo-600 mr-2 animate-pulse" />
                AI Cover Letter Generator
              </h2>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Mobile: Simple subtitle */}
          <div className="block sm:hidden">
            <p className="text-sm text-gray-600 mb-4 px-4">
              Create professional, ATS-optimized cover letters with AI assistance
            </p>
          </div>

          {/* Desktop: Full description */}
          <div className="hidden sm:block">
            {/* <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed px-4">
              Create compelling, ATS-optimized cover letters with intelligent writing assistance, 
              real-time editing, and professional formatting. Get personalized suggestions and 
              multiple output formats tailored to your target role.
            </p> */}

            {/* Feature Highlights - Desktop Only */}
            {/* <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 px-4 mb-8">
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                <Lightbulb className="h-4 w-4 text-indigo-500 mr-2" />
                <span className="whitespace-nowrap">AI Writing Assistant</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                <Target className="h-4 w-4 text-green-500 mr-2" />
                <span className="whitespace-nowrap">ATS Optimization</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                <Edit className="h-4 w-4 text-blue-500 mr-2" />
                <span className="whitespace-nowrap">Real-time Editing</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                <File className="h-4 w-4 text-purple-500 mr-2" />
                <span className="whitespace-nowrap">Multiple Formats</span>
              </div>
            </div> */}

            {/* Process Preview - Desktop Only */}
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">1. Upload & Analyze</h3>
                    <p className="text-sm text-gray-600">AI analyzes your resume and job requirements</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">2. Generate & Optimize</h3>
                    <p className="text-sm text-gray-600">Creates personalized, ATS-optimized content</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <Edit className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">3. Edit & Perfect</h3>
                    <p className="text-sm text-gray-600">Real-time AI assistance for improvements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators - Desktop Only */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400 px-4">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1 text-yellow-500" />
                <span className="whitespace-nowrap">ATS-Optimized Templates</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span className="whitespace-nowrap">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-blue-500" />
                <span className="whitespace-nowrap">Professional Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Rendering: Mobile Wizard vs Desktop Layout */}
        {showMobileWizard ? (
          <>
            {/* Mobile Wizard */}
            {isLocked && (
              <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Upgrade to Continue
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  You've used all {userUsage?.usageCount || 2} free cover letters this month.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Pro
                </a>
              </div>
            )}

            {!isLocked && <MobileWizard />}

            {/* Mobile Results */}
            {(coverLetter || isGenerating) && (
              <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                    Your Cover Letter
                  </h3>

                  {isGenerating ? (
                    <div className="text-center py-8">
                      <Loader className="h-8 w-8 text-indigo-600 mx-auto mb-4 animate-spin" />
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        {generationStep === 'analyzing' && 'Analyzing your resume...'}
                        {generationStep === 'generating' && 'Generating cover letter...'}
                        {generationStep === 'optimizing' && 'Optimizing for ATS...'}
                        {generationStep === 'complete' && 'Complete!'}
                      </h4>
                      <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
                        <div className={`h-2 rounded-full transition-all duration-500 ${generationStep === 'analyzing' ? 'w-1/3 bg-indigo-600' :
                            generationStep === 'generating' ? 'w-2/3 bg-indigo-600' :
                              generationStep === 'optimizing' ? 'w-5/6 bg-indigo-600' :
                                'w-full bg-green-500'
                          }`}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={editableCoverLetter}
                        onChange={(e) => handleCoverLetterEdit(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-200 rounded-lg resize-none text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Your generated cover letter will appear here..."
                      />

                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{getWordCount(editableCoverLetter)} words</span>
                          <span className={getLengthStatus(getWordCount(editableCoverLetter)).color}>
                            {getLengthStatus(getWordCount(editableCoverLetter)).message}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleCopy}
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg hover:border-gray-300 text-gray-600 flex items-center justify-center transition-colors"
                          >
                            {copySuccess ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copySuccess ? "Copied!" : "Copy to Clipboard"}
                          </button>
                          <button
                            onClick={handleDownload}
                            className="w-full px-4 py-3 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download {outputFormat.toUpperCase()}
                          </button>
                        </div>

                        <button
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center mt-2"
                          onClick={handleReset}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Start Over
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Desktop Layout - Original 2-Column Layout */
          <>
            {/* Desktop Lock Screen */}
            {isLocked && (
              <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upgrade to Continue
                </h3>
                <p className="text-gray-600 mb-6">
                  You've used all {userUsage?.usageCount || 2} free cover letters this month. Upgrade to Pro for unlimited access.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-lg"
                >
                  <Crown className="h-6 w-6 mr-3" />
                  Upgrade to Pro
                </a>
                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    ✨ Unlimited cover letters • Advanced ATS analysis • Priority support
                  </div>
                </div>
              </div>
            )}

            {/* Original Desktop 2-Column Layout */}
            {!isLocked && (
              <div className={`max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex flex-col md:flex-row">
                  {/* Left Side - Input (1/3 width) */}
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
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
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
                            <Upload className={`h-10 w-10 mb-2 ${isDragging ? "text-blue-500" : fileName ? "text-green-500" : "text-gray-400"
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
                        disabled={isGenerating || !isFormValid}
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

                  {/* Right Side - Generated Cover Letter (2/3 width) */}
                  <div className="md:w-2/3 p-6 bg-gray-50">
                    {coverLetter && !isGenerating ? (
                      <>
                        {/* Header with word count and edit status */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">Your Cover Letter</h3>
                            {hasBeenEdited && (
                              <div className="flex items-center px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200">
                                <Edit className="h-3 w-3 mr-1" />
                                Edited
                              </div>
                            )}
                            {isAutoSaving && (
                              <div className="flex items-center px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                                <Save className="h-3 w-3 mr-1 animate-pulse" />
                                Saving...
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            {/* Undo/Redo Controls */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`p-1 rounded text-xs ${canUndo
                                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'
                                  }`}
                                title="Undo (Ctrl+Z)"
                              >
                                <Undo2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`p-1 rounded text-xs ${canRedo
                                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    : 'text-gray-300 cursor-not-allowed'
                                  }`}
                                title="Redo (Ctrl+Y)"
                              >
                                <Redo2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Word Count & Status */}
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                              <span>{wordCount} words</span>
                              <span className={lengthStatus.color}>• {lengthStatus.message}</span>
                            </div>
                          </div>
                        </div>

                        {/* Always-Visible AI Improvement Indicator */}
                        <div className="mb-3 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="relative">
                              <Sparkles className="h-4 w-4 text-indigo-600 mr-2 animate-pulse" />
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-sm font-medium text-indigo-900">AI Writing Assistant</span>
                            <span className="ml-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                              Select text or use quick actions
                            </span>
                          </div>
                          <button
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            className="flex items-center text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Quick Actions
                            {showQuickActions ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                          </button>
                        </div>

                        {/* Quick Actions Panel */}
                        {showQuickActions && (
                          <div className="mb-3 p-3 bg-white border border-indigo-200 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <button
                                onClick={() => improveSection('opening', 'impactful')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center border border-blue-200"
                              >
                                <Lightbulb className="h-3 w-3 mr-1" />
                                Improve Opening
                              </button>
                              <button
                                onClick={() => improveSection('middle', 'professional')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 disabled:opacity-50 flex items-center justify-center border border-green-200"
                              >
                                <Award className="h-3 w-3 mr-1" />
                                Strengthen Body
                              </button>
                              <button
                                onClick={() => improveSection('closing', 'enthusiastic')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100 disabled:opacity-50 flex items-center justify-center border border-purple-200"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Enhance Closing
                              </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                              These actions automatically detect and improve specific sections of your cover letter
                            </div>
                          </div>
                        )}

                        {/* Editable textarea */}
                        <textarea
                          ref={textareaRef}
                          value={editableCoverLetter}
                          onChange={(e) => handleCoverLetterEdit(e.target.value)}
                          onSelect={handleTextSelection}
                          className="w-full h-[400px] p-4 border border-gray-200 rounded-lg resize-none text-gray-700 text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Your generated cover letter will appear here for editing..."
                          style={{
                            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                          }}
                          spellCheck={true}
                        />

                        {/* Helper text */}
                        <div className="mt-2 text-xs text-gray-400 flex justify-between items-center">
                          <span>
                            💡 Tip: Select text to improve it with AI • Use Ctrl+Z to undo, Ctrl+Y to redo • Changes are auto-saved
                          </span>
                          {editHistory.length > 1 && (
                            <span className="text-indigo-500">
                              {editHistory.length} versions in history
                            </span>
                          )}
                        </div>

                        {/* AI Improvement Options Panel */}
                        {showImprovementOptions && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                            <div className="flex items-center mb-3">
                              <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
                              <h4 className="text-sm font-medium text-indigo-900">
                                Improve Selected Text
                              </h4>
                              <button
                                onClick={() => setShowImprovementOptions(false)}
                                className="ml-auto text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="text-xs text-indigo-700 mb-3 bg-indigo-100 p-2 rounded">
                              "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                              <button
                                onClick={() => improveText('professional')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center"
                              >
                                <Lightbulb className="h-3 w-3 mr-1" />
                                More Professional
                              </button>
                              <button
                                onClick={() => improveText('enthusiastic')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 disabled:opacity-50 flex items-center justify-center"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                More Enthusiastic
                              </button>
                              <button
                                onClick={() => improveText('concise')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 disabled:opacity-50 flex items-center justify-center"
                              >
                                <AlignLeft className="h-3 w-3 mr-1" />
                                More Concise
                              </button>
                              <button
                                onClick={() => improveText('impactful')}
                                disabled={isImproving}
                                className="px-3 py-2 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200 disabled:opacity-50 flex items-center justify-center"
                              >
                                <Award className="h-3 w-3 mr-1" />
                                More Impactful
                              </button>
                            </div>

                            {isImproving && (
                              <div className="flex items-center justify-center py-4">
                                <Loader className="h-4 animate-spin mr-2 text-indigo-600" />
                                <span className="text-sm text-indigo-600">Generating improvements...</span>
                              </div>
                            )}

                            {improvementSuggestions.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Choose an improvement:</h5>
                                {improvementSuggestions.map((suggestion, index) => (
                                  <div key={index} className="bg-white p-3 rounded border border-gray-200 hover:border-indigo-300 transition-colors">
                                    <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                                    <button
                                      onClick={() => replaceWithImprovement(suggestion)}
                                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 flex items-center"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Use This
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

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

                    {/* ATS Score Section - Inside Right Column */}
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
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${atsAnalysis.passFailStatus === 'PASS'
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
                                      <div key={index} className={`p-3 rounded-lg border-l-4 ${rec.priority === 'CRITICAL'
                                          ? 'bg-red-50 border-red-400'
                                          : rec.priority === 'HIGH'
                                            ? 'bg-orange-50 border-orange-400'
                                            : rec.priority === 'MEDIUM'
                                              ? 'bg-yellow-50 border-yellow-400'
                                              : 'bg-blue-50 border-blue-400'
                                        }`}>
                                        <div className="flex items-start justify-between mb-1">
                                          <span className={`text-xs font-medium px-2 py-1 rounded ${rec.priority === 'CRITICAL'
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

                    {/* ATS Error Display - Inside Right Column */}
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
            )}
          </>
        )}
      </div>
    </section>
  );
}