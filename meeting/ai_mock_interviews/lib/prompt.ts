export const ResumeAnalyserPrompt = `
You are an expert ATS (Applicant Tracking System) parser. Extract the structure and content of the following resume.
Do NOT score the resume. Do NOT provide feedback. Your only job is to extract data accurately.

Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
  "skillsExtracted": {
    "technicalSkills": ["List of technical skills extracted"],
    "softSkills": ["List of soft skills extracted"],
    "toolsFrameworks": ["List of tools, libraries, or frameworks (e.g., React, Git, Docker)"],
    "programmingLanguages": ["List of programming languages (e.g., JavaScript, Python, C++)"],
    "certifications": ["List of certifications detected"],
    "experienceLevel": "Junior / Mid / Senior",
    "projects": [
      {
        "name": "Project Name",
        "description": "Short description of the project"
      }
    ],
    "experience": [
      {
        "company": "Company Name",
        "title": "Job Title",
        "dates": "Employment Dates"
      }
    ],
    "education": [
      {
        "institution": "School Name",
        "degree": "Degree Name"
      }
    ]
  },
  "rawTextSummary": "A brief 2-3 sentence summary of the candidate's profile based strictly on the text."
}
`;

export const JobMatcherPrompt = (
  mode: string,
  skills?: string[],
  experience?: string
) => `
You are an expert career counselor and job market analyst.
${
  mode === "manual"
    ? `The candidate has these skills: ${skills?.join(
        ", "
      )}\nExperience: ${experience}`
    : "Analyze the attached resume to extract skills and experience."
}
 
Based on this profile, suggest the 5 best matching job roles.
 
Respond ONLY in valid JSON with this exact structure:
{
  "summary": "2-3 sentence overview of the candidate profile and job market fit",
  "jobs": [
    {
      "title": "Job title",
      "company": "Type of company that typically hires this (e.g. 'Startups', 'MNCs', 'Product companies')",
      "matchScore": 85,
      "location": "Remote / Hybrid / On-site",
      "type": "Full-time / Freelance / Contract",
      "skills": ["skill1", "skill2", "skill3"],
      "whyMatch": "Why this role suits the candidate based on their profile",
      "applyTip": "One specific actionable tip to improve their chances of getting this role"
    }
  ]
}
`;

export const buildResumePrompt = (mode: string, formData?: any) => `
You are an expert resume writer and ATS optimization specialist.
${
  mode === "manual"
    ? `Build a professional, ATS-optimized resume using this information:
${JSON.stringify(formData, null, 2)}`
    : "Extract all information from the attached resume and rewrite it to be highly ATS-optimized, professional, and impactful."
}
 
Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "linkedin": "linkedin url or empty string",
  "summary": "3-4 sentence powerful professional summary optimized for ATS",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": [
        "Achievement-focused bullet with action verb and quantifiable result",
        "Another strong bullet point"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "Institution Name",
      "location": "City, Country",
      "year": "Graduation Year",
      "gpa": "GPA if provided or empty string"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "2-3 sentence ATS-optimized description with technologies used and impact",
      "link": "project link or empty string"
    }
  ],
  "certifications": ["Certification 1", "Certification 2"]
}
 
ATS Rules to follow:
- Use standard section headings
- Include relevant keywords naturally
- Start each bullet with a strong action verb
- Quantify achievements wherever possible
- If any field has no data, use empty array or empty string
`;

export const buildLatexPrompt = (latexText: string) => `
You are an expert ATS optimization specialist and LaTeX parser.
Read the following raw LaTeX resume code and extract its structure, contents, and visual design rules into a dynamic JSON format.

RAW LATEX CODE:
${latexText}

Do not force the data into fixed Experience/Education buckets if they don't exist. Instead, create a generic list of "sections".
For each section, extract the "entries" (e.g. jobs, degrees, publications, awards).
Each entry should be an object containing key-value string pairs (or arrays of strings for bullets) that represent the fields for that entry (e.g. "Title", "Company", "Dates", "Bullets", "Award Name", "Description").

Additionally, infer the styling pattern used by this LaTeX template:
- columnLayout: "single" | "two-column"
- headerStyle: "rule-under" (e.g. \hrulefill or \vspace{-...}\rule), "filled-bar", "small-caps" (e.g. \scshape), "colored-accent", or "normal"
- fontPairing: "sans", "serif", or "mixed"
- dateAlignment: "right" (e.g. \hfill), "inline"
- spacingDensity: "compact" (e.g. negative vspace, itemsep=0), "airy", or "normal"

Return ONLY valid JSON with this exact structure:
{
  "isDynamic": true,
  "name": "Full Name extracted from latex or empty string",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "linkedin": "linkedin url or empty string",
  "style": {
    "columnLayout": "single",
    "headerStyle": "rule-under",
    "fontPairing": "serif",
    "dateAlignment": "right",
    "spacingDensity": "normal"
  },
  "sections": [
    {
      "id": "section-1",
      "title": "Experience",
      "entries": [
        {
          "id": "entry-1-1",
          "fields": {
            "Title": "Software Engineer",
            "Company": "Tech Corp",
            "Dates": "2020 - Present",
            "Bullets": [
              "Did X",
              "Did Y"
            ]
          }
        }
      ]
    },
    {
      "id": "section-2",
      "title": "Publications",
      "entries": [
        {
          "id": "entry-2-1",
          "fields": {
            "Title": "A paper on AI",
            "Venue": "NeurIPS",
            "Year": "2023"
          }
        }
      ]
    }
  ]
}
`;

