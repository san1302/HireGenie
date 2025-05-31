// ATS (Applicant Tracking System) Analyzer Service
// AI-powered analysis for realistic ATS compatibility scoring

import OpenAI from 'openai';
import type { ResumeParserSuccessResponse } from './resume-parser';

// Export the enhanced ATS analyzer
export { analyzeATSCompatibilityEnhanced } from './ats/enhanced-ats-analyzer';

// Export enhanced types for external use
export type {
  EnhancedKeywordMatch,
  KeywordInsights,
  MatchQuality,
  ExtractedKeywords,
  KeywordData,
  KeywordContext
} from './ats/types';

// TypeScript interfaces for ATS analysis
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
  overallScore: number;       // 0-100: Weighted average of all scores
  passFailStatus: 'PASS' | 'FAIL' | 'REVIEW';
  breakdown: ATSScoreBreakdown;
  recommendations: ATSRecommendation[];
  missingKeywords: string[];
  matchedKeywords: string[];
  skillsFound: string[];
  skillsMissing: string[];
  bonusItems: string[];       // Found job titles, certifications, etc.
  criticalIssues: string[];   // Issues that cause automatic rejection
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

// Enhanced keyword matching interface
interface KeywordMatch {
  keyword: string;
  variations: string[];
  context: 'skill' | 'title' | 'certification' | 'experience' | 'education';
  weight: number;
  found: boolean;
  matches: MatchDetail[];
}

interface MatchDetail {
  variation: string;
  location: 'title' | 'skills' | 'experience' | 'education' | 'other';
  frequency: number;
  proximity: number; // Distance from section header (0-100)
}

// Resume section detection interfaces
interface ResumeSection {
  content: string;
  startLine: number;
  endLine: number;
  headerLine: number;
}

interface ParsedResumeSections {
  contact: ResumeSection | null;
  summary: ResumeSection | null;
  experience: ResumeSection | null;
  education: ResumeSection | null;
  skills: ResumeSection | null;
  certifications: ResumeSection | null;
  other: ResumeSection[];
}

interface StructuralCompliance {
  score: number;
  sectionsFound: string[];
  missingCriticalSections: string[];
  sectionOrder: string[];
  orderScore: number;
  recommendations: ATSRecommendation[];
}

