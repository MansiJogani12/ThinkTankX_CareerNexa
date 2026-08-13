"use client";

import { useEffect, useState } from "react";
import { getUserSkillProfile } from "@/lib/actions/general.action";
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Code,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  HelpCircle,
  X,
} from "lucide-react";

interface RecommendationItem {
  name: string;
  category: "Course" | "Project" | "Certification" | "Interview Topic";
  whyRecommended: string;
  skillImproves: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  priority: "High" | "Medium" | "Low";
}

const popularRoles = [
  "Frontend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Data Analyst",
  "Data Engineer",
];

const DEFAULT_RECOMMENDATIONS: RecommendationItem[] = [
  {
    name: "Next.js - The Complete Guide (Academind)",
    category: "Course",
    whyRecommended: "Learn App Router and Server Components.",
    skillImproves: "Next.js",
    difficulty: "Intermediate",
    estimatedTime: "30 hours",
    priority: "High",
  },
  {
    name: "Meta Frontend Developer Professional Certificate",
    category: "Certification",
    whyRecommended: "Provides industry recognition and structural credibility for React-centric roles.",
    skillImproves: "React & UX Design",
    difficulty: "Beginner",
    estimatedTime: "3 months",
    priority: "Medium",
  },
  {
    name: "Full-Stack Dashboard Application",
    category: "Project",
    whyRecommended: "A comprehensive full-stack application built to strengthen key gaps for the target Frontend Developer role.",
    skillImproves: "Full Stack Integration",
    difficulty: "Intermediate",
    estimatedTime: "3 weeks",
    priority: "High",
  },
  {
    name: "System Scaling & Optimization",
    category: "Interview Topic",
    whyRecommended: "Highly relevant theoretical concepts for tech validation.",
    skillImproves: "Architecture Design",
    difficulty: "Advanced",
    estimatedTime: "4 days",
    priority: "Medium",
  },
];

