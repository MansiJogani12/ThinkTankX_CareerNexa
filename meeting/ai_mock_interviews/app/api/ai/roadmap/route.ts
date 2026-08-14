import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";
import { computeSkillDNA } from "@/lib/skill-dna";
import { generateAdaptiveRoadmap } from "@/lib/roadmapEngine";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentSkills, experienceLevel, projects, targetRole } = await req.json();

    if (!targetRole || !currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json({ message: "targetRole and currentSkills array are required" }, { status: 400 });
    }

    const userDoc = await db.collection("users").doc(user.uid).get();
    const profile = userDoc.data()?.skillProfile || {};
    
    // Override profile attributes based on UI input
    profile.technicalSkills = currentSkills;
    profile.experienceLevel = experienceLevel;
    profile.projects = projects;

    const dna = computeSkillDNA(profile);
    const jsonResponse = await generateAdaptiveRoadmap(dna, targetRole);

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Roadmap API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

