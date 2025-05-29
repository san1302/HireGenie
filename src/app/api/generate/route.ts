import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { parseResumeFromFile, parseResumeFromText } from "../../../lib/resume-parser";
import { generateCoverLetter } from "../../../lib/openai";

// Rate limiting map: IP -> {count, timestamp}
type RateLimitEntry = { count: number; timestamp: number };
const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT = 5; // requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
export async function POST(request: NextRequest) {
  try {
    // Get user IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    // Check rate limit
    const now = Date.now();
    const rateLimitEntry = rateLimitMap.get(ip) || { count: 0, timestamp: now };

    // Reset count if outside window
    if (now - rateLimitEntry.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitEntry.count = 0;
      rateLimitEntry.timestamp = now;
    }

    // Check if authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Apply rate limiting for unauthenticated users
    if (!user && rateLimitEntry.count >= RATE_LIMIT) {
      return NextResponse.json(
        { message: "Rate limit exceeded. Please try again later or sign in." },
        { status: 429 },
      );
    }

    // Increment rate limit counter for unauthenticated users
    if (!user) {
      rateLimitEntry.count += 1;
      rateLimitMap.set(ip, rateLimitEntry);
    }

    // Check subscription for authenticated users
    let hasActiveSubscription = false;
    if (user) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      hasActiveSubscription = !!subscription;
    }

    // Parse form data
    const formData = await request.formData();
    const resumeFile = formData.get("resume_file") as File | null;
    const resumeText = formData.get("resume_text") as string | null;
    const jobDescription = formData.get("job_description") as string;
    const tone = formData.get("tone") as string || "Professional";

    if (!jobDescription) {
      return NextResponse.json(
        { message: "Job description is required" },
        { status: 400 },
      );
    }

    if (!resumeFile && !resumeText) {
      return NextResponse.json(
        { message: "Resume file or text is required" },
        { status: 400 },
      );
    }

    // Extract resume text using the resume parser service
    let extractedResumeText = "";
    
    if (resumeFile) {
      console.log(`Processing resume file: ${resumeFile.name} (${resumeFile.size} bytes)`);
      
      const parseResult = await parseResumeFromFile(resumeFile);
      
      if (!parseResult.success) {
        console.error("Resume parsing failed:", parseResult.error, parseResult.details);
        return NextResponse.json(
          { 
            message: "Failed to parse resume file", 
            error: parseResult.error,
            details: parseResult.details 
          },
          { status: 400 },
        );
      }
      
      extractedResumeText = parseResult.text;
      console.log(`Successfully extracted ${parseResult.word_count} words from resume`);
      
    } else if (resumeText) {
      console.log("Processing resume text input");
      
      const parseResult = await parseResumeFromText(resumeText);
      
      if (!parseResult.success) {
        console.error("Resume text parsing failed:", parseResult.error, parseResult.details);
        return NextResponse.json(
          { 
            message: "Failed to parse resume text", 
            error: parseResult.error,
            details: parseResult.details 
          },
          { status: 400 },
        );
      }
      
      extractedResumeText = parseResult.text;
      console.log(`Successfully processed ${parseResult.word_count} words from resume text`);
    }

    // Sanitize inputs
    const sanitizedResumeText = extractedResumeText.slice(0, 10000);
    const sanitizedJobDescription = jobDescription.slice(0, 10000);

    // Generate cover letter using OpenAI
    console.log(`Generating cover letter with tone: ${tone}`);
    
    const coverLetterResult = await generateCoverLetter({
      resumeText: sanitizedResumeText,
      jobDescription: sanitizedJobDescription,
      tone: tone as 'Professional' | 'Conversational' | 'Enthusiastic' | 'Formal'
    });

    if (!coverLetterResult.success) {
      console.error("Cover letter generation failed:", coverLetterResult.error, coverLetterResult.details);
      
      // Return specific error based on whether it's retryable
      const statusCode = coverLetterResult.retryable ? 503 : 400;
      
      return NextResponse.json(
        { 
          message: "Failed to generate cover letter", 
          error: coverLetterResult.error,
          details: coverLetterResult.details,
          retryable: coverLetterResult.retryable 
        },
        { status: statusCode },
      );
    }

    console.log(`Cover letter generated successfully. Tokens used: ${coverLetterResult.tokensUsed || 'unknown'}`);

    return NextResponse.json({ 
      coverLetter: coverLetterResult.coverLetter,
      tokensUsed: coverLetterResult.tokensUsed 
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { message: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
