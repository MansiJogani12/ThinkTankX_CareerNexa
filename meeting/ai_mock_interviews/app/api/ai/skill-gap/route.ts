import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";
import { computeSkillDNA } from "@/lib/skill-dna";
import { analyzeSkillGap } from "@/lib/roadmapEngine";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentSkills, targetRole } = await req.json();

    if (!targetRole || !currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json({ message: "targetRole and currentSkills array are required" }, { status: 400 });
    }

    // Use deterministic skill-dna and roadmap engine instead of LLM
    const userDoc = await db.collection("users").doc(user.uid).get();
    const profile = userDoc.data()?.skillProfile || {};
    
    // Override profile skills with the ones passed in (if they edited them in UI)
    profile.technicalSkills = currentSkills;
    
    const dna = computeSkillDNA(profile);
    const jsonResponse = await analyzeSkillGap(dna, targetRole);

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Skill Gap API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

