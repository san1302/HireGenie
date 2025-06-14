import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { coverLetter, section, style, jobDescription } = await request.json();

    // Validate required inputs
    if (!coverLetter || !section || !style) {
      return NextResponse.json(
        { message: "Cover letter, section, and style are required" },
        { status: 400 }
      );
    }

    // Define section improvement prompts
    const sectionPrompts = {
      opening: {
        impactful: `Rewrite the opening paragraph of this cover letter to be more impactful and attention-grabbing. The opening should immediately capture the hiring manager's interest and clearly establish the candidate's value proposition. Make it compelling and professional.`,
        professional: `Improve the opening paragraph to be more professional and polished while maintaining warmth and genuine interest. Use sophisticated language that demonstrates professionalism.`,
        enthusiastic: `Enhance the opening paragraph to be more enthusiastic and energetic while remaining professional. Show genuine excitement about the opportunity.`
      },
      middle: {
        professional: `Strengthen the body paragraphs of this cover letter to be more professional and compelling. Focus on quantifiable achievements, specific skills, and concrete examples that demonstrate value to the employer. Make the content more persuasive and results-oriented.`,
        impactful: `Rewrite the body paragraphs to be more impactful and persuasive. Emphasize measurable achievements, leadership examples, and specific contributions. Use powerful action verbs and quantified results.`,
        technical: `Enhance the body paragraphs to better highlight technical skills and expertise. Include specific technologies, methodologies, and technical achievements that align with the job requirements.`
      },
      closing: {
        enthusiastic: `Improve the closing paragraph to be more enthusiastic and compelling. Create a strong call-to-action that expresses genuine excitement about the opportunity and confidently requests next steps. Make it memorable and persuasive.`,
        professional: `Enhance the closing paragraph to be more professional and confident. Include a clear call-to-action and express appreciation while maintaining executive presence.`,
        impactful: `Rewrite the closing to be more impactful and memorable. Create urgency and excitement while remaining professional. Make the hiring manager want to contact the candidate immediately.`
      }
    };

    // Get the appropriate prompt
    const sectionKey = section as keyof typeof sectionPrompts;
    const styleKey = style as keyof typeof sectionPrompts[typeof sectionKey];
    
    if (!sectionPrompts[sectionKey] || !sectionPrompts[sectionKey][styleKey]) {
      return NextResponse.json(
        { message: "Invalid section or style specified" },
        { status: 400 }
      );
    }

    const improvementPrompt = sectionPrompts[sectionKey][styleKey];

    // Create system prompt for section-specific improvement
    const systemPrompt = `You are an expert career coach and professional writer specializing in cover letters. Your task is to improve a specific section of a cover letter while maintaining the overall flow and coherence of the document.

${improvementPrompt}

Important guidelines:
- Maintain the original meaning and key information
- Keep the improved section proportional to the original length
- Ensure the improved section flows naturally with the rest of the cover letter
- Use language appropriate for the industry and role
- Preserve any specific company names, job titles, or personal details mentioned
- Return ONLY the complete improved cover letter, not just the section

The job description context: ${jobDescription || 'Professional role'}`;

    const userPrompt = `Please improve the ${section} section of this cover letter with a ${style} approach:

Original Cover Letter:
${coverLetter}

Focus on improving the ${section} section specifically, but return the complete improved cover letter.`;

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
      temperature: 0.7,
      max_tokens: 1500, // Allow for full cover letter response
    });

    const improvedText = response.choices[0]?.message?.content;

    if (!improvedText) {
      throw new Error("No response from OpenAI");
    }

    return NextResponse.json({ 
      improvedText: improvedText.trim(),
      tokensUsed: response.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error("Error improving section:", error);
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        message: "Failed to improve section. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 