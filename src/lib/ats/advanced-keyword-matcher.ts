/**
 * Advanced Keyword Matcher with Multiple Matching Strategies
 * Implements exact, semantic, fuzzy, compound, and industry-specific matching
 */

import OpenAI from 'openai';
import { KeywordVariationDatabase } from './keyword-variations';
import { IndustryDetector } from './industry-detector';
import type {
  EnhancedKeywordMatch,
  ExtractedKeywords,
  KeywordData,
  KeywordMatchingResult,
  MatchQuality,
  ParsedResumeSections,
  ATSRecommendation,
  KeywordInsights
} from './types';

// Initialize OpenAI for semantic matching
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Advanced keyword matcher with multiple matching strategies
 */
export class AdvancedKeywordMatcher {
  private readonly variationDB: KeywordVariationDatabase;
  private readonly industryDetector: IndustryDetector;
  
  constructor() {
    this.variationDB = new KeywordVariationDatabase();
    this.industryDetector = new IndustryDetector();
  }
  
  /**
   * Main keyword matching function with multiple strategies
   */
  async matchKeywords(
    resumeText: string,
    jobKeywords: ExtractedKeywords,
    resumeSections: ParsedResumeSections
  ): Promise<KeywordMatchingResult> {
    const matches: EnhancedKeywordMatch[] = [];
    const unmatchedKeywords: string[] = [];
    
    // Detect industry for context-aware matching
    const detectedIndustries = await this.industryDetector.detectIndustries(resumeText, jobKeywords);
    console.log('Detected industries:', detectedIndustries);
    
    // Process each keyword with multiple matching strategies
    for (const keywordData of jobKeywords.all) {
      const matchResult = await this.findBestMatch(
        keywordData,
        resumeText,
        resumeSections,
        detectedIndustries
      );
      
      if (matchResult) {
        matches.push(matchResult);
      } else {
        unmatchedKeywords.push(keywordData.keyword);
      }
    }
    
    // Calculate match quality score
    const matchQuality = this.calculateMatchQuality(matches, jobKeywords);
    
    return {
      matches,
      unmatchedKeywords,
      matchQuality,
      recommendations: this.generateMatchingRecommendations(matches, unmatchedKeywords, jobKeywords)
    };
  }
  
  /**
   * Find the best match for a keyword using multiple strategies
   */
  private async findBestMatch(
    keywordData: KeywordData,
    resumeText: string,
    resumeSections: ParsedResumeSections,
    industries: string[]
  ): Promise<EnhancedKeywordMatch | null> {
    const matches: EnhancedKeywordMatch[] = [];
    
    // Strategy 1: Exact matching with variations
    const exactMatches = this.findExactMatches(keywordData, resumeText, resumeSections);
    matches.push(...exactMatches);
    
    // Strategy 2: Compound term matching
    if (this.variationDB.isCompoundTerm(keywordData.keyword)) {
      const compoundMatches = this.findCompoundMatches(keywordData, resumeText, resumeSections);
      matches.push(...compoundMatches);
    }
    
    // Strategy 3: Industry-specific matching
    for (const industry of industries) {
      const industryMatches = this.findIndustryMatches(keywordData, resumeText, resumeSections, industry);
      matches.push(...industryMatches);
    }
    
    // Strategy 4: Semantic matching (for important keywords only)
    if (keywordData.importance === 'required' && matches.length === 0) {
      const semanticMatch = await this.findSemanticMatch(keywordData, resumeText, resumeSections);
      if (semanticMatch) matches.push(semanticMatch);
    }
    
    // Strategy 5: Partial/fuzzy matching (last resort)
    if (matches.length === 0 && keywordData.keyword.length > 5) {
      const fuzzyMatches = this.findFuzzyMatches(keywordData, resumeText, resumeSections);
      matches.push(...fuzzyMatches);
    }
    
    // Return the best match based on confidence and location
    return this.selectBestMatch(matches);
  }
  
