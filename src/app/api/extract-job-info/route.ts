import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a job information extraction expert. Extract key information from job descriptions and return ONLY a valid JSON object with the following structure:

{
  "jobTitle": "exact job title",
  "company": "company name", 
  "location": "work location or 'Remote'",
  "industry": "industry category",
  "department": "department if mentioned",
  "experienceLevel": "entry/mid/senior/executive",
  "workType": "full-time/part-time/contract/internship"
}

Rules:
- Always return valid JSON
- Use "Not specified" if information is unclear
- For location, prioritize "Remote" if mentioned, otherwise extract city/state
- Keep jobTitle concise and professional
- Industry should be broad categories like "Technology", "Healthcare", "Finance", etc.
- ExperienceLevel should be one of: entry, mid, senior, executive`
        },
        {
          role: "user",
          content: `Extract job information from this job description:\n\n${jobDescription}`
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const extractedText = completion.choices[0]?.message?.content;
    
    if (!extractedText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let jobInfo;
    try {
      jobInfo = JSON.parse(extractedText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", extractedText);
      // Fallback to default structure
      jobInfo = {
        jobTitle: "Position Not Specified",
        company: "Company Not Specified", 
        location: "Not specified",
        industry: "Not specified",
        department: "Not specified",
        experienceLevel: "Not specified",
        workType: "Not specified"
      };
    }

    // Validate required fields exist
    const requiredFields = ['jobTitle', 'company', 'location', 'industry'];
    const missingFields = requiredFields.filter(field => !jobInfo[field]);
    
    if (missingFields.length > 0) {
      console.warn("Missing fields in OpenAI response:", missingFields);
      // Fill in missing fields
      missingFields.forEach(field => {
        jobInfo[field] = "Not specified";
      });
    }

    return NextResponse.json({
      success: true,
      jobInfo: {
        jobTitle: jobInfo.jobTitle || "Position Not Specified",
        company: jobInfo.company || "Company Not Specified",
        location: jobInfo.location || "Not specified", 
        industry: jobInfo.industry || "Not specified",
        department: jobInfo.department || "Not specified",
        experienceLevel: jobInfo.experienceLevel || "Not specified",
        workType: jobInfo.workType || "Not specified"
      }
    });

  } catch (error) {
    console.error("Error extracting job info:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to extract job information",
        success: false,
        jobInfo: {
          jobTitle: "Position Not Specified",
          company: "Company Not Specified",
          location: "Not specified",
          industry: "Not specified", 
          department: "Not specified",
          experienceLevel: "Not specified",
          workType: "Not specified"
        }
      },
      { status: 500 }
    );
  }
} 