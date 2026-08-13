import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";
import { computeSkillDNA } from "@/lib/skill-dna";
import { generateAdaptiveRoadmap } from "@/lib/roadmapEngine";

export async function POST(req: NextRequest) {
  try {
    const { currentSkills, experienceLevel, projects, targetRole, difficultyLevel, timeframe } = await req.json();

    if (!targetRole || !currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json({ message: "targetRole and currentSkills array are required" }, { status: 400 });
    }

    let profile: any = {};
    try {
      const { user } = await verifyAuth(req);
      if (user?.uid) {
        const userDoc = await db.collection("users").doc(user.uid).get();
        profile = userDoc.data()?.skillProfile || {};
      }
    } catch {}
    
    profile.technicalSkills = currentSkills;
    profile.experienceLevel = experienceLevel || "Mid";
    profile.projects = projects || [];

    const dna = computeSkillDNA(profile);
    const jsonResponse = await generateAdaptiveRoadmap(
      dna,
      targetRole,
      difficultyLevel || "Intermediate",
      timeframe || "3 Months"
    );

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Roadmap API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