  /**
   * Find exact matches including variations
   */
  private findExactMatches(
    keywordData: KeywordData,
    resumeText: string,
    resumeSections: ParsedResumeSections
  ): EnhancedKeywordMatch[] {
    const matches: EnhancedKeywordMatch[] = [];
    const variations = this.variationDB.getAllVariations(keywordData.keyword);
    
    variations.forEach(variation => {
      // Create word boundary regex for exact matching
      const regex = new RegExp(`\\b${this.escapeRegex(variation)}\\b`, 'gi');
      
      // Search in each section
      Object.entries(resumeSections).forEach(([sectionName, section]) => {
        if (!section || sectionName === 'other') return;
        
        const sectionMatches = section.content.match(regex);
        if (sectionMatches && sectionMatches.length > 0) {
          const match: EnhancedKeywordMatch = {
            originalKeyword: keywordData.keyword,
            matchedVariation: variation,
            matchType: variation === keywordData.keyword.toLowerCase() ? 'exact' : 'synonym',
            confidence: variation === keywordData.keyword.toLowerCase() ? 1.0 : 0.9,
            context: keywordData.context,
            location: {
              section: sectionName as any,
              proximity: this.calculateProximity(variation, section.content)
            },
            frequency: sectionMatches.length,
            contextualScore: this.calculateContextualScore(keywordData.context, sectionName as any)
          };
          matches.push(match);
        }
      });
    });
    
    return matches;
  }
  
  /**
   * Find compound term matches (e.g., "machine learning")
   */
  private findCompoundMatches(
    keywordData: KeywordData,
    resumeText: string,
    resumeSections: ParsedResumeSections
  ): EnhancedKeywordMatch[] {
    const matches: EnhancedKeywordMatch[] = [];
    const compound = this.variationDB.isCompoundTerm(keywordData.keyword);
    if (!compound) return matches;
    
    // Check if all parts exist in close proximity
    const searchText = resumeText.toLowerCase();
    const partPositions: Map<string, number[]> = new Map();
    
    // Find positions of each part
    compound.parts.forEach(part => {
      const positions: number[] = [];
      const regex = new RegExp(`\\b${this.escapeRegex(part)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(searchText)) !== null) {
        positions.push(match.index);
      }
      partPositions.set(part, positions);
    });
    
    // Check if parts appear close together (within 3 words)
    const maxDistance = 20; // characters
    let foundNearby = false;
    
    if (compound.mustMatchAll) {
      // All parts must be present and close
      const firstPartPositions = partPositions.get(compound.parts[0]) || [];
      firstPartPositions.forEach(startPos => {
        let allPartsNearby = true;
        for (let i = 1; i < compound.parts.length; i++) {
          const partPositions_i = partPositions.get(compound.parts[i]) || [];
          const hasNearby = partPositions_i.some(pos => 
            Math.abs(pos - startPos) <= maxDistance * i
          );
          if (!hasNearby) {
            allPartsNearby = false;
            break;
          }
        }
        if (allPartsNearby) foundNearby = true;
      });
    } else {
      // At least one part is sufficient
      foundNearby = compound.parts.some(part => 
        (partPositions.get(part) || []).length > 0
      );
    }
    
    if (foundNearby) {
      // Find which section contains the match
      Object.entries(resumeSections).forEach(([sectionName, section]) => {
        if (!section || sectionName === 'other') return;
        
        const sectionHasMatch = compound.parts.every(part => 
          new RegExp(`\\b${this.escapeRegex(part)}\\b`, 'i').test(section.content)
        );
        
        if (sectionHasMatch) {
          matches.push({
            originalKeyword: keywordData.keyword,
            matchedVariation: compound.full,
            matchType: 'compound',
            confidence: 0.95,
            context: keywordData.context,
            location: {
              section: sectionName as any,
              proximity: 80
            },
            frequency: 1,
            contextualScore: this.calculateContextualScore(keywordData.context, sectionName as any)
          });
        }
      });
    }
    
    return matches;
  }
  
  /**
   * Find industry-specific matches
   */
  private findIndustryMatches(
    keywordData: KeywordData,
    resumeText: string,
    resumeSections: ParsedResumeSections,
    industry: string
  ): EnhancedKeywordMatch[] {
    const matches: EnhancedKeywordMatch[] = [];
    const industryVariations = this.variationDB.getIndustryVariations(keywordData.keyword, industry);
    
    industryVariations.forEach(variation => {
      const regex = new RegExp(`\\b${this.escapeRegex(variation)}\\b`, 'gi');
      
      Object.entries(resumeSections).forEach(([sectionName, section]) => {
        if (!section || sectionName === 'other') return;
        
        const sectionMatches = section.content.match(regex);
        if (sectionMatches && sectionMatches.length > 0) {
          matches.push({
            originalKeyword: keywordData.keyword,
            matchedVariation: variation,
            matchType: 'synonym',
            confidence: 0.85,
            context: { ...keywordData.context, industry },
            location: {
              section: sectionName as any,
              proximity: this.calculateProximity(variation, section.content)
            },
            frequency: sectionMatches.length,
            contextualScore: this.calculateContextualScore(keywordData.context, sectionName as any)
          });
        }
      });
    });
    
    return matches;
  }
  
  /**
   * Semantic matching using AI (expensive, use sparingly)
   */
  private async findSemanticMatch(
    keywordData: KeywordData,
    resumeText: string,
    resumeSections: ParsedResumeSections
  ): Promise<EnhancedKeywordMatch | null> {
    try {
      const prompt = `
        Analyze if the resume contains skills or experience semantically similar to "${keywordData.keyword}".
        Look for related concepts, not exact matches.
        
        Resume excerpt: ${resumeText.substring(0, 1000)}
        
        If found, return JSON: { "found": true, "matchedPhrase": "exact phrase from resume", "confidence": 0.7-0.9 }
        If not found, return: { "found": false }
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.1
      });
      
      const responseContent = response.choices[0]?.message?.content || '{"found": false}';
      
      // Clean the response to handle markdown-wrapped JSON
      let cleanedResponse = responseContent.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const result = JSON.parse(cleanedResponse);
      
      if (result.found && result.matchedPhrase) {
        // Find which section contains the semantic match
        for (const [sectionName, section] of Object.entries(resumeSections)) {
          if (!section || sectionName === 'other') continue;
          
          if (section.content.toLowerCase().includes(result.matchedPhrase.toLowerCase())) {
            return {
              originalKeyword: keywordData.keyword,
              matchedVariation: result.matchedPhrase,
              matchType: 'semantic',
              confidence: result.confidence || 0.7,
              context: keywordData.context,
              location: {
                section: sectionName as any,
                proximity: 50
              },
              frequency: 1,
              contextualScore: this.calculateContextualScore(keywordData.context, sectionName as any)
            };
          }
        }
      }
    } catch (error) {
      console.error('Semantic matching failed:', error);
    }
    
    return null;
  }
  
