/**
 * Enhanced Keyword Extraction with AI-Powered Categorization
 * Intelligently extracts and categorizes keywords from job descriptions
 */

import OpenAI from 'openai';
import type { ExtractedKeywords, KeywordData, KeywordContext } from './types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced keyword extraction that categorizes keywords by importance and context
 */
export async function extractEnhancedJobKeywords(jobDescription: string): Promise<ExtractedKeywords> {
  console.log('Starting AI-powered keyword extraction...');
  console.log('Job description text:', jobDescription.substring(0, 1000) + '...');
  
  // Check if specific keywords are in the job description
  const testKeywords = ['mobx', 'redux', 'angular', 'vue.js'];
  testKeywords.forEach(keyword => {
    const found = jobDescription.toLowerCase().includes(keyword.toLowerCase());
    console.log(`Keyword "${keyword}" found in JD: ${found}`);
  });
  
  const systemPrompt = `You are an expert ATS keyword analyzer. Extract and categorize keywords from this job description.

CRITICAL RULES:
- ONLY extract keywords that are EXPLICITLY mentioned in the job description text
- DO NOT add related technologies, synonyms, or examples that aren't specifically written
- DO NOT infer or suggest additional keywords based on context
- If a technology is mentioned as an example (e.g., "such as React"), only extract what's explicitly listed
- Extract the EXACT terms as they appear in the text

Categorize each keyword by:
1. Importance: "required" (must-have), "preferred" (nice-to-have), "nice-to-have" (bonus)
2. Context type: "skill", "tool", "certification", "degree", "job_title", "responsibility", "industry_term"
3. Category: For skills/tools, specify subcategory like "programming_language", "framework", "database", "cloud", "soft_skill"

Return JSON in this exact format:
{
  "required": [
    {"keyword": "python", "contextType": "skill", "category": "programming_language"},
    {"keyword": "bachelor's degree", "contextType": "degree", "category": "education"}
  ],
  "preferred": [
    {"keyword": "react", "contextType": "tool", "category": "framework"},
    {"keyword": "aws", "contextType": "tool", "category": "cloud"}
  ],
  "niceToHave": [
    {"keyword": "kubernetes", "contextType": "tool", "category": "devops"}
  ]
}

STRICT EXTRACTION RULES:
- Extract the exact terms as they appear, but lowercase
- Identify compound terms (e.g., "machine learning" not "machine" and "learning" separately)
- For experience requirements like "5+ years", extract as "5+ years experience"
- Don't include generic terms like "team player", "good communication" unless specifically emphasized
- Focus on technical skills, tools, certifications, and specific qualifications that are EXPLICITLY mentioned
- Include industry-specific terms and methodologies ONLY if explicitly stated
- Extract job titles and role-related terms ONLY if explicitly mentioned
- DO NOT add examples, related technologies, or inferred requirements`;

  const userPrompt = `Extract and categorize ATS keywords from this job description. Remember: ONLY extract what is EXPLICITLY mentioned, do not add related technologies or examples.

Job Description:
${jobDescription}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    console.log('AI extraction response:', response.substring(0, 500) + '...');

    // Clean the response to handle markdown-wrapped JSON
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanedResponse);
    
    // Transform to internal format
    const all: KeywordData[] = [];
    
    ['required', 'preferred', 'niceToHave'].forEach(importance => {
      if (parsed[importance]) {
        parsed[importance].forEach((item: any) => {
          const context: KeywordContext = {
            type: item.contextType,
            category: item.category
          };
          
          // Validate that the keyword is actually in the job description
          const keyword = item.keyword.toLowerCase();
          const jobDescLower = jobDescription.toLowerCase();
          
          if (jobDescLower.includes(keyword)) {
            all.push({
              keyword: keyword,
              context,
              importance: importance === 'niceToHave' ? 'nice-to-have' : importance as 'required' | 'preferred'
            });
            console.log(`✅ Validated keyword "${keyword}" found in JD`);
          } else {
            console.log(`❌ Rejected keyword "${keyword}" - not found in original JD`);
          }
        });
      }
    });

    console.log('AI extraction successful:', {
      total: all.length,
      required: all.filter(k => k.importance === 'required').length,
      preferred: all.filter(k => k.importance === 'preferred').length,
      keywords: all.map(k => k.keyword)
    });

    return {
      all,
      required: all.filter(k => k.importance === 'required'),
      preferred: all.filter(k => k.importance === 'preferred')
    };

  } catch (error) {
    console.error('Enhanced keyword extraction failed:', error);
    console.log('Falling back to basic extraction...');
    // Fallback to basic extraction
    return fallbackKeywordExtraction(jobDescription);
  }
}

/**
 * Fallback keyword extraction if AI fails
 * CONSERVATIVE: Only extracts very obvious keywords that are clearly present
 */
function fallbackKeywordExtraction(jobDescription: string): ExtractedKeywords {
  const text = jobDescription.toLowerCase();
  console.log('Using CONSERVATIVE fallback keyword extraction...');
  console.log('Job description text:', text.substring(0, 300) + '...');
  
  // Very conservative list - only most common, unambiguous terms
  const potentialTechnicalSkills = [
    'javascript', 'react', 'angular', 'vue', 'html', 'css', 'typescript',
    'node.js', 'python', 'java', 'sql', 'git'
  ];
  
  const technicalSkills: KeywordData[] = potentialTechnicalSkills
    .filter(skill => {
      // More strict matching - look for word boundaries
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const found = regex.test(text);
      if (found) {
        console.log(`✅ Found technical skill in JD: ${skill}`);
      }
      return found;
    })
    .map(skill => ({
      keyword: skill,
      context: { type: 'skill' as const, category: 'technical' },
      importance: 'required' as const
    }));

  // Very conservative qualifications
  const potentialQualifications = [
    'bachelor', 'master', 'degree', 'experience'
  ];
  
  const qualifications: KeywordData[] = potentialQualifications
    .filter(qual => {
      const found = text.includes(qual);
      if (found) {
        console.log(`✅ Found qualification in JD: ${qual}`);
      }
      return found;
    })
    .map(qual => ({
      keyword: qual,
      context: { type: 'degree' as const, category: 'education' },
      importance: 'required' as const
    }));

  // Very conservative experience terms
  const potentialExperienceTerms = [
    'frontend', 'backend', 'development'
  ];
  
  const experienceTerms: KeywordData[] = potentialExperienceTerms
    .filter(term => {
      const found = text.includes(term);
      if (found) {
        console.log(`✅ Found experience term in JD: ${term}`);
      }
      return found;
    })
    .map(term => ({
      keyword: term,
      context: { type: 'responsibility' as const, category: 'development' },
      importance: 'preferred' as const
    }));

  const all = [
    ...technicalSkills,
    ...qualifications,
    ...experienceTerms
  ];

  console.log('Conservative fallback extraction results:', {
    total: all.length,
    keywords: all.map(k => k.keyword)
  });

  return {
    all,
    required: all.filter(k => k.importance === 'required'),
    preferred: all.filter(k => k.importance === 'preferred')
  };
}

/**
 * Extract keywords with industry context
 */
export async function extractKeywordsWithIndustryContext(
  jobDescription: string,
  detectedIndustry: string
): Promise<ExtractedKeywords> {
  const industrySpecificPrompt = `You are analyzing a ${detectedIndustry} job description. 
  Focus on ${detectedIndustry}-specific terminology, tools, and requirements.`;
  
  // Use the enhanced extraction with industry context
  const keywords = await extractEnhancedJobKeywords(jobDescription);
  
  // Add industry context to all keywords
  keywords.all.forEach(keyword => {
    keyword.context.industry = detectedIndustry;
  });
  
  return keywords;
}

/**
 * Validate and clean extracted keywords
 */
export function validateAndCleanKeywords(keywords: ExtractedKeywords): ExtractedKeywords {
  // Remove duplicates and clean keywords
  const cleanKeyword = (keyword: string): string => {
    return keyword.toLowerCase().trim().replace(/[^\w\s+.-]/g, '');
  };
  
  const seenKeywords = new Set<string>();
  const cleanedAll: KeywordData[] = [];
  
  keywords.all.forEach(keywordData => {
    const cleaned = cleanKeyword(keywordData.keyword);
    if (cleaned.length > 1 && !seenKeywords.has(cleaned)) {
      seenKeywords.add(cleaned);
      cleanedAll.push({
        ...keywordData,
        keyword: cleaned
      });
    }
  });
  
  return {
    all: cleanedAll,
    required: cleanedAll.filter(k => k.importance === 'required'),
    preferred: cleanedAll.filter(k => k.importance === 'preferred')
  };
}

/**
 * Merge keywords from multiple sources
 */
export function mergeKeywordSources(
  primaryKeywords: ExtractedKeywords,
  secondaryKeywords: ExtractedKeywords
): ExtractedKeywords {
  const keywordMap = new Map<string, KeywordData>();
  
  // Add primary keywords first (higher priority)
  primaryKeywords.all.forEach(keyword => {
    keywordMap.set(keyword.keyword, keyword);
  });
  
  // Add secondary keywords if not already present
  secondaryKeywords.all.forEach(keyword => {
    if (!keywordMap.has(keyword.keyword)) {
      keywordMap.set(keyword.keyword, keyword);
    }
  });
  
  const all = Array.from(keywordMap.values());
  
  return {
    all,
    required: all.filter(k => k.importance === 'required'),
    preferred: all.filter(k => k.importance === 'preferred')
  };
} 