// AI-powered keyword extraction interfaces
interface KeywordExtractionResult {
  technicalSkills: string[];
  qualifications: string[];
  experienceTerms: string[];
  industryTerms: string[];
  jobTitles: string[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration for ATS analysis - Updated with realistic weights
const ATS_CONFIG = {
  weights: {
    parseability: 0.30,        // 30% weight - Can't score if can't parse
    keywordMatch: 0.35,        // 35% weight - Most important for matching
    skillsAlignment: 0.20,     // 20% weight - Technical skills matching
    formatCompatibility: 0.10, // 10% weight - Format and structure
    contactInfo: 0.03,         // 3% weight - Contact information
    bonusFeatures: 0.02        // 2% weight - Job titles, certifications, etc.
  },
  // Realistic thresholds based on actual ATS behavior
  thresholds: {
    autoReject: 30,           // Below 30 = automatic rejection
    needsReview: 60,          // 30-60 = human review needed
    autoPass: 75              // Above 75 = likely to pass initial screen
  }
};

// Common synonyms and abbreviations that ATS systems recognize
const SYNONYM_MAP = new Map([
  ['software developer', ['software engineer', 'developer', 'programmer', 'swe']],
  ['frontend', ['front-end', 'front end', 'client side', 'client-side']],
  ['backend', ['back-end', 'back end', 'server side', 'server-side']],
  ['full stack', ['fullstack', 'full-stack']],
  ['machine learning', ['ml', 'deep learning', 'ai', 'artificial intelligence']],
  ['continuous integration', ['ci', 'ci/cd', 'continuous deployment']],
  ['user experience', ['ux', 'user interface', 'ui', 'ui/ux']],
  ['javascript', ['js']],
  ['typescript', ['ts']],
  ['senior', ['sr', 'sr.']],
  ['junior', ['jr', 'jr.']],
  ['years', ['yrs', 'y']],
]);

/**
 * Analyze parseability using enhanced resume parser data
 */
function analyzeParseability(resumeParserData?: ResumeParserSuccessResponse): {
  score: number;
  issues: string[];
  criticalFailures: boolean;
  recommendations: ATSRecommendation[];
} {
  let score = 100;
  const issues: string[] = [];
  const recommendations: ATSRecommendation[] = [];
  let criticalFailures = false;

  if (!resumeParserData) {
    return {
      score: 50,
      issues: ['Resume parser data not available'],
      criticalFailures: false,
      recommendations: [{
        priority: 'MEDIUM',
        issue: 'Unable to analyze parsing quality',
        fix: 'Ensure resume is in a standard format (PDF, DOC, DOCX)',
        impact: 'May have parsing issues in some ATS systems'
      }]
    };
  }

  // Critical parsing failures that cause immediate rejection
  if (resumeParserData.parsing_confidence && resumeParserData.parsing_confidence < 20) {
    criticalFailures = true;
    score = 10;
    issues.push('CRITICAL: Resume format cannot be parsed by ATS');
    recommendations.push({
      priority: 'CRITICAL',
      issue: 'Resume format prevents ATS parsing',
      fix: 'Convert to simple single-column format with standard fonts',
      impact: 'Currently being auto-rejected by ATS'
    });
  }

  // Check for specific formatting issues
  if (resumeParserData.formatting_issues) {
    resumeParserData.formatting_issues.forEach(issue => {
      switch (issue) {
        case 'multi_column':
          score -= 40;
          issues.push('Multi-column layout will scramble content in most ATS');
          recommendations.push({
            priority: 'HIGH',
            issue: 'Multi-column layout detected',
            fix: 'Convert to single-column format',
            impact: 'Content may be scrambled or misread by ATS'
          });
          if (score < 30) criticalFailures = true;
          break;
        case 'tables':
          score -= 30;
          issues.push('Tables are often parsed incorrectly, mixing data');
          recommendations.push({
            priority: 'HIGH',
            issue: 'Tables detected in resume',
            fix: 'Replace tables with simple text formatting',
            impact: 'Table data may be scrambled or lost'
          });
          break;
        case 'graphics':
          score -= 20;
          issues.push('Graphics/images are completely ignored by ATS');
          recommendations.push({
            priority: 'MEDIUM',
            issue: 'Graphics or images detected',
            fix: 'Remove images and use text-based formatting',
            impact: 'Visual elements will be ignored by ATS'
          });
          break;
        case 'header':
          score -= 25;
          issues.push('Headers/footers may not be parsed, losing contact info');
          recommendations.push({
            priority: 'HIGH',
            issue: 'Header/footer content detected',
            fix: 'Move contact information to main document body',
            impact: 'Contact information may be lost'
          });
          break;
        case 'special_chars':
          score -= 15;
          issues.push('Special characters may break parsing');
          recommendations.push({
            priority: 'MEDIUM',
            issue: 'Special characters detected',
            fix: 'Use standard characters and avoid symbols',
            impact: 'May cause parsing errors in some ATS'
          });
          break;
      }
    });
  }

  // Text density check (too little text = likely parsing failure)
  const wordCount = resumeParserData.word_count || 0;
  if (wordCount < 150) {
    score -= 50;
    issues.push('Insufficient text content - likely parsing failure');
    recommendations.push({
      priority: 'HIGH',
      issue: 'Very low word count detected',
      fix: 'Ensure resume has sufficient content and detail',
      impact: 'May indicate parsing failure or insufficient content'
    });
    if (wordCount < 100) criticalFailures = true;
  }

  // ATS warnings from parser
  if (resumeParserData.ats_warnings && resumeParserData.ats_warnings.length > 0) {
    resumeParserData.ats_warnings.forEach(warning => {
      score -= 10;
      issues.push(warning);
      recommendations.push({
        priority: 'MEDIUM',
        issue: warning,
        fix: 'Address the specific formatting issue mentioned',
        impact: 'May reduce ATS compatibility'
      });
    });
  }

  return {
    score: Math.max(0, score),
    issues,
    criticalFailures,
    recommendations
  };
}

/**
 * Parse resume text into structured sections
 */
function parseResumeIntoSections(resumeText: string): ParsedResumeSections {
  const lines = resumeText.split('\n');
  const sections: ParsedResumeSections = {
    contact: null,
    summary: null,
    experience: null,
    education: null,
    skills: null,
    certifications: null,
    other: []
  };

  // Common section header patterns
  const sectionPatterns = {
    contact: /^(contact|personal|info|details|address|phone|email)$/i,
    summary: /^(summary|objective|profile|about|overview|professional\s+summary)$/i,
    experience: /^(experience|work|employment|professional|career|history|work\s+experience|professional\s+experience)$/i,
    education: /^(education|academic|degree|university|college|school|qualifications)$/i,
    skills: /^(skills|technical|technologies|competencies|expertise|abilities|technical\s+skills)$/i,
    certifications: /^(certifications|certificates|licenses|credentials|professional\s+development)$/i
  };

  let currentSection: string | null = null;
  let currentSectionStart = 0;
  let currentHeaderLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Check if this line is a section header
    let foundSection: string | null = null;
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        foundSection = sectionName;
        break;
      }
    }

