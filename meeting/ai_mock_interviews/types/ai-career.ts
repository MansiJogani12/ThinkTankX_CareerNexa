export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  subscription: Date | null;
  freeRequestsUsed: number;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  LogoutUser: () => void;
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  matchScore: number;
  location: string;
  type: string;
  skills: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  whyMatch: string;
  applyTip: string;
  applyUrl?: string;
  employerWebsite?: string;
  distanceCategory?: "Same City" | "Nearby" | "Farther Away";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  latitude?: number;
  longitude?: number;
}

export interface Question {
  id: number;
  question: string;
  hint: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  whyAsked: string;
  strongAnswer: string[];
}
export interface InterviewData {
  role: string;
  round: string;
  questions: Question[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}
export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa: string;
}
export interface Project {
  name: string;
  description: string;
  link: string;
}
export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: { technical: string[]; soft: string[] };
  projects: Project[];
  certifications: string[];
}

export interface ScoreBlock {
  score: number;
  feedback: string;
}
export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}
export interface SkillsExtracted {
  technicalSkills: string[];
  softSkills: string[];
  toolsFrameworks: string[];
  programmingLanguages: string[];
  certifications: string[];
  experienceLevel: string;
  projects: Array<{ name: string; description: string }>;
}

export interface Analysis {
  atsScore: number;
  scoreBreakdown: {
    formatting: ScoreBlock;
    keywords: ScoreBlock;
    structure: ScoreBlock;
    readability: ScoreBlock;
  };
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
  skillsExtracted?: SkillsExtracted;
}

export interface DynamicEntry {
  id: string; // Unique ID for React rendering/editing
  fields: Record<string, string | string[]>; // e.g., { "Title": "Engineer", "Bullets": ["Built X", "Fixed Y"] }
}

export interface DynamicSection {
  id: string;
  title: string;
  entries: DynamicEntry[];
}

export interface ResumeStyle {
  columnLayout: "single" | "two-column";
  headerStyle: "rule-under" | "filled-bar" | "small-caps" | "colored-accent" | "normal";
  fontPairing: "sans" | "serif" | "mixed";
  dateAlignment: "right" | "inline";
  spacingDensity: "compact" | "normal" | "airy";
}

export interface DynamicResumeData {
  isDynamic: true;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  sections: DynamicSection[];
  style: ResumeStyle;
}