export default function RecommendationsPage() {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [missingInput, setMissingInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationItem[] | null>(DEFAULT_RECOMMENDATIONS);

  useEffect(() => {
    let customRole = "";
    let customMissing: string[] = [];

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      const missingParam = params.get("missing");

      if (roleParam) {
        customRole = roleParam;
        setTargetRole(roleParam);
      }
      if (missingParam) {
        const parsedMissing = missingParam.split(",").filter((s) => s.trim().length > 0);
        customMissing = parsedMissing;
        setMissingSkills(parsedMissing);
      }
    }

    async function loadData() {
      setLoading(true);
      try {
        const profile = await getUserSkillProfile();
        if (profile) {
          const aggregatedSkills = [
            ...(profile.programmingLanguages || []),
            ...(profile.technicalSkills || []),
            ...(profile.toolsFrameworks || []),
            ...(profile.softSkills || []),
          ];
          const uniqueCurrent = Array.from(new Set(aggregatedSkills));
          setCurrentSkills(uniqueCurrent);
          setExperienceLevel(profile.experienceLevel || "Mid");

          if (customMissing.length === 0) {
            const activeRole = customRole || targetRole;
            const lowerCurrent = uniqueCurrent.map((s) => s.toLowerCase());
            const inferredMissing: string[] = [];
            if (activeRole === "Frontend Developer") {
              if (!lowerCurrent.includes("next.js") && !lowerCurrent.includes("nextjs")) inferredMissing.push("Next.js");
              if (!lowerCurrent.includes("typescript") && !lowerCurrent.includes("ts")) inferredMissing.push("TypeScript");
              if (!lowerCurrent.includes("graphql")) inferredMissing.push("GraphQL");
            } else if (activeRole === "Java Developer") {
              if (!lowerCurrent.includes("spring boot") && !lowerCurrent.includes("spring")) inferredMissing.push("Spring Boot");
              if (!lowerCurrent.includes("hibernate") && !lowerCurrent.includes("jpa")) inferredMissing.push("Hibernate");
              if (!lowerCurrent.includes("docker")) inferredMissing.push("Docker");
            } else if (activeRole === "Full Stack Developer") {
              if (!lowerCurrent.includes("node.js") && !lowerCurrent.includes("node")) inferredMissing.push("Node.js");
              if (!lowerCurrent.includes("mongodb") && !lowerCurrent.includes("mongo")) inferredMissing.push("MongoDB");
              if (!lowerCurrent.includes("docker")) inferredMissing.push("Docker");
            } else if (activeRole === "Data Analyst") {
              if (!lowerCurrent.includes("tableau")) inferredMissing.push("Tableau");
              if (!lowerCurrent.includes("powerbi") && !lowerCurrent.includes("power bi")) inferredMissing.push("Power BI");
              if (!lowerCurrent.includes("sql")) inferredMissing.push("SQL");
            } else if (activeRole === "Data Engineer") {
              if (!lowerCurrent.includes("spark") && !lowerCurrent.includes("apache spark")) inferredMissing.push("Apache Spark");
              if (!lowerCurrent.includes("airflow") && !lowerCurrent.includes("apache airflow")) inferredMissing.push("Apache Airflow");
              if (!lowerCurrent.includes("snowflake")) inferredMissing.push("Snowflake");
            }
            setMissingSkills(inferredMissing);
          }

          if (customRole) {
            setGenerating(true);
            try {
              const res = await fetch("/api/ai/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  currentSkills: uniqueCurrent,
                  missingSkills: customMissing,
                  targetRole: customRole,
                  experienceLevel: profile.experienceLevel || "Mid",
                }),
              });
              const recData = await res.json();
              if (res.ok) {
                setRecommendations(recData);
              }
            } catch (err) {
              console.error("Error auto-fetching recommendations:", err);
            } finally {
              setGenerating(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetRole]);

  function addMissingSkill() {
    const s = missingInput.trim();
    if (s && !missingSkills.includes(s)) {
      setMissingSkills((prev) => [...prev, s]);
    }
    setMissingInput("");
  }

  function removeMissingSkill(skill: string) {
    setMissingSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleGetRecommendations() {
    if (!targetRole.trim()) {
      return setError("Please select or enter a target career role.");
    }

    setError("");
    setGenerating(true);

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token`,
        },
        body: JSON.stringify({
          currentSkills,
          missingSkills,
          targetRole,
          experienceLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch recommendations.");
      }
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching recommendations.");
    } finally {
      setGenerating(false);
    }
  }

  const getCategoryIcon = (cat: RecommendationItem["category"]) => {
    switch (cat) {
      case "Course":
        return <BookOpen size={14} className="text-indigo-400" />;
      case "Project":
        return <Code size={14} className="text-emerald-400" />;
      case "Certification":
        return <Award size={14} className="text-amber-400" />;
      case "Interview Topic":
        return <HelpCircle size={14} className="text-rose-400" />;
      default:
        return <Briefcase size={14} className="text-white/60" />;
    }
  };

  const getCategoryBadgeClass = (cat: RecommendationItem["category"]) => {
    switch (cat) {
      case "Course":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
      case "Project":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "Certification":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "Interview Topic":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      default:
        return "bg-white/10 border-white/20 text-white/60";
    }
  };

  const getPriorityBadgeClass = (prio: "High" | "Medium" | "Low") => {
    switch (prio) {
      case "High":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Low":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      default:
        return "bg-white/10 border-white/20 text-white/60";
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Personalized Recommendations
          </h1>
          <p className="text-white/50 text-sm">
            Tailored learning resources, certifications, interview topics, and missing-skills targeted projects.
          </p>
        </div>

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm text-white/50">Loading profile configs...</p>
          </div>
        ) : (
          /* Settings Panel */
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest font-semibold">
                TARGET ROLE
              </label>
              <div className="flex flex-col gap-3">
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Frontend Developer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <div className="flex flex-wrap gap-2">
                  {popularRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        targetRole === role
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Missing Skills Input */}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <label className="text-xs text-white/30 uppercase tracking-widest font-semibold">
                IDENTIFY MISSING SKILLS (FOR TARGETED PROJECTS)
              </label>
              <div className="flex gap-2">
                <input
                  value={missingInput}
                  onChange={(e) => setMissingInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMissingSkill()}
                  placeholder="e.g. Next.js, System Architecture..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  onClick={addMissingSkill}
                  className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-white shadow-md shadow-indigo-600/30"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <p className="text-white/30 text-xs italic mt-0.5">
                Type a missing skill to custom target project recommendations, or use the auto-inferred gaps above.
              </p>

              {missingSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {missingSkills.map((s) => (
                    <span
                      key={s}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium"
                    >
                      {s}
                      <button
                        onClick={() => removeMissingSkill(s)}
                        className="text-rose-400/60 hover:text-rose-400 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5 border-t border-white/5 pt-3">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button
              onClick={handleGetRecommendations}
              disabled={generating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-white shadow-lg shadow-indigo-600/30"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Compiling recommendations...
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Get Personalized Recommendations
                </>
              )}
            </button>
          </div>
        )}

        {/* Recommendations Results List */}
        {recommendations && (
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="font-bold text-lg border-b border-white/10 pb-2 text-white">
              Recommended for your path
            </h3>
            <div className="flex flex-col gap-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-white/20 transition-all backdrop-blur-xl"
                >
                  {/* Category and priority header */}
                  <div className="flex justify-between items-center flex-wrap gap-2 border-b border-white/10 pb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded border flex items-center gap-1.5 ${getCategoryBadgeClass(
                        rec.category
                      )}`}
                    >
                      {getCategoryIcon(rec.category)}
                      {rec.category}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded border ${getPriorityBadgeClass(
                        rec.priority
                      )}`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>

                  {/* Recommendation details */}
                  <div>
                    <h4 className="text-md font-bold text-white">{rec.name}</h4>
                    <p className="text-xs text-white/60 leading-relaxed mt-2">
                      {rec.whyRecommended}
                    </p>
                  </div>

                  {/* Info badges */}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/40">
                    <p>• Skill Improved: <span className="text-indigo-300 font-semibold">{rec.skillImproves}</span></p>
                    <p>• Difficulty: <span className="text-white/70">{rec.difficulty}</span></p>
                    <p>• Estimated Time: <span className="text-white/70">{rec.estimatedTime}</span></p>
                  </div>

                  {/* Start/Explore Button */}
                  <div className="flex justify-end border-t border-white/5 pt-4 mt-2">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        rec.name + " " + rec.category
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-white shadow-md shadow-indigo-600/20"
                    >
                      Start / Explore
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  setLoadingMore(true);
                  setTimeout(() => {
                    setRecommendations((prev) => [
                      ...(prev || []),
                      {
                        name: "Cloud Native Microservices Architecture",
                        category: "Project",
                        whyRecommended:
                          "Design and deploy containerized RESTful microservices to demonstrate modern cloud deployment capability.",
                        skillImproves: "Docker & Microservices",
                        difficulty: "Advanced",
                        estimatedTime: "2 weeks",
                        priority: "High",
                      },
                      {
                        name: "Advanced System Design & Distributed Systems",
                        category: "Course",
                        whyRecommended:
                          "Master distributed caching, database sharding, and high-availability architecture patterns.",
                        skillImproves: "System Architecture",
                        difficulty: "Advanced",
                        estimatedTime: "25 hours",
                        priority: "High",
                      },
                      {
                        name: "Frontend Performance Optimization & Core Web Vitals",
                        category: "Interview Topic",
                        whyRecommended:
                          "Deep dive into browser rendering pipelines, dynamic bundle splitting, and memory optimization.",
                        skillImproves: "Performance & UX",
                        difficulty: "Intermediate",
                        estimatedTime: "3 days",
                        priority: "Medium",
                      },
                    ]);
                    setLoadingMore(false);
                  }, 600);
                }}
                disabled={loadingMore}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 text-indigo-300 text-xs font-bold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/5"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                    Loading More Recommendations...
                  </>
                ) : (
                  <>
                    Load More Recommendations ↓
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
