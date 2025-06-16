import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { coverLetter, jobDescription } = await request.json();

    // Validate required inputs
    if (!coverLetter || !coverLetter.trim()) {
      return NextResponse.json(
        { message: "Cover letter content is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert career coach and professional writer specializing in cover letter analysis. Your task is to analyze a cover letter and intelligently identify its sections, boundaries, and provide detailed quality assessment.

IMPORTANT: You must respond with a valid JSON object only. No additional text or explanations outside the JSON.

Analyze the cover letter and identify:
1. Header content (contact info, date, recipient address - everything before the actual letter)
2. Section boundaries (where each section starts and ends)
3. Footer content (signature, any content after the main letter)
4. Content quality and issues for each section
5. Specific recommendations for improvement

Return a JSON object with this exact structure:
{
  "header": "extracted header content (contact info, addresses, etc.)",
  "sections": {
    "opening": {
      "content": "extracted opening text",
      "score": 85,
      "issues": ["specific issue 1", "specific issue 2"],
      "strengths": ["strength 1", "strength 2"],
      "recommendations": ["recommendation 1", "recommendation 2"]
    },
    "body": {
      "content": "extracted body text", 
      "score": 75,
      "issues": ["specific issue 1"],
      "strengths": ["strength 1"],
      "recommendations": ["recommendation 1"]
    },
    "closing": {
      "content": "extracted closing text",
      "score": 80,
      "issues": ["specific issue 1"],
      "strengths": ["strength 1"], 
      "recommendations": ["recommendation 1"]
    }
  },
  "footer": "extracted footer content (signature, etc.)",
  "overallAnalysis": {
    "totalScore": 80,
    "keyStrengths": ["overall strength 1", "overall strength 2"],
    "criticalIssues": ["critical issue 1", "critical issue 2"],
    "improvementPriority": ["high priority item 1", "high priority item 2"]
  }
}

Guidelines for section identification:
- Header: Contact information, date, recipient address, anything before "Dear..." or greeting
- Opening: Introduction, greeting, position interest, initial value proposition (typically starts with "Dear..." and includes the first paragraph)
- Body: Main qualifications, experience, skills, achievements, company research (middle paragraphs with substance)
- Closing: The final substantive paragraph with call-to-action, next steps, gratitude (e.g., "I would welcome the opportunity...", "Thank you for considering...")
- Footer: Signature line, printed name, any content after the closing paragraph (e.g., "Sincerely,", "Best regards,", followed by name)

Guidelines for scoring (0-100):
- 90-100: Exceptional, compelling, professional
- 80-89: Strong, well-written, minor improvements needed
- 70-79: Good, solid content, some improvements needed
- 60-69: Adequate, needs significant improvement
- Below 60: Poor, major issues, requires substantial revision

Focus on:
- Relevance to the job/company
- Professional tone and language
- Specific examples and achievements
- Clear value proposition
- Proper structure and flow
- Grammar and clarity`;

    const userPrompt = `Please analyze this cover letter and provide detailed section analysis:

Cover Letter:
${coverLetter}

${jobDescription ? `Job Context: ${jobDescription}` : ''}

Provide the analysis in the exact JSON format specified.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000,
    });

    const analysisText = response.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error("Invalid response format from AI");
    }

    // Validate the response structure
    if (!analysisData.sections || !analysisData.overallAnalysis) {
      throw new Error("Invalid analysis structure from AI");
    }

    return NextResponse.json({
      analysis: analysisData,
      tokensUsed: response.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error("Error in analyze-sections API:", error);
    
    // Return a structured error response
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Failed to analyze sections",
        error: "ANALYSIS_FAILED"
      },
      { status: 500 }
    );
  }
} 