  /**
   * Fuzzy matching for typos and close matches
   */
  private findFuzzyMatches(
    keywordData: KeywordData,
    resumeText: string,
    resumeSections: ParsedResumeSections
  ): EnhancedKeywordMatch[] {
    const matches: EnhancedKeywordMatch[] = [];
    const keyword = keywordData.keyword.toLowerCase();
    
    // Simple fuzzy matching: allow 1-2 character differences for longer words
    const allowedDistance = keyword.length <= 5 ? 1 : 2;
    
    Object.entries(resumeSections).forEach(([sectionName, section]) => {
      if (!section || sectionName === 'other') return;
      
      const words = section.content.toLowerCase().split(/\W+/);
      const fuzzyMatches = words.filter((word: string) => 
        this.levenshteinDistance(word, keyword) <= allowedDistance &&
        word.length >= keyword.length - 2 &&
        word.length <= keyword.length + 2
      );
      
      if (fuzzyMatches.length > 0) {
        const uniqueMatches: string[] = Array.from(new Set(fuzzyMatches));
        uniqueMatches.forEach(match => {
          matches.push({
            originalKeyword: keywordData.keyword,
            matchedVariation: match,
            matchType: 'partial',
            confidence: 0.6, // Lower confidence for fuzzy matches
            context: keywordData.context,
            location: {
              section: sectionName as any,
              proximity: 40
            },
            frequency: fuzzyMatches.filter((m: string) => m === match).length,
            contextualScore: this.calculateContextualScore(keywordData.context, sectionName as any) * 0.7
          });
        });
      }
    });
    
    return matches;
  }
  
  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  /**
   * Select the best match from multiple options
   */
  private selectBestMatch(matches: EnhancedKeywordMatch[]): EnhancedKeywordMatch | null {
    if (matches.length === 0) return null;
    
    // Sort by: confidence * contextual score * (1 + frequency bonus)
    return matches.sort((a, b) => {
      const scoreA = a.confidence * a.contextualScore * (1 + Math.log10(a.frequency + 1));
      const scoreB = b.confidence * b.contextualScore * (1 + Math.log10(b.frequency + 1));
      return scoreB - scoreA;
    })[0];
  }
  
  /**
   * Calculate contextual score based on where keyword appears
   */
  private calculateContextualScore(context: any, section: string): number {
    const contextMap: { [key: string]: { [key: string]: number } } = {
      skill: {
        skills: 100,
        summary: 80,
        experience: 70,
        education: 40,
        certifications: 60,
        other: 20
      },
      tool: {
        skills: 90,
        experience: 85,
        summary: 70,
        certifications: 60,
        education: 40,
        other: 20
      },
      certification: {
        certifications: 100,
        education: 80,
        skills: 70,
        summary: 60,
        experience: 50,
        other: 20
      },
      job_title: {
        experience: 100,
        summary: 80,
        skills: 30,
        education: 20,
        certifications: 20,
        other: 10
      },
      responsibility: {
        experience: 100,
        summary: 70,
        skills: 40,
        education: 20,
        certifications: 20,
        other: 20
      }
    };
    
    const baseScore = contextMap[context.type]?.[section] || 50;
    return baseScore / 100; // Normalize to 0-1
  }
  
