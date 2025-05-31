/**
 * Industry Detection for Context-Aware Keyword Matching
 * Analyzes resume and job description content to identify relevant industries
 */

import type { ExtractedKeywords } from './types';

/**
 * Industry detection for context-aware matching
 */
export class IndustryDetector {
  private readonly industryKeywords: Map<string, string[]>;
  
  constructor() {
    this.industryKeywords = new Map([
      ['technology', [
        'software', 'programming', 'developer', 'engineer', 'coding', 'tech', 'IT', 'data', 'cloud', 'AI',
        'javascript', 'python', 'react', 'angular', 'vue', 'node.js', 'typescript', 'html', 'css',
        'database', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'machine learning', 'artificial intelligence', 'deep learning', 'neural networks',
        'web development', 'mobile development', 'full stack', 'frontend', 'backend',
        'devops', 'ci/cd', 'agile', 'scrum', 'api', 'microservices', 'rest', 'graphql'
      ]],
      ['healthcare', [
        'patient', 'medical', 'health', 'clinical', 'hospital', 'nurse', 'doctor', 'pharma', 'HIPAA',
        'ehr', 'emr', 'electronic health records', 'electronic medical records',
        'registered nurse', 'rn', 'cna', 'lpn', 'md', 'physician', 'np', 'pa',
        'patient care', 'clinical research', 'medical research', 'clinical trials',
        'healthcare', 'medicine', 'nursing', 'pharmacy', 'radiology', 'surgery',
        'diagnosis', 'treatment', 'therapy', 'rehabilitation', 'emergency',
        'intensive care', 'icu', 'operating room', 'or', 'medical device'
      ]],
      ['finance', [
        'financial', 'banking', 'investment', 'accounting', 'CPA', 'trading', 'risk', 'compliance', 'audit',
        'certified public accountant', 'financial analysis', 'financial modeling', 'financial planning',
        'anti-money laundering', 'aml', 'know your customer', 'kyc', 'risk management',
        'investment banking', 'private equity', 'venture capital', 'hedge fund',
        'wealth management', 'portfolio', 'securities', 'derivatives', 'bonds', 'stocks',
        'credit', 'loan', 'mortgage', 'insurance', 'actuarial', 'underwriting',
        'fintech', 'blockchain', 'cryptocurrency', 'payment', 'transaction'
      ]],
      ['marketing', [
        'marketing', 'advertising', 'brand', 'campaign', 'SEO', 'social media', 'content', 'digital',
        'search engine optimization', 'pay per click', 'ppc', 'sem', 'crm', 'salesforce',
        'social media marketing', 'content marketing', 'email marketing', 'email campaigns',
        'conversion rate optimization', 'cro', 'marketing automation', 'martech',
        'brand management', 'digital marketing', 'online marketing', 'growth hacking',
        'lead generation', 'customer acquisition', 'retention', 'analytics', 'metrics',
        'a/b testing', 'user acquisition', 'performance marketing', 'influencer marketing'
      ]],
      ['education', [
        'teaching', 'education', 'curriculum', 'student', 'academic', 'university', 'learning',
        'curriculum development', 'instructional design', 'student assessment', 'classroom management',
        'special education', 'english as second language', 'esl', 'learning management system', 'lms',
        'educational technology', 'edtech', 'pedagogy', 'assessment', 'evaluation',
        'school', 'college', 'professor', 'instructor', 'tutor', 'principal',
        'administration', 'research', 'thesis', 'dissertation', 'academic writing'
      ]],
      ['manufacturing', [
        'manufacturing', 'production', 'quality', 'supply chain', 'lean', 'six sigma', 'factory',
        'lean manufacturing', 'total quality management', 'tqm', 'supply chain management', 'scm',
        'quality assurance', 'qa', 'quality control', 'qc', 'production planning',
        'inventory management', 'just in time', 'jit', 'assembly', 'automation',
        'industrial', 'operations', 'process improvement', 'efficiency', 'productivity',
        'safety', 'compliance', 'iso', 'standards', 'equipment', 'machinery'
      ]],
      ['retail', [
        'retail', 'sales', 'customer', 'merchandise', 'store', 'e-commerce', 'inventory',
        'customer service', 'point of sale', 'pos', 'merchandising', 'visual merchandising',
        'buyer', 'purchasing', 'vendor', 'supplier', 'distribution', 'logistics',
        'omnichannel', 'online retail', 'brick and mortar', 'fashion', 'apparel',
        'consumer goods', 'fmcg', 'category management', 'pricing', 'promotion'
      ]],
      ['consulting', [
        'consulting', 'consultant', 'advisory', 'strategy', 'transformation', 'implementation',
        'business analysis', 'process improvement', 'change management', 'project management',
        'stakeholder', 'client', 'engagement', 'solution', 'recommendation',
        'mckinsey', 'bain', 'bcg', 'deloitte', 'pwc', 'kpmg', 'ey', 'accenture',
        'management consulting', 'strategy consulting', 'it consulting', 'hr consulting'
      ]],
      ['legal', [
        'legal', 'law', 'attorney', 'lawyer', 'counsel', 'litigation', 'contract', 'compliance',
        'paralegal', 'legal assistant', 'court', 'trial', 'case', 'brief', 'motion',
        'corporate law', 'criminal law', 'civil law', 'intellectual property', 'patent',
        'trademark', 'copyright', 'employment law', 'tax law', 'real estate law',
        'merger', 'acquisition', 'due diligence', 'regulatory', 'bar exam'
      ]],
      ['sales', [
        'sales', 'selling', 'revenue', 'quota', 'pipeline', 'lead', 'prospect', 'client',
        'account management', 'business development', 'relationship building', 'negotiation',
        'closing', 'deal', 'territory', 'hunter', 'farmer', 'inside sales', 'outside sales',
        'field sales', 'enterprise sales', 'b2b sales', 'b2c sales', 'saas sales',
        'cold calling', 'warm calling', 'demo', 'presentation', 'proposal', 'rfp'
      ]],
      ['human-resources', [
        'human resources', 'hr', 'recruiting', 'talent acquisition', 'hiring', 'onboarding',
        'employee relations', 'performance management', 'compensation', 'benefits',
        'training', 'development', 'learning and development', 'l&d', 'organizational development',
        'culture', 'engagement', 'retention', 'diversity', 'inclusion', 'equity',
        'hris', 'payroll', 'compliance', 'employment law', 'policy', 'procedure'
      ]]
    ]);
  }
  
