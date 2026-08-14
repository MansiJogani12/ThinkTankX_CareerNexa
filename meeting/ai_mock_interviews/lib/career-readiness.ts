export function calculateCareerReadiness(profile: {
  atsScore?: number;
  skills?: string[];
  projects?: any[];
  certifications?: any[];
  interviewStats?: { averageScore?: number };
  jobMatchStats?: { topMatchScore?: number };
  roadmapProgress?: { percentage?: number };
}): number {
  // Only use real values — no fake fallbacks that inflate the score
  const resumeScore = profile.atsScore || 0;         // weight 20%
  const skillsCount = profile.skills?.length || 0;
  const skillsScore = skillsCount > 0 ? Math.min(100, skillsCount * 12) : 0; // weight 20%

  const projectsCount = profile.projects?.length || 0;
  const projectsScore = projectsCount > 0 ? Math.min(100, 60 + projectsCount * 15) : 0; // weight 15%

  const certsCount = profile.certifications?.length || 0;
  const certsScore = certsCount > 0 ? Math.min(100, 65 + certsCount * 15) : 0; // weight 10%

  const interviewScore = profile.interviewStats?.averageScore || 0; // weight 20%
  const jobMatchScore = profile.jobMatchStats?.topMatchScore || 0;  // weight 15%

  const weightedScore = Math.round(
    resumeScore * 0.20 +
    skillsScore * 0.20 +
    projectsScore * 0.15 +
    certsScore * 0.10 +
    interviewScore * 0.20 +
    jobMatchScore * 0.15
  );

  return Math.min(100, Math.max(0, weightedScore));
}

export function getReadinessBreakdown(profile: any) {
  const resumeScore = profile.atsScore || 0;
  const skillsCount = profile.skills?.length || 0;
  const skillsScore = skillsCount > 0 ? Math.min(100, skillsCount * 12) : 0;
  const projectsCount = profile.projects?.length || 0;
  const projectsScore = projectsCount > 0 ? Math.min(100, 60 + projectsCount * 15) : 0;
  const certsCount = profile.certifications?.length || 0;
  const certsScore = certsCount > 0 ? Math.min(100, 65 + certsCount * 15) : 0;
  const interviewScore = profile.interviewStats?.averageScore || 0;
  const jobMatchScore = profile.jobMatchStats?.topMatchScore || 0;

  return [
    { label: "Resume ATS", score: resumeScore, weight: "20%" },
    { label: "Technical Skills", score: skillsScore, weight: "20%" },
    { label: "Projects & Portfolio", score: projectsScore, weight: "15%" },
    { label: "Certifications", score: certsScore, weight: "10%" },
    { label: "Interview Performance", score: interviewScore, weight: "20%" },
    { label: "Job Market Match", score: jobMatchScore, weight: "15%" },
  ];
}
