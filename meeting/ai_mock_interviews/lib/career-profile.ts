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

export async function getUserCareerProfile(userId: string): Promise<CareerProfile | null> {
  if (!userId) return null;
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data() || {};
    const skillProfile = data.skillProfile || {};
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
      targetRole: skillProfile.targetRole || data.targetRole || "Software Engineer",
      preferredCity: skillProfile.preferredCity || data.preferredCity || "Ahmedabad",
      skills,
      softSkills: skillProfile.softSkills || ["Problem Solving", "Teamwork", "Communication"],
      education: data.education || [{ degree: "B.Tech in Computer Science", institution: "University", year: "2025" }],
      experience: data.experience || [],
      projects: skillProfile.projects || data.projects || [],
      certifications: skillProfile.certifications || data.certifications || [],
      resumeAnalysis: {
        atsScore: atsAnalysis.atsScore || 75,
        summary: atsAnalysis.summary || "Strong technical foundation with room for targeted framework practice.",
        strengths: atsAnalysis.strengths || ["Core Programming", "Algorithmic Logic"],
      },
      atsScore: atsAnalysis.atsScore || 75,
      interviewStats: data.interviewStats || {
        totalCompleted: 3,
        averageScore: 78,
        topStrengths: ["Communication", "Domain Knowledge"],
        areasToImprove: ["System Architecture", "Advanced Frameworks"],
      },
      jobMatchStats: data.jobMatchStats || {
        topMatchScore: 85,
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
