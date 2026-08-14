import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";
import { computeSkillDNA } from "@/lib/skill-dna";
import { generateRecommendations } from "@/lib/recommendationEngine";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentSkills, missingSkills, targetRole, experienceLevel } = await req.json();

    if (!targetRole || !currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json({ message: "targetRole and currentSkills are required" }, { status: 400 });
    }

    const missing = Array.isArray(missingSkills) ? missingSkills : [];

    const userDoc = await db.collection("users").doc(user.uid).get();
    const profile = userDoc.data()?.skillProfile || {};
    
    // Override profile attributes based on UI input
    profile.technicalSkills = currentSkills;
    profile.experienceLevel = experienceLevel;

    const dna = computeSkillDNA(profile);
    const jsonResponse = generateRecommendations(dna, missing, targetRole);

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Recommendations API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

