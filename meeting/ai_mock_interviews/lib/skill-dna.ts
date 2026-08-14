export interface SkillDNA {
  technicalSkills: Array<{ name: string; proficiency: number }>;
  softSkills: Array<{ name: string; proficiency: number }>;
  recommendedRoles: string[];
  careerReadiness: number;
}

export function computeSkillDNA(profile: any): SkillDNA {
  const techSkills = profile?.technicalSkills || [];
  const tools = profile?.toolsFrameworks || [];
  const progLangs = profile?.programmingLanguages || [];
  
  const allTech = [...techSkills, ...tools, ...progLangs].filter(Boolean);
  
  const baseProficiency = profile?.experienceLevel?.toLowerCase().includes("senior") ? 85 : 
                          profile?.experienceLevel?.toLowerCase().includes("mid") ? 70 : 50;

  const technicalSkills = allTech.map(skill => ({
    name: skill,
    // Add some deterministic jitter based on length so they aren't all exactly the same number
    proficiency: Math.min(98, baseProficiency + (skill.length % 15))
  }));

  const softSkillsRaw = profile?.softSkills || [];
  const softSkills = softSkillsRaw.map((skill: string) => ({
    name: skill,
    proficiency: Math.min(95, 75 + (skill.length % 10))
  }));

  const readiness = profile?.experienceLevel?.toLowerCase().includes("senior") ? 88 : 
                    profile?.experienceLevel?.toLowerCase().includes("mid") ? 72 : 55;

  return {
    technicalSkills: technicalSkills.slice(0, 15), 
    softSkills: softSkills.slice(0, 8),
    recommendedRoles: ["Software Engineer", "Frontend Developer", "Full Stack Developer", "Backend Developer"].slice(0, profile?.experienceLevel?.toLowerCase().includes("senior") ? 4 : 2),
    careerReadiness: readiness
  };
}
