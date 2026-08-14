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

    const profile = userDoc.data()?.skillProfile || {};
    const dna = computeSkillDNA(profile);

    return NextResponse.json(dna);
  } catch (error: any) {
    console.error("Skill DNA error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
