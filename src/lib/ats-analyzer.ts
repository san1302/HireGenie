// ATS (Applicant Tracking System) Analyzer Service
// Analyzes resume compatibility with ATS systems and provides scoring

import { generateCoverLetter } from './openai';

// TypeScript interfaces for ATS analysis
export interface ATSScoreBreakdown {
  keywordMatch: number;        // 0-100: Percentage of job keywords found in resume
  skillsAlignment: number;     // 0-100: Skills matching score
  formatCompatibility: number; // 0-100: Format and structure score
  contactInfo: number;        // 0-100: Contact information completeness
  bonusFeatures: number;      // 0-100: Job titles, certifications, etc.
}

export interface ATSAnalysisResult {
  success: true;
  overallScore: number;       // 0-100: Weighted average of all scores
  breakdown: ATSScoreBreakdown;
  recommendations: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  skillsFound: string[];
  skillsMissing: string[];
  bonusItems: string[];       // Found job titles, certifications, etc.
}

export interface ATSAnalysisError {
  success: false;
  error: string;
  details?: string;
}

export type ATSResult = ATSAnalysisResult | ATSAnalysisError;

// Configuration for ATS analysis
const ATS_CONFIG = {
  weights: {
    keywordMatch: 0.40,        // 40% weight - Job Description terms
    skillsAlignment: 0.30,     // 30% weight - Skills matching
    formatCompatibility: 0.20, // 20% weight - Format and structure
    contactInfo: 0.05,         // 5% weight - Contact information
    bonusFeatures: 0.05        // 5% weight - Job titles, certifications, etc.
  },
  minKeywordLength: 3,
  commonWords: new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'
  ])
};

/**
 * Analyze ATS compatibility of resume against job description
 */