    // If we found a new section header
    if (foundSection) {
      // Save the previous section if it exists
      if (currentSection && currentSectionStart < i) {
        const content = lines.slice(currentSectionStart, i).join('\n').trim();
        if (content) {
          const section: ResumeSection = {
            content,
            startLine: currentSectionStart,
            endLine: i - 1,
            headerLine: currentHeaderLine
          };

          if (currentSection in sections && currentSection !== 'other') {
            (sections as any)[currentSection] = section;
          } else {
            sections.other.push(section);
          }
        }
      }

      // Start new section
      currentSection = foundSection;
      currentSectionStart = i + 1;
      currentHeaderLine = i;
    }
  }

  // Handle the last section
  if (currentSection && currentSectionStart < lines.length) {
    const content = lines.slice(currentSectionStart).join('\n').trim();
    if (content) {
      const section: ResumeSection = {
        content,
        startLine: currentSectionStart,
        endLine: lines.length - 1,
        headerLine: currentHeaderLine
      };

      if (currentSection in sections && currentSection !== 'other') {
        (sections as any)[currentSection] = section;
      } else {
        sections.other.push(section);
      }
    }
  }

  // If no sections were detected, try to extract contact info from the beginning
  if (!sections.contact && !sections.summary && !sections.experience) {
    const firstLines = lines.slice(0, Math.min(10, lines.length)).join('\n');
    if (/@/.test(firstLines) || /\d{3}/.test(firstLines)) {
      sections.contact = {
        content: firstLines,
        startLine: 0,
        endLine: Math.min(9, lines.length - 1),
        headerLine: 0
      };
    }
  }

  return sections;
}

/**
 * Analyze structural compliance of resume
 */
function analyzeStructuralCompliance(resumeSections: ParsedResumeSections): StructuralCompliance {
  const requiredSections = ['contact', 'experience'];
  const expectedSections = ['summary', 'education', 'skills'];
  const optionalSections = ['certifications'];
  
  const sectionsFound: string[] = [];
  const missingCriticalSections: string[] = [];
  let score = 100;
  const recommendations: ATSRecommendation[] = [];

  // Check required sections
  requiredSections.forEach(sectionName => {
    if (resumeSections[sectionName as keyof ParsedResumeSections]) {
      sectionsFound.push(sectionName);
    } else {
      missingCriticalSections.push(sectionName);
      score -= 40; // Heavy penalty for missing critical sections
      recommendations.push({
        priority: 'CRITICAL',
        issue: `Missing required section: ${sectionName}`,
        fix: `Add a clearly labeled ${sectionName} section to your resume`,
        impact: 'ATS systems expect standard resume sections and may reject resumes without them'
      });
    }
  });

  // Check expected sections
  expectedSections.forEach(sectionName => {
    if (resumeSections[sectionName as keyof ParsedResumeSections]) {
      sectionsFound.push(sectionName);
    } else {
      score -= 15; // Moderate penalty for missing expected sections
      recommendations.push({
        priority: 'HIGH',
        issue: `Missing expected section: ${sectionName}`,
        fix: `Consider adding a ${sectionName} section to improve ATS compatibility`,
        impact: 'Expected sections help ATS systems categorize your information properly'
      });
    }
  });

  // Check optional sections
  optionalSections.forEach(sectionName => {
    if (resumeSections[sectionName as keyof ParsedResumeSections]) {
      sectionsFound.push(sectionName);
      score += 5; // Small bonus for optional sections
    }
  });

  // Analyze section order
  const expectedOrder = ['contact', 'summary', 'experience', 'education', 'skills', 'certifications'];
  const actualOrder = sectionsFound.filter(section => expectedOrder.includes(section));
  
  let orderScore = 100;
  let orderPenalty = 0;
  
  for (let i = 0; i < actualOrder.length - 1; i++) {
    const currentIndex = expectedOrder.indexOf(actualOrder[i]);
    const nextIndex = expectedOrder.indexOf(actualOrder[i + 1]);
    
    if (currentIndex > nextIndex) {
      orderPenalty += 10; // Penalty for out-of-order sections
    }
  }
  
  orderScore = Math.max(0, orderScore - orderPenalty);
  
  if (orderScore < 80) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Resume sections are not in standard order',
      fix: 'Reorganize sections in this order: Contact, Summary, Experience, Education, Skills, Certifications',
      impact: 'Standard section order helps ATS systems parse your resume more accurately'
    });
  }

  // Apply order score to overall score (20% weight)
  score = score * 0.8 + orderScore * 0.2;

  return {
    score: Math.max(0, Math.round(score)),
    sectionsFound,
    missingCriticalSections,
    sectionOrder: actualOrder,
    orderScore: Math.round(orderScore),
    recommendations
  };
}

/**
 * Enhanced keyword matching with context awareness and proximity scoring
 */
