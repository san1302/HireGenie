import { SectionAnalysis, AIAnalysisResponse } from './types';

// Calculate word count
export const getWordCount = (text: string): number => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

// Get length status
export const getLengthStatus = (count: number) => {
  if (count < 150) return { message: "Too short", color: "text-red-500" };
  if (count <= 250) return { message: "Concise", color: "text-green-500" };
  if (count <= 350) return { message: "Standard", color: "text-blue-500" };
  if (count <= 450) return { message: "Detailed", color: "text-indigo-500" };
  if (count > 450) return { message: "Comprehensive", color: "text-purple-500" };
  return { message: "Good length", color: "text-gray-500" };
};

// Helper functions for ATS analysis
export const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

export const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Textarea height calculations
export const getTextareaHeight = (content: string, isExpanded: boolean, isFullExpand: boolean = false) => {
  if (isFullExpand) return '60vh';
  if (isExpanded) return '300px';
  
  // Dynamic height based on content with better minimum height
  const lines = content.split('\n').length;
  const minHeight = 200; // Increased from 120px to 200px for better usability
  const lineHeight = 24;
  const calculatedHeight = Math.max(minHeight, Math.min(lines * lineHeight, 350)); // Increased max from 200px to 350px
  
  return `${calculatedHeight}px`;
};

// Helper function to get full content height
export const getFullContentHeight = (content: string) => {
  const lines = content.split('\n').length;
  const lineHeight = 24;
  const padding = 32; // Account for padding
  const calculatedHeight = Math.max(200, lines * lineHeight + padding);
  return `${Math.min(calculatedHeight, window.innerHeight * 0.8)}px`; // Max 80% of viewport height
};

// Section analysis helper functions
export const analyzeCoverLetterSections = (content: string) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const analysis: {[key: string]: SectionAnalysis} = {};
  
  if (paragraphs.length > 0) {
    // Opening paragraph analysis
    const opening = paragraphs[0];
    const openingIssues = [];
    let openingScore = 70;
    
    if (opening.length < 100) openingIssues.push("Too short - needs more impact");
    if (!opening.toLowerCase().includes('position') && !opening.toLowerCase().includes('role')) {
      openingIssues.push("Doesn't mention the specific position");
      openingScore -= 15;
    }
    if (!opening.toLowerCase().includes('company') && !opening.toLowerCase().includes('organization')) {
      openingIssues.push("Doesn't mention the company name");
      openingScore -= 10;
    }
    if (opening.startsWith('Dear Hiring Manager') || opening.startsWith('To Whom')) {
      openingIssues.push("Generic greeting - try to find specific contact");
      openingScore -= 5;
    }
    
    analysis.opening = { 
      score: Math.max(openingScore - openingIssues.length * 5, 0), 
      issues: openingIssues,
      content: getSectionText('opening', content)
    };
  }
  
  if (paragraphs.length > 1) {
    // Body paragraphs analysis
    const bodyParagraphs = paragraphs.slice(1, -1);
    const bodyIssues = [];
    let bodyScore = 75;
    
    if (bodyParagraphs.length === 0) {
      bodyIssues.push("Missing body paragraphs");
      bodyScore = 20;
    } else {
      const bodyText = bodyParagraphs.join(' ');
      if (bodyText.length < 200) bodyIssues.push("Body content too brief");
      if (!bodyText.toLowerCase().includes('experience') && !bodyText.toLowerCase().includes('skill')) {
        bodyIssues.push("Lacks specific experience or skills");
        bodyScore -= 15;
      }
      if (!bodyText.includes('achieve') && !bodyText.includes('result') && !bodyText.includes('impact')) {
        bodyIssues.push("Missing quantifiable achievements");
        bodyScore -= 10;
      }
    }
    
    analysis.body = { 
      score: Math.max(bodyScore - bodyIssues.length * 5, 0), 
      issues: bodyIssues,
      content: getSectionText('body', content)
    };
  }
  
  if (paragraphs.length > 1) {
    // Closing paragraph analysis
    const closing = paragraphs[paragraphs.length - 1];
    const closingIssues = [];
    let closingScore = 80;
    
    if (closing.length < 50) closingIssues.push("Too brief - needs stronger call to action");
    if (!closing.toLowerCase().includes('interview') && !closing.toLowerCase().includes('discuss') && !closing.toLowerCase().includes('contact')) {
      closingIssues.push("Missing call to action");
      closingScore -= 15;
    }
    if (!closing.toLowerCase().includes('thank') && !closing.toLowerCase().includes('appreciate')) {
      closingIssues.push("Could be more courteous");
      closingScore -= 5;
    }
    
    analysis.closing = { 
      score: Math.max(closingScore - closingIssues.length * 5, 0), 
      issues: closingIssues,
      content: getSectionText('closing', content)
    };
  }
  
  return analysis;
};

