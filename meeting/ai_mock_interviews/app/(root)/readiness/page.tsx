"use client";

import { useEffect, useState } from "react";
import { Target, Award, BookOpen, Briefcase, FileText } from "lucide-react";

export default function ReadinessPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/ai/readiness");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-64" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-slate-500">Could not load readiness score. Please update your profile.</p>
      </div>
    );
  }

  const { score, breakdown } = data;

  const scoreColor = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const progressColor = score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Readiness</h1>
        <p className="text-slate-500 mt-2">Your holistic readiness score based on your skills, experience, and resume.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="md:col-span-1 border border-indigo-100 shadow-sm rounded-xl relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10" />
          <div className="p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Overall Score</h3>
            <p className="text-sm text-slate-500 mt-1.5">Calculated using a deterministic hybrid model</p>
          </div>
          <div className="p-6 pt-0 flex flex-col items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-slate-100" strokeWidth="12" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  className={progressColor}
                  strokeWidth="12" fill="none"
                  strokeDasharray="351.8"
                  strokeDashoffset={351.8 - (351.8 * score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Card */}
        <div className="md:col-span-2 shadow-sm border border-slate-200 rounded-xl bg-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Score Breakdown</h3>
            <p className="text-sm text-slate-500 mt-1.5">How your score is calculated (30% Skills, 20% Exp, 20% Projects, 30% ATS)</p>
          </div>
          <div className="p-6 pt-0 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500" /> Technical Skills</span>
                <span>{breakdown.skills}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all" style={{ width: `${breakdown.skills}%` }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-500" /> Experience Level</span>
                <span>{breakdown.experience}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all" style={{ width: `${breakdown.experience}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-2"><Target className="w-4 h-4 text-amber-500" /> Projects & Portfolio</span>
                <span>{breakdown.projects}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all" style={{ width: `${breakdown.projects}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Resume ATS Score</span>
                <span>{breakdown.resume}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all" style={{ width: `${breakdown.resume}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="flex items-center gap-2 font-semibold text-indigo-900 mb-2">
          <Award className="w-5 h-5 text-indigo-600" />
          How to improve
        </h3>
        <p className="text-sm text-indigo-800/80 leading-relaxed">
          Your readiness score is a deterministic calculation based on your profile completeness and extracted skills. 
          To increase your score, ensure you have uploaded an ATS-friendly resume, added multiple projects to your portfolio, 
          and validated your skills. You can visit the <strong>Roadmap</strong> to fill in your skill gaps, which will directly 
          boost this score!
        </p>
      </div>
    </div>
  );
}