function findContextualKeywordMatches(
  keyword: string, 
  resumeSections: ParsedResumeSections,
  resumeText: string
): MatchDetail[] {
  const matches: MatchDetail[] = [];
  const variations = generateKeywordVariations(keyword);
  
  // Define section priorities for different keyword types
  const sectionPriorities = {
    skills: ['skills', 'summary', 'experience', 'other'],
    title: ['experience', 'summary', 'other'],
    certification: ['certifications', 'education', 'skills', 'other'],
    experience: ['experience', 'summary', 'other'],
    education: ['education', 'summary', 'other']
  };

  variations.forEach(variation => {
    const regex = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'gi');
    
    // Search in each section
    Object.entries(resumeSections).forEach(([sectionName, section]) => {
      if (!section || sectionName === 'other') return;
      
      const sectionMatches = section.content.match(regex);
      if (sectionMatches && sectionMatches.length > 0) {
        // Calculate proximity to section header
        const lines = section.content.split('\n');
        let bestProximity = 0;
        
        lines.forEach((line: string, lineIndex: number) => {
          if (regex.test(line)) {
            // Proximity decreases with distance from section start
            const proximity = Math.max(0, 100 - (lineIndex / lines.length) * 50);
            bestProximity = Math.max(bestProximity, proximity);
          }
        });

        matches.push({
          variation,
          location: sectionName as MatchDetail['location'],
          frequency: sectionMatches.length,
          proximity: bestProximity
        });
      }
    });

    // Also search in 'other' sections
    resumeSections.other.forEach(section => {
      const sectionMatches = section.content.match(regex);
      if (sectionMatches && sectionMatches.length > 0) {
        matches.push({
          variation,
          location: 'other',
          frequency: sectionMatches.length,
          proximity: 50 // Default proximity for unclassified sections
        });
      }
    });

    // Fallback: search in full text if no section matches found
    if (matches.length === 0) {
      const textMatches = resumeText.match(regex);
      if (textMatches && textMatches.length > 0) {
        matches.push({
          variation,
          location: 'other',
          frequency: textMatches.length,
          proximity: 25 // Low proximity for unsectioned matches
        });
      }
    }
  });

  return matches;
}

/**
 * Calculate context-aware keyword score
 */
function calculateContextScore(matches: MatchDetail[], keywordContext: string): number {
  if (matches.length === 0) return 0;

  let bestScore = 0;
  
  matches.forEach(match => {
    let baseScore = match.frequency * 10; // Base score from frequency
    
    // Context bonus: keywords found in relevant sections get higher scores
    const contextBonus = getContextBonus(match.location, keywordContext);
    baseScore *= (1 + contextBonus);
    
    // Proximity bonus: keywords near section headers get bonus
    const proximityBonus = match.proximity * 0.01; // 0-1 multiplier
    baseScore *= (1 + proximityBonus);
    
    bestScore = Math.max(bestScore, baseScore);
  });

  return Math.min(100, bestScore); // Cap at 100
}

/**
 * Get context bonus multiplier based on where keyword was found
 */
function getContextBonus(location: string, keywordContext: string): number {
  const contextMap: { [key: string]: { [key: string]: number } } = {
    skill: {
      skills: 0.5,      // 50% bonus for skills in skills section
      experience: 0.3,   // 30% bonus for skills in experience
      summary: 0.2,      // 20% bonus for skills in summary
      other: 0.1
    },
    title: {
      experience: 0.4,   // 40% bonus for job titles in experience
      summary: 0.3,      // 30% bonus for job titles in summary
      other: 0.1
    },
    certification: {
      certifications: 0.6, // 60% bonus for certs in cert section
      education: 0.3,      // 30% bonus for certs in education
      skills: 0.2,         // 20% bonus for certs in skills
      other: 0.1
    },
    experience: {
      experience: 0.4,   // 40% bonus for experience terms in experience
      summary: 0.2,      // 20% bonus for experience terms in summary
      other: 0.1
    },
    education: {
      education: 0.5,    // 50% bonus for education terms in education
      summary: 0.2,      // 20% bonus for education terms in summary
      other: 0.1
    }
  };

  return contextMap[keywordContext]?.[location] || 0;
}

/**
 * Enhanced keyword matching with word boundaries and synonyms
 */
function findKeywordMatches(keyword: string, text: string): MatchDetail[] {
  const matches: MatchDetail[] = [];
  const variations = generateKeywordVariations(keyword);
  
  variations.forEach(variation => {
    // Use word boundary regex for exact matching (no partial matches)
    const regex = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'gi');
    const textMatches = text.match(regex);
    
    if (textMatches && textMatches.length > 0) {
      matches.push({
        variation,
        location: 'other', // Default location for basic matching
        frequency: textMatches.length,
        proximity: 25 // Default proximity
      });
    }
  });

  return matches;
}

/**
 * Generate keyword variations including synonyms and abbreviations
 */
