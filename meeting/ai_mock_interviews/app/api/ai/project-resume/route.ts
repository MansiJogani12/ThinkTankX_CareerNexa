import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Project name and description are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    You are an expert resume writer. The user has built a project.
    Project Name: ${name}
    Project Description/Tech Stack: ${description}

    Write exactly 3 highly professional, ATS-friendly resume bullet points for this project.
    Each bullet must start with a strong action verb, include the technology used, and if possible, imply a metric or outcome (even if hypothetical but realistic).
    
    Return a JSON array of strings:
    [
      "Designed and implemented...",
      "Developed...",
      "Engineered..."
    ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const bullets = JSON.parse(text);

    return NextResponse.json({ bullets });
  } catch (error: any) {
    console.error("Error generating project bullets:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate bullets" },
      { status: 500 }
    );
  }
}