export const generateInterviewPrompt = (
  round: string,
  mode: string,
  skills?: string,
  experience?: string,
  existingQuestions?: string[]
) => `
You are an expert ${
  round === "hr" ? "HR interviewer" : "Senior Technical Interviewer"
}.
${
  mode === "manual"
    ? `The candidate has these skills: ${skills}\nBackground: ${experience}`
    : "Analyze the attached resume to understand the candidate's profile."
}
 
Generate a realistic ${
  round === "hr" ? "HR and behavioral" : "technical and scenario-based"
} interview question set.

CRITICAL INSTRUCTIONS FOR SKILLS: 
- If the candidate lists specific skills (e.g. Java, React, SQL), the technical questions MUST explicitly test those specific skills. Do not generate generic questions.
- If the candidate lists completely unrelated skills (e.g. SQL and UI Design), do NOT try to artificially link them. Instead, generate a diverse mix of questions that test each skill individually.
${existingQuestions && existingQuestions.length > 0 ? `\nCRITICAL: DO NOT generate any questions similar to these existing ones:\n${existingQuestions.map((q,i) => `${i+1}. ${q}`).join('\n')}` : ""}
 
Return ONLY valid JSON:
{
  "role": "Inferred or likely job role",
  "round": "${round}",
  "error": "Optional string: If the provided skills and background are completely nonsensical or gibberish (e.g. 'rdg', 'g', 'asdf'), set this field with a polite error message explaining that valid skills are required, and leave 'questions' empty.",
  "questions": [
    {
      "id": 1,
      "question": "The interview question",
      "hint": "A short pointer on how to approach answering it (not the full answer)",
      "category": "The specific category of this question",
      "difficulty": "Easy" | "Medium" | "Hard",
      "whyAsked": "One line on what the interviewer is trying to evaluate",
      "strongAnswer": [
        "Key point 1 a good answer should touch on",
        "Key point 2"
      ]
    }
  ]
}
 
Rules:
- Generate exactly 10 questions.
- Distribute the difficulty of questions: approximately 30% Easy, 50% Medium, 20% Hard.
- ${
  round === "hr"
    ? "Category MUST be one of: HR, Behavioral, Scenario-based. Generate a genuine mix of these."
    : "Category MUST be one of: Technical, Scenario-based, Project-based. Generate a genuine mix of these."
}
- Questions should progressively get harder.
- Keep questions realistic and commonly asked in actual interviews.
`;

export const SkillGapPrompt = (currentSkills: string[], targetRole: string) => `
You are an expert career advisor and technical recruiter. Your task is to perform a detailed skill gap analysis between the candidate's current skills and the requirements for the target job role.

Candidate's Current Skills: ${currentSkills.join(", ")}
Target Career/Job Role: ${targetRole}

Analyze the requirements for this target role and compare them with the candidate's current skills. Classify the skills into:
1. **matchingSkills**: Skills the candidate has that are highly relevant to the target role.
2. **weakSkills**: Skills the candidate has but might need further depth, practice, or optimization for the target role. Explain why in the feedback.
3. **missingSkills**: Core skills required for the target role that are completely missing from the candidate's list. Assign a priority level (High, Medium, Low) based on how critical they are for getting hired. Explain why in the feedback.

Calculate a realistic **readinessScore** (0-100) representing how prepared the candidate is for this role.
Provide an overall summary of 2-3 sentences.

Respond ONLY in valid JSON with this exact structure:
{
  "readinessScore": 75,
  "matchingSkills": ["React", "TypeScript", "JavaScript"],
  "weakSkills": [
    {
      "skill": "Next.js",
      "priority": "Medium",
      "feedback": "Lacks hands-on experience with SSR/ISR patterns."
    }
  ],
  "missingSkills": [
    {
      "skill": "GraphQL",
      "priority": "High",
      "feedback": "Crucial for target role API integrations."
    }
  ],
  "summary": "The candidate has strong frontend fundamentals but lacks next-gen architecture experience."
}
`;