function generateKeywordVariations(keyword: string): string[] {
  const variations = [keyword];
  const keywordLower = keyword.toLowerCase();
  
  // Add known synonyms - Convert Map iteration to Array for ES5 compatibility
  const synonymEntries = Array.from(SYNONYM_MAP.entries());
  for (let i = 0; i < synonymEntries.length; i++) {
    const [key, synonyms] = synonymEntries[i];
    if (keywordLower === key || synonyms.includes(keywordLower)) {
      variations.push(key, ...synonyms);
    }
  }
  
  // Remove duplicates and return - Convert Set to Array for ES5 compatibility
  const uniqueVariations = Array.from(new Set(variations));
  return uniqueVariations;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract relevant keywords from job description using AI
 */
async function extractJobKeywordsWithAI(jobDescription: string): Promise<KeywordExtractionResult> {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Extract the most important keywords that an ATS would look for in a resume for this job.

Focus on:
1. Technical skills and technologies (programming languages, frameworks, tools)
2. Required qualifications and experience levels
3. Industry-specific terms and methodologies
4. Job titles and role-related terms

Return ONLY a JSON object with these exact keys:
{
  "technicalSkills": ["react", "javascript", "html", "css"],
  "qualifications": ["5+ years experience", "bachelor's degree"],
  "experienceTerms": ["frontend development", "team leadership"],
  "industryTerms": ["agile", "scrum", "ci/cd"],
  "jobTitles": ["tech lead", "frontend developer"]
}

Do not include common words like "job", "title", "company", "location", "responsibilities".`;

  const userPrompt = `Extract ATS-relevant keywords from this job description:

${jobDescription}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const keywords = JSON.parse(response) as KeywordExtractionResult;
    
    // Normalize keywords to lowercase
    return {
      technicalSkills: keywords.technicalSkills.map(k => k.toLowerCase()),
      qualifications: keywords.qualifications.map(k => k.toLowerCase()),
      experienceTerms: keywords.experienceTerms.map(k => k.toLowerCase()),
      industryTerms: keywords.industryTerms.map(k => k.toLowerCase()),
      jobTitles: keywords.jobTitles.map(k => k.toLowerCase())
    };

  } catch (error) {
    console.error('AI keyword extraction failed:', error);
    
    // Fallback to basic extraction
    return extractKeywordsFallback(jobDescription);
  }
}

/**
 * Fallback keyword extraction if AI fails
 */
function extractKeywordsFallback(jobDescription: string): KeywordExtractionResult {
  const text = jobDescription.toLowerCase();
  
  // Common technical skills
  const technicalSkills = [
    'javascript', 'react', 'angular', 'vue', 'html', 'css', 'typescript',
    'node.js', 'python', 'java', 'redux', 'mobx', 'api', 'rest', 'graphql'
  ].filter(skill => text.includes(skill));

  // Common qualifications
  const qualifications = [
    'bachelor', 'master', 'degree', 'years experience', 'senior', 'lead'
  ].filter(qual => text.includes(qual));

  // Experience terms
  const experienceTerms = [
    'frontend', 'backend', 'full stack', 'development', 'engineering'
  ].filter(term => text.includes(term));

  // Industry terms
  const industryTerms = [
    'agile', 'scrum', 'ci/cd', 'testing', 'code review'
  ].filter(term => text.includes(term));

  // Job titles
  const jobTitles = [
    'developer', 'engineer', 'tech lead', 'frontend developer'
  ].filter(title => text.includes(title));

  return {
    technicalSkills,
    qualifications,
    experienceTerms,
    industryTerms,
    jobTitles
  };
}

/**
 * Enhanced keyword matching analysis with context awareness
 */
function analyzeKeywordMatch(
  resumeText: string, 
  jobKeywords: KeywordExtractionResult,
  resumeSections: ParsedResumeSections
) {
  // Combine all relevant keywords with their contexts
  const keywordContexts = [
    ...jobKeywords.technicalSkills.map(k => ({ keyword: k, context: 'skill' })),
    ...jobKeywords.qualifications.map(k => ({ keyword: k, context: 'education' })),
    ...jobKeywords.experienceTerms.map(k => ({ keyword: k, context: 'experience' })),
    ...jobKeywords.industryTerms.map(k => ({ keyword: k, context: 'experience' })),
    ...jobKeywords.jobTitles.map(k => ({ keyword: k, context: 'title' }))
  ];

  const matched: string[] = [];
  const missing: string[] = [];
  const recommendations: ATSRecommendation[] = [];
  let totalScore = 0;

  // Enhanced keyword matching with context awareness
  keywordContexts.forEach(({ keyword, context }) => {
    const matches = findContextualKeywordMatches(keyword, resumeSections, resumeText);
    if (matches.length > 0) {
      matched.push(keyword);
      // Calculate context-aware score for this keyword
      const keywordScore = calculateContextScore(matches, context);
      totalScore += keywordScore;
    } else {
      missing.push(keyword);
    }
  });

  // Calculate overall score
  const averageScore = keywordContexts.length > 0 ? totalScore / keywordContexts.length : 0;
  const score = Math.round(Math.min(100, averageScore));
  
  // Generate context-aware recommendations
  if (score < 60) {
    const topMissing = missing.slice(0, 3);
    recommendations.push({
      priority: 'HIGH',
      issue: `Missing key requirements: ${topMissing.join(', ')}`,
      fix: 'Add these skills to relevant sections (skills in Skills section, experience terms in Experience section)',
      impact: 'May not pass initial keyword screening'
    });
  }

  if (missing.length > 5) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: `Missing ${missing.length} relevant keywords`,
      fix: 'Review job description and incorporate more relevant terms in appropriate sections',
      impact: 'Lower keyword match score affects ATS ranking'
    });
  }

  // Check for context mismatches
  const skillsInWrongSection = checkSkillsPlacement(jobKeywords.technicalSkills, resumeSections);
  if (skillsInWrongSection.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Technical skills found outside Skills section',
      fix: 'Move technical skills to a dedicated Skills section for better ATS recognition',
      impact: 'Skills may not be properly categorized by ATS systems'
    });
  }

  return { score, matched, missing, recommendations };
}

