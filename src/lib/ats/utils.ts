/**
 * Utility functions extracted from the original ATS analyzer
 * These functions handle parseability, structural analysis, format checking, etc.
 */

import type {
  ATSRecommendation,
  ParsedResumeSections,
  ResumeSection,
  StructuralCompliance,
  EnhancedKeywordMatch
} from './types';
import type { ResumeParserSuccessResponse } from '../resume-parser';

/**
 * Analyze parseability using enhanced resume parser data
 */
export function analyzeParseability(resumeParserData?: ResumeParserSuccessResponse): {
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
export function parseResumeIntoSections(resumeText: string): ParsedResumeSections {
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

  // If no sections were detected, put everything in 'other'
  if (!sections.contact && !sections.summary && !sections.experience && 
      !sections.education && !sections.skills && !sections.certifications && 
      sections.other.length === 0) {
    sections.other.push({
      content: resumeText,
      startLine: 0,
      endLine: lines.length - 1,
      headerLine: 0
    });
  }

  return sections;
}

/**
 * Analyze structural compliance of resume
 */
export function analyzeStructuralCompliance(resumeSections: ParsedResumeSections): StructuralCompliance {
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

  // Calculate section order score
  const idealOrder = ['contact', 'summary', 'experience', 'education', 'skills', 'certifications'];
  const actualOrder = sectionsFound.filter(section => idealOrder.includes(section));
  let orderScore = 100;

  // Check if sections are in reasonable order
  for (let i = 1; i < actualOrder.length; i++) {
    const currentIndex = idealOrder.indexOf(actualOrder[i]);
    const previousIndex = idealOrder.indexOf(actualOrder[i - 1]);
    if (currentIndex < previousIndex) {
      orderScore -= 10; // Penalty for out-of-order sections
    }
  }

  return {
    score: Math.max(0, score),
    sectionsFound,
    missingCriticalSections,
    sectionOrder: actualOrder,
    orderScore,
    recommendations
  };
}

/**
 * Analyze format compatibility
 */
export function analyzeFormatCompatibility(resumeText: string) {
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
 * Analyze contact information
 */
export function analyzeContactInfo(resumeText: string) {
  let score = 0;
  const recommendations: ATSRecommendation[] = [];

  // Check for email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  if (emailRegex.test(resumeText)) {
    score += 40;
  } else {
    recommendations.push({
      priority: 'HIGH',
      issue: 'No email address found',
      fix: 'Add a professional email address',
      impact: 'Recruiters cannot contact you without email'
    });
  }

  // Check for phone number
  const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
  if (phoneRegex.test(resumeText)) {
    score += 30;
  } else {
    recommendations.push({
      priority: 'HIGH',
      issue: 'No phone number found',
      fix: 'Add a professional phone number',
      impact: 'Limits contact options for recruiters'
    });
  }

  // Check for name (assume first line or first few words)
  const firstLine = resumeText.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
    score += 30;
  } else {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Name may not be clearly identified',
      fix: 'Ensure your full name is prominently displayed at the top',
      impact: 'ATS may not properly identify candidate name'
    });
  }

  return { score: Math.min(100, score), recommendations };
}

/**
 * Analyze bonus features
 */
export function analyzeBonusFeatures(resumeText: string, matches: EnhancedKeywordMatch[]) {
  let score = 0;
  const found: string[] = [];
  const recommendations: ATSRecommendation[] = [];

  // Check for matching job titles using enhanced matching
  const jobTitleMatches = matches.filter(m => m.context.type === 'job_title');
  if (jobTitleMatches.length > 0) {
    score += 40;
    found.push(...jobTitleMatches.map(m => `Job Title: ${m.originalKeyword}`));
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
 * Extract certifications from text
 */
function extractCertifications(text: string): string[] {
  const certPatterns = [
    /\b(AWS|Azure|GCP|Google Cloud)\s+(Certified|Professional|Associate|Expert|Practitioner)\b/gi,
    /\b(PMP|CISSP|CISA|CISM|CEH|CCNA|CCNP|CCIE)\b/gi,
    /\b(Certified|Professional)\s+(Scrum Master|Product Owner|Developer|Analyst)\b/gi,
    /\b(Microsoft|Oracle|Salesforce|Adobe)\s+Certified\b/gi,
    /\bCertified\s+(Public Accountant|Financial Planner|Project Manager)\b/gi
  ];

  const certifications: string[] = [];
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      certifications.push(...matches);
    }
  });

  return Array.from(new Set(certifications)); // Remove duplicates
}

/**
 * Extract years of experience from text
 */
function extractExperienceYears(text: string): number {
  const patterns = [
    /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/gi,
    /(\d+)\+?\s*yrs?\s*(of\s*)?(experience|exp)/gi,
    /(\d+)\+?\s*year\s*(of\s*)?(experience|exp)/gi
  ];

  let maxYears = 0;
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const years = parseInt(match[1]);
      if (years > maxYears) {
        maxYears = years;
      }
    }
  });

  return maxYears;
} 