export const getSectionText = (section: string, content: string) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  switch (section) {
    case 'opening':
      return paragraphs[0] || '';
    case 'body':
      return paragraphs.slice(1, -1).join('\n\n') || '';
    case 'closing':
      return paragraphs[paragraphs.length - 1] || '';
    default:
      return '';
  }
};

// Sample cover letter for the UI
export const sampleCoverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Senior Software Engineer position at Acme Inc. With over 5 years of experience in React and Node.js development, I am confident in my ability to become a valuable member of your team.

Throughout my career, I have focused on building scalable web applications and implementing best practices in software development. My experience aligns perfectly with the requirements outlined in your job description, particularly in frontend development and API integration.

At my previous role at XYZ Company, I led the development of a customer-facing portal that improved user engagement by 40%. I collaborated closely with design and product teams to ensure seamless integration of features while maintaining code quality and performance.

I am particularly excited about the opportunity to work on innovative projects at Acme Inc. Your company's commitment to technological advancement and user-centered design resonates with my professional values.

I would welcome the opportunity to discuss how my background, skills, and experiences would benefit your team. Thank you for considering my application.

Sincerely,
John Smith`;

// Helper functions for new non-modal components

// Get text selection rectangle for popover positioning
export const getSelectionRect = (): DOMRect | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  return range.getBoundingClientRect();
};

// Determine optimal popover position
export const getPopoverPosition = (selectionRect: DOMRect): 'above' | 'below' => {
  const spaceBelow = window.innerHeight - selectionRect.bottom;
  const spaceAbove = selectionRect.top;
  
  // Need at least 250px for popover content
  return spaceBelow > 250 ? 'below' : 'above';
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return window.innerWidth < 768;
};

// Get responsive panel mode
export const getResponsivePanelMode = (): 'sidebar' | 'bottom-sheet' => {
  return isMobileDevice() ? 'bottom-sheet' : 'sidebar';
};

// Debounce function for text selection
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Check if text selection is valid for improvement
export const isValidTextSelection = (text: string): boolean => {
  return text.trim().length > 0 && text.trim().length <= 500; // Max 500 chars for performance
};

// Get selection context (surrounding text for better AI understanding)
export const getSelectionContext = (
  fullText: string, 
  selectedText: string, 
  contextLength: number = 100
): { before: string; after: string } => {
  const selectedIndex = fullText.indexOf(selectedText);
  if (selectedIndex === -1) return { before: '', after: '' };
  
  const beforeStart = Math.max(0, selectedIndex - contextLength);
  const afterEnd = Math.min(fullText.length, selectedIndex + selectedText.length + contextLength);
  
  return {
    before: fullText.substring(beforeStart, selectedIndex),
    after: fullText.substring(selectedIndex + selectedText.length, afterEnd)
  };
};

// Format improvement suggestions for display
export const formatImprovementSuggestion = (suggestion: string): string => {
  return suggestion.trim().replace(/\s+/g, ' ');
};

// Calculate improvement metrics
export const getImprovementMetrics = (original: string, improved: string) => {
  const originalWords = original.trim().split(/\s+/).length;
  const improvedWords = improved.trim().split(/\s+/).length;
  const wordDiff = improvedWords - originalWords;
  
  return {
    originalWords,
    improvedWords,
    wordDiff,
    percentChange: originalWords > 0 ? Math.round((wordDiff / originalWords) * 100) : 0,
    isLonger: wordDiff > 0,
    isShorter: wordDiff < 0
  };
};

// AI-powered section analysis
export const analyzeWithAI = async (content: string, jobDescription?: string): Promise<AIAnalysisResponse | null> => {
  try {
    const response = await fetch('/api/analyze-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverLetter: content,
        jobDescription
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI Analysis API Error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error calling AI analysis:', error);
    return null;
  }
};

// Enhanced section analysis that tries AI first, falls back to code-based
export const analyzeWithAIFallback = async (content: string, jobDescription?: string): Promise<{[key: string]: SectionAnalysis}> => {
  // Try AI analysis first
  const aiAnalysis = await analyzeWithAI(content, jobDescription);
  
  if (aiAnalysis) {
    // Convert AI response to the expected format
    return {
      opening: aiAnalysis.sections.opening,
      body: aiAnalysis.sections.body,
      closing: aiAnalysis.sections.closing
    };
  }
  
  // Fallback to code-based analysis
  console.log('AI analysis failed, falling back to code-based analysis');
  return analyzeCoverLetterSections(content);
};

// Get section text using AI-detected boundaries or fallback to code-based
export const getSectionTextAI = (section: string, content: string, aiAnalysis?: AIAnalysisResponse): string => {
  // If we have AI analysis with content, use that
  if (aiAnalysis?.sections[section as keyof typeof aiAnalysis.sections]?.content) {
    return aiAnalysis.sections[section as keyof typeof aiAnalysis.sections].content || '';
  }
  
  // Fallback to code-based section detection
  return getSectionText(section, content);
}; 