/**
 * Check if skills are properly placed in skills section
 */
function checkSkillsPlacement(technicalSkills: string[], resumeSections: ParsedResumeSections): string[] {
  const misplacedSkills: string[] = [];
  
  if (!resumeSections.skills) {
    return technicalSkills; // All skills are misplaced if no skills section exists
  }

  technicalSkills.forEach(skill => {
    const skillsMatches = findContextualKeywordMatches(skill, resumeSections, '');
    const hasSkillsSection = skillsMatches.some(match => match.location === 'skills');
    const hasOtherSections = skillsMatches.some(match => match.location !== 'skills');
    
    if (!hasSkillsSection && hasOtherSections) {
      misplacedSkills.push(skill);
    }
  });

  return misplacedSkills;
}

/**
 * Enhanced skills alignment analysis with context awareness
 */
function analyzeSkillsAlignment(
  resumeText: string, 
  jobKeywords: KeywordExtractionResult,
  resumeSections: ParsedResumeSections
) {
  const found: string[] = [];
  const missing: string[] = [];
  const recommendations: ATSRecommendation[] = [];

  // Focus on technical skills for this analysis
  const technicalSkills = jobKeywords.technicalSkills;
  let totalContextScore = 0;

  technicalSkills.forEach(skill => {
    const matches = findContextualKeywordMatches(skill, resumeSections, resumeText);
    if (matches.length > 0) {
      found.push(skill);
      // Calculate context score for skills (prefer skills section)
      const contextScore = calculateContextScore(matches, 'skill');
      totalContextScore += contextScore;
    } else {
      missing.push(skill);
    }
  });

  // Calculate score based on both quantity and context quality
  const quantityScore = technicalSkills.length > 0 ? (found.length / technicalSkills.length) * 100 : 100;
  const qualityScore = found.length > 0 ? totalContextScore / found.length : 0;
  const score = Math.round((quantityScore * 0.7) + (qualityScore * 0.3)); // 70% quantity, 30% quality

  // Generate context-aware recommendations
  if (score < 70) {
    const topMissing = missing.slice(0, 3);
    recommendations.push({
      priority: 'HIGH',
      issue: `Missing technical skills: ${topMissing.join(', ')}`,
      fix: 'Add these technical skills to your Skills section if you have experience with them',
      impact: 'Technical skills are heavily weighted in ATS scoring'
    });
  }

  // Check if skills section exists
  if (!resumeSections.skills && found.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'No dedicated Skills section found',
      fix: 'Create a Skills section to properly showcase your technical abilities',
      impact: 'ATS systems expect skills to be in a dedicated section for proper categorization'
    });
  }

  return { score, found, missing, recommendations };
}

/**
 * Analyze format compatibility
 */
function analyzeFormatCompatibility(resumeText: string) {
  let score = 100;
  const recommendations: ATSRecommendation[] = [];

  // Check for potential formatting issues in text
  const issues = [];

  // Check for excessive special characters
  const specialCharCount = (resumeText.match(/[^\w\s.,;:()\-]/g) || []).length;
  if (specialCharCount > resumeText.length * 0.02) { // More than 2% special chars
    score -= 20;
    issues.push('Excessive special characters detected');
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Too many special characters',
      fix: 'Use standard punctuation and avoid decorative symbols',
      impact: 'May cause parsing errors in some ATS systems'
    });
  }

  // Check for very short lines (may indicate formatting issues)
  const lines = resumeText.split('\n');
  const shortLines = lines.filter(line => line.trim().length > 0 && line.trim().length < 10).length;
  if (shortLines > lines.length * 0.3) {
    score -= 15;
    issues.push('Many short lines detected - possible formatting issues');
    recommendations.push({
      priority: 'LOW',
      issue: 'Fragmented text structure detected',
      fix: 'Ensure proper sentence structure and formatting',
      impact: 'May indicate parsing or formatting issues'
    });
  }

  return { score: Math.max(0, score), recommendations };
}

