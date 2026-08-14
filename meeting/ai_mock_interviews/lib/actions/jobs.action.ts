"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import type { Job } from "@/types/ai-career";

export async function saveUserJob(job: Job) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const jobId = job.id || Math.random().toString();
    const savedJobData = {
      ...job,
      id: jobId,
      status: "Saved",
      savedAt: new Date().toISOString(),
      userId: user.id
    };

    // Note: Mock DB may not fully support subcollections properly if not implemented.
    // However, the interface allows chaining. Let's see if admin.ts handles it.
    // If not, we will save it to a root collection "savedJobs" with userId filter.
    await db.collection("savedJobs").doc(jobId).set(savedJobData);
    
    return { success: true, jobId };
  } catch (error) {
    console.error("Error saving job:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function getSavedJobs() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const snapshot = await db.collection("savedJobs").where("userId", "==", user.id).get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return [];
  }
}
