import { SkillDNA } from "./skill-dna";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export interface SkillGapDetail {
  skill: string;
  priority: "High" | "Medium" | "Low";
  feedback: string;
}

export interface RoadmapItem {
  topic: string;
  priority: "High" | "Medium" | "Low";
  estimatedTime: string;
  resources: string[];
  projectSuggestion: string;
  completed: boolean;
}

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  "frontend": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Next.js"],
  "java": ["Java", "Spring Boot", "SQL", "Hibernate", "Microservices"],
  "full stack": ["JavaScript", "React", "Node.js", "Express", "PostgreSQL", "Docker", "REST API"],
  "backend": ["Node.js", "Python", "Java", "SQL", "MongoDB", "Redis", "Docker", "Microservices"],
  "data analyst": ["SQL", "Excel", "Python", "Pandas", "Tableau", "Statistics", "Power BI"],
  "data engineer": ["Python", "SQL", "ETL", "Apache Spark", "Airflow", "Cloud", "Data Warehousing"],
  "ai": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Mathematics"],
  "machine learning": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Mathematics"],
  "cyber": ["Network Security", "Cryptography", "Penetration Testing", "Linux", "Ethical Hacking", "Firewalls", "Security Operations"],
  "security": ["Network Security", "Cryptography", "Penetration Testing", "Linux", "Ethical Hacking", "Firewalls", "Security Operations"],
  "devops": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Bash", "Python"],
  "mobile": ["Swift", "Kotlin", "React Native", "Flutter", "Mobile UI", "API Integration"],
  "general": ["Problem Solving", "Git", "Agile", "Communication", "Software Design", "Testing"]
};

const normalizeSkill = (skill: string) => {
  let s = skill.toLowerCase().trim();
  s = s.replace(/[^a-z0-9]/g, ""); // strip non-alphanumeric
  // Map common synonyms
  if (s === "js") return "javascript";
  if (s === "ts") return "typescript";
  if (s === "reactjs") return "react";
  if (s === "nodejs") return "node";
  if (s === "nextjs") return "next";
  if (s === "vuejs") return "vue";
  return s;
};

export async function analyzeSkillGap(dna: SkillDNA, targetRole: string) {
  const currentSkills = [...dna.technicalSkills, ...dna.softSkills].map(s => s.name);
  const normalizedUserSkills = currentSkills.map(normalizeSkill);
  
  let roleKey = Object.keys(ROLE_REQUIREMENTS).find(k => targetRole.toLowerCase().includes(k));
  let required: string[] = [];

  if (roleKey) {
    required = ROLE_REQUIREMENTS[roleKey];
  } else {
    // LLM Fallback for unrecognized custom roles
    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash", { structuredOutputs: true }),
        schema: z.object({
          requiredSkills: z.array(z.string()).describe("6 to 8 core technical and soft skills required for this job role.")
        }),
        prompt: `List the absolute most critical core skills required for the job role: "${targetRole}". Return 6 to 8 skill names.`
      });
      required = object.requiredSkills;
    } catch (e) {
      console.error("LLM fallback failed, using general requirements", e);
      required = ROLE_REQUIREMENTS["general"];
    }
  }

  // Fallback if LLM returns empty array
  if (!required || required.length === 0) {
    required = ROLE_REQUIREMENTS["general"];
  }

  const normalizedRequiredSkills = required.map(req => ({ original: req, norm: normalizeSkill(req) }));

  // Deterministic set intersection
  const matchingSkillsRaw = normalizedRequiredSkills.filter(req => 
    normalizedUserSkills.includes(req.norm) || 
    // fuzzy substring check just in case (e.g. 'machinelearning' in 'appliedmachinelearning')
    normalizedUserSkills.some(userNorm => userNorm.includes(req.norm) || req.norm.includes(userNorm) && req.norm.length > 3)
  );
  
  const matchingSkills = matchingSkillsRaw.map(req => req.original);
  
  const missingSkillsRaw = normalizedRequiredSkills.filter(req => !matchingSkillsRaw.includes(req));
  const missingReqs = missingSkillsRaw.map(req => req.original);

  const missingSkills: SkillGapDetail[] = missingReqs.slice(0, 3).map(req => ({
    skill: req,
    priority: "High",
    feedback: `Essential core skill required for ${targetRole} positions.`
  }));

  const weakSkills: SkillGapDetail[] = missingReqs.slice(3, 5).map(req => ({
    skill: req,
    priority: "Medium",
    feedback: `Good to have for advanced ${targetRole} roles.`
  }));

  let score = 0;
  if (required.length > 0) {
    score = Math.round((matchingSkills.length / required.length) * 100);
  }

  return {
    readinessScore: score,
    matchingSkills,
    weakSkills,
    missingSkills,
    summary: `Your profile has ${matchingSkills.length} of the ${required.length} core skills recommended for ${targetRole}. Focus on acquiring the missing high-priority skills.`
  };
}

export async function generateAdaptiveRoadmap(dna: SkillDNA, targetRole: string): Promise<RoadmapItem[]> {
  const gap = await analyzeSkillGap(dna, targetRole);
  const roadmap: RoadmapItem[] = [];

  // Add missing skills to roadmap
  gap.missingSkills.forEach(item => {
    roadmap.push({
      topic: `Master ${item.skill}`,
      priority: item.priority,
      estimatedTime: "2 weeks",
      resources: [`Official ${item.skill} Docs`, "FreeCodeCamp"],
      projectSuggestion: `Build a small prototype using ${item.skill} to understand its core concepts.`,
      completed: false
    });
  });

  // Add weak skills
  gap.weakSkills.forEach(item => {
    roadmap.push({
      topic: `Improve ${item.skill}`,
      priority: item.priority,
      estimatedTime: "1 week",
      resources: ["YouTube Tutorials"],
      projectSuggestion: `Integrate ${item.skill} into an existing project.`,
      completed: false
    });
  });

  // Add standard final steps
  roadmap.push({
    topic: "Final Production Project",
    priority: "High",
    estimatedTime: "3 weeks",
    resources: ["Vercel Deploy docs", "GitHub Actions"],
    projectSuggestion: `Deploy a complete, polished project demonstrating your readiness for ${targetRole}.`,
    completed: false
  });

  roadmap.push({
    topic: "Interview Preparation",
    priority: "High",
    estimatedTime: "1 week",
    resources: ["PrepWise Mock Interview", "Cracking the Coding Interview"],
    projectSuggestion: `Conduct 3 mock technical interviews targeting ${targetRole}.`,
    completed: false
  });

  return roadmap;
}
