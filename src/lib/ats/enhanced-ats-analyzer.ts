/**
 * Enhanced ATS Analyzer with Advanced Keyword Matching
 * Integrates all advanced modules for comprehensive ATS analysis
 */

import { AdvancedKeywordMatcher } from './advanced-keyword-matcher';
import { IndustryDetector } from './industry-detector';
import { extractEnhancedJobKeywords, validateAndCleanKeywords } from './keyword-extractor';
import {
  analyzeParseability,
  parseResumeIntoSections,
  analyzeStructuralCompliance,
  analyzeFormatCompatibility,
  analyzeContactInfo,
  analyzeBonusFeatures
} from './utils';
import type {
  ATSResult,
  ATSAnalysisResult,
  ATSScoreBreakdown,
  ATSRecommendation,
  ParsedResumeSections,
  KeywordInsights,
  EnhancedKeywordMatch
} from './types';
import type { ResumeParserSuccessResponse } from '../resume-parser';

// Configuration for enhanced ATS analysis
const ENHANCED_ATS_CONFIG = {
  weights: {
    parseability: 0.30,        // 30% weight - Can't score if can't parse
    keywordMatch: 0.35,        // 35% weight - Most important for matching
    skillsAlignment: 0.20,     // 20% weight - Technical skills matching
    formatCompatibility: 0.10, // 10% weight - Format and structure
    contactInfo: 0.03,         // 3% weight - Contact information
    bonusFeatures: 0.02        // 2% weight - Job titles, certifications, etc.
  },
  thresholds: {
    autoReject: 30,           // Below 30 = automatic rejection
    needsReview: 60,          // 30-60 = human review needed
    autoPass: 75              // Above 75 = likely to pass initial screen
  }
};

/**
 * Enhanced ATS compatibility analysis with advanced keyword matching
 */
