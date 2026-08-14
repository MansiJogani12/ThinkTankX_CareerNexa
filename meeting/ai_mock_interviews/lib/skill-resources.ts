// Static Curated Resource Database for Missing Skills
// Maps a normalized skill name to text/youtube resources.

export interface SkillResource {
  text: { title: string; url: string }[];
  youtube: { title: string; url: string; duration: string }[];
  reason_template: string; // {target_role} is injected dynamically
}

export const SKILL_RESOURCES: Record<string, SkillResource> = {
  "Docker": {
    text: [{ title: "Docker Overview (Official Docs)", url: "https://docs.docker.com/get-started/overview/" }],
    youtube: [{ title: "Docker in 100 Seconds", url: "https://www.youtube.com/watch?v=Gjnup-PuquQ", duration: "2 min" }],
    reason_template: "Required for {target_role} — Docker is an industry standard for containerized deployments."
  },
  "React": {
    text: [{ title: "React Quick Start", url: "https://react.dev/learn" }],
    youtube: [{ title: "React for Beginners", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", duration: "1 hr" }],
    reason_template: "Required for {target_role} — Modern frontend development heavily relies on React or similar libraries."
  },
  "Next.js": {
    text: [{ title: "Next.js Routing", url: "https://nextjs.org/docs/app/building-your-application/routing" }],
    youtube: [{ title: "Next.js App Router Crash Course", url: "https://www.youtube.com/watch?v=vwSlYG7hFk0", duration: "30 min" }],
    reason_template: "Required for {target_role} — React server-side rendering is a key requirement for modern web apps."
  },
  "Node.js": {
    text: [{ title: "Introduction to Node.js", url: "https://nodejs.dev/en/learn/" }],
    youtube: [{ title: "Node.js Crash Course", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", duration: "1.5 hr" }],
    reason_template: "Required for {target_role} — Expected for backend/full-stack roles to handle server-side JavaScript."
  },
  "TypeScript": {
    text: [{ title: "TypeScript for JavaScript Programmers", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html" }],
    youtube: [{ title: "TypeScript in 100 Seconds", url: "https://www.youtube.com/watch?v=zQnBQ4tB3ZA", duration: "2 min" }],
    reason_template: "Required for {target_role} — Strongly typed JavaScript is increasingly demanded in large codebases."
  },
  "Amazon Web Services": {
    text: [{ title: "AWS Core Services", url: "https://aws.amazon.com/getting-started/" }],
    youtube: [{ title: "AWS in 10 Minutes", url: "https://www.youtube.com/watch?v=3XFODqA-s6c", duration: "10 min" }],
    reason_template: "Required for {target_role} — Cloud infrastructure knowledge is essential for deployment and scaling."
  },
  "Python": {
    text: [{ title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" }],
    youtube: [{ title: "Python for Beginners", url: "https://www.youtube.com/watch?v=kqtD5dpn9C8", duration: "1 hr" }],
    reason_template: "Required for {target_role} — Python is dominant in AI, Data Science, and backend scripting."
  },
  "Machine Learning": {
    text: [{ title: "Machine Learning Glossary", url: "https://developers.google.com/machine-learning/glossary" }],
    youtube: [{ title: "Machine Learning in 100 Seconds", url: "https://www.youtube.com/watch?v=PeMlggyqz0Y", duration: "2 min" }],
    reason_template: "Required for {target_role} — Fundamental understanding of ML models is necessary for AI roles."
  },
  "PostgreSQL": {
    text: [{ title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/" }],
    youtube: [{ title: "PostgreSQL Crash Course", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", duration: "1 hr" }],
    reason_template: "Required for {target_role} — Relational databases are the backbone of most web applications."
  },
  "MongoDB": {
    text: [{ title: "MongoDB Introduction", url: "https://www.mongodb.com/docs/manual/introduction/" }],
    youtube: [{ title: "MongoDB in 100 Seconds", url: "https://www.youtube.com/watch?v=-bt_y4Loofg", duration: "2 min" }],
    reason_template: "Required for {target_role} — NoSQL databases are heavily used for unstructured data storage."
  },
  "CI/CD": {
    text: [{ title: "What is CI/CD?", url: "https://www.redhat.com/en/topics/devops/what-is-ci-cd" }],
    youtube: [{ title: "CI/CD Pipeline Explained", url: "https://www.youtube.com/watch?v=scEDHsr3APg", duration: "10 min" }],
    reason_template: "Required for {target_role} — Automation in testing and deployment is a must-have for modern DevOps."
  },
  "Kubernetes": {
    text: [{ title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" }],
    youtube: [{ title: "Kubernetes in 100 Seconds", url: "https://www.youtube.com/watch?v=VnvRFRk_51k", duration: "2 min" }],
    reason_template: "Required for {target_role} — Container orchestration is essential for scaling microservices."
  }
};

export function getMissingSkillResources(skill: string, targetRole: string = "this role") {
  const resource = SKILL_RESOURCES[skill];
  if (!resource) return null;
  
  return {
    ...resource,
    reason: resource.reason_template.replace("{target_role}", targetRole)
  };
}