export async function analyzeATSCompatibility(
  resumeText: string,
  jobDescription: string
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

    console.log('Starting ATS compatibility analysis...');

    // Perform individual analyses
    const keywordAnalysis = analyzeKeywordMatch(resumeText, jobDescription);
    const skillsAnalysis = await analyzeSkillsAlignment(resumeText, jobDescription);
    const formatAnalysis = analyzeFormatCompatibility(resumeText);
    const contactAnalysis = analyzeContactInfo(resumeText);
    const bonusAnalysis = analyzeBonusFeatures(resumeText, jobDescription);

    // Calculate overall score
    const breakdown: ATSScoreBreakdown = {
      keywordMatch: keywordAnalysis.score,
      skillsAlignment: skillsAnalysis.score,
      formatCompatibility: formatAnalysis.score,
      contactInfo: contactAnalysis.score,
      bonusFeatures: bonusAnalysis.score
    };

    const overallScore = Math.round(
      breakdown.keywordMatch * ATS_CONFIG.weights.keywordMatch +
      breakdown.skillsAlignment * ATS_CONFIG.weights.skillsAlignment +
      breakdown.formatCompatibility * ATS_CONFIG.weights.formatCompatibility +
      breakdown.contactInfo * ATS_CONFIG.weights.contactInfo +
      breakdown.bonusFeatures * ATS_CONFIG.weights.bonusFeatures
    );

    // Compile recommendations
    const recommendations = [
      ...keywordAnalysis.recommendations,
      ...skillsAnalysis.recommendations,
      ...formatAnalysis.recommendations,
      ...contactAnalysis.recommendations,
      ...bonusAnalysis.recommendations
    ];

    console.log(`ATS analysis complete. Overall score: ${overallScore}/100`);

    return {
      success: true,
      overallScore,
      breakdown,
      recommendations,
      missingKeywords: keywordAnalysis.missing,
      matchedKeywords: keywordAnalysis.matched,
      skillsFound: skillsAnalysis.found,
      skillsMissing: skillsAnalysis.missing,
      bonusItems: bonusAnalysis.found
    };

  } catch (error) {
    console.error('ATS analysis error:', error);
    return {
      success: false,
      error: 'Failed to analyze ATS compatibility',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Analyze keyword matching between resume and job description (40% weight)
 */
function analyzeKeywordMatch(resumeText: string, jobDescription: string) {
  const resumeWords = extractKeywords(resumeText.toLowerCase());
  const jobWords = extractKeywords(jobDescription.toLowerCase());

  const matched: string[] = [];
  const missing: string[] = [];

  // Use Array operations instead of Set iteration
  jobWords.forEach(keyword => {
    if (resumeWords.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const score = jobWords.length > 0 ? Math.round((matched.length / jobWords.length) * 100) : 0;
  
  const recommendations: string[] = [];
  if (score < 70) {
    recommendations.push(`Include more relevant keywords from the job description (${missing.slice(0, 5).join(', ')})`);
  }
  if (score < 50) {
    recommendations.push('Consider restructuring your resume to better match the job requirements');
  }
  if (score < 30) {
    recommendations.push('Your resume lacks key terms from the job description - this is critical for ATS systems');
  }

  return { score, matched, missing, recommendations };
}

/**
 * Analyze skills alignment using AI (30% weight)
 */
async function analyzeSkillsAlignment(resumeText: string, jobDescription: string) {
  try {
    // For now, use a simplified approach without OpenAI to avoid additional API calls
    // TODO: Implement OpenAI-based skills extraction in future iteration
    
    const resumeSkills = extractSkillsBasic(resumeText);
    const jobSkills = extractSkillsBasic(jobDescription);
    
    const found = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    const missing = jobSkills.filter(skill => 
      !resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(resumeSkill.toLowerCase())
      )
    );

    const score = jobSkills.length > 0 ? Math.round((found.length / jobSkills.length) * 100) : 0;

    const recommendations: string[] = [];
    if (score < 80) {
      recommendations.push(`Add missing skills: ${missing.slice(0, 3).join(', ')}`);
    }
    if (score < 60) {
      recommendations.push('Consider gaining experience in the key skills mentioned in the job description');
    }
    if (score < 40) {
      recommendations.push('Significant skills gap - focus on developing the required technical competencies');
    }

    return { score, found, missing, recommendations };

  } catch (error) {
    console.error('Skills analysis error:', error);
    // Fallback to basic analysis
    return { score: 50, found: [], missing: [], recommendations: ['Unable to perform detailed skills analysis'] };
  }
}

/**
 * Analyze format compatibility (20% weight)
 */
function analyzeFormatCompatibility(resumeText: string) {
  let score = 100;
  const recommendations: string[] = [];

  // Check for proper sections
  const hasContactSection = /contact|email|phone|address/i.test(resumeText);
  const hasExperienceSection = /experience|work|employment|career/i.test(resumeText);
  const hasEducationSection = /education|degree|university|college/i.test(resumeText);
  const hasSkillsSection = /skills|technical|competencies/i.test(resumeText);

  if (!hasContactSection) {
    score -= 20;
    recommendations.push('Add a clear contact information section');
  }
  if (!hasExperienceSection) {
    score -= 30;
    recommendations.push('Include a work experience section');
  }
  if (!hasEducationSection) {
    score -= 20;
    recommendations.push('Add an education section');
  }
  if (!hasSkillsSection) {
    score -= 20;
    recommendations.push('Include a skills section');
  }

  // Check for problematic formatting
  const hasSpecialChars = /[^\w\s\-.,()@]/g.test(resumeText);
  if (hasSpecialChars) {
    score -= 10;
    recommendations.push('Avoid special characters that may not parse correctly');
  }

  return { score: Math.max(0, score), recommendations };
}

/**
 * Analyze contact information completeness (5% weight)
 */
function analyzeContactInfo(resumeText: string) {
  let score = 0;
  const recommendations: string[] = [];

  // Check for email
  const hasEmail = /@[\w.-]+\.\w+/.test(resumeText);
  if (hasEmail) score += 50;
  else recommendations.push('Include a professional email address');

  // Check for phone
  const hasPhone = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(resumeText);
  if (hasPhone) score += 30;
  else recommendations.push('Include a phone number');

  // Check for location
  const hasLocation = /(city|state|country|address|location)/i.test(resumeText);
  if (hasLocation) score += 20;
  else recommendations.push('Include your location (city, state)');

  return { score: Math.min(100, score), recommendations };
}

/**
 * Analyze bonus features - Job titles, certifications, etc. (5% weight)
 */
function analyzeBonusFeatures(resumeText: string, jobDescription: string) {
  let score = 0;
  const found: string[] = [];
  const recommendations: string[] = [];

  // Extract job titles from job description
  const jobTitles = extractJobTitles(jobDescription);
  const resumeTitles = extractJobTitles(resumeText);
  
  // Check for matching job titles
  const matchingTitles = jobTitles.filter(title => 
    resumeTitles.some(resumeTitle => 
      resumeTitle.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(resumeTitle.toLowerCase())
    )
  );
  
  if (matchingTitles.length > 0) {
    score += 40;
    found.push(...matchingTitles.map(title => `Job Title: ${title}`));
  }

  // Check for certifications
  const certifications = extractCertifications(resumeText);
  if (certifications.length > 0) {
    score += 30;
    found.push(...certifications.map(cert => `Certification: ${cert}`));
  }

  // Check for industry keywords
  const industryKeywords = extractIndustryKeywords(resumeText, jobDescription);
  if (industryKeywords.length > 0) {
    score += 20;
    found.push(...industryKeywords.map(keyword => `Industry Term: ${keyword}`));
  }

  // Check for years of experience
  const experienceYears = extractExperienceYears(resumeText);
  if (experienceYears > 0) {
    score += 10;
    found.push(`Experience: ${experienceYears} years`);
  }

  // Recommendations
  if (score < 50) {
    recommendations.push('Consider adding relevant certifications or highlighting job titles');
  }
  if (matchingTitles.length === 0) {
    recommendations.push('Include job titles that match the target role');
  }
  if (certifications.length === 0) {
    recommendations.push('Add relevant professional certifications if you have them');
  }

  return { score: Math.min(100, score), found, recommendations };
}

/**
 * Extract job titles from text
 */
function extractJobTitles(text: string): string[] {
  const titlePatterns = [
    /(?:senior|junior|lead|principal|staff|associate)?\s*(?:software|web|mobile|frontend|backend|full.?stack|data|machine learning|ai|devops|cloud|security|qa|test|product|project|program|engineering|technical|systems|network|database|ui|ux|design)\s*(?:engineer|developer|architect|analyst|manager|director|specialist|consultant|lead|coordinator)/gi,
    /(?:ceo|cto|cfo|vp|director|manager|coordinator|specialist|analyst|consultant|associate|intern)\b/gi
  ];

  const titles: string[] = [];
  titlePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      titles.push(...matches.map(match => match.trim()));
    }
  });

  return Array.from(new Set(titles)); // Remove duplicates
}

/**
 * Extract certifications from text
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

  return Array.from(new Set(certifications)); // Remove duplicates
}

/**
 * Extract industry-specific keywords
 */
function extractIndustryKeywords(resumeText: string, jobDescription: string): string[] {
  const industryTerms = [
    'fintech', 'healthcare', 'e-commerce', 'saas', 'b2b', 'b2c', 'startup', 'enterprise',
    'agile', 'scrum', 'kanban', 'ci/cd', 'microservices', 'api', 'rest', 'graphql',
    'machine learning', 'artificial intelligence', 'blockchain', 'cryptocurrency',
    'cloud computing', 'serverless', 'containerization', 'kubernetes', 'docker'
  ];

  const jobTerms = industryTerms.filter(term => 
    jobDescription.toLowerCase().includes(term.toLowerCase())
  );

  const matchingTerms = jobTerms.filter(term => 
    resumeText.toLowerCase().includes(term.toLowerCase())
  );

  return matchingTerms;
}

/**
 * Extract years of experience from text
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

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length >= ATS_CONFIG.minKeywordLength && 
      !ATS_CONFIG.commonWords.has(word.toLowerCase())
    )
    .map(word => word.toLowerCase());

  // Remove duplicates by converting to Set and back to Array
  return Array.from(new Set(words));
}

/**
 * Basic skills extraction (to be enhanced with AI in future)
 */
function extractSkillsBasic(text: string): string[] {
  const commonSkills = [
    // Technical skills
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
    'typescript', 'angular', 'vue', 'php', 'c++', 'c#', 'ruby', 'go', 'rust',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'jenkins', 'terraform',
    
    // Soft skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'project management', 'agile', 'scrum', 'collaboration', 'creativity',
    
    // Business skills
    'marketing', 'sales', 'finance', 'accounting', 'operations', 'strategy',
    'business development', 'customer service', 'data analysis', 'reporting'
  ];

  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => textLower.includes(skill));
} 