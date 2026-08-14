import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

const COURSE_DATABASE = [
  {
    id: "c1",
    title: "The Complete 2024 Web Development Bootcamp",
    platform: "Udemy",
    level: "Beginner",
    duration: "65 hours",
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Web Development"],
    url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
  },
  {
    id: "c2",
    title: "React - The Complete Guide",
    platform: "Udemy",
    level: "Intermediate",
    duration: "40 hours",
    skills: ["React", "Redux", "Next.js", "Frontend"],
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
  },
  {
    id: "c3",
    title: "Spring Boot 3, Spring 6 & Hibernate",
    platform: "Udemy",
    level: "Advanced",
    duration: "38 hours",
    skills: ["Java", "Spring Boot", "Hibernate", "Backend"],
    url: "https://www.udemy.com/course/spring-hibernate-tutorial/",
  },
  {
    id: "c4",
    title: "Machine Learning A-Z",
    platform: "Udemy",
    level: "Intermediate",
    duration: "45 hours",
    skills: ["Python", "Machine Learning", "Data Science", "AI"],
    url: "https://www.udemy.com/course/machinelearning/",
  },
  {
    id: "c5",
    title: "Mastering TypeScript",
    platform: "Udemy",
    level: "Intermediate",
    duration: "10 hours",
    skills: ["TypeScript", "JavaScript"],
    url: "https://www.udemy.com/course/understanding-typescript/",
  },
  {
    id: "c6",
    title: "AWS Certified Solutions Architect",
    platform: "Coursera",
    level: "Advanced",
    duration: "50 hours",
    skills: ["AWS", "Cloud", "DevOps"],
    url: "https://www.coursera.org/",
  }
];

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { missingSkills, targetRole } = await req.json();

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return NextResponse.json({ message: "missingSkills array is required" }, { status: 400 });
    }

    const recommendations = [];
    const lowerMissing = missingSkills.map(s => s.toLowerCase());

    for (const course of COURSE_DATABASE) {
      const matchedSkills = course.skills.filter(s => 
        lowerMissing.some(missing => s.toLowerCase().includes(missing) || missing.includes(s.toLowerCase()))
      );
      
      if (matchedSkills.length > 0) {
        recommendations.push({
          ...course,
          matchScore: matchedSkills.length,
          whyMatch: `This course covers ${matchedSkills.join(", ")}, which are recommended skills you're currently missing for a ${targetRole || "targeted"} role.`
        });
      }
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    if (recommendations.length === 0) {
      const generic = COURSE_DATABASE.slice(0, 3).map(c => ({
        ...c,
        whyMatch: `Recommended to build fundamental skills for ${targetRole || "tech roles"}. (Curated Demo Data)`
      }));
      return NextResponse.json({ courses: generic });
    }

    return NextResponse.json({ courses: recommendations.slice(0, 5).map(c => ({...c, whyMatch: c.whyMatch + " (Curated Demo Data)"})) });
  } catch (error: any) {
    console.error("Course Recommendation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