/**
 * Analyze contact information completeness
 */
function analyzeContactInfo(resumeText: string) {
  let score = 0;
  const recommendations: ATSRecommendation[] = [];

  // Check for email
  const hasEmail = /@[\w.-]+\.\w+/.test(resumeText);
  if (hasEmail) score += 60;
  else recommendations.push({
    priority: 'HIGH',
    issue: 'No email address found',
    fix: 'Include a professional email address',
    impact: 'Recruiters cannot contact you'
  });

  // Check for phone
  const hasPhone = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(resumeText);
  if (hasPhone) score += 40;
  else recommendations.push({
    priority: 'MEDIUM',
    issue: 'No phone number found',
    fix: 'Include a phone number',
    impact: 'Limits contact options for recruiters'
  });

  return { score: Math.min(100, score), recommendations };
}

/**
 * Analyze bonus features
 */
function analyzeBonusFeatures(resumeText: string, jobKeywords: KeywordExtractionResult) {
  let score = 0;
  const found: string[] = [];
  const recommendations: ATSRecommendation[] = [];

  // Check for matching job titles using enhanced matching
  jobKeywords.jobTitles.forEach(title => {
    const matches = findKeywordMatches(title, resumeText);
    if (matches.length > 0) {
      score += 40;
      found.push(`Job Title: ${title}`);
    }
  });

  // Check for certifications
  const certifications = extractCertifications(resumeText);
  if (certifications.length > 0) {
    score += 30;
    found.push(...certifications.map(cert => `Certification: ${cert}`));
  }

  // Check for years of experience
  const experienceYears = extractExperienceYears(resumeText);
  if (experienceYears > 0) {
    score += 30;
    found.push(`Experience: ${experienceYears} years`);
  }

  // Recommendations
  if (score < 50) {
    recommendations.push({
      priority: 'LOW',
      issue: 'Limited bonus features detected',
      fix: 'Consider highlighting relevant job titles and experience',
      impact: 'Missing opportunities for additional ATS scoring'
    });
  }
  if (certifications.length === 0) {
    recommendations.push({
      priority: 'LOW',
      issue: 'No certifications found',
      fix: 'Add relevant professional certifications if available',
      impact: 'Certifications can boost ATS scores'
    });
  }

  return { score: Math.min(100, score), found, recommendations };
}

/**
 * Determine pass/fail status based on realistic ATS behavior
 */
function determinePassFailStatus(
  overallScore: number,
  criticalFailures: boolean,
  missingKeywords: string[]
): 'PASS' | 'FAIL' | 'REVIEW' {
  // Automatic failures
  if (criticalFailures) return 'FAIL';
  if (overallScore < ATS_CONFIG.thresholds.autoReject) return 'FAIL';
  if (missingKeywords.length > 5) return 'FAIL'; // Too many missing keywords

  // Clear passes
  if (overallScore >= ATS_CONFIG.thresholds.autoPass && missingKeywords.length <= 2) return 'PASS';

  // Human review needed
  return 'REVIEW';
}

/**
 * Main ATS compatibility analysis function with enhanced features
 */
