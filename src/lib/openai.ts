// OpenAI Service for Cover Letter Generation
// Handles communication with OpenAI API for generating personalized cover letters

import OpenAI from 'openai';

// TypeScript types for our service
export interface CoverLetterRequest {
  resumeText: string;
  jobDescription: string;
  tone?: 'Professional' | 'Conversational' | 'Enthusiastic' | 'Formal';
}

export interface CoverLetterResponse {
  success: true;
  coverLetter: string;
  tokensUsed?: number;
}

export interface CoverLetterError {
  success: false;
  error: string;
  details?: string;
  retryable?: boolean;
}

export type CoverLetterResult = CoverLetterResponse | CoverLetterError;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const DEFAULT_MODEL = 'gpt-4o-mini'; // Cost-effective model for cover letters
const MAX_TOKENS = 1000; // Reasonable length for cover letters
const TEMPERATURE = 0.7; // Balance between creativity and consistency

/**
 * Generate a personalized cover letter using OpenAI
 */
export async function generateCoverLetter({
  resumeText,
  jobDescription,
  tone = 'Professional'
}: CoverLetterRequest): Promise<CoverLetterResult> {
  try {
    // Validate inputs
    if (!resumeText.trim()) {
      return {
        success: false,
        error: 'Resume text is required',
        details: 'Cannot generate cover letter without resume content'
      };
    }

    if (!jobDescription.trim()) {
      return {
        success: false,
        error: 'Job description is required',
        details: 'Cannot generate cover letter without job description'
      };
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY environment variable',
        retryable: false
      };
    }

    // Create the prompt
    const systemPrompt = createSystemPrompt(tone);
    const userPrompt = createUserPrompt(resumeText, jobDescription);

    console.log('Generating cover letter with OpenAI...');
    console.log(`Model: ${DEFAULT_MODEL}, Tone: ${tone}`);

    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    });

    // Extract the generated cover letter
    const coverLetter = completion.choices[0]?.message?.content;

    if (!coverLetter) {
      return {
        success: false,
        error: 'No cover letter generated',
        details: 'OpenAI returned empty response',
        retryable: true
      };
    }

    console.log(`Cover letter generated successfully. Tokens used: ${completion.usage?.total_tokens || 'unknown'}`);

    return {
      success: true,
      coverLetter: coverLetter.trim(),
      tokensUsed: completion.usage?.total_tokens
    };

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid OpenAI API key',
          details: 'Please check your OpenAI API key configuration',
          retryable: false
        };
      }

      if (error.status === 429) {
        return {
          success: false,
          error: 'OpenAI rate limit exceeded',
          details: 'Please try again in a few moments',
          retryable: true
        };
      }

      if (error.status === 500) {
        return {
          success: false,
          error: 'OpenAI service error',
          details: 'OpenAI is experiencing issues. Please try again later',
          retryable: true
        };
      }

      return {
        success: false,
        error: 'OpenAI API error',
        details: `${error.status}: ${error.message}`,
        retryable: error.status >= 500
      };
    }

    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error',
        details: 'Unable to connect to OpenAI. Please check your internet connection',
        retryable: true
      };
    }

    // Handle unknown errors
    return {
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: true
    };
  }
}

/**
 * Create system prompt based on tone
 */
function createSystemPrompt(tone: string): string {
  const basePrompt = `You are an expert cover letter writer. Your task is to create personalized, compelling cover letters that help job seekers stand out.

Key requirements:
- Write in a ${tone} tone
- Keep it as organic as possible
- Keep it concise (3-4 paragraphs)
- Highlight relevant skills and experiences from the resume
- Show enthusiasm for the specific role and company
- Include a strong opening and closing
- Avoid generic phrases and clichés
- Make it ATS-friendly
- Do not include placeholder text like [Your Name] or [Company Name]

Format the cover letter as a complete, ready-to-send document.`;

  return basePrompt;
}

/**
 * Create user prompt with resume and job description
 */
function createUserPrompt(resumeText: string, jobDescription: string): string {
  return `Please write a personalized cover letter based on the following:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Generate a cover letter that specifically connects the candidate's experience from their resume to the requirements mentioned in the job description. Focus on the most relevant skills and achievements that match what the employer is looking for.`;
}

/**
 * Check if OpenAI service is properly configured
 */
export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return false;
    }

    // Make a simple API call to test connectivity
    const response = await openai.models.list();
    return response.data.length > 0;
  } catch (error) {
    console.error('OpenAI health check failed:', error);
    return false;
  }
} 