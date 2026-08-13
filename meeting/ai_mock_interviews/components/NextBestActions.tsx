"use client";

import React from "react";
import { CheckCircle2, ArrowRight, Zap, BookOpen, Code, Mic } from "lucide-react";
import Link from "next/link";

interface ActionItem {
  id: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  why: string;
  expectedImpact: string;
  link: string;
  icon: any;
}

interface NextBestActionsProps {
  profile?: any;
}

export function NextBestActions({ profile }: NextBestActionsProps) {
  const targetRole = profile?.targetRole || "Software Developer";
  
  const actions: ActionItem[] = [
    {
      id: 1,
      title: "Master Core Missing Framework Skills",
      priority: "HIGH",
      why: `${targetRole} positions frequently require hands-on framework & database architecture experience.`,
      expectedImpact: "Boosts your target job match score by up to +15%.",
      link: "/roadmap",
      icon: BookOpen,
    },
    {
      id: 2,
      title: "Build & Add a Portfolio Project to Resume",
      priority: "HIGH",
      why: "Recruiters emphasize verified portfolio projects demonstrating REST APIs and system design.",
      expectedImpact: "Strengthens project portfolio evaluation & ATS compliance.",
      link: "/resume-builder",
      icon: Code,
    },
    {
      id: 3,
      title: "Practice a Technical Mock Interview",
      priority: "MEDIUM",
      why: "Recent interview evaluations indicate opportunities to refine technical question structure.",
      expectedImpact: "Increases candidate interview confidence and fluency.",
      link: "/interview",
      icon: Mic,
    },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Zap size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Your Next 3 High-Impact Actions</h3>
          <p className="text-xs text-white/50">Personalized steps to maximize job market readiness</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((act) => {
          const IconComp = act.icon;
          return (
            <div
              key={act.id}
              className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest">
                    Action #{act.id}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      act.priority === "HIGH"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {act.priority}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                  <IconComp size={16} className="text-indigo-400 shrink-0" />
                  {act.title}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  <strong className="text-white/80">Why:</strong> {act.why}
                </p>
              </div>

              <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
                <p className="text-[11px] text-emerald-300 font-medium">
                  ✨ <strong className="text-emerald-200">Impact:</strong> {act.expectedImpact}
                </p>
                <Link
                  href={act.link}
                  className="bg-white/5 hover:bg-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/10"
                >
                  Take Action <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
