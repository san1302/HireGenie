// Resume Parser API Service
// Handles communication with the local resume parser service running on localhost:8000

// TypeScript types for API responses
export interface ResumeParserSuccessResponse {
  success: true;
  text: string;
  word_count: number;
}

export interface ResumeParserErrorResponse {
  detail: Array<{
    type: string;
    loc: string[];
    msg: string;
    input?: any;
    url?: string;
  }>;
}

export interface ResumeParserError {
  success: false;
  error: string;
  details?: string;
}

export type ResumeParserResponse = ResumeParserSuccessResponse | ResumeParserError;

// Configuration
const RESUME_PARSER_BASE_URL = 'http://localhost:8000';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Parse resume from uploaded file
 */
export async function parseResumeFromFile(file: File): Promise<ResumeParserResponse> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit',
        details: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return {
        success: false,
        error: 'Invalid file type',
        details: 'Only PDF, DOC, and DOCX files are supported'
      };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('max_size', MAX_FILE_SIZE.toString());

    // Make API call
    const response = await fetch(`${RESUME_PARSER_BASE_URL}/parse/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 422) {
        // Validation error from the API
        const errorData: ResumeParserErrorResponse = await response.json();
        const errorMessage = errorData.detail?.[0]?.msg || 'Validation error';
        return {
          success: false,
          error: 'File validation failed',
          details: errorMessage
        };
      }

      return {
        success: false,
        error: 'Resume parser service error',
        details: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    
    // Validate response structure
    if (data.success && typeof data.text === 'string') {
      return {
        success: true,
        text: data.text,
        word_count: data.word_count || 0
      };
    }

    return {
      success: false,
      error: 'Invalid response from resume parser',
      details: 'Response does not contain expected text field'
    };

  } catch (error) {
    console.error('Resume parser API error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Resume parser service unavailable',
        details: 'Could not connect to resume parser service. Please ensure it is running on localhost:8000'
      };
    }

    return {
      success: false,
      error: 'Unexpected error during resume parsing',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Parse resume from text input
 */
export async function parseResumeFromText(text: string): Promise<ResumeParserResponse> {
  try {
    if (!text.trim()) {
      return {
        success: false,
        error: 'Empty text provided',
        details: 'Resume text cannot be empty'
      };
    }

    // Make API call
    const response = await fetch(`${RESUME_PARSER_BASE_URL}/parse/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      if (response.status === 422) {
        // Validation error from the API
        const errorData: ResumeParserErrorResponse = await response.json();
        const errorMessage = errorData.detail?.[0]?.msg || 'Validation error';
        return {
          success: false,
          error: 'Text validation failed',
          details: errorMessage
        };
      }

      return {
        success: false,
        error: 'Resume parser service error',
        details: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    
    // Validate response structure
    if (data.success && typeof data.text === 'string') {
      return {
        success: true,
        text: data.text,
        word_count: data.word_count || 0
      };
    }

    return {
      success: false,
      error: 'Invalid response from resume parser',
      details: 'Response does not contain expected text field'
    };

  } catch (error) {
    console.error('Resume parser API error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Resume parser service unavailable',
        details: 'Could not connect to resume parser service. Please ensure it is running on localhost:8000'
      };
    }

    return {
      success: false,
      error: 'Unexpected error during resume parsing',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if resume parser service is available
 */
export async function checkResumeParserHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${RESUME_PARSER_BASE_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.service === 'Resume Parser API' && data.status === 'running';
    }
    
    return false;
  } catch (error) {
    console.error('Resume parser health check failed:', error);
    return false;
  }
} 