"use client";

import React from "react";
import { Sparkles, Trophy, AlertTriangle, Compass, Target, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface CareerTwinProps {
  profile?: any;
}

export function CareerTwin({ profile }: CareerTwinProps) {
  // If no profile (no resume uploaded), show upload prompt
  if (!profile) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Career Twin</h3>
            <p className="text-xs text-white/50">Real-time Resume &amp; Skill Profile Analysis</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-dashed border-indigo-500/30 flex items-center justify-center">
            <Target size={28} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-semibold">No Resume Data Yet</p>
            <p className="text-white/50 text-sm mt-1">Upload your resume to unlock your personalized AI Career Twin profile.</p>
          </div>
          <Link
            href="/analyse"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <ArrowUpRight size={16} /> Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  const readiness = profile.careerReadiness;
  const targetRole = profile.targetRole;

  // Extract skills from resume skill profile
  const topSkills = profile.skills?.slice(0, 4) || [];

  const strongestArea = profile.strongestArea || (profile.skills?.[0] ?? null);
  const biggestGap = profile.biggestGap || null;

  // No hardcoded fake improvement areas — only show real data from profile
  const needsImprovement: { area: string; score: number; status: string }[] = [];


  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Career Twin</h3>
            <p className="text-xs text-white/50">Real-time Resume & Skill Profile Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Target size={12} /> Target: {targetRole}
          </span>
        </div>
      </div>

      {/* Main Readiness Score & Technical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Meter */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
            <span className="text-3xl font-extrabold text-white">{readiness}%</span>
            <span className="absolute bottom-3 text-[9px] text-white/40 uppercase tracking-widest font-bold">Match Score</span>
          </div>
          <p className="text-xs font-bold text-white/80 text-center">ATS & Skills Fit Score</p>
        </div>

        {/* Technical Mastery & Needs Improvement */}
        <div className="md:col-span-2 flex flex-col gap-4 justify-center">
          {/* Top Skills */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Top Recognized Skills</p>
            <div className="flex flex-wrap gap-2">
              {topSkills.map((sk: string) => (
                <span key={sk} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Needs Improvement Bars — only shown when real data exists */}
          {needsImprovement.length > 0 && (
            <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={11} /> Needs Improvement Areas
              </p>
              {needsImprovement.map((item) => (
                <div key={item.area} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/80 font-medium">{item.area}</span>
                    <span className="text-amber-400 font-bold">{item.score}% ({item.status})</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Highlights Grid — only shown when real values exist */}
      {(strongestArea || biggestGap) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-white/10 pt-4">
          {/* Strongest Area */}
          {strongestArea && (
            <div className="bg-emerald-500/[0.04] border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Trophy size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">Strongest Area</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{strongestArea}</p>
              </div>
            </div>
          )}

          {/* Biggest Gap */}
          {biggestGap && (
            <div className="bg-rose-500/[0.04] border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">Biggest Gap</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{biggestGap}</p>
              </div>
            </div>
          )}

          {/* Next Action Link */}
          <Link
            href={`/skill-gap`}
            className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 text-indigo-300 transition-colors group sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Compass size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Career Guidance</p>
                <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Run Skill Gap Analysis</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
