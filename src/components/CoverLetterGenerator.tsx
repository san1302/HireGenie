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
  Zap,
  Target,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "./ui/use-toast";

// Import modular components and types
import {
  // Types
  ATSAnalysis,
  CoverLetterGeneratorProps,
  GenerationStep,
  MobileStep,
  ActiveTab,
  SectionAnalysis,
  CoverLetterState,
  // Helper functions
  getWordCount,
  getLengthStatus,
  getScoreColor,
  getProgressColor,
  getTextareaHeight,
  getFullContentHeight,
  analyzeCoverLetterSections,
  getSectionText,
  sampleCoverLetter,
  getSelectionRect,
  isValidTextSelection,
  debounce,
  // Components
  MobileWizard,
  AIWritingAssistant,
  ATSAnalysisDisplay,
  QuickActionsModal,
  TextSelectionPopover,
  AnalysisPanel
} from './CoverLetterGenerator/index';

// Import the new AI analysis functions
import { 
  analyzeWithAI,
  analyzeWithAIFallback,
  getSectionTextAI
} from './CoverLetterGenerator/helpers';
import { AIAnalysisResponse } from './CoverLetterGenerator/types';

export default function CoverLetterGenerator({ userUsage, hasActiveSubscription }: CoverLetterGeneratorProps) {
  // Basic form state
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Standard");
  const [outputFormat, setOutputFormat] = useState("txt");
  
  // Cover letter state
  const [coverLetter, setCoverLetter] = useState("");
  const [editableCoverLetter, setEditableCoverLetter] = useState("");
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('analyzing');
  const [error, setError] = useState("");
  
  // UI state
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  
  // Mobile state
  const [mobileStep, setMobileStep] = useState<MobileStep>('resume');
  const [showMobileWizard, setShowMobileWizard] = useState(false);
  
  // AI Assistant state
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showImprovementOptions, setShowImprovementOptions] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // New non-modal component state
  const [textSelectionPopover, setTextSelectionPopover] = useState<{
    isVisible: boolean;
    selectedText: string;
  }>({
    isVisible: false,
    selectedText: ''
  });

  // Modal state for section analysis
  const [showQuickActionsModal, setShowQuickActionsModal] = useState(false);
  
  // Enhanced Quick Actions state
  const [sectionImprovements, setSectionImprovements] = useState<{[key: string]: string}>({});
  const [currentSection, setCurrentSection] = useState<string>('');
  const [sectionAnalysis, setSectionAnalysis] = useState<{[key: string]: SectionAnalysis}>({});
  
  // New state for expandable and editable functionality
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [editableSections, setEditableSections] = useState<{[key: string]: string}>({});
  const [editableImprovements, setEditableImprovements] = useState<{[key: string]: string}>({});
  const [mainTextareaExpanded, setMainTextareaExpanded] = useState(false);
  
  // Undo/Redo state
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // ATS Analysis state
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [showATSDetails, setShowATSDetails] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Add ref to track programmatic changes (vs user edits)
  const isProgrammaticChange = useRef(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>(''); // Track content for re-analysis
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResponse | null>(null);

  // Sample cover letter for fallback
  const sampleCoverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Senior Software Engineer position at Acme Inc. With over 5 years of experience in React and Node.js development, I am confident in my ability to become a valuable member of your team.

Throughout my career, I have focused on building scalable web applications and implementing best practices in software development. My experience aligns perfectly with the requirements outlined in your job description, particularly in frontend development and API integration.

At my previous role at XYZ Company, I led the development of a customer-facing portal that improved user engagement by 40%. I collaborated closely with design and product teams to ensure seamless integration of features while maintaining code quality and performance.

I am particularly excited about the opportunity to work on innovative projects at Acme Inc. Your company's commitment to technological advancement and user-centered design resonates with my professional values.

I would welcome the opportunity to discuss how my background, skills, and experiences would benefit your team. Thank you for considering my application.

Sincerely,
John Smith`;

  // Check if the generator should be locked
  const isLocked = !hasActiveSubscription && userUsage?.hasReachedLimit;

  // Computed values for undo/redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < editHistory.length - 1;
  const wordCount = getWordCount(editableCoverLetter);
  const lengthStatus = getLengthStatus(wordCount);

  // Mobile steps configuration
  const mobileSteps = [
    { id: 'resume', title: 'Resume', icon: Upload },
    { id: 'job', title: 'Job Details', icon: FileText },
    { id: 'customize', title: 'Customize', icon: Settings },
    { id: 'generate', title: 'Generate', icon: Sparkles }
  ];
  const currentStepIndex = mobileSteps.findIndex(step => step.id === mobileStep);

  // Text selection handler
  const handleTextSelection = debounce(() => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = editableCoverLetter.substring(start, end);
      
      if (isValidTextSelection(selected)) {
        setTextSelectionPopover({
          isVisible: true,
          selectedText: selected
        });
        setSelectedText(selected);
        setSelectionStart(start);
        setSelectionEnd(end);
        setImprovementSuggestions([]);
      } else {
        setTextSelectionPopover({
          isVisible: false,
          selectedText: ''
        });
        setShowImprovementOptions(false);
      }
    }
  }, 300);

  // Undo/Redo functions
  const addToHistory = (content: string) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(content);
    
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
      setHasBeenEdited(true);
    }
  };

  const redo = () => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditableCoverLetter(editHistory[newIndex]);
      setHasBeenEdited(true);
    }
  };

  // Keyboard shortcuts
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
  }, [canUndo, canRedo, historyIndex, editHistory]);

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
          context: 'cover letter'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to improve text');
      }

        const data = await response.json();
        setImprovementSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error improving text:', error);
      toast({
        title: "Error",
        description: "Failed to generate improvements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const improveSection = async (section: string, style: string) => {
    setIsImproving(true);
    setCurrentSection(section);
    try {
      // Map section names to API expected values
      const sectionMapping: {[key: string]: string} = {
        'opening': 'opening',
        'body': 'middle',  // API expects 'middle' for body section
        'closing': 'closing'
      };
      
      const apiSection = sectionMapping[section] || section;
      
      const response = await fetch('/api/improve-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: editableCoverLetter,
          section: apiSection,  // Use mapped section name
          style,
          jobDescription
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to improve section');
      }

        const data = await response.json();
        if (data.improvedText) {
        // Store the improvement in state instead of directly applying it
        setSectionImprovements(prev => ({ ...prev, [section]: data.improvedText }));
          toast({
            title: "Section improved!",
          description: `${section} section has been enhanced. Review and apply the changes.`
          });
      }
    } catch (error) {
      console.error('Error improving section:', error);
      toast({
        title: "Error",
        description: "Failed to improve section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
      setCurrentSection('');
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
      title: "Text Updated",
      description: "Your cover letter has been improved!",
    });
  };

  const applySectionImprovement = (section: string, improvement: string) => {
    // Use AI-detected section content instead of code-based detection
    const currentSectionText = sectionAnalysis[section]?.content || getSectionText(section, editableCoverLetter);
    
    if (!currentSectionText) {
      toast({
        title: "Error",
        description: `Could not find ${section} section to replace.`,
        variant: "destructive",
      });
      return;
    }
    
    // Replace the AI-detected section with the improvement
    const newContent = editableCoverLetter.replace(currentSectionText, improvement);
    
    // Check if replacement actually happened
    if (newContent === editableCoverLetter) {
      toast({
        title: "Warning", 
        description: `Could not apply improvement to ${section} section. The section content may have changed.`,
        variant: "destructive",
      });
      return;
    }
    
    // Mark this as a programmatic change to skip auto-analysis
    isProgrammaticChange.current = true;
    
    addToHistory(editableCoverLetter);
    setEditableCoverLetter(newContent);
    setHasBeenEdited(true);
    
    // Close the modal immediately
    setShowQuickActionsModal(false);
    
    toast({
      title: "Section Updated",
      description: `Your ${section} section has been improved!`,
    });
  };

  // File handling
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, or DOCX file");
      return;
    }
    
    setResumeFile(file);
    setFileName(file.name);
    setError("");
    setFileProcessing(true);
    
    // Simulate file processing
    setTimeout(() => {
      setResumeText("Extracted resume content would appear here...");
      setFileProcessing(false);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const clearSelectedFile = () => {
    setResumeFile(null);
    setFileName("");
    setResumeText("");
    setError("");
  };

  // Mobile navigation
  const nextMobileStep = () => {
    const nextIndex = Math.min(currentStepIndex + 1, mobileSteps.length - 1);
    setMobileStep(mobileSteps[nextIndex].id as MobileStep);
  };

  const prevMobileStep = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setMobileStep(mobileSteps[prevIndex].id as MobileStep);
  };

  const canProceedFromStep = (step: string) => {
    switch (step) {
      case 'resume':
        return (activeTab === 'upload' && !!fileName) || (activeTab === 'paste' && !!resumeText.trim());
      case 'job':
        return jobDescription.trim().length > 0;
      case 'customize':
        return true;
      default:
        return false;
    }
  };

  // Toggle section expansion function
  const toggleSectionExpansion = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // New handlers for non-modal components
  const handlePopoverClose = () => {
    setTextSelectionPopover({
      isVisible: false,
      selectedText: ''
    });
    setShowImprovementOptions(false);
  };

  const handlePopoverImprove = (improvementType: string) => {
    improveText(improvementType);
  };

  const handlePopoverApply = (improvement: string) => {
    replaceWithImprovement(improvement);
    handlePopoverClose();
  };

  const handleSectionEdit = (section: string, content: string) => {
    setEditableSections(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handleImprovementEdit = (section: string, content: string) => {
    setEditableImprovements(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handleApplySectionEdit = (section: string) => {
    const editedContent = editableSections[section];
    if (editedContent) {
      // Apply the section edit to the main cover letter
      const paragraphs = editableCoverLetter.split('\n\n').filter(p => p.trim().length > 0);
      
      switch (section) {
        case 'opening':
          paragraphs[0] = editedContent;
          break;
        case 'body':
          const bodyParagraphs = editedContent.split('\n\n').filter(p => p.trim().length > 0);
          paragraphs.splice(1, paragraphs.length - 2, ...bodyParagraphs);
          break;
        case 'closing':
          paragraphs[paragraphs.length - 1] = editedContent;
          break;
      }
      
      const newContent = paragraphs.join('\n\n');
      handleCoverLetterEdit(newContent);
      
      // Clear the edited section
      setEditableSections(prev => {
        const newSections = { ...prev };
        delete newSections[section];
        return newSections;
      });
    }
  };

  // Main generation function
  const handleGenerate = async () => {
    if (isLocked) {
      toast({
        title: "Upgrade Required",
        description: "You've reached your free limit. Please upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError("");
    
    try {
      setGenerationStep('analyzing');
      
      // Prepare form data for API call
      const formData = new FormData();

      if (resumeFile) {
        formData.append("resume_file", resumeFile);
      } else if (resumeText.trim()) {
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate cover letter");
      }

      const data = await response.json();
      const generatedLetter = data.coverLetter || sampleCoverLetter;
      setCoverLetter(generatedLetter);
      setEditableCoverLetter(generatedLetter);
      addToHistory(generatedLetter);
      
      // AI analysis will run automatically when editableCoverLetter changes
      
      // Set ATS analysis data from API response
      if (data.atsAnalysis) {
        setAtsAnalysis(data.atsAnalysis);
      }
      
      setGenerationStep('complete');
      setShowMobileWizard(false);
      
      toast({
        title: "Analysis complete!",
        description: "Your cover letter and ATS score are ready!",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setError(error instanceof Error ? error.message : "Failed to generate cover letter");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Utility functions
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableCoverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `cover-letter-${timestamp}`;
    const contentToDownload = editableCoverLetter || coverLetter;
    
    if (!contentToDownload.trim()) {
      toast({
        title: "Error",
        description: "No content to download. Please generate a cover letter first.",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (outputFormat) {
        case 'pdf':
          // Create a formatted HTML document for PDF printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cover Letter</title>
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
                  <div class="content">${contentToDownload.replace(/\n/g, '<br>')}</div>
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
            throw new Error("Unable to open print window. Please check your browser's popup settings.");
          }
          break;

        case 'html':
          // Create a properly formatted HTML document
          const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cover Letter</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 1in auto;
            padding: 0;
            color: #000;
        }
        .content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        @media print {
            body { margin: 1in; }
        }
    </style>
</head>
<body>
    <div class="content">${contentToDownload.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
          
          const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const htmlElement = document.createElement("a");
          htmlElement.href = URL.createObjectURL(htmlBlob);
          htmlElement.download = `${baseFilename}.html`;
          document.body.appendChild(htmlElement);
          htmlElement.click();
          document.body.removeChild(htmlElement);
          URL.revokeObjectURL(htmlElement.href);
          break;

        case 'docx':
          // Create RTF format (Rich Text Format) which can be opened by Word
          const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${contentToDownload.replace(/\n/g, '\\par ')}}`;
          
          const rtfBlob = new Blob([rtfContent], { type: 'application/rtf' });
          const rtfElement = document.createElement("a");
          rtfElement.href = URL.createObjectURL(rtfBlob);
          rtfElement.download = `${baseFilename}.rtf`;
          document.body.appendChild(rtfElement);
          rtfElement.click();
          document.body.removeChild(rtfElement);
          URL.revokeObjectURL(rtfElement.href);
          break;

        case 'txt':
        default:
          // Plain text format
          const txtBlob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
          const txtElement = document.createElement("a");
          txtElement.href = URL.createObjectURL(txtBlob);
          txtElement.download = `${baseFilename}.txt`;
          document.body.appendChild(txtElement);
          txtElement.click();
          document.body.removeChild(txtElement);
          URL.revokeObjectURL(txtElement.href);
          break;
      }

      toast({
        title: "Download Started!",
        description: `Cover letter download initiated as ${outputFormat.toUpperCase()}.`,
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setCoverLetter("");
    setEditableCoverLetter("");
    setHasBeenEdited(false);
    setAtsAnalysis(null);
    setSectionImprovements({});
    setSectionAnalysis({});
    setEditHistory([]);
    setHistoryIndex(-1);
    setError("");
    
    toast({
      title: "Reset Complete",
      description: "All fields have been cleared.",
    });
  };

  const handleCoverLetterEdit = (newContent: string) => {
    if (newContent !== editableCoverLetter) {
      if (!hasBeenEdited) {
        addToHistory(editableCoverLetter);
      }
    
      setEditableCoverLetter(newContent);
      setHasBeenEdited(true);

    // Auto-save functionality
    setIsAutoSaving(true);
    setTimeout(() => {
        addToHistory(newContent);
      setIsAutoSaving(false);
    }, 1000);
    }
  };

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setShowMobileWizard(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update section analysis when cover letter changes
  useEffect(() => {
    if (editableCoverLetter.trim()) {
      // Skip auto-analysis for programmatic changes (like applying improvements)
      if (isProgrammaticChange.current) {
        isProgrammaticChange.current = false; // Reset the flag
        return;
      }
      
      // Only run analysis for actual user edits
      performAIAnalysis();
    }
  }, [editableCoverLetter]);

  const performAIAnalysis = async () => {
    if (!editableCoverLetter.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Use AI-powered analysis
      const aiResult = await analyzeWithAI(editableCoverLetter, jobDescription);
      
      if (aiResult) {
        setAiAnalysisResult(aiResult);
        // Use AI analysis results directly
        const analysisWithContent: {[key: string]: SectionAnalysis} = {
          opening: {
            score: aiResult.sections.opening.score,
            issues: aiResult.sections.opening.issues,
            content: aiResult.sections.opening.content
          },
          body: {
            score: aiResult.sections.body.score,
            issues: aiResult.sections.body.issues,
            content: aiResult.sections.body.content
          },
          closing: {
            score: aiResult.sections.closing.score,
            issues: aiResult.sections.closing.issues,
            content: aiResult.sections.closing.content
          }
        };
        
        setSectionAnalysis(analysisWithContent);
        setLastAnalyzedContent(editableCoverLetter);
      } else {
        // Fallback to code-based analysis
        const fallbackAnalysis = analyzeCoverLetterSections(editableCoverLetter);
        // Add content to fallback analysis
        const analysisWithContent = Object.keys(fallbackAnalysis).reduce((acc, section) => {
          acc[section] = {
            ...fallbackAnalysis[section],
            content: getSectionText(section, editableCoverLetter)
          };
          return acc;
        }, {} as {[key: string]: SectionAnalysis});
        setSectionAnalysis(analysisWithContent);
        setLastAnalyzedContent(editableCoverLetter);
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      // Use code-based analysis as final fallback
      const fallbackAnalysis = analyzeCoverLetterSections(editableCoverLetter);
      // Add content to fallback analysis
      const analysisWithContent = Object.keys(fallbackAnalysis).reduce((acc, section) => {
        acc[section] = {
          ...fallbackAnalysis[section],
          content: getSectionText(section, editableCoverLetter)
        };
        return acc;
      }, {} as {[key: string]: SectionAnalysis});
      setSectionAnalysis(analysisWithContent);
      setLastAnalyzedContent(editableCoverLetter);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

            {!isLocked && (
              <MobileWizard
                mobileStep={mobileStep}
                currentStepIndex={currentStepIndex}
                activeTab={activeTab}
                resumeFile={resumeFile}
                fileName={fileName}
                resumeText={resumeText}
                jobDescription={jobDescription}
                tone={tone}
                length={length}
                outputFormat={outputFormat}
                error={error}
                isDragging={isDragging}
                fileProcessing={fileProcessing}
                isGenerating={isGenerating}
                setActiveTab={setActiveTab}
                setResumeText={setResumeText}
                setJobDescription={setJobDescription}
                setTone={setTone}
                setLength={setLength}
                setOutputFormat={setOutputFormat}
                handleFileChange={handleFileChange}
                handleDragEnter={handleDragEnter}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                clearSelectedFile={clearSelectedFile}
                handleGenerate={handleGenerate}
                nextMobileStep={nextMobileStep}
                prevMobileStep={prevMobileStep}
                canProceedFromStep={canProceedFromStep}
              />
            )}
            
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
                      <div className="relative mb-4">
                      <textarea
                          ref={textareaRef}
                        value={editableCoverLetter}
                        onChange={(e) => handleCoverLetterEdit(e.target.value)}
                          onSelect={handleTextSelection}
                          className="w-full p-4 border border-gray-200 rounded-lg text-gray-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-300"
                          style={{
                            height: mainTextareaExpanded ? getFullContentHeight(editableCoverLetter) : getTextareaHeight(editableCoverLetter, false),
                            maxHeight: mainTextareaExpanded ? '80vh' : '500px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                          }}
                        placeholder="Your generated cover letter will appear here..."
                          spellCheck={true}
                        />
                        
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => setMainTextareaExpanded(!mainTextareaExpanded)}
                          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 group"
                          title={mainTextareaExpanded ? "Collapse textarea" : "Expand textarea"}
                        >
                          {mainTextareaExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                          )}
                        </button>
                      </div>

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

                      {/* Inline Text Selection Improvement */}
                      <TextSelectionPopover
                        selectedText={textSelectionPopover.selectedText}
                        isImproving={isImproving}
                        improvementSuggestions={improvementSuggestions}
                        isVisible={textSelectionPopover.isVisible}
                        onImprove={handlePopoverImprove}
                        onApply={handlePopoverApply}
                        onClose={handlePopoverClose}
                      />
                      
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{getWordCount(editableCoverLetter)} words</span>
                          <span className={getLengthStatus(getWordCount(editableCoverLetter)).color}>
                            {getLengthStatus(getWordCount(editableCoverLetter)).message}
                          </span>
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
                              className={`px-3 py-1 text-sm border rounded hover:border-gray-300 flex items-center transition-colors ${copySuccess 
                                ? 'border-green-300 text-green-600 bg-green-50' 
                                : 'border-gray-200 text-gray-600'
                              }`}
                          >
                              {copySuccess ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                              {copySuccess ? "Copied!" : "Copy"}
                          </button>
                          <button 
                            onClick={handleDownload} 
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center transition-colors"
                          >
                              <Download className="h-4 w-4 mr-1" />
                            Download {outputFormat.toUpperCase()}
                          </button>
                            </div>
                        </div>
                          </div>
                    </>
                  )}
                        </div>
                            </div>
            )}
          </>
        ) : (
          /* Desktop Layout - Original Structure */
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
                          <option value="docx">Word Compatible (.rtf)</option>
                          <option value="pdf">PDF (Print to Save)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mb-6">
                      <button 
                        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors flex items-center ${isGenerating ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"}`}
                        onClick={handleGenerate} 
                        disabled={isGenerating || !jobDescription.trim() || (!fileName && !resumeText.trim())}
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
                            onClick={() => {
                              // Check if content has changed since last analysis
                              if (editableCoverLetter !== lastAnalyzedContent) {
                                // Content has changed, need to re-analyze with AI
                                setShowQuickActionsModal(true);
                                performAIAnalysis();
                              } else {
                                // Content hasn't changed, just open modal
                                setShowQuickActionsModal(true);
                              }
                            }}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            🚀 AI Assistant
                          </button>
                        </div>

                        {/* Main Textarea */}
                        <div className="relative mb-4">
                        <textarea
                          ref={textareaRef}
                          value={editableCoverLetter}
                          onChange={(e) => handleCoverLetterEdit(e.target.value)}
                          onSelect={handleTextSelection}
                            className="w-full p-4 border border-gray-200 rounded-lg text-gray-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-300"
                          style={{ 
                              height: mainTextareaExpanded ? getFullContentHeight(editableCoverLetter) : getTextareaHeight(editableCoverLetter, false),
                              maxHeight: mainTextareaExpanded ? '80vh' : '500px',
                              overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                          }}
                            placeholder="Your generated cover letter will appear here..."
                          spellCheck={true}
                        />
                          
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => setMainTextareaExpanded(!mainTextareaExpanded)}
                            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 group"
                            title={mainTextareaExpanded ? "Collapse textarea" : "Expand textarea"}
                          >
                            {mainTextareaExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                            )}
                          </button>
                        </div>
                        
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

                        {/* Inline Text Selection Improvement */}
                        <TextSelectionPopover
                          selectedText={textSelectionPopover.selectedText}
                          isImproving={isImproving}
                          improvementSuggestions={improvementSuggestions}
                          isVisible={textSelectionPopover.isVisible}
                          onImprove={handlePopoverImprove}
                          onApply={handlePopoverApply}
                          onClose={handlePopoverClose}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                              <button
                            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                            onClick={handleReset}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reset
                          </button>
                          <div className="flex space-x-3">
                            <button 
                              onClick={handleCopy} 
                              className={`px-3 py-1 text-sm border rounded hover:border-gray-300 flex items-center transition-colors ${copySuccess 
                                ? 'border-green-300 text-green-600 bg-green-50' 
                                : 'border-gray-200 text-gray-600'
                              }`}
                            >
                              {copySuccess ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                              {copySuccess ? "Copied!" : "Copy"}
                            </button>
                            <button 
                              onClick={handleDownload} 
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download {outputFormat.toUpperCase()}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : isGenerating ? (
                      <div className="text-center py-12">
                        <Loader className="h-8 w-8 text-indigo-600 mx-auto mb-4 animate-spin" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {generationStep === 'analyzing' && 'Analyzing your resume...'}
                          {generationStep === 'generating' && 'Generating cover letter...'}
                          {generationStep === 'optimizing' && 'Optimizing for ATS...'}
                          {generationStep === 'complete' && 'Complete!'}
                        </h4>
                        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                          <div className={`h-2 rounded-full transition-all duration-500 ${
                            generationStep === 'analyzing' ? 'w-1/3 bg-indigo-600' :
                            generationStep === 'generating' ? 'w-2/3 bg-indigo-600' :
                            generationStep === 'optimizing' ? 'w-5/6 bg-indigo-600' :
                            'w-full bg-green-500'
                          }`}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Cover Letter Placeholder */}
                        <div className="bg-white border border-gray-200 border-dashed rounded-lg p-8 h-[400px] flex flex-col items-center justify-center text-center">
                          <FileText className="h-12 w-12 text-gray-300 mb-4" />
                          {isGenerating ? (
                            <>
                              <Loader className="h-8 animate-spin mb-2 text-indigo-500" />
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
                                    <span className="text-sm font-medium w-8">--</span>
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
                    {atsAnalysis && (
                      <ATSAnalysisDisplay
                        atsAnalysis={atsAnalysis}
                        showATSDetails={showATSDetails}
                        setShowATSDetails={setShowATSDetails}
                      />
                    )}
                              </div>
                            </div>
                            </div>
                          )}
                              </>
                            )}

        {/* Modular Components */}
        <QuickActionsModal
          showQuickActionsModal={showQuickActionsModal}
          sectionAnalysis={sectionAnalysis}
          sectionImprovements={sectionImprovements}
          isImproving={isImproving}
          isAnalyzing={isAnalyzing}
          currentSection={currentSection}
          expandedSections={expandedSections}
          editableSections={editableSections}
          editableImprovements={editableImprovements}
          editableCoverLetter={editableCoverLetter}
          setShowQuickActionsModal={setShowQuickActionsModal}
          improveSection={improveSection}
          applySectionImprovement={applySectionImprovement}
          getSectionText={(section: string, content: string) => getSectionTextAI(section, content, aiAnalysisResult || undefined)}
          setExpandedSections={setExpandedSections}
          setEditableSections={setEditableSections}
          setEditableImprovements={setEditableImprovements}
        />
      </div>
    </section>
  );
}