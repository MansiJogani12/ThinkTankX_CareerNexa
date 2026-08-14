import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { db } from "@/firebase/admin";
import { computeSkillDNA } from "@/lib/skill-dna";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userDoc = await db.collection("users").doc(user.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const data = userDoc.data();
    const profile = data?.skillProfile || {};
    const atsScore = data?.atsAnalysis?.atsScore || 0;
    
    // We compute a detailed readiness breakdown deterministically
    const dna = computeSkillDNA(profile);

    const breakdown = {
      skills: dna.technicalSkills.length > 5 ? 85 : 50,
      experience: profile.experienceLevel === "Senior" ? 95 : profile.experienceLevel === "Mid" ? 75 : 55,
      projects: (profile.projects || []).length > 2 ? 90 : (profile.projects || []).length > 0 ? 70 : 40,
      resume: atsScore,
    };

    // Calculate a weighted average
    const finalScore = Math.round(
      (breakdown.skills * 0.3) +
      (breakdown.experience * 0.2) +
      (breakdown.projects * 0.2) +
      (breakdown.resume * 0.3)
    );

    return NextResponse.json({
      score: finalScore,
      breakdown,
      dna
    });
  } catch (error: any) {
    console.error("Career Readiness error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