export async function analyzeATSCompatibility(
  resumeText: string,
  jobDescription: string,
  resumeParserData?: ResumeParserSuccessResponse
): Promise<ATSResult> {
  try {
    // Validate inputs
    if (!resumeText.trim()) {
      return {
        success: false,
        error: 'Resume text is required',
        details: 'Cannot analyze ATS compatibility without resume content'
      };
    }

    if (!jobDescription.trim()) {
      return {
        success: false,
        error: 'Job description is required',
        details: 'Cannot analyze ATS compatibility without job description'
      };
    }

    console.log('Starting enhanced ATS compatibility analysis...');
    console.log('Resume parser data:', resumeParserData);
    // Step 1: Analyze parseability using enhanced resume parser data
    const parseabilityAnalysis = analyzeParseability(resumeParserData);
    console.log('Parseability analysis complete:', parseabilityAnalysis.score);

    // If critical parsing failures, return early with rejection
    if (parseabilityAnalysis.criticalFailures) {
      return {
        success: true,
        overallScore: parseabilityAnalysis.score,
        passFailStatus: 'FAIL',
        breakdown: {
          parseability: parseabilityAnalysis.score,
          keywordMatch: 0,
          skillsAlignment: 0,
          formatCompatibility: 0,
          contactInfo: 0,
          bonusFeatures: 0
        },
        recommendations: parseabilityAnalysis.recommendations,
        missingKeywords: [],
        matchedKeywords: [],
        skillsFound: [],
        skillsMissing: [],
        bonusItems: [],
        criticalIssues: parseabilityAnalysis.issues
      };
    }

    // Step 2: Extract job keywords using AI
    const jobKeywords = await extractJobKeywordsWithAI(jobDescription);
    console.log('Extracted job keywords:', jobKeywords);

    // Step 3: Parse resume into sections for context-aware analysis
    const resumeSections = parseResumeIntoSections(resumeText);
    console.log('Parsed resume sections:', Object.keys(resumeSections).filter(key => resumeSections[key as keyof ParsedResumeSections] !== null));

    // Step 4: Perform individual analyses with enhanced matching
    const keywordAnalysis = analyzeKeywordMatch(resumeText, jobKeywords, resumeSections);
    const skillsAnalysis = analyzeSkillsAlignment(resumeText, jobKeywords, resumeSections);
    const structuralAnalysis = analyzeStructuralCompliance(resumeSections);
    const formatAnalysis = analyzeFormatCompatibility(resumeText);
    const contactAnalysis = analyzeContactInfo(resumeText);
    const bonusAnalysis = analyzeBonusFeatures(resumeText, jobKeywords);

    // Step 5: Calculate overall score with realistic weights (including structural compliance)
    const breakdown: ATSScoreBreakdown = {
      parseability: parseabilityAnalysis.score,
      keywordMatch: keywordAnalysis.score,
      skillsAlignment: skillsAnalysis.score,
      formatCompatibility: Math.round((formatAnalysis.score * 0.7) + (structuralAnalysis.score * 0.3)), // Combine format and structure
      contactInfo: contactAnalysis.score,
      bonusFeatures: bonusAnalysis.score
    };

    const overallScore = Math.round(
      breakdown.parseability * ATS_CONFIG.weights.parseability +
      breakdown.keywordMatch * ATS_CONFIG.weights.keywordMatch +
      breakdown.skillsAlignment * ATS_CONFIG.weights.skillsAlignment +
      breakdown.formatCompatibility * ATS_CONFIG.weights.formatCompatibility +
      breakdown.contactInfo * ATS_CONFIG.weights.contactInfo +
      breakdown.bonusFeatures * ATS_CONFIG.weights.bonusFeatures
    );

    // Step 6: Determine pass/fail status
    const passFailStatus = determinePassFailStatus(
      overallScore,
      parseabilityAnalysis.criticalFailures,
      keywordAnalysis.missing
    );

    // Step 7: Compile all recommendations with priorities
    const allRecommendations = [
      ...parseabilityAnalysis.recommendations,
      ...keywordAnalysis.recommendations,
      ...skillsAnalysis.recommendations,
      ...structuralAnalysis.recommendations,
      ...formatAnalysis.recommendations,
      ...contactAnalysis.recommendations,
      ...bonusAnalysis.recommendations
    ].sort((a, b) => {
      const priorityOrder: { [key in ATSRecommendation['priority']]: number } = { 
        'CRITICAL': 0, 
        'HIGH': 1, 
        'MEDIUM': 2, 
        'LOW': 3 
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    console.log(`Enhanced ATS analysis complete. Overall score: ${overallScore}/100, Status: ${passFailStatus}`);
    console.log(`Structural compliance: ${structuralAnalysis.score}/100, Sections found: ${structuralAnalysis.sectionsFound.join(', ')}`);

    return {
      success: true,
      overallScore,
      passFailStatus,
      breakdown,
      recommendations: allRecommendations,
      missingKeywords: keywordAnalysis.missing,
      matchedKeywords: keywordAnalysis.matched,
      skillsFound: skillsAnalysis.found,
      skillsMissing: skillsAnalysis.missing,
      bonusItems: bonusAnalysis.found,
      criticalIssues: parseabilityAnalysis.issues
    };

  } catch (error) {
    console.error('Enhanced ATS analysis error:', error);
    return {
      success: false,
      error: 'Failed to analyze ATS compatibility',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Extract certifications from text (helper function)
 */
function extractCertifications(text: string): string[] {
  const certPatterns = [
    /(?:aws|azure|gcp|google cloud)\s*(?:certified|certification)/gi,
    /(?:pmp|cissp|cisa|cism|comptia|cisco|microsoft|oracle|salesforce|scrum master|agile|six sigma)\b/gi,
    /(?:certified|certification)\s+(?:in\s+)?[\w\s]+/gi
  ];

  const certifications: string[] = [];
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      certifications.push(...matches.map(match => match.trim()));
    }
  });

  // Convert to array and remove duplicates
  return Array.from(new Set(certifications));
}

/**
 * Extract years of experience from text (helper function)
 */
function extractExperienceYears(text: string): number {
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
    /(\d+)\+?\s*years?\s*in/gi,
    /experience\s*:\s*(\d+)\+?\s*years?/gi
  ];

  let maxYears = 0;
  experiencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const years = parseInt(match.match(/\d+/)?.[0] || '0');
        maxYears = Math.max(maxYears, years);
      });
    }
  });

  return maxYears;
} 