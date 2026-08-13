import { NormalizedJob } from "./job-service";

export interface SkillMatchDetails {
  score: number; // 0 to 100
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  breakdown: {
    skillMatchScore: number;     // max 40
    roleMatchScore: number;      // max 25
    experienceMatchScore: number;// max 15
    locationMatchScore: number;  // max 10
    educationMatchScore: number; // max 10
  };
  whyMatches: string[];
  howToImprove: string[];
}

export function calculateDeterministicJobMatch(
  job: NormalizedJob,
  candidateProfile: {
    targetRole?: string;
    preferredCity?: string;
    technicalSkills?: string[];
    programmingLanguages?: string[];
    toolsFrameworks?: string[];
    softSkills?: string[];
    experienceLevel?: string;
  }
): SkillMatchDetails {
  const candidateSkills = [
    ...(candidateProfile.technicalSkills || []),
    ...(candidateProfile.programmingLanguages || []),
    ...(candidateProfile.toolsFrameworks || []),
    ...(candidateProfile.softSkills || []),
  ].map((s) => s.trim().toLowerCase());

  const uniqueCandidateSkills = Array.from(new Set(candidateSkills));

  // Extract required skills from job title and description
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  
  const commonTechSkills = [
    "java", "python", "javascript", "typescript", "react", "next.js", "node.js",
    "express", "sql", "postgresql", "mongodb", "aws", "docker", "kubernetes",
    "html", "css", "tailwind", "git", "rest api", "graphql", "spring boot",
    "c++", "c#", ".net", "django", "flask", "system design", "agile", "devops",
    "spark", "hadoop", "etl", "olap", "oltp", "data engineering", "machine learning"
  ];

  const requiredInJob = commonTechSkills.filter((skill) =>
    jobText.includes(skill)
  );

  // If job doesn't explicitly match dictionary skills, infer default target skills from title
  const finalRequired = requiredInJob.length > 0 
    ? requiredInJob 
    : ["javascript", "react", "node.js", "sql"];

  const matchedSkills: string[] = [];
  const partialSkills: string[] = [];
  const missingSkills: string[] = [];

  finalRequired.forEach((reqSkill) => {
    const hasExact = uniqueCandidateSkills.some(
      (candSkill) => candSkill === reqSkill || candSkill.includes(reqSkill) || reqSkill.includes(candSkill)
    );

    if (hasExact) {
      matchedSkills.push(capitalizeSkill(reqSkill));
    } else {
      // Check partial match (e.g. candidate has sql, job requires postgresql)
      const hasPartial = uniqueCandidateSkills.some(
        (candSkill) => candSkill.slice(0, 3) === reqSkill.slice(0, 3)
      );
      if (hasPartial) {
        partialSkills.push(capitalizeSkill(reqSkill));
      } else {
        missingSkills.push(capitalizeSkill(reqSkill));
      }
    }
  });

  // 1. Skill Match (Max 40 points)
  const totalRequired = finalRequired.length;
  const matchRatio = totalRequired > 0 
    ? (matchedSkills.length + partialSkills.length * 0.5) / totalRequired 
    : 0.8;
  const skillMatchScore = Math.round(matchRatio * 40);

  // 2. Role Match (Max 25 points)
  const candRole = (candidateProfile.targetRole || "").toLowerCase();
  const jobTitle = job.title.toLowerCase();
  let roleMatchScore = 15; // baseline
  if (candRole && (jobTitle.includes(candRole) || candRole.includes(jobTitle))) {
    roleMatchScore = 25;
  } else if (candRole && (jobTitle.includes("software") || jobTitle.includes("developer") || jobTitle.includes("engineer"))) {
    roleMatchScore = 20;
  }

  // 3. Experience Match (Max 15 points)
  const candidateExp = (candidateProfile.experienceLevel || "Mid").toLowerCase();
  let experienceMatchScore = 12;
  if (jobText.includes(candidateExp) || candidateExp.includes("mid") || candidateExp.includes("fresher")) {
    experienceMatchScore = 15;
  }

  // 4. Location Match (Max 10 points)
  const candCity = (candidateProfile.preferredCity || "").toLowerCase();
  const jobLoc = job.location.toLowerCase();
  let locationMatchScore = 6;
  if (job.jobType.toLowerCase().includes("remote") || jobLoc.includes("remote")) {
    locationMatchScore = 10;
  } else if (candCity && jobLoc.includes(candCity)) {
    locationMatchScore = 10;
  } else if (jobLoc.includes("india")) {
    locationMatchScore = 8;
  }

  // 5. Education / Fundamentals Match (Max 10 points)
  const educationMatchScore = 9;

  const totalScore = Math.min(
    100,
    skillMatchScore + roleMatchScore + experienceMatchScore + locationMatchScore + educationMatchScore
  );

  // Explanations
  const whyMatches: string[] = [];
  matchedSkills.forEach((s) => whyMatches.push(`✓ ${s} matches your profile requirements`));
  if (roleMatchScore >= 20) {
    whyMatches.push(`✓ Role title aligned with your target direction (${candidateProfile.targetRole || job.title})`);
  }

  const howToImprove: string[] = [];
  if (missingSkills.length > 0) {
    missingSkills.slice(0, 3).forEach((s) => {
      howToImprove.push(`Learn ${s} to increase your match score by +${Math.round(40 / totalRequired)}%`);
    });
  }
  if (howToImprove.length === 0) {
    howToImprove.push("Build a practical GitHub portfolio project demonstrating these technologies to stand out!");
  }

  return {
    score: totalScore,
    matchedSkills,
    partialSkills,
    missingSkills,
    breakdown: {
      skillMatchScore,
      roleMatchScore,
      experienceMatchScore,
      locationMatchScore,
      educationMatchScore,
    },
    whyMatches,
    howToImprove,
  };
}

function capitalizeSkill(str: string): string {
  if (str === "sql" || str === "etl" || str === "aws" || str === "rest api" || str === "olap" || str === "oltp") {
    return str.toUpperCase();
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
