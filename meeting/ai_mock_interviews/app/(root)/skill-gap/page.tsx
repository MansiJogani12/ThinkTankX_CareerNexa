"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserSkillProfile } from "@/lib/actions/general.action";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { scoreColor } from "@/lib/ai-career-utils";

interface SkillGapDetail {
  skill: string;
  priority: "High" | "Medium" | "Low";
  feedback: string;
}

interface SkillGapResult {
  readinessScore: number;
  matchingSkills: string[];
  weakSkills: SkillGapDetail[];
  missingSkills: SkillGapDetail[];
  summary: string;
}

const popularRoles = [
  "Frontend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Data Analyst",
  "Data Engineer",
];

export default function SkillGapPage() {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SkillGapResult | null>(null);

  useEffect(() => {
    async function loadProfile() {
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
          // Remove duplicates
          const uniqueSkills = Array.from(new Set(aggregatedSkills));
          setSkills(uniqueSkills);
          setProfileLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load user skill profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleAnalyze() {
    if (skills.length === 0) {
      return setError("Please add at least one current skill before running the analysis.");
    }
    if (!targetRole.trim()) {
      return setError("Please select or enter a target career role.");
    }

    setError("");
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token_for_now`,
        },
        body: JSON.stringify({
          currentSkills: skills,
          targetRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze skill gap.");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
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

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Skill Gap Detection
          </h1>
          <p className="text-white/50 text-sm">
            Analyze your current skills against target role requirements to identify missing knowledge and calculate career readiness.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          {/* Target Role input */}
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

          {/* Current Skills lists */}
          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Your Current Skills
              </label>
              {profileLoaded && (
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Extracted from Resume
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Type a skill and press enter..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={addSkill}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={12} className="animate-spin text-white/40" />
                <span className="text-xs text-white/40">Loading resume skills...</span>
              </div>
            ) : skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto p-1">
                {skills.map((s) => (
                  <span
                    className="bg-white/10 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/15"
                    key={s}
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-xs italic mt-1">
                No skills entered yet. Upload a resume on the Analyse page to pre-populate, or add them manually.
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5 border-t border-white/5 pt-3">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Comparing skills...
              </>
            ) : (
              <>
                <Briefcase size={16} />
                Analyze Skill Gap
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="flex flex-col gap-5 mt-4">
            {/* Summary Ring Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 flex-wrap">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={result.readinessScore} />
                <div className="absolute flex flex-col items-center">
                  <span
                    className={`text-2xl font-black ${scoreColor(
                      result.readinessScore
                    )}`}
                  >
                    {result.readinessScore}%
                  </span>
                  <span className="text-[9px] text-white/30 tracking-wider">FIT</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-1 text-md">Role Readiness Summary</p>
                <p className="text-white/50 text-sm leading-relaxed">
                  {result.summary}
                </p>
                <div className="mt-3">
                  <Link
                    href={`/roadmap?role=${encodeURIComponent(targetRole)}`}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors cursor-pointer"
                  >
                    Generate Roadmap for {targetRole} →
                  </Link>
                </div>
              </div>
            </div>

            {/* Matching Skills */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Matching Skills ({result.matchingSkills?.length || 0})
              </p>
              {result.matchingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.matchingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-xs italic">No matching skills found for the target role.</p>
              )}
            </div>

            {/* Weak Skills */}
            {result.weakSkills?.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                  Skills Requiring Improvement ({result.weakSkills.length})
                </p>
                <div className="flex flex-col gap-3">
                  {result.weakSkills.map((w, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white/95">{w.skill}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getPriorityBadgeClass(
                            w.priority
                          )}`}
                        >
                          {w.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-white/60">
                        <ChevronRight size={13} className="shrink-0 mt-0.5 text-amber-400" />
                        {w.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills?.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                  Missing Core Requirements ({result.missingSkills.length})
                </p>
                <div className="flex flex-col gap-3">
                  {result.missingSkills.map((m, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white/95">{m.skill}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getPriorityBadgeClass(
                            m.priority
                          )}`}
                        >
                          {m.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-white/60">
                        <ChevronRight size={13} className="shrink-0 mt-0.5 text-indigo-400" />
                        {m.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
