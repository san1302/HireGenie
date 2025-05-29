import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { parseResumeFromFile, parseResumeFromText } from "../../../lib/resume-parser";

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
    console.log("sanitizedResumeText", extractedResumeText);
    // In a real implementation, you would call an AI service here
    // For this demo, we'll generate a placeholder cover letter
    const coverLetter = generatePlaceholderCoverLetter(
      sanitizedResumeText,
      sanitizedJobDescription,
    );

    // Add delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { message: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}

function generatePlaceholderCoverLetter(
  resumeText: string,
  jobDescription: string,
): string {
  // Extract some keywords from the job description
  const keywords = jobDescription
    .split(" ")
    .filter((word) => word.length > 5)
    .slice(0, 5)
    .map((word) => word.replace(/[^a-zA-Z]/g, ""));

  return `Dear Hiring Manager,

I am writing to express my interest in the position advertised. With my background and experience, I believe I am a strong candidate for this role.

Based on the job description, I understand you're looking for someone with expertise in ${keywords.join(", ")}. Throughout my career, I have developed strong skills in these areas and have consistently delivered results.

In my previous roles, I have:
- Successfully led projects requiring ${keywords[0] || "technical expertise"}
- Developed solutions involving ${keywords[1] || "problem-solving"}
- Collaborated with teams to implement ${keywords[2] || "innovative approaches"}

I am particularly excited about the opportunity to bring my experience in ${keywords[3] || "this field"} to your organization. Your company's focus on ${keywords[4] || "excellence"} aligns perfectly with my professional values.

Thank you for considering my application. I look forward to the possibility of discussing how my background, skills, and experiences would benefit your organization.

Sincerely,
Your Name
`;
}
