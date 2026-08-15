import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, incrementRequestCount } from "@/lib/verifyAuth";
import { generateInterviewPrompt } from "@/lib/prompt";

const isDev = process.env.NODE_ENV === "development";
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { mode, round, skills, experience, pdfBase64, existingQuestions } = await req.json();

    if (!mode || !round) return NextResponse.json({ message: "Mode and round are required" }, { status: 400 });
    
    if (mode === "manual" && (!skills?.length || !experience?.trim()))
      return NextResponse.json({ message: "Skills and experience are required" }, { status: 400 });

    if (mode === "resume" && !pdfBase64)
      return NextResponse.json({ message: "PDF is required" }, { status: 400 });

    const parts: any[] = [
      { text: generateInterviewPrompt(round, mode, skills, experience, existingQuestions) },
    ];

    if (mode === "resume") {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
        },
      });
    }

    let jsonResponse;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
      });

      const rawText = response.text?.replace(/```json|```/g, "").trim();

      if (!rawText) {
        throw new Error("Ai returned empty response");
      }

      jsonResponse = JSON.parse(rawText);
      
      if (jsonResponse.error) {
        return NextResponse.json({ message: jsonResponse.error }, { status: 400 });
      }
    } catch (err) {
      if (isDev) {
        console.warn("API failed in development, using mock data", err);
        jsonResponse = {
          role: "Software Engineer",
          round: round,
          questions: [
            {
              id: 1,
              question: round === "hr" ? "Tell me about a time you had a conflict with a team member and how you resolved it." : "Explain how you would design a URL shortener system like Bitly.",
              hint: round === "hr" ? "Focus on communication, empathy, and finding a mutually beneficial solution." : "Mention data models, hashing algorithms, and scalability considerations like caching.",
              category: round === "hr" ? "Behavioral" : "System Design",
              difficulty: "Medium",
              whyAsked: round === "hr" ? "To evaluate your interpersonal and conflict resolution skills." : "To test your high-level architectural thinking.",
              strongAnswer: [
                "Give a specific example of the conflict.",
                "Describe the steps you took to resolve it professionally."
              ]
            },
            {
              id: 2,
              question: round === "hr" ? "Where do you see your career in 5 years?" : "What is the time complexity of searching for an element in a balanced binary search tree?",
              hint: round === "hr" ? "Show ambition and alignment with the company's trajectory." : "Explain why it is O(log n) and how the tree structure enables it.",
              category: round === "hr" ? "HR" : "Technical",
              difficulty: "Easy",
              whyAsked: round === "hr" ? "To assess your long-term goals and fit." : "To test fundamental computer science knowledge.",
              strongAnswer: [
                "Demonstrate enthusiasm for the role.",
                "Show clear progression in your skills."
              ]
            },
            {
              id: 3,
              question: round === "hr" ? "Describe a project where you had to learn a new technology quickly." : "How does the virtual DOM work in React and why is it useful?",
              hint: round === "hr" ? "Highlight your adaptability and learning process." : "Discuss diffing algorithms, batching updates, and performance benefits.",
              category: round === "hr" ? "Behavioral" : "Technical",
              difficulty: "Hard",
              whyAsked: round === "hr" ? "To see how you adapt to new challenges." : "To verify your deep understanding of the tool you use.",
              strongAnswer: [
                "Mention the resources you used to learn.",
                "Highlight the successful outcome."
              ]
            }
          ]
        };
      } else {
        return NextResponse.json({ message: "Failed to generate interview questions" }, { status: 500 });
      }
    }

    if (!user.hasProAccess()) {
      await incrementRequestCount(user.uid);
    }

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Generate Interview error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
