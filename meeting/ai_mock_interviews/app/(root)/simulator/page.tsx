"use client";

import { useEffect, useState } from "react";
import { simulateCareerPath, SimulationResult } from "@/lib/career-simulator";
import { getUserSkillProfile } from "@/lib/actions/general.action";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const CAREER_OPTIONS = [
  "Java Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Cloud Engineer",
  "AI/ML Engineer",
];

export default function CareerSimulatorPage() {
  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  useEffect(() => {
    async function initData() {
      const profile = await getUserSkillProfile();
      if (profile) {
        const aggregated = [
          ...(profile.programmingLanguages || []),
          ...(profile.technicalSkills || []),
          ...(profile.toolsFrameworks || []),
        ];
        if (aggregated.length > 0) {
          setUserSkills(Array.from(new Set(aggregated)));
        }
      }
    }
    initData();
  }, []);

  useEffect(() => {
    const res = simulateCareerPath(selectedRole, userSkills);
    setSimulation(res);
  }, [selectedRole, userSkills]);

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16 text-white max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3.5 py-1 rounded-full text-xs font-semibold w-fit flex items-center gap-2">
          <Sparkles size={14} /> Career What-If Simulator
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Simulate <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400">Alternative Career Paths</span>
        </h1>
        <p className="text-white/60 text-sm max-w-2xl">
          Test "What if" career shifts to see skill gap requirements, estimated learning time, and strategic recommendations tailored to your profile.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="bg-white/5 border border-white/10 p-2 rounded-2xl flex flex-wrap gap-2 backdrop-blur-xl">
        {CAREER_OPTIONS.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === role
                ? "bg-indigo-600 border border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            What if I choose {role}?
          </button>
        ))}
      </div>

      {/* Simulation Result Card */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Path Score & Fit */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6 backdrop-blur-xl">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Career Fit Rating</p>
              <h2 className="text-2xl font-bold text-white">{simulation.role}</h2>
            </div>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <span className="text-4xl font-extrabold text-white">{simulation.currentMatch}%</span>
                <span className="absolute bottom-4 text-[10px] text-white/40 uppercase tracking-widest font-bold">Current Match</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <span className="text-white/60 flex items-center gap-1.5"><TrendingUp size={14} className="text-indigo-400" /> Career Fit</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                  simulation.careerFit === "High" ? "bg-emerald-500/20 text-emerald-300" :
                  simulation.careerFit === "Medium" ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"
                }`}>{simulation.careerFit}</span>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <span className="text-white/60 flex items-center gap-1.5"><Clock size={14} className="text-indigo-400" /> Estimated Prep</span>
                <span className="font-semibold text-white">{simulation.estimatedPrepWeeks}</span>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                <span className="text-white/60 flex items-center gap-1.5"><Briefcase size={14} className="text-indigo-400" /> Key Projects Needed</span>
                <span className="font-semibold text-white">{simulation.recommendedProjectsCount} Portfolio Projects</span>
              </div>
            </div>
          </div>

          {/* Detailed Skill Analysis & Recommendations */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Zap size={18} className="text-amber-400" /> Strategic AI Recommendation
              </h3>
              <p className="text-sm text-white/70 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                {simulation.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="bg-emerald-500/[0.04] border border-emerald-500/20 p-4 rounded-2xl flex flex-col gap-3">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Matched Skills ({simulation.matchedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {simulation.matchedSkills.length > 0 ? (
                    simulation.matchedSkills.map((s) => (
                      <span key={s} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-2.5 py-1 rounded-xl">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/40">No matching skills yet</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-red-500/[0.04] border border-red-500/20 p-4 rounded-2xl flex flex-col gap-3">
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle size={14} /> Missing Skills ({simulation.missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {simulation.missingSkills.length > 0 ? (
                    simulation.missingSkills.map((s) => (
                      <span key={s} className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-2.5 py-1 rounded-xl">
                        ✕ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-300">All required skills mastered!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
              <Link
                href={`/roadmap?role=${encodeURIComponent(simulation.role)}`}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Generate Roadmap for {simulation.role} <ArrowRight size={14} />
              </Link>
              <Link
                href="/job-matcher"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                View Jobs Matching This Path
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
