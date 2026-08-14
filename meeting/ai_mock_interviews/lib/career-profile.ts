import { db } from "@/firebase/admin";
import { calculateCareerReadiness } from "./career-readiness";

export interface CareerProfile {
  userId: string;
  targetRole: string;
  preferredCity: string;
  skills: string[];
  softSkills: string[];
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ title: string; company: string; duration: string }>;
  projects: Array<{ name: string; description: string; techStack?: string[] }>;
  certifications: Array<{ name: string; issuer: string; year?: string }>;
  resumeAnalysis?: {
    atsScore?: number;
    summary?: string;
    strengths?: string[];
  };
  atsScore: number;
  interviewStats: {
    totalCompleted: number;
    averageScore: number;
    topStrengths: string[];
    areasToImprove: string[];
  };
  jobMatchStats: {
    topMatchScore: number;
    savedJobsCount: number;
    applicationsCount: number;
  };
  roadmapProgress: {
    totalMilestones: number;
    completedMilestones: number;
    percentage: number;
  };
  careerReadiness: number; // 0 to 100
  updatedAt: string;
}

// Helper to detect if the profile is the hardcoded legacy fake data
function isFakeSkillProfile(sp: any) {
  if (!sp) return false;
  const hasFakeLang = sp.programmingLanguages && 
    sp.programmingLanguages.includes("JavaScript") &&
    sp.programmingLanguages.includes("HTML5");
  
  const hasFakeTech = sp.technicalSkills && 
    sp.technicalSkills.includes("Frontend Development") && 
    sp.technicalSkills.includes("React State Management");

  return !!(hasFakeLang || hasFakeTech);
}

export async function getUserCareerProfile(userId: string): Promise<CareerProfile | null> {
  if (!userId) return null;
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data() || {};

    // If no skillProfile exists, or if it's the legacy fake data, the user has NOT uploaded a resume yet — return null.
    if (!data.skillProfile || Object.keys(data.skillProfile).length === 0 || isFakeSkillProfile(data.skillProfile)) {
      return null;
    }

    const skillProfile = data.skillProfile;
    const atsAnalysis = data.atsAnalysis || {};
    const activeRoadmap = data.activeRoadmap || [];

    const completedMilestones = activeRoadmap.filter((m: any) => m.completed).length;
    const roadmapPercentage = activeRoadmap.length > 0
      ? Math.round((completedMilestones / activeRoadmap.length) * 100)
      : 0;

    const skills = Array.from(new Set([
      ...(skillProfile.technicalSkills || []),
      ...(skillProfile.programmingLanguages || []),
      ...(skillProfile.toolsFrameworks || []),
    ]));

    const profile: CareerProfile = {
      userId,
      targetRole: skillProfile.targetRole || data.targetRole || "",
      preferredCity: skillProfile.preferredCity || data.preferredCity || "",
      skills,
      softSkills: skillProfile.softSkills || [],
      education: data.education || [],
      experience: data.experience || [],
      projects: skillProfile.projects || data.projects || [],
      certifications: skillProfile.certifications || data.certifications || [],
      resumeAnalysis: {
        atsScore: atsAnalysis.atsScore,
        summary: atsAnalysis.summary,
        strengths: atsAnalysis.strengths || [],
      },
      atsScore: atsAnalysis.atsScore || 0,
      interviewStats: data.interviewStats || {
        totalCompleted: 0,
        averageScore: 0,
        topStrengths: [],
        areasToImprove: [],
      },
      jobMatchStats: data.jobMatchStats || {
        topMatchScore: 0,
        savedJobsCount: data.savedJobs?.length || 0,
        applicationsCount: data.applications?.length || 0,
      },
      roadmapProgress: {
        totalMilestones: activeRoadmap.length,
        completedMilestones,
        percentage: roadmapPercentage,
      },
      careerReadiness: 0, // Calculated below
      updatedAt: new Date().toISOString(),
    };

    profile.careerReadiness = calculateCareerReadiness(profile);
    return profile;
  } catch (error) {
    console.error("Error fetching user career profile:", error);
    return null;
  }
}
