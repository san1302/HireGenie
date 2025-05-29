// ATS (Applicant Tracking System) Analyzer Service
// AI-powered analysis for realistic ATS compatibility scoring

import OpenAI from 'openai';

// TypeScript interfaces for ATS analysis
export interface ATSScoreBreakdown {
  keywordMatch: number;        // 0-100: Percentage of relevant keywords found
  skillsAlignment: number;     // 0-100: Technical skills matching score
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

// Configuration for ATS analysis
const ATS_CONFIG = {
  weights: {
    keywordMatch: 0.40,        // 40% weight - Relevant keywords
    skillsAlignment: 0.30,     // 30% weight - Technical skills matching
    formatCompatibility: 0.20, // 20% weight - Format and structure
    contactInfo: 0.05,         // 5% weight - Contact information
    bonusFeatures: 0.05        // 5% weight - Job titles, certifications, etc.
  }
};

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
 * Analyze keyword matching between resume and job requirements
 */
function analyzeKeywordMatch(resumeText: string, jobKeywords: KeywordExtractionResult) {
  const resumeLower = resumeText.toLowerCase();
  
  // Combine all relevant keywords
  const allKeywords = [
    ...jobKeywords.technicalSkills,
    ...jobKeywords.qualifications,
    ...jobKeywords.experienceTerms,
    ...jobKeywords.industryTerms,
    ...jobKeywords.jobTitles
  ];

  const matched: string[] = [];
  const missing: string[] = [];

  allKeywords.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  // Calculate score - more realistic thresholds
  const matchPercentage = allKeywords.length > 0 ? (matched.length / allKeywords.length) * 100 : 0;
  
  // Realistic scoring: 60%+ match is good, 80%+ is excellent
  let score = Math.round(matchPercentage);
  
  const recommendations: string[] = [];
  if (score < 60) {
    const topMissing = missing.slice(0, 3);
    recommendations.push(`Include key skills: ${topMissing.join(', ')}`);
  }
  if (score < 40) {
    recommendations.push('Consider adding more relevant technical skills from the job description');
  }
  if (score < 20) {
    recommendations.push('Your resume may not be a good match for this role - consider highlighting relevant experience');
  }

  return { score, matched, missing, recommendations };
}

/**
 * Analyze technical skills alignment
 */
function analyzeSkillsAlignment(resumeText: string, jobKeywords: KeywordExtractionResult) {
  const resumeLower = resumeText.toLowerCase();
  
  const found = jobKeywords.technicalSkills.filter(skill => 
    resumeLower.includes(skill)
  );
  
  const missing = jobKeywords.technicalSkills.filter(skill => 
    !resumeLower.includes(skill)
  );

  // Skills are critical - stricter scoring
  const score = jobKeywords.technicalSkills.length > 0 ? 
    Math.round((found.length / jobKeywords.technicalSkills.length) * 100) : 100;

  const recommendations: string[] = [];
  if (score < 70) {
    const topMissing = missing.slice(0, 2);
    recommendations.push(`Add missing technical skills: ${topMissing.join(', ')}`);
  }
  if (score < 50) {
    recommendations.push('Significant skills gap - consider gaining experience in required technologies');
  }

  return { score, found, missing, recommendations };
}

/**
 * Analyze format compatibility (simplified but realistic)
 */
function analyzeFormatCompatibility(resumeText: string) {
  let score = 100;
  const recommendations: string[] = [];

  // Check for basic sections (more lenient)
  const hasContact = /email|phone|@/.test(resumeText);
  const hasExperience = /experience|work|employment|position|role/i.test(resumeText);
  const hasSkills = /skills|technical|technologies|programming/i.test(resumeText);

  if (!hasContact) {
    score -= 30;
    recommendations.push('Include clear contact information');
  }
  if (!hasExperience) {
    score -= 40;
    recommendations.push('Add work experience section');
  }
  if (!hasSkills) {
    score -= 30;
    recommendations.push('Include a technical skills section');
  }

  return { score: Math.max(0, score), recommendations };
}

/**
 * Analyze contact information completeness
 */
function analyzeContactInfo(resumeText: string) {
  let score = 0;
  const recommendations: string[] = [];

  // Check for email
  const hasEmail = /@[\w.-]+\.\w+/.test(resumeText);
  if (hasEmail) score += 60;
  else recommendations.push('Include a professional email address');

  // Check for phone
  const hasPhone = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/.test(resumeText);
  if (hasPhone) score += 40;
  else recommendations.push('Include a phone number');

  return { score: Math.min(100, score), recommendations };
}

/**
 * Analyze bonus features
 */
function analyzeBonusFeatures(resumeText: string, jobKeywords: KeywordExtractionResult) {
  let score = 0;
  const found: string[] = [];
  const recommendations: string[] = [];

  // Check for matching job titles
  const matchingTitles = jobKeywords.jobTitles.filter(title => 
    resumeText.toLowerCase().includes(title)
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

  // Check for years of experience
  const experienceYears = extractExperienceYears(resumeText);
  if (experienceYears > 0) {
    score += 30;
    found.push(`Experience: ${experienceYears} years`);
  }

  // Recommendations
  if (score < 50) {
    recommendations.push('Consider highlighting relevant job titles and experience');
  }
  if (certifications.length === 0) {
    recommendations.push('Add relevant professional certifications if available');
  }

  return { score: Math.min(100, score), found, recommendations };
}

/**
 * Main ATS compatibility analysis function
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

    console.log('Starting AI-powered ATS compatibility analysis...');

    // Extract job keywords using AI
    const jobKeywords = await extractJobKeywordsWithAI(jobDescription);
    console.log('Extracted job keywords:', jobKeywords);

    // Perform individual analyses
    const keywordAnalysis = analyzeKeywordMatch(resumeText, jobKeywords);
    const skillsAnalysis = analyzeSkillsAlignment(resumeText, jobKeywords);
    const formatAnalysis = analyzeFormatCompatibility(resumeText);
    const contactAnalysis = analyzeContactInfo(resumeText);
    const bonusAnalysis = analyzeBonusFeatures(resumeText, jobKeywords);

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

    console.log(`AI-powered ATS analysis complete. Overall score: ${overallScore}/100`);

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

  return Array.from(new Set(certifications)); // Remove duplicates
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