export const RoadmapPrompt = (
  currentSkills: string[],
  experienceLevel: string,
  projects: any[],
  targetRole: string
) => `
You are an expert career counselor and learning path architect. Your task is to generate a personalized, step-by-step learning roadmap for a candidate who is preparing to transition to the target job role.

Target Career/Job Role: ${targetRole}
Candidate's Experience Level: ${experienceLevel}
Candidate's Current Skills: ${currentSkills.join(", ")}
Candidate's Current Projects: ${JSON.stringify(projects)}

Analyze the gaps between their current skills and the skills needed for this target role. Generate a step-by-step learning roadmap. The roadmap should contain 6-8 core sequential milestones/skills to learn.

The items in the roadmap must progress from foundational topics to advanced frameworks and tools, ending with a final project and interview preparation milestone.

Return ONLY a valid JSON array of objects representing the step-by-step roadmap. Do not include markdown wraps or additional text.
Each object must have the following structure:
{
  "topic": "Skill/Topic Name (e.g. Spring Boot)",
  "priority": "High" | "Medium" | "Low",
  "estimatedTime": "Estimated learning time (e.g. 2-3 weeks)",
  "resources": [
    "Recommended resource 1 (e.g. FreeCodeCamp, documentation, specific course)",
    "Recommended resource 2"
  ],
  "projectSuggestion": "A concrete, actionable practice project or mini-project to build to apply this skill",
  "completed": false
}
`;

export const RecommendationsPrompt = (
  currentSkills: string[],
  missingSkills: string[],
  targetRole: string,
  experienceLevel: string
) => `
You are an expert career advisor and technical training lead. Your task is to generate personalized learning and career development recommendations for a candidate based on their profile and skill gaps.

Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Current Skills: ${currentSkills.join(", ")}
Skill Gaps / Missing Skills: ${missingSkills.join(", ")}

Generate a total of 6-8 tailored recommendations across these categories:
1. **Courses/resources**: Online courses, tutorials, or guides.
2. **Projects**: Actionable portfolio projects to build. Projects MUST specifically target the candidate's missing/gap skills (e.g. if they are missing Spring Boot, recommend a REST API project using Spring Boot; if they are missing MongoDB, recommend a MERN project; if they are missing DSA, recommend a coding practice project).
3. **Certifications**: Industry certifications relevant to the target role.
4. **Interview preparation topics**: Specific topics to study for technical interviews.

Return ONLY a valid JSON array of objects representing these recommendations. Do not include markdown wraps or additional text.
Each object must have the following structure:
{
  "name": "Recommendation Name (e.g., Spring Boot Developer Course)",
  "category": "Course" | "Project" | "Certification" | "Interview Topic",
  "whyRecommended": "Why this is recommended based on their target role and gaps",
  "skillImproves": "The specific skill or knowledge gap this improves (e.g., Spring Boot)",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "Estimated time to complete/study (e.g., 4 weeks, 20 hours, 3 days)",
  "priority": "High" | "Medium" | "Low"
}
`;

export const LiveJobMatcherPrompt = (
  mode: string,
  skills?: string[],
  experience?: string,
  liveJobsJson?: string
) => `
You are an expert career counselor and job market analyst.
${
  mode === "manual"
    ? `The candidate has these skills: ${skills?.join(
        ", "
      )}\nExperience: ${experience}`
    : "Analyze the attached resume to extract skills and experience."
}
 
I have found the following real live job listings:
${liveJobsJson}

Based on the candidate's profile, analyze these specific jobs. 
For each job in the list, provide:
1. "skills": The key skills required for this job (extract 3-5 from the job description).
2. "whyMatch": Why this role suits the candidate based on their profile.
3. "applyTip": One specific actionable tip to improve their chances of getting this role.

Respond ONLY in valid JSON with this exact structure:
{
  "summary": "2-3 sentence overview of the candidate profile and how it fits these live roles",
  "jobs": [
    {
      "title": "Exact job title from the provided list",
      "company": "Exact company name from the provided list",
      "location": "Exact location from the provided list",
      "type": "Exact job type from the provided list",
      "applyUrl": "Exact applyUrl from the provided list",
      "employerWebsite": "Exact employerWebsite from the provided list",
      "skills": ["skill1", "skill2", "skill3"],
      "whyMatch": "Why this role suits the candidate based on their profile",
      "applyTip": "One specific actionable tip to improve their chances of getting this role"
    }
  ]
}
Ensure you return an entry in "jobs" for EVERY job provided in the live jobs list. Keep the title, company, location, type, applyUrl, and employerWebsite EXACTLY as provided.
`;
