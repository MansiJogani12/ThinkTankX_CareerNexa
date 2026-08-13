import { calculateDeterministicJobMatch } from "./job-matcher-engine";

export interface SimulationResult {
  role: string;
  currentMatch: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  estimatedPrepWeeks: string;
  recommendedProjectsCount: number;
  careerFit: "High" | "Medium" | "Low";
  reasoning: string;
}

const CAREER_PATH_DICTIONARY: Record<string, { required: string[]; baseEstWeeks: number }> = {
  "Java Backend Developer": {
    required: ["Java", "SQL", "REST API", "Spring Boot", "Docker", "System Design"],
    baseEstWeeks: 6,
  },
  "Full Stack Developer": {
    required: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    baseEstWeeks: 10,
  },
  "Data Analyst": {
    required: ["Python", "SQL", "Excel", "PowerBI", "Pandas", "Statistics"],
    baseEstWeeks: 8,
  },
  "Cloud Engineer": {
    required: ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "Python", "Networking"],
    baseEstWeeks: 12,
  },
  "AI/ML Engineer": {
    required: ["Python", "PyTorch", "TensorFlow", "Math", "Scikit-Learn", "Machine Learning", "NLP"],
    baseEstWeeks: 14,
  },
};

export function simulateCareerPath(
  targetRole: string,
  userSkills: string[] = []
): SimulationResult {
  const normSkills = userSkills.map((s) => s.trim().toLowerCase());
  const pathConfig = CAREER_PATH_DICTIONARY[targetRole] || {
    required: ["JavaScript", "Python", "SQL", "Git", "REST API"],
    baseEstWeeks: 8,
  };

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  pathConfig.required.forEach((req) => {
    const rLower = req.toLowerCase();
    const has = normSkills.some(
      (u) => u === rLower || u.includes(rLower) || rLower.includes(u)
    );
    if (has) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const totalReq = pathConfig.required.length;
  const matchRatio = matchedSkills.length / totalReq;
  const currentMatch = Math.round(matchRatio * 100);

  const missingCount = missingSkills.length;
  const estWeeksMin = Math.max(2, missingCount * 2);
  const estWeeksMax = estWeeksMin + 4;
  const estimatedPrepWeeks = `${estWeeksMin}–${estWeeksMax} weeks`;

  const recommendedProjectsCount = Math.max(1, Math.ceil(missingCount / 2));

  let careerFit: "High" | "Medium" | "Low" = "Medium";
  if (currentMatch >= 75) careerFit = "High";
  else if (currentMatch < 45) careerFit = "Low";

  let reasoning = "";
  if (careerFit === "High") {
    reasoning = `Your existing profile aligns exceptionally well with ${targetRole}. You already master ${matchedSkills.slice(0, 3).join(", ")}, allowing you to reach job readiness rapidly.`;
  } else if (careerFit === "Medium") {
    reasoning = `You have a solid foundation for ${targetRole} (${matchedSkills.join(", ")}). Focus on learning ${missingSkills.slice(0, 2).join(" & ")} through recommended projects to boost your match to 85%+.`;
  } else {
    reasoning = `${targetRole} requires several new core competencies (${missingSkills.slice(0, 3).join(", ")}). Consider tackling a 3-month roadmap or choosing a closer adjacent role.`;
  }

  return {
    role: targetRole,
    currentMatch,
    requiredSkills: pathConfig.required,
    matchedSkills,
    missingSkills,
    estimatedPrepWeeks,
    recommendedProjectsCount,
    careerFit,
    reasoning,
  };
}
