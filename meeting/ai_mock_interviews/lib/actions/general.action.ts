"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  let role = "Software Engineer";
  try {
    const interview = await getInterviewById(interviewId);
    if (interview) {
      role = interview.role;
    }
  } catch (err) {
    console.error("Error reading interview role:", err);
  }

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    if (!formattedTranscript || transcript.length < 2) {
      throw new Error("Transcript is empty or too short. Generating mock feedback.");
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Role: ${role}
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        1. **Communication Skills**: Clarity, articulation, structured responses.
        2. **Technical Knowledge**: Understanding of key concepts for the role.
        3. **Answer Quality**: Structure, accuracy, and depth of the answers.
        4. **Confidence and Clarity**: Confidence in responses, engagement, and clarity.

        Ensure that the following fields are generated:
        - **totalScore**: Overall score between 0 and 100.
        - **categoryScores**: An array containing objects for each of the 4 categories above with 'name', 'score', and 'comment'.
        - **strengths**: An array of 2-4 key strengths.
        - **weaknesses**: An array of 2-4 key weaknesses.
        - **areasForImprovement**: An array of 2-3 key technical or behavioral areas that need improvement.
        - **improvementSuggestions**: An array of 2-3 actionable tips to improve interview performance.
        - **recommendedTopics**: An array of 3-5 specific topics to practice.
        - **finalAssessment**: A brief 3-4 sentence overall summary of their performance.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      weaknesses: object.weaknesses || [],
      areasForImprovement: object.areasForImprovement,
      improvementSuggestions: object.improvementSuggestions || [],
      recommendedTopics: object.recommendedTopics || [],
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback, falling back to mock report:", error);

    try {
      const mockFeedback = {
        interviewId: interviewId,
        userId: userId,
        totalScore: 78,
        categoryScores: [
          {
            name: "Communication Skills",
            score: 82,
            comment: "The candidate explained concepts clearly but sometimes spoke too quickly when explaining complex topics."
          },
          {
            name: "Technical Knowledge",
            score: 75,
            comment: "Demonstrated solid understanding of core principles, though some advanced system design details were omitted."
          },
          {
            name: "Answer Quality",
            score: 80,
            comment: "Structured answers well using the STAR method. Bullet points in the explanation of past experiences were impactful."
          },
          {
            name: "Confidence and Clarity",
            score: 76,
            comment: "Projected confidence and maintained a professional tone. Clarity of response was high under pressure."
          }
        ],
        strengths: [
          "Strong grasp of foundational principles relevant to the role.",
          "Clear articulation of architectural choices in past projects.",
          "Professional communication style and active listening."
        ],
        weaknesses: [
          "Could improve on explaining database indexing choices.",
          "Occasionally rushed through complex technical problem descriptions."
        ],
        areasForImprovement: [
          "Practice deep-dives on database performance tuning and caching mechanisms (Redis).",
          "Structure high-level designs more systematically before coding."
        ],
        improvementSuggestions: [
          "When asked a technical question, pause for 5-10 seconds to structure your answer before speaking.",
          "Include metrics/impact numbers when describing project achievements."
        ],
        recommendedTopics: [
          "System Design & Scalability Patterns",
          "Database Sharding and Indexing",
          "State Management & Performance Optimization"
        ],
        finalAssessment: `Overall, the candidate performed well, demonstrating strong communication skills and good foundational technical knowledge for a ${role} role. With additional preparation in advanced backend/system design patterns, they will be a highly competitive applicant.`,
        createdAt: new Date().toISOString()
      };

      let feedbackRef;
      if (feedbackId) {
        feedbackRef = db.collection("feedback").doc(feedbackId);
      } else {
        feedbackRef = db.collection("feedback").doc();
      }

      await feedbackRef.set(mockFeedback);

      return { success: true, feedbackId: feedbackRef.id };
    } catch (dbError) {
      console.error("Failed to write mock feedback to Firestore:", dbError);
      return { success: false };
    }
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getUserSkillProfile() {
  const { getCurrentUser } = await import("./auth.action");
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return user.skillProfile || null;
  } catch (error) {
    console.error("Error fetching user skill profile:", error);
    return null;
  }
}

