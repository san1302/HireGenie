/**
 * Comprehensive TypeScript interfaces for Advanced ATS Analysis System
 */

// Core ATS Analysis Results
export interface ATSScoreBreakdown {
  parseability: number;        // 0-100: Can ATS parse the resume properly?
  keywordMatch: number;        // 0-100: Percentage of relevant keywords found
  skillsAlignment: number;     // 0-100: Technical skills matching score
  formatCompatibility: number; // 0-100: Format and structure score
  contactInfo: number;        // 0-100: Contact information completeness
  bonusFeatures: number;      // 0-100: Job titles, certifications, etc.
}

export interface ATSAnalysisResult {
  success: true;
  overallScore: number;
  passFailStatus: 'PASS' | 'FAIL' | 'REVIEW';
  breakdown: ATSScoreBreakdown;
  recommendations: ATSRecommendation[];
  missingKeywords: string[];
  matchedKeywords: string[];
  skillsFound: string[];
  skillsMissing: string[];
  bonusItems: string[];
  criticalIssues: string[];
  // Enhanced fields
  matchQuality: MatchQuality;
  insights: KeywordInsights;
  detailedMatches: EnhancedKeywordMatch[];
}

export interface ATSRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  fix: string;
  impact: string;
}

export interface ATSAnalysisError {
  success: false;
  error: string;
  details?: string;
}

export type ATSResult = ATSAnalysisResult | ATSAnalysisError;

// Enhanced Keyword Matching Interfaces
export interface EnhancedKeywordMatch {
  originalKeyword: string;
  matchedVariation: string;
  matchType: 'exact' | 'synonym' | 'semantic' | 'partial' | 'acronym' | 'compound';
  confidence: number; // 0-1
  context: KeywordContext;
  location: SectionLocation;
  frequency: number;
  contextualScore: number;
}

export interface KeywordContext {
  type: 'skill' | 'tool' | 'certification' | 'degree' | 'job_title' | 'responsibility' | 'industry_term';
  category?: string; // e.g., 'programming_language', 'framework', 'soft_skill'
  industry?: string; // e.g., 'tech', 'healthcare', 'finance'
}

export interface SectionLocation {
  section: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'other';
  subsection?: string; // e.g., specific job title under experience
  proximity: number; // 0-100, distance from section start
}

export interface CompoundTerm {
  full: string;
  parts: string[];
  mustMatchAll: boolean;
}

// Keyword Extraction and Analysis
export interface ExtractedKeywords {
  all: KeywordData[];
  required: KeywordData[];
  preferred: KeywordData[];
}

export interface KeywordData {
  keyword: string;
  context: KeywordContext;
  importance: 'required' | 'preferred' | 'nice-to-have';
}

export interface KeywordMatchingResult {
  matches: EnhancedKeywordMatch[];
  unmatchedKeywords: string[];
  matchQuality: MatchQuality;
  recommendations: ATSRecommendation[];
}

export interface MatchQuality {
  overallScore: number;
  metrics: {
    requiredCoverage: number;
    preferredCoverage: number;
    averageConfidence: number;
    contextAccuracy: number;
    matchTypeDistribution: { [key: string]: number };
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface KeywordInsights {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  matchPatterns: { [matchType: string]: number };
}

// Resume Structure Interfaces
export interface ResumeSection {
  content: string;
  startLine: number;
  endLine: number;
  headerLine: number;
}

export interface ParsedResumeSections {
  contact: ResumeSection | null;
  summary: ResumeSection | null;
  experience: ResumeSection | null;
  education: ResumeSection | null;
  skills: ResumeSection | null;
  certifications: ResumeSection | null;
  other: ResumeSection[];
}

export interface StructuralCompliance {
  score: number;
  sectionsFound: string[];
  missingCriticalSections: string[];
  sectionOrder: string[];
  orderScore: number;
  recommendations: ATSRecommendation[];
}

// Legacy interfaces for compatibility
export interface MatchDetail {
  variation: string;
  location: 'title' | 'skills' | 'experience' | 'education' | 'other';
  frequency: number;
  proximity: number;
}

export interface KeywordExtractionResult {
  technicalSkills: string[];
  qualifications: string[];
  experienceTerms: string[];
  industryTerms: string[];
  jobTitles: string[];
} 