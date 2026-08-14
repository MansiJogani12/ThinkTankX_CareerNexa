import { streamText, Message } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";
import { computeSkillDNA } from "@/lib/skill-dna";

// Use Edge Runtime if desired, but we rely on firebase-admin which is Node.js. 
// So we use Node runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    const userDoc = await db.collection("users").doc(user.uid).get();
    const profile = userDoc.data()?.skillProfile || {};
    const targetRole = profile.targetRole || "Software Engineer";
    const dna = computeSkillDNA(profile);
    
    const contextStr = `
      User Profile Info:
      Target Role: ${targetRole}
      Experience Level: ${profile.experienceLevel || "Mid"}
      Technical Skills: ${(profile.technicalSkills || []).join(", ")}
      
      Skill DNA Analysis:
      - Top Strength: ${dna.strongestCategory}
      - Top Weakness: ${dna.weakestCategory}
      
      Use this context to give personalized career and learning advice.
    `;

    const systemPrompt = `You are a personalized AI Career and Learning Mentor named SkillForge AI.
Your goal is to provide concise, actionable, and personalized career advice.
${contextStr}

Format responses with markdown. Keep answers relatively brief unless the user asks for a detailed plan. Be encouraging but realistic.`;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
      system: systemPrompt,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Mentor chat error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
