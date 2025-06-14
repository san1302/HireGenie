// OpenAI Service for Cover Letter Generation
// Handles communication with OpenAI API for generating personalized cover letters

import OpenAI from 'openai';

// TypeScript types for our service
export interface CoverLetterRequest {
  resumeText: string;
  jobDescription: string;
  tone?: 'Professional' | 'Conversational' | 'Enthusiastic' | 'Formal';
  length?: 'Concise' | 'Standard' | 'Detailed' | 'Comprehensive';
}

export interface CoverLetterResponse {
  success: true;
  coverLetter: string;
  processedJobDescription: string;
  tokensUsed?: number;
}

export interface CoverLetterError {
  success: false;
  error: string;
  details?: string;
  retryable?: boolean;
}

export type CoverLetterResult = CoverLetterResponse | CoverLetterError;

// Job description processing types
export interface JobDescriptionProcessResult {
  success: true;
  processedContent: string;
  tokensUsed?: number;
}

export interface JobDescriptionProcessError {
  success: false;
  error: string;
  details?: string;
  retryable?: boolean;
}

export type JobDescriptionResult = JobDescriptionProcessResult | JobDescriptionProcessError;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const DEFAULT_MODEL = 'gpt-4o-mini'; // Cost-effective model for cover letters
const MAX_TOKENS = 1000; // Reasonable length for cover letters
const TEMPERATURE = 0.7; // Balance between creativity and consistency

/**
 * Process job description input using OpenAI to extract meaningful content
 */
export async function processJobDescriptionWithAI(input: string): Promise<JobDescriptionResult> {
  try {
    if (!input.trim()) {
      return {
        success: false,
        error: 'Job description input is required',
        details: 'Cannot process empty job description'
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY environment variable',
        retryable: false
      };
    }

    console.log('Processing job description with OpenAI...');

    const systemPrompt = `You are an expert at extracting and processing job description content. Your task is to:

1. If the input contains URLs, extract the job description content from those URLs
2. If the input is mixed content (URLs + text), combine and process everything
3. If the input is plain text, clean and structure it
4. Return a clean, comprehensive job description that includes:
   - Job title and company (if available)
   - Key responsibilities
   - Required skills and qualifications
   - Any other relevant job details

Return ONLY the processed job description content, nothing else. Do not include any explanations or metadata.`;

    const userPrompt = `Please process this job description input and return clean, structured job description content:

${input}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000, // Allow more tokens for job description processing
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    const processedContent = completion.choices[0]?.message?.content;

    if (!processedContent) {
      return {
        success: false,
        error: 'No content extracted from job description',
        details: 'OpenAI returned empty response',
        retryable: true
      };
    }

    console.log(`Job description processed successfully. Tokens used: ${completion.usage?.total_tokens || 'unknown'}`);

    return {
      success: true,
      processedContent: processedContent.trim(),
      tokensUsed: completion.usage?.total_tokens
    };

  } catch (error) {
    console.error('Job description processing error:', error);

    // Handle specific OpenAI errors (same as in generateCoverLetter)
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

      return {
        success: false,
        error: 'OpenAI API error',
        details: `${error.status}: ${error.message}`,
        retryable: error.status >= 500
      };
    }

    return {
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: true
    };
  }
}

/**
 * Generate a personalized cover letter using OpenAI
 */
export async function generateCoverLetter({
  resumeText,
  jobDescription,
  tone = 'Professional',
  length = 'Standard'
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

    // First, process the job description to get clean content
    console.log('Step 1: Processing job description...');
    const jobDescriptionResult = await processJobDescriptionWithAI(jobDescription);
    
    if (!jobDescriptionResult.success) {
      return {
        success: false,
        error: 'Failed to process job description',
        details: jobDescriptionResult.details,
        retryable: jobDescriptionResult.retryable
      };
    }

    const processedJobDescription = jobDescriptionResult.processedContent;
    console.log("processedJobDescription: ", processedJobDescription);
    console.log('Step 2: Generating cover letter with processed job description...');

    // Create the prompt
    const systemPrompt = createSystemPrompt(tone, length);
    const userPrompt = createUserPrompt(resumeText, processedJobDescription);

    console.log(`Model: ${DEFAULT_MODEL}, Tone: ${tone}`);

    // Make OpenAI API call for cover letter generation
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

    const totalTokens = (jobDescriptionResult.tokensUsed || 0) + (completion.usage?.total_tokens || 0);
    console.log(`Cover letter generated successfully. Total tokens used: ${totalTokens}`);

    return {
      success: true,
      coverLetter: coverLetter.trim(),
      processedJobDescription: processedJobDescription,
      tokensUsed: totalTokens
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
 * Create system prompt based on tone and length
 */
function createSystemPrompt(tone: string, length: string): string {
  // Get length-specific instructions
  const getLengthInstructions = (length: string): string => {
    switch (length) {
      case 'Concise':
        return 'Keep it concise (2-3 paragraphs, 150-250 words). Focus on the most impactful points.';
      case 'Standard':
        return 'Keep it standard length (3-4 paragraphs, 250-350 words). Balance detail with conciseness.';
      case 'Detailed':
        return 'Provide detailed coverage (4-5 paragraphs, 350-450 words). Include specific examples and achievements.';
      case 'Comprehensive':
        return 'Provide comprehensive coverage (5+ paragraphs, 450+ words). Include extensive detail about experience and qualifications.';
      default:
        return 'Keep it concise (3-4 paragraphs).';
    }
  };

  const basePrompt = `You are an expert cover letter writer. Your task is to create personalized, compelling cover letters that help job seekers stand out.

Key requirements:
- Write in a ${tone} tone
- Keep it as organic as possible
- ${getLengthInstructions(length)}
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