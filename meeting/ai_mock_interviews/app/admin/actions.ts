"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

export async function createAdminInterview(data: {
  role: string;
  type: string;
  level: string;
  techstack: string[];
  questions: string[];
}) {
  try {
    const interviewRef = db.collection("interviews").doc();
    const interview = {
      ...data,
      userId: "system", // Default user credentials for admin interviews
      finalized: true,
      createdAt: new Date().toISOString(),
    };
    
    await interviewRef.set(interview);
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, id: interviewRef.id };
  } catch (error) {
    console.error("Error creating admin interview:", error);
    return { success: false, error: "Failed to create interview" };
  }
}
