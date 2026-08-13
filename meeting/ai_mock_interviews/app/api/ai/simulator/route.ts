import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { targetRole, currentSkills } = await req.json();

    if (!targetRole) {
      return NextResponse.json(
        { message: "Target Role is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    You are an AI Career Simulator. A user wants to pivot to a new role.
    Target Role: ${targetRole}
    User's Current Skills: ${currentSkills?.join(", ") || "None"}

    Based on this, simulate:
    1. A "Career Readiness Score" (0-100).
    2. Missing Skills (array of strings).
    3. Simulated Job Market Data (number of jobs available, average salary range string).
    4. 3 simulated job match titles.

    Return JSON strictly matching this schema:
    {
      "readinessScore": number,
      "missingSkills": ["skill1", "skill2"],
      "marketData": {
         "jobsAvailable": number,
         "averageSalary": "string"
      },
      "simulatedJobs": ["job title 1", "job title 2", "job title 3"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error simulating career:", error);
    return NextResponse.json(
      { message: error.message || "Failed to simulate career" },
      { status: 500 }
    );
  }
}
