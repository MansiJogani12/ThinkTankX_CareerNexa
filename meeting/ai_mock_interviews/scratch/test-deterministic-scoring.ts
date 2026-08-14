import { computeDetailedATSAnalysis, computeDeterministicJobMatch } from '../lib/ai-career-utils';

const mockResumeExtracted = {
  technicalSkills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Git"],
  softSkills: ["Teamwork", "Problem Solving", "Communication"],
  toolsFrameworks: ["Docker", "Jest", "Webpack"],
  programmingLanguages: ["HTML", "CSS", "Python"],
  certifications: ["AWS Certified Developer"],
  experienceLevel: "Mid",
  experience: [
    { company: "Tech Corp", title: "Software Engineer", dates: "2021-Present" },
    { company: "Startup Inc", title: "Junior Dev", dates: "2019-2021" }
  ],
  education: [
    { institution: "State University", degree: "B.S. Computer Science" }
  ],
  projects: [
    { name: "Portfolio", description: "Personal website" },
    { name: "E-Commerce API", description: "Backend API" }
  ]
};

const jobRequirements = ["JavaScript", "TypeScript", "React", "Docker", "AWS", "Python"];

console.log("--- TEST 1: ATS Scoring Determinism ---");
const atsRun1 = computeDetailedATSAnalysis(mockResumeExtracted);
const atsRun2 = computeDetailedATSAnalysis(mockResumeExtracted);

if (atsRun1.atsScore === atsRun2.atsScore) {
  console.log(`✅ ATS Score is deterministic: ${atsRun1.atsScore}`);
  console.log(`   Breakdown:`, atsRun1.scoreBreakdown);
} else {
  console.error(`❌ ATS Score is NOT deterministic. Run1: ${atsRun1.atsScore}, Run2: ${atsRun2.atsScore}`);
}

console.log("\n--- TEST 2: Job Match Determinism ---");
const userSkills = [
  ...mockResumeExtracted.technicalSkills,
  ...mockResumeExtracted.toolsFrameworks,
  ...mockResumeExtracted.programmingLanguages
];

const matchRun1 = computeDeterministicJobMatch(userSkills, jobRequirements, "Mid");
const matchRun2 = computeDeterministicJobMatch(userSkills, jobRequirements, "Mid");

if (matchRun1.matchScore === matchRun2.matchScore) {
  console.log(`✅ Job Match Score is deterministic: ${matchRun1.matchScore}`);
  console.log(`   Matched:`, matchRun1.matchedSkills);
  console.log(`   Missing:`, matchRun1.missingSkills);
} else {
  console.error(`❌ Job Match Score is NOT deterministic. Run1: ${matchRun1.matchScore}, Run2: ${matchRun2.matchScore}`);
}
