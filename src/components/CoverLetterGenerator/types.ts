// TypeScript interface for ATS analysis
export interface ATSRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  fix: string;
  impact: string;
}

export interface ATSAnalysis {
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

export interface CoverLetterGeneratorProps {
  userUsage?: {
    usageCount: number;
    hasReachedLimit: boolean;
  };
  hasActiveSubscription?: boolean;
}

export type GenerationStep = 'analyzing' | 'generating' | 'optimizing' | 'complete';
export type MobileStep = 'resume' | 'job' | 'customize' | 'generate';
export type ActiveTab = 'upload' | 'paste';

export interface SectionAnalysis {
  score: number;
  issues: string[];
  strengths?: string[];
  recommendations?: string[];
  content: string;
}

export interface OverallAnalysis {
  totalScore: number;
  keyStrengths: string[];
  criticalIssues: string[];
  improvementPriority: string[];
}

export interface AIAnalysisResponse {
  header?: string;
  sections: {
    opening: SectionAnalysis;
    body: SectionAnalysis;
    closing: SectionAnalysis;
  };
  footer?: string;
  overallAnalysis: OverallAnalysis;
}

export interface CoverLetterState {
  // Basic form state
  activeTab: ActiveTab;
  fileName: string;
  resumeFile: File | null;
  resumeText: string;
  jobDescription: string;
  tone: string;
  length: string;
  outputFormat: string;
  
  // Cover letter state
  coverLetter: string;
  editableCoverLetter: string;
  hasBeenEdited: boolean;
  
  // Generation state
  isGenerating: boolean;
  generationStep: GenerationStep;
  error: string;
  
  // UI state
  copySuccess: boolean;
  isDragging: boolean;
  fileProcessing: boolean;
  
  // Mobile state
  mobileStep: MobileStep;
  showMobileWizard: boolean;
  
  // AI Assistant state
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
  showImprovementOptions: boolean;
  isImproving: boolean;
  improvementSuggestions: string[];
  showQuickActions: boolean;
  
  // Enhanced Quick Actions state
  showQuickActionsModal: boolean;
  sectionImprovements: {[key: string]: string};
  currentSection: string;
  sectionAnalysis: {[key: string]: SectionAnalysis};
  
  // Expandable functionality state
  expandedSections: {[key: string]: boolean};
  editableSections: {[key: string]: string};
  editableImprovements: {[key: string]: string};
  mainTextareaExpanded: boolean;
  
  // Undo/Redo state
  editHistory: string[];
  historyIndex: number;
  isAutoSaving: boolean;
  
  // ATS Analysis state
  atsAnalysis: ATSAnalysis | null;
  showATSDetails: boolean;
} 