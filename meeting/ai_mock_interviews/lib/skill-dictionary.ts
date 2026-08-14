// A dictionary to normalize skill aliases to a canonical name for deterministic scoring
export const SKILL_ALIASES: Record<string, string> = {
  // Web & Frontend
  "js": "JavaScript",
  "ts": "TypeScript",
  "react.js": "React",
  "reactjs": "React",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "vue.js": "Vue.js",
  "vuejs": "Vue.js",
  "html5": "HTML",
  "css3": "CSS",
  // Backend & DB
  "postgres": "PostgreSQL",
  "mongo": "MongoDB",
  "sql server": "SQL",
  "mysql": "SQL",
  "relational databases": "SQL",
  "nosql": "NoSQL",
  // Cloud & DevOps
  "aws": "Amazon Web Services",
  "gcp": "Google Cloud",
  "azure": "Microsoft Azure",
  "k8s": "Kubernetes",
  "ci/cd": "CI/CD",
  "github actions": "CI/CD",
  // AI/ML
  "ml": "Machine Learning",
  "ai": "Artificial Intelligence",
  "nlp": "Natural Language Processing",
  "llms": "Large Language Models",
  "genai": "Generative AI",
  "pytorch": "PyTorch",
  "tf": "TensorFlow",
  // General
  "oop": "Object-Oriented Programming",
  "dsa": "Data Structures & Algorithms",
  "c++": "C++",
  "c#": "C#",
  "golang": "Go",
  "python3": "Python"
};

export function normalizeSkill(skill: string): string {
  if (!skill) return "";
  const lower = skill.toLowerCase().trim();
  // Check exact alias match
  if (SKILL_ALIASES[lower]) {
    return SKILL_ALIASES[lower];
  }
  
  // Return title cased original if no alias found
  return skill
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
