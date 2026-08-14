"use client";

import { useEffect, useState } from "react";
import { getUserSkillProfile } from "@/lib/actions/general.action";
import { Loader2, Zap, Briefcase, TrendingUp, AlertTriangle } from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { scoreColor } from "@/lib/ai-career-utils";

interface SimulatorResult {
  readinessScore: number;
  missingSkills: string[];
  marketData: {
    jobsAvailable: number;
    averageSalary: string;
  };
  simulatedJobs: string[];
}

export default function SimulatorPage() {
  const [profile, setProfile] = useState<any>(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const p = await getUserSkillProfile();
      if (p) {
        setProfile(p);
        if (p.targetRole) {
            setTargetRole(p.targetRole);
        }
      }
    }
    loadProfile();
  }, []);

  async function handleSimulate() {
    if (!targetRole.trim()) {
      return setError("Please enter a target role to simulate.");
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          currentSkills: profile?.technicalSkills || [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to run simulation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Zap className="text-amber-400" /> "What If?" Career Simulator
          </h1>
          <p className="text-white/60">
            Experiment with different career paths. See how your current skills map to new target roles, and discover what you need to learn.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <label className="text-sm font-semibold text-white">Simulate a pivot to...</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Machine Learning Engineer"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 disabled:opacity-50 text-white"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {loading ? "Simulating..." : "Run Simulation"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Readiness Score */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                Simulated Readiness
              </p>
              <div className="relative flex items-center justify-center">
                <ScoreRing score={result.readinessScore} />
                <div className="absolute flex flex-col items-center">
                  <span className={`text-3xl font-black ${scoreColor(result.readinessScore)}`}>
                    {result.readinessScore}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed max-w-[200px]">
                Your estimated fit for {targetRole} based on current skills.
              </p>
            </div>

            {/* Missing Skills */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" /> Skill Gaps Detected
              </h3>
              <p className="text-sm text-white/60">To successfully transition to this role, you will need to learn:</p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, i) => (
                  <span key={i} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    ✕ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Market Data */}
            <div className="md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" /> Market Outlook
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                     <p className="text-xs text-white/50 uppercase mb-1">Average Salary</p>
                     <p className="text-2xl font-bold text-white">{result.marketData.averageSalary}</p>
                 </div>
                 <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                     <p className="text-xs text-white/50 uppercase mb-1">Live Job Opportunities</p>
                     <p className="text-2xl font-bold text-white">{result.marketData.jobsAvailable.toLocaleString()}+</p>
                 </div>
              </div>

              <div className="mt-2">
                  <p className="text-xs text-white/50 uppercase mb-2">Simulated Job Matches</p>
                  <div className="flex flex-col gap-2">
                      {result.simulatedJobs.map((job, i) => (
                          <div key={i} className="bg-white/5 px-4 py-3 rounded-lg border border-white/5 flex items-center gap-2 text-sm text-white/80">
                              <Briefcase size={14} className="text-indigo-400" /> {job}
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
