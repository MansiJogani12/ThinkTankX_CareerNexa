"use client";

import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  platform: string;
  level: string;
  duration: string;
  url: string;
  whyMatch: string;
}

interface CourseListProps {
  missingSkills: string[];
  targetRole?: string;
}

export function CourseList({ missingSkills, targetRole }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (missingSkills.length === 0) {
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/ai/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ missingSkills, targetRole }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [missingSkills, targetRole]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm text-slate-500">No course recommendations available right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h4>
              <p className="text-sm font-medium text-slate-500 mt-1">{course.platform}</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <a href={course.url} target="_blank" rel="noopener noreferrer">
                View <ExternalLink className="ml-2 w-3 h-3" />
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-700">
              <BarChart className="w-3.5 h-3.5" />
              {course.level}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-700">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
          </div>

          <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/50">
            <p className="text-xs text-indigo-900/80 leading-relaxed flex items-start gap-2">
              <BookOpen className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
              {course.whyMatch}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