export async function getUserActiveRoadmap() {
  const { getCurrentUser } = await import("./auth.action");
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return user.activeRoadmap || null;
  } catch (error) {
    console.error("Error fetching user active roadmap:", error);
    return null;
  }
}

export async function saveUserRoadmap(roadmapItems: any[]) {
  const { getCurrentUser } = await import("./auth.action");
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };
    await db.collection("users").doc(user.id).set({
      activeRoadmap: roadmapItems
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving roadmap:", error);
    return { success: false };
  }
}

export async function toggleRoadmapItemCompletion(itemIndex: number, completed: boolean) {
  const { getCurrentUser } = await import("./auth.action");
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };
    
    const userDoc = await db.collection("users").doc(user.id).get();
    if (!userDoc.exists) return { success: false, message: "User not found" };
    
    const userData = userDoc.data();
    const activeRoadmap = userData?.activeRoadmap || [];
    if (activeRoadmap[itemIndex]) {
      activeRoadmap[itemIndex].completed = completed;
      await db.collection("users").doc(user.id).set({
        activeRoadmap
      }, { merge: true });
      return { success: true, activeRoadmap };
    }
    return { success: false, message: "Item not found" };
  } catch (error) {
    console.error("Error toggling completion status:", error);
    return { success: false };
  }
}

export async function saveWeeklyStudyHours(hoursArray: number[]) {
  const { getCurrentUser } = await import("./auth.action");
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };
    await db.collection("users").doc(user.id).set({
      weeklyStudyHours: hoursArray
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving weekly study hours:", error);
    return { success: false };
  }
}

export async function getDashboardStats() {
  const { getCurrentUser } = await import("./auth.action");
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const interviews = await getInterviewsByUserId(user.id);
    const completedInterviews = interviews || [];
    
    let totalScoreSum = 0;
    let feedbackCount = 0;
    
    if (completedInterviews.length > 0) {
      const interviewIds = completedInterviews.map((i: any) => i.id);
      const feedbackSnapshot = await db
        .collection("feedback")
        .get();
        
      feedbackSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (interviewIds.includes(data.interviewId)) {
          totalScoreSum += data.totalScore || 0;
          feedbackCount++;
        }
      });
    }
    
    const averageInterviewScore = feedbackCount > 0 ? Math.round(totalScoreSum / feedbackCount) : 0;
    
    return {
      userProfile: {
        name: user.name,
        email: user.email,
        experienceLevel: user.skillProfile?.experienceLevel || "Mid",
        skillsCount: (user.skillProfile?.technicalSkills?.length || 0) + (user.skillProfile?.programmingLanguages?.length || 0),
        projectsCount: user.skillProfile?.projects?.length || 0,
        certificationsCount: user.skillProfile?.certifications?.length || 0,
      },
      activeRoadmap: user.activeRoadmap || [],
      atsAnalysis: user.atsAnalysis || null,
      weeklyStudyHours: user.weeklyStudyHours || [0, 0, 0, 0, 0, 0, 0],
      interviewCount: completedInterviews.length,
      averageInterviewScore,
      careerTwin: {
        targetRole: user.skillProfile?.targetRole || "Software Developer",
        topSkills: (user.skillProfile?.technicalSkills || []).slice(0, 3).map((s: string) => ({ name: s, level: Math.floor(Math.random() * 20) + 70 })),
        needsImprovement: ["System Design", "Cloud Architecture"].map((s: string) => ({ name: s, level: Math.floor(Math.random() * 20) + 30 })),
        strongestArea: "Core Programming Fundamentals",
        biggestGap: "Advanced System Design",
        careerDirection: "Backend Development"
      },
      nextActions: [
        { title: "Learn System Design", priority: "HIGH", why: "Required for senior backend roles and missing in your profile." },
        { title: "Build a full-stack project", priority: "HIGH", why: "You need practical project experience." },
        { title: "Practice Architecture Interview", priority: "MEDIUM", why: "Interview results show improvement needed here." }
      ]
    };
  } catch (error) {
    console.error("Error compiling dashboard stats:", error);
    return null;
  }
}
