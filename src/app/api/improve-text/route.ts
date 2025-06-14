import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, improvementType, context } = await request.json();

    if (!text || !improvementType) {
      return NextResponse.json(
        { message: "Text and improvement type are required" },
        { status: 400 }
      );
    }

    // Define improvement prompts based on type
    const improvementPrompts = {
      professional: `Make this text more professional and formal while maintaining the same meaning. Use sophisticated vocabulary and business-appropriate language.`,
      enthusiastic: `Rewrite this text to be more enthusiastic and engaging while keeping it professional. Add energy and passion to the tone.`,
      concise: `Make this text more concise and impactful. Remove unnecessary words while preserving all key information and meaning.`,
      impactful: `Rewrite this text to be more impactful and compelling. Use stronger, more persuasive language that creates a lasting impression.`
    };

    const systemPrompt = `You are an expert writing assistant specializing in ${context || 'professional writing'}. 
    ${improvementPrompts[improvementType as keyof typeof improvementPrompts]}
    
    Provide exactly 3 different variations of the improved text. Each should:
    - Maintain the original meaning and key information
    - Be appropriate for a ${context || 'professional document'}
    - Flow naturally within the larger document
    - Be roughly the same length as the original (unless making it concise)
    
    Return your response as a JSON array of strings, with no additional formatting or explanation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Original text: "${text}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      // Try to parse as JSON array
      const suggestions = JSON.parse(content);
      if (Array.isArray(suggestions)) {
        return NextResponse.json({ suggestions });
      }
    } catch (parseError) {
      console.log("Parsing as JSON failed, processing as text");
    }

    // Fallback: split by lines and clean up
    const suggestions = content
      .split('\n')
      .filter(line => line.trim().length > 10)
      .map(line => line.replace(/^\d+\.\s*|^-\s*|^•\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Limit to 3 suggestions

    if (suggestions.length === 0) {
      suggestions.push(content.trim());
    }

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("Error improving text:", error);
    return NextResponse.json(
      { message: "Failed to improve text. Please try again." },
      { status: 500 }
    );
  }
} 