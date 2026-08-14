"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserSkillProfile,
  getUserActiveRoadmap,
  saveUserRoadmap,
  toggleRoadmapItemCompletion,
} from "@/lib/actions/general.action";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Code,
  ExternalLink,
  Flame,
  Loader2,
  MapPin,
  RefreshCw,
  Zap,
} from "lucide-react";

interface RoadmapItem {
  topic: string;
  priority: "High" | "Medium" | "Low";
  estimatedTime: string;
  resources: string[];
  projectSuggestion: string;
  completed: boolean;
}

const popularRoles = [
  "Frontend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Data Analyst",
  "Data Engineer",
];

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [projects, setProjects] = useState<any[]>([]);
  
  const [roadmap, setRoadmap] = useState<RoadmapItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingIndex, setActionLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam) {
        setTargetRole(roleParam);
      }
    }

    async function loadData() {
      setLoading(true);
      try {
        const savedRoadmap = await getUserActiveRoadmap();
        if (savedRoadmap && savedRoadmap.length > 0) {
          setRoadmap(savedRoadmap as RoadmapItem[]);
        }

        const profile = await getUserSkillProfile();
        if (profile) {
          const aggregatedSkills = [
            ...(profile.programmingLanguages || []),
            ...(profile.technicalSkills || []),
            ...(profile.toolsFrameworks || []),
            ...(profile.softSkills || []),
          ];
          setCurrentSkills(Array.from(new Set(aggregatedSkills)));
          setExperienceLevel(profile.experienceLevel || "Mid");
          setProjects(profile.projects || []);
        }
      } catch (err) {
        console.error("Failed to load user profile or roadmap:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleGenerate() {
    if (!targetRole.trim()) {
      return setError("Please select or enter a target career role.");
    }

    setError("");
    setGenerating(true);

    try {
      const response = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token`,
        },
        body: JSON.stringify({
          currentSkills,
          experienceLevel,
          projects,
          targetRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate learning roadmap.");
      }

      // Save to db
      const saveRes = await saveUserRoadmap(data);
      if (saveRes.success) {
        setRoadmap(data);
      } else {
        throw new Error("Failed to save generated roadmap in profile.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during roadmap generation.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleCompletion(index: number, currentStatus: boolean) {
    setActionLoadingIndex(index);
    try {
      const res = await toggleRoadmapItemCompletion(index, !currentStatus);
      if (res.success && res.activeRoadmap) {
        setRoadmap(res.activeRoadmap as RoadmapItem[]);
      } else {
        alert(res.message || "Failed to update item completion status.");
      }
    } catch (err) {
      console.error("Error toggling item completion:", err);
    } finally {
      setActionLoadingIndex(null);
    }
  }

  const getPriorityBadgeClass = (prio: "High" | "Medium" | "Low") => {
    switch (prio) {
      case "High":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "Low":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      default:
        return "bg-white/10 border-white/20 text-white/60";
    }
  };

  // Completion calculation
  const completedCount = roadmap ? roadmap.filter((item) => item.completed).length : 0;
  const totalCount = roadmap ? roadmap.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Personalized Learning Roadmap
          </h1>
          <p className="text-white/50 text-sm">
            A step-by-step sequential learning path customized to your current skills and target role expectations.
          </p>
        </div>

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm text-white/50">Fetching your profile and roadmap records...</p>
          </div>
        ) : !roadmap ? (
          /* Generate Form View */
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Target Career / Job Role
              </label>
              <div className="flex flex-col gap-3">
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <div className="flex flex-wrap gap-2">
                  {popularRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        targetRole === role
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <p className="text-xs text-white/30 uppercase tracking-widest">Profile Snapshot</p>
              <div className="flex flex-col gap-1.5 text-sm text-white/70">
                <p>• Experience Level: <span className="text-indigo-300 font-semibold">{experienceLevel}</span></p>
                <p>• Recognized Skills: <span className="text-white/90">{currentSkills.length > 0 ? `${currentSkills.length} skills loaded` : "No skills saved"}</span></p>
                <p>• Extracted Projects: <span className="text-white/90">{projects.length > 0 ? `${projects.length} projects detected` : "No projects logged"}</span></p>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5 border-t border-white/5 pt-3">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating learning path...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Learning Roadmap
                </>
              )}
            </button>
          </div>
        ) : (
          /* Active Roadmap View */
          <div className="flex flex-col gap-6">
            {/* Progress & Re-generate Header */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-lg text-white">Your Learning Journey</h3>
                  <p className="text-xs text-white/40">Target Role: {targetRole}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/recommendations?role=${encodeURIComponent(targetRole)}&missing=${encodeURIComponent(
                      roadmap ? roadmap.filter((item) => !item.completed).map((item) => item.topic).join(",") : ""
                    )}`}
                    className="bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-white"
                  >
                    Get Recommendations →
                  </Link>
                  <button
                    onClick={() => setRoadmap(null)}
                    className="bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-white/90"
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-white/50">
                  <span>Progress ({progressPercent}%)</span>
                  <span>{completedCount} / {totalCount} completed</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="flex flex-col relative pl-6 border-l border-white/10 ml-4 gap-8">
              {roadmap.map((item, index) => (
                <div key={index} className="relative flex flex-col gap-3">
                  {/* Timeline indicator node */}
                  <div
                    onClick={() => handleToggleCompletion(index, item.completed)}
                    className={`absolute -left-[37px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      item.completed
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "bg-neutral-900 border-white/20 text-white/30 hover:border-indigo-500"
                    }`}
                  >
                    {actionLoadingIndex === index ? (
                      <Loader2 size={10} className="animate-spin text-white" />
                    ) : item.completed ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Roadmap Item Card */}
                  <div
                    className={`border rounded-2xl p-6 transition-all duration-300 ${
                      item.completed
                        ? "bg-emerald-500/[0.02] border-emerald-500/20"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Header: title, priority, estimated time */}
                    <div className="flex items-start justify-between flex-wrap gap-2 border-b border-white/10 pb-3 mb-3">
                      <div>
                        <h4
                          className={`text-md font-bold transition-colors ${
                            item.completed ? "text-emerald-300 line-through" : "text-white"
                          }`}
                        >
                          {item.topic}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-white/40 mt-1">
                          <Clock size={12} />
                          <span>Estimated Time: {item.estimatedTime}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded border ${getPriorityBadgeClass(
                          item.priority
                        )}`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    {/* Resources */}
                    {item.resources?.length > 0 && (
                      <div className="flex flex-col gap-2 mb-4">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold flex items-center gap-1">
                          <BookOpen size={10} /> Recommended Resources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={`https://www.google.com/search?q=${encodeURIComponent(
                                res + " learning resource"
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 text-indigo-300 transition-colors"
                            >
                              {res}
                              <ExternalLink size={10} className="opacity-50" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practice project */}
                    {item.projectSuggestion && (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-1.5">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold flex items-center gap-1">
                          <Code size={10} /> Practice / Project Suggestion
                        </p>
                        <p className="text-xs text-white/70 leading-relaxed">
                          {item.projectSuggestion}
                        </p>
                      </div>
                    )}

                    {/* Toggle Switch */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleToggleCompletion(index, item.completed)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          item.completed
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <CheckCircle size={12} />
                        {item.completed ? "Mark Incomplete" : "Mark as Completed"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