  /**
   * Calculate proximity score (how close to section start)
   */
  private calculateProximity(keyword: string, sectionContent: string): number {
    const index = sectionContent.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return 0;
    
    // Proximity is higher when keyword appears earlier in section
    const position = index / sectionContent.length;
    return Math.round((1 - position) * 100);
  }
  
  /**
   * Calculate overall match quality
   */
  private calculateMatchQuality(
    matches: EnhancedKeywordMatch[],
    jobKeywords: ExtractedKeywords
  ): MatchQuality {
    const requiredMatches = matches.filter(m => 
      jobKeywords.required.some(k => k.keyword === m.originalKeyword)
    );
    const preferredMatches = matches.filter(m => 
      jobKeywords.preferred.some(k => k.keyword === m.originalKeyword)
    );
    
    // Calculate different quality metrics
    const metrics = {
      requiredCoverage: jobKeywords.required.length > 0 
        ? requiredMatches.length / jobKeywords.required.length 
        : 1,
      preferredCoverage: jobKeywords.preferred.length > 0
        ? preferredMatches.length / jobKeywords.preferred.length
        : 1,
      averageConfidence: matches.length > 0
        ? matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
        : 0,
      contextAccuracy: matches.length > 0
        ? matches.reduce((sum, m) => sum + m.contextualScore, 0) / matches.length
        : 0,
      matchTypeDistribution: this.calculateMatchTypeDistribution(matches)
    };
    
    // Calculate overall quality score
    const overallScore = (
      metrics.requiredCoverage * 0.5 +  // Required keywords are most important
      metrics.preferredCoverage * 0.2 +
      metrics.averageConfidence * 0.15 +
      metrics.contextAccuracy * 0.15
    ) * 100;
    
    return {
      overallScore: Math.round(overallScore),
      metrics,
      grade: this.getQualityGrade(overallScore)
    };
  }
  
  private calculateMatchTypeDistribution(matches: EnhancedKeywordMatch[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {
      exact: 0,
      synonym: 0,
      semantic: 0,
      partial: 0,
      acronym: 0,
      compound: 0
    };
    
    matches.forEach(match => {
      distribution[match.matchType]++;
    });
    
    return distribution;
  }
  
  private getQualityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
  
  /**
   * Generate specific recommendations based on matching results
   */
  private generateMatchingRecommendations(
    matches: EnhancedKeywordMatch[],
    unmatchedKeywords: string[],
    jobKeywords: ExtractedKeywords
  ): ATSRecommendation[] {
    const recommendations: ATSRecommendation[] = [];
    
    // Check for missing required keywords
    const missingRequired = jobKeywords.required
      .filter(k => unmatchedKeywords.includes(k.keyword))
      .map(k => k.keyword);
    
    if (missingRequired.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: `Missing required keywords: ${missingRequired.slice(0, 3).join(', ')}`,
        fix: 'Add these critical skills/requirements to your resume if you have the experience',
        impact: 'These are likely minimum requirements - missing them may result in automatic rejection'
      });
    }
    
    // Check for keywords in wrong sections
    const misplacedKeywords = matches.filter(m => 
      m.context.type === 'skill' && m.location.section !== 'skills' && m.contextualScore < 0.7
    );
    
    if (misplacedKeywords.length > 3) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Technical skills scattered throughout resume',
        fix: 'Consolidate technical skills in a dedicated Skills section',
        impact: 'ATS systems expect skills in a specific section for proper categorization'
      });
    }
    
    // Check for low-confidence matches
    const lowConfidenceMatches = matches.filter(m => m.confidence < 0.7);
    if (lowConfidenceMatches.length > matches.length * 0.3) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Many keywords only partially match job requirements',
        fix: 'Use exact terminology from the job description where applicable',
        impact: 'Partial matches may not be recognized by all ATS systems'
      });
    }
    
    // Check match type distribution
    const typeDistribution = this.calculateMatchTypeDistribution(matches);
    if (typeDistribution.partial > matches.length * 0.2) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Too many fuzzy/partial keyword matches',
        fix: 'Review spelling and use standard industry terminology',
        impact: 'Typos and non-standard terms reduce ATS matching confidence'
      });
    }
    
    return recommendations;
  }
  
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
} 