import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";

export const runtime = "nodejs";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastUserMessage = messages.length > 0 
      ? messages[messages.length - 1].content 
      : body.prompt || "Hello";

    let profile: any = {};
    try {
      const { user } = await verifyAuth(req);
      if (user?.uid) {
        const userDoc = await db.collection("users").doc(user.uid).get();
        profile = userDoc.data()?.skillProfile || {};
      }
    } catch {}

    const targetRole = profile.targetRole || "Software Developer";
    const skills = (profile.technicalSkills || ["JavaScript", "Python", "SQL"]).join(", ");

    let reply = "";

    try {
      const systemPrompt = `You are an expert AI Career & Technical Mentor named CareerNexa AI.
User Target Role: ${targetRole}
User Current Skills: ${skills}

Provide concise, highly relevant, empathetic, and encouraging advice for the user's question. Use bullet points or short paragraphs where appropriate.`;

      const contents = `${systemPrompt}\n\nUser Question: ${lastUserMessage}`;

      const aiResult = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents,
      });

      if (aiResult.text) {
        reply = aiResult.text;
      }
    } catch (llmError) {
      console.warn("Gemini API call failed, falling back to smart contextual mentor:", llmError);
    }

    if (!reply) {
      const lowerQuery = lastUserMessage.toLowerCase();

      if (lowerQuery.includes("hi") || lowerQuery.includes("hello") || lowerQuery.includes("hey")) {
        reply = `Hello! 👋 I am your **CareerNexa AI Mentor**. How can I help you advance your career toward becoming a successful **${targetRole}** today?`;
      } else if (lowerQuery.includes("become") || lowerQuery.includes("role") || lowerQuery.includes("career")) {
        reply = `Based on your profile, you are currently targeting **${targetRole}**!\n\nHere are the top high-demand paths aligned with your skills (${skills}):\n1. **${targetRole}**: High demand, focus on system design and core frameworks.\n2. **Full Stack Developer**: Master React, Node.js, and database management.\n3. **Data Engineer / Analyst**: Expand into Python, SQL, and pipeline tools.\n\nUse our **Skill Gap** and **Roadmap** tools to track your progress step-by-step!`;
      } else if (lowerQuery.includes("interview") || lowerQuery.includes("prep")) {
        reply = `For your **${targetRole}** interview prep:\n• Practice technical mock interviews in our **Voice Mock Interview** module.\n• Focus on core data structures, system design, and practical coding scenarios.\n• Use STAR method (Situation, Task, Action, Result) for behavioral questions.`;
      } else {
        reply = `To help you succeed as a **${targetRole}**, I recommend focusing on mastering **${skills}** through hands-on projects, practicing mock interviews, and completing your personalized learning roadmap. What specific guidance or topic would you like to explore next?`;
      }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Mentor route exception:", error);
    return NextResponse.json(
      { reply: "I am ready to help you with career advice, mock interview strategies, and skill development! What specific topic would you like to discuss?" },
      { status: 200 }
    );
  }
}