  /**
   * Detect industries from resume text and job keywords
   */
  async detectIndustries(resumeText: string, jobKeywords: ExtractedKeywords): Promise<string[]> {
    const detectedIndustries: Map<string, number> = new Map();
    
    // Combine resume text and job keywords for analysis
    const combinedText = `${resumeText} ${this.extractKeywordsText(jobKeywords)}`.toLowerCase();
    
    // Count industry indicators
    this.industryKeywords.forEach((keywords, industry) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
        const matches = combinedText.match(regex);
        if (matches) {
          // Weight keywords differently based on specificity
          const weight = this.getKeywordWeight(keyword);
          score += matches.length * weight;
        }
      });
      if (score > 0) {
        detectedIndustries.set(industry, score);
      }
    });
    
    // Sort by score and return top industries
    const sorted = Array.from(detectedIndustries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Return top 3 industries
      .filter(([, score]) => score >= 2) // Minimum threshold
      .map(([industry]) => industry);
    
    return sorted.length > 0 ? sorted : ['general'];
  }
  
  /**
   * Detect industry from job description alone
   */
  async detectIndustryFromJobDescription(jobDescription: string): Promise<string[]> {
    const detectedIndustries: Map<string, number> = new Map();
    const jobText = jobDescription.toLowerCase();
    
    // Count industry indicators with higher weights for job descriptions
    this.industryKeywords.forEach((keywords, industry) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
        const matches = jobText.match(regex);
        if (matches) {
          // Higher weight for job description keywords
          const weight = this.getKeywordWeight(keyword) * 1.5;
          score += matches.length * weight;
        }
      });
      if (score > 0) {
        detectedIndustries.set(industry, score);
      }
    });
    
    // Sort by score and return top industries
    const sorted = Array.from(detectedIndustries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2) // Return top 2 industries for job descriptions
      .filter(([, score]) => score >= 3) // Higher threshold for job descriptions
      .map(([industry]) => industry);
    
    return sorted.length > 0 ? sorted : ['general'];
  }
  
  /**
   * Get keyword weight based on specificity
   */
  private getKeywordWeight(keyword: string): number {
    // Longer, more specific keywords get higher weights
    if (keyword.length > 15) return 3; // Very specific terms
    if (keyword.length > 10) return 2; // Moderately specific terms
    if (keyword.length > 5) return 1.5; // Somewhat specific terms
    return 1; // Generic terms
  }
  
  /**
   * Extract text from job keywords for analysis
   */
  private extractKeywordsText(jobKeywords: ExtractedKeywords): string {
    return jobKeywords.all.map(k => k.keyword).join(' ');
  }
  
  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Get industry-specific keyword boost
   */
  getIndustryKeywordBoost(keyword: string, detectedIndustries: string[]): number {
    let maxBoost = 1.0;
    
    detectedIndustries.forEach(industry => {
      const industryKeywords = this.industryKeywords.get(industry) || [];
      if (industryKeywords.some(ik => ik.toLowerCase().includes(keyword.toLowerCase()) || 
                                     keyword.toLowerCase().includes(ik.toLowerCase()))) {
        maxBoost = Math.max(maxBoost, 1.3); // 30% boost for industry-relevant keywords
      }
    });
    
    return maxBoost;
  }
  
  /**
   * Get all available industries
   */
  getAvailableIndustries(): string[] {
    return Array.from(this.industryKeywords.keys());
  }
  
  /**
   * Get keywords for a specific industry
   */
  getIndustryKeywords(industry: string): string[] {
    return this.industryKeywords.get(industry) || [];
  }
} 