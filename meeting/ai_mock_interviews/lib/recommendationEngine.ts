import { SkillDNA } from "./skill-dna";

export interface RecommendationItem {
  name: string;
  category: "Course" | "Project" | "Certification" | "Interview Topic";
  whyRecommended: string;
  skillImproves: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  priority: "High" | "Medium" | "Low";
}

const COURSES: Record<string, RecommendationItem[]> = {
  "frontend": [{
    name: "Next.js - The Complete Guide (Academind)",
    category: "Course",
    whyRecommended: "Learn App Router and Server Components.",
    skillImproves: "Next.js",
    difficulty: "Intermediate",
    estimatedTime: "30 hours",
    priority: "High"
  }],
  "java": [{
    name: "Spring Boot Microservices Course (Amigoscode)",
    category: "Course",
    whyRecommended: "Deep knowledge of constructing distributed web apps using Spring.",
    skillImproves: "Spring Boot & APIs",
    difficulty: "Intermediate",
    estimatedTime: "25 hours",
    priority: "High"
  }],
  "full stack": [{
    name: "The Web Developer Bootcamp (Colt Steele)",
    category: "Course",
    whyRecommended: "Cover databases, routing, authentication, and layouts.",
    skillImproves: "Full Stack Integration",
    difficulty: "Beginner",
    estimatedTime: "60 hours",
    priority: "High"
  }],
  "data analyst": [{
    name: "Tableau 2024 A-Z: Hands-On Training (Udemy)",
    category: "Course",
    whyRecommended: "Practical course to learn layout visualization structures.",
    skillImproves: "Tableau Dashboards",
    difficulty: "Beginner",
    estimatedTime: "12 hours",
    priority: "High"
  }],
  "data engineer": [{
    name: "Apache Spark & Python for Big Data (Udemy)",
    category: "Course",
    whyRecommended: "Focusing on dataframes and cluster layouts.",
    skillImproves: "Apache Spark",
    difficulty: "Intermediate",
    estimatedTime: "18 hours",
    priority: "High"
  }]
};

const CERTIFICATIONS: Record<string, RecommendationItem[]> = {
  "frontend": [{
    name: "Meta Frontend Developer Professional Certificate",
    category: "Certification",
    whyRecommended: "Provides industry recognition and structural credibility for React-centric roles.",
    skillImproves: "React & UX Design",
    difficulty: "Beginner",
    estimatedTime: "3 months",
    priority: "Medium"
  }],
  "java": [{
    name: "Oracle Certified Professional: Java SE Developer",
    category: "Certification",
    whyRecommended: "Highly respected credential for enterprise backend roles.",
    skillImproves: "Core Java & SE",
    difficulty: "Advanced",
    estimatedTime: "2 months",
    priority: "Medium"
  }],
  "full stack": [{
    name: "AWS Certified Developer - Associate",
    category: "Certification",
    whyRecommended: "Increases credibility in deployment and devops configurations.",
    skillImproves: "Cloud Computing & AWS",
    difficulty: "Intermediate",
    estimatedTime: "6 weeks",
    priority: "Medium"
  }],
  "data analyst": [{
    name: "Google Data Analytics Professional Certificate",
    category: "Certification",
    whyRecommended: "Excellent industry certification to prove visual reporting and analytical skills.",
    skillImproves: "SQL, R, & Tableau",
    difficulty: "Beginner",
    estimatedTime: "4 months",
    priority: "High"
  }],
  "data engineer": [{
    name: "Google Cloud Professional Data Engineer",
    category: "Certification",
    whyRecommended: "Top data warehousing and pipeline certification in the cloud space.",
    skillImproves: "GCP BigQuery & Dataflow",
    difficulty: "Advanced",
    estimatedTime: "2 months",
    priority: "Medium"
  }]
};

export function generateRecommendations(dna: SkillDNA, missingSkills: string[], targetRole: string): RecommendationItem[] {
  const roleLower = targetRole.toLowerCase();
  const missingLower = missingSkills.map(s => s.toLowerCase());

  let roleKey = "frontend";
  if (roleLower.includes("java")) roleKey = "java";
  else if (roleLower.includes("full stack") || roleLower.includes("fullstack")) roleKey = "full stack";
  else if (roleLower.includes("data analyst")) roleKey = "data analyst";
  else if (roleLower.includes("data engineer")) roleKey = "data engineer";

  const recommendations: RecommendationItem[] = [];
  
  const course = COURSES[roleKey]?.[0];
  if (course) recommendations.push(course);

  const cert = CERTIFICATIONS[roleKey]?.[0];
  if (cert) recommendations.push(cert);

  let suggestedProject: RecommendationItem = {
    name: "Full-Stack Dashboard Application",
    category: "Project",
    skillImproves: "Full Stack Integration",
    whyRecommended: `A comprehensive full-stack application built to strengthen key gaps for the target ${targetRole} role.`,
    difficulty: "Intermediate",
    estimatedTime: "3 weeks",
    priority: "High"
  };

  if (missingLower.some(s => s.includes("spring"))) {
    suggestedProject = {
      name: "REST API Microservice with Spring Boot",
      category: "Project",
      skillImproves: "Spring Boot",
      whyRecommended: "Recommended because Spring Boot was identified as a critical missing skill. This project focuses on dependency injection, entity mappings, and REST controllers.",
      difficulty: "Intermediate",
      estimatedTime: "2 weeks",
      priority: "High"
    };
  } else if (missingLower.some(s => s.includes("mongo"))) {
    suggestedProject = {
      name: "MERN Stack E-Commerce Platform",
      category: "Project",
      skillImproves: "MongoDB & MERN",
      whyRecommended: "MongoDB is missing from your profile. This project will teach you document schemas, aggregation pipelines, and connecting Express to Mongo.",
      difficulty: "Intermediate",
      estimatedTime: "3 weeks",
      priority: "High"
    };
  } else if (missingLower.some(s => s.includes("dsa") || s.includes("data structure") || s.includes("algorithm"))) {
    suggestedProject = {
      name: "Coding Interview Practice Suite",
      category: "Project",
      skillImproves: "Data Structures & Algorithms",
      whyRecommended: "DSA is a critical gap for your target role. Building custom solvers for sorting, trees, and graphs will solidify your fundamentals.",
      difficulty: "Intermediate",
      estimatedTime: "2 weeks",
      priority: "High"
    };
  } else if (missingLower.some(s => s.includes("next.js") || s.includes("nextjs"))) {
    suggestedProject = {
      name: "Next.js Static Blog & Portal",
      category: "Project",
      skillImproves: "Next.js",
      whyRecommended: "Since Next.js is a key gap, building this project will teach you App Router, Server Components, and SSR hydration.",
      difficulty: "Intermediate",
      estimatedTime: "2 weeks",
      priority: "High"
    };
  } else if (missingLower.some(s => s.includes("sql") || s.includes("database"))) {
    suggestedProject = {
      name: "Database Analytics Ledger",
      category: "Project",
      skillImproves: "SQL Databases",
      whyRecommended: "SQL database queries are missing or weak in your profile. You will design relational schemas, write aggregate joins, and analyze query execution plans.",
      difficulty: "Intermediate",
      estimatedTime: "10 days",
      priority: "High"
    };
  }

  recommendations.push(suggestedProject);

  recommendations.push({
    name: "System Scaling & Optimization",
    category: "Interview Topic",
    whyRecommended: "Highly relevant theoretical concepts for tech validation.",
    skillImproves: "Architecture Design",
    difficulty: "Advanced",
    estimatedTime: "4 days",
    priority: "Medium"
  });

  return recommendations;
}