export async function analyzeATSCompatibilityEnhanced(
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
        criticalIssues: parseabilityAnalysis.issues,
        matchQuality: {
          overallScore: 0,
          metrics: {
            requiredCoverage: 0,
            preferredCoverage: 0,
            averageConfidence: 0,
            contextAccuracy: 0,
            matchTypeDistribution: {}
          },
          grade: 'F'
        },
        insights: {
          strengths: [],
          weaknesses: ['Critical parsing failures prevent proper analysis'],
          opportunities: [],
          matchPatterns: {}
        },
        detailedMatches: []
      };
    }

    // Step 2: Extract and validate job keywords using AI
    const rawJobKeywords = await extractEnhancedJobKeywords(jobDescription);
    const jobKeywords = validateAndCleanKeywords(rawJobKeywords);
    console.log('Extracted job keywords:', {
      total: jobKeywords.all.length,
      required: jobKeywords.required.length,
      preferred: jobKeywords.preferred.length
    });

    // Step 3: Parse resume into sections for context-aware analysis
    const resumeSections = parseResumeIntoSections(resumeText);
    console.log('Parsed resume sections:', Object.keys(resumeSections).filter(key => resumeSections[key as keyof ParsedResumeSections] !== null));

    // Step 4: Perform enhanced keyword matching analysis
    const keywordMatcher = new AdvancedKeywordMatcher();
    const keywordMatchingResult = await keywordMatcher.matchKeywords(
      resumeText,
      jobKeywords,
      resumeSections
    );

    console.log('Enhanced keyword matching complete:', {
      matches: keywordMatchingResult.matches.length,
      unmatched: keywordMatchingResult.unmatchedKeywords.length,
      quality: keywordMatchingResult.matchQuality.grade
    });

    // Step 5: Calculate enhanced scores
    const enhancedScores = calculateEnhancedScores(keywordMatchingResult, jobKeywords);

    // Step 6: Perform remaining analyses (structural, format, contact, bonus)
    const structuralAnalysis = analyzeStructuralCompliance(resumeSections);
    const formatAnalysis = analyzeFormatCompatibility(resumeText);
    const contactAnalysis = analyzeContactInfo(resumeText);
    const bonusAnalysis = analyzeBonusFeatures(resumeText, keywordMatchingResult.matches);

    // Step 7: Calculate overall score with enhanced weights
    const breakdown: ATSScoreBreakdown = {
      parseability: parseabilityAnalysis.score,
      keywordMatch: enhancedScores.overall,
      skillsAlignment: enhancedScores.breakdown.requiredKeywords,
      formatCompatibility: Math.round((formatAnalysis.score * 0.7) + (structuralAnalysis.score * 0.3)),
      contactInfo: contactAnalysis.score,
      bonusFeatures: bonusAnalysis.score
    };

    const overallScore = Math.round(
      breakdown.parseability * ENHANCED_ATS_CONFIG.weights.parseability +
      breakdown.keywordMatch * ENHANCED_ATS_CONFIG.weights.keywordMatch +
      breakdown.skillsAlignment * ENHANCED_ATS_CONFIG.weights.skillsAlignment +
      breakdown.formatCompatibility * ENHANCED_ATS_CONFIG.weights.formatCompatibility +
      breakdown.contactInfo * ENHANCED_ATS_CONFIG.weights.contactInfo +
      breakdown.bonusFeatures * ENHANCED_ATS_CONFIG.weights.bonusFeatures
    );

    // Step 8: Determine pass/fail status
    const passFailStatus = determinePassFailStatus(
      overallScore,
      parseabilityAnalysis.criticalFailures,
      keywordMatchingResult.unmatchedKeywords
    );

    // Step 9: Generate insights
    const insights = generateKeywordInsights(keywordMatchingResult, jobKeywords);

    // Step 10: Compile all recommendations with priorities
    const allRecommendations = [
      ...parseabilityAnalysis.recommendations,
      ...keywordMatchingResult.recommendations,
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
    console.log(`Match quality: ${keywordMatchingResult.matchQuality.grade}, Confidence: ${Math.round(keywordMatchingResult.matchQuality.metrics.averageConfidence * 100)}%`);

    return {
      success: true,
      overallScore,
      passFailStatus,
      breakdown,
      recommendations: allRecommendations,
      missingKeywords: keywordMatchingResult.unmatchedKeywords,
      matchedKeywords: keywordMatchingResult.matches.map(m => m.originalKeyword),
      skillsFound: keywordMatchingResult.matches
        .filter(m => m.context.type === 'skill' || m.context.type === 'tool')
        .map(m => m.originalKeyword),
      skillsMissing: keywordMatchingResult.unmatchedKeywords.filter(k => 
        jobKeywords.all.find(jk => jk.keyword === k)?.context.type === 'skill' ||
        jobKeywords.all.find(jk => jk.keyword === k)?.context.type === 'tool'
      ),
      bonusItems: bonusAnalysis.found,
      criticalIssues: parseabilityAnalysis.issues,
      matchQuality: keywordMatchingResult.matchQuality,
      insights,
      detailedMatches: keywordMatchingResult.matches
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
 * Calculate enhanced scores based on match quality
 */
function calculateEnhancedScores(
  keywordMatchingResult: any,
  jobKeywords: any
): { overall: number, breakdown: any } {
  const breakdown = {
    requiredKeywords: 0,
    preferredKeywords: 0,
    matchConfidence: 0,
    contextAccuracy: 0,
    coverageBonus: 0
  };

  // Score required keywords (60% of total)
  const requiredMatches = keywordMatchingResult.matches.filter((m: any) => 
    jobKeywords.required.some((k: any) => k.keyword === m.originalKeyword)
  );
  const requiredCoverage = jobKeywords.required.length > 0 
    ? requiredMatches.length / jobKeywords.required.length 
    : 1;
  
  // Apply confidence weights to required matches
  const requiredScore = requiredMatches.reduce((score: number, match: any) => {
    // Base points for match
    let points = 60 / Math.max(jobKeywords.required.length, 1);
    
    // Adjust based on match quality
    points *= match.confidence; // Confidence multiplier
    points *= (0.5 + match.contextualScore * 0.5); // Context multiplier
    
    // Bonus for exact matches
    if (match.matchType === 'exact') points *= 1.1;
    
    return score + points;
  }, 0);
  
  breakdown.requiredKeywords = Math.min(60, requiredScore);

  // Score preferred keywords (30% of total)
  const preferredMatches = keywordMatchingResult.matches.filter((m: any) => 
    jobKeywords.preferred.some((k: any) => k.keyword === m.originalKeyword)
  );
  const preferredScore = preferredMatches.reduce((score: number, match: any) => {
    let points = 30 / Math.max(jobKeywords.preferred.length, 1);
    points *= match.confidence;
    points *= (0.5 + match.contextualScore * 0.5);
    return score + points;
  }, 0);
  
  breakdown.preferredKeywords = Math.min(30, preferredScore);

  // Match quality bonus (10% of total)
  breakdown.matchConfidence = keywordMatchingResult.matchQuality.metrics.averageConfidence * 5;
  breakdown.contextAccuracy = keywordMatchingResult.matchQuality.metrics.contextAccuracy * 5;

  // Coverage bonus for matching high percentage of keywords
  if (requiredCoverage >= 0.9) breakdown.coverageBonus = 5;
  else if (requiredCoverage >= 0.75) breakdown.coverageBonus = 3;

  const overall = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return {
    overall: Math.round(Math.min(100, overall)),
    breakdown
  };
}

/**
 * Generate insights about keyword matching patterns
 */
function generateKeywordInsights(
  keywordMatchingResult: any,
  jobKeywords: any
): KeywordInsights {
  const insights: KeywordInsights = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    matchPatterns: {}
  };

  // Analyze match patterns
  const matchTypes = keywordMatchingResult.matches.reduce((acc: any, match: any) => {
    acc[match.matchType] = (acc[match.matchType] || 0) + 1;
    return acc;
  }, {});

  insights.matchPatterns = matchTypes;

  // Identify strengths
  if (matchTypes.exact > keywordMatchingResult.matches.length * 0.6) {
    insights.strengths.push('Strong exact keyword matches with job requirements');
  }
  
  const skillsInRightPlace = keywordMatchingResult.matches.filter((m: any) => 
    m.context.type === 'skill' && m.location.section === 'skills'
  ).length;
  if (skillsInRightPlace > 5) {
    insights.strengths.push('Technical skills properly organized in Skills section');
  }

  if (keywordMatchingResult.matchQuality.metrics.averageConfidence > 0.8) {
    insights.strengths.push('High confidence keyword matches indicate strong alignment');
  }

  // Identify weaknesses
  if (matchTypes.partial > keywordMatchingResult.matches.length * 0.2) {
    insights.weaknesses.push('Many partial/fuzzy matches suggest terminology misalignment');
  }

  const missingRequired = jobKeywords.required.filter((k: any) => 
    !keywordMatchingResult.matches.some((m: any) => m.originalKeyword === k.keyword)
  );
  if (missingRequired.length > 0) {
    insights.weaknesses.push(`Missing ${missingRequired.length} required keywords`);
  }

  if (keywordMatchingResult.matchQuality.metrics.contextAccuracy < 0.6) {
    insights.weaknesses.push('Keywords found in suboptimal resume sections');
  }

  // Identify opportunities
  const lowConfidenceMatches = keywordMatchingResult.matches.filter((m: any) => m.confidence < 0.8);
  if (lowConfidenceMatches.length > 0) {
    insights.opportunities.push('Update terminology to match job description exactly');
  }

  const synonymMatches = keywordMatchingResult.matches.filter((m: any) => m.matchType === 'synonym');
  if (synonymMatches.length > 3) {
    insights.opportunities.push('Consider using the exact terms from the job posting');
  }

  if (keywordMatchingResult.matchQuality.metrics.preferredCoverage < 0.5) {
    insights.opportunities.push('Add more preferred qualifications to strengthen your profile');
  }

  return insights;
}

function determinePassFailStatus(
  overallScore: number,
  criticalFailures: boolean,
  unmatchedKeywords: string[]
): 'PASS' | 'FAIL' | 'REVIEW' {
  // Automatic failures
  if (criticalFailures) return 'FAIL';
  if (overallScore < ENHANCED_ATS_CONFIG.thresholds.autoReject) return 'FAIL';
  if (unmatchedKeywords.length > 5) return 'FAIL'; // Too many missing keywords

  // Clear passes
  if (overallScore >= ENHANCED_ATS_CONFIG.thresholds.autoPass && unmatchedKeywords.length <= 2) return 'PASS';

  // Human review needed
  return 'REVIEW';
} 