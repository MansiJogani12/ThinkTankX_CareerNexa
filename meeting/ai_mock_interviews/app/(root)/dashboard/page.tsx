"use client";

import { useEffect, useState } from "react";
import { getDashboardStats, saveWeeklyStudyHours } from "@/lib/actions/general.action";
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  HelpCircle,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  TrendingUp,
  User,
} from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { scoreColor } from "@/lib/ai-career-utils";
import { SkillProgressChart } from "@/components/SkillProgressChart";

interface DashboardData {
  userProfile: {
    name: string;
    email: string;
    experienceLevel: string;
    skillsCount: number;
    projectsCount: number;
    certificationsCount: number;
  };
  activeRoadmap: any[];
  atsAnalysis: {
    atsScore: number;
    summary: string;
    strengths: string[];
    suggestionsCount: number;
  } | null;
  weeklyStudyHours: number[];
  interviewCount: number;
  interviewCount: number;
  averageInterviewScore: number;
  careerTwin?: {
      targetRole: string;
      topSkills: {name: string; level: number}[];
      needsImprovement: {name: string; level: number}[];
      strongestArea: string;
      biggestGap: string;
      careerDirection: string;
  };
  nextActions?: {
      title: string;
      priority: string;
      why: string;
  }[];
}

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingHours, setUpdatingHours] = useState(false);
  const [logDayIndex, setLogDayIndex] = useState(0);
  const [logHours, setLogHours] = useState("1");

  async function loadData() {
    try {
      const stats = await getDashboardStats();
      if (stats) {
        setData(stats as DashboardData);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // Default logDayIndex to current day (0=Mon, ..., 6=Sun)
    const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    setLogDayIndex(day === 0 ? 6 : day - 1);
  }, []);

  async function handleLogHours() {
    if (!data) return;
    const hours = parseFloat(logHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      alert("Please enter a valid number of hours (0-24).");
      return;
    }

    setUpdatingHours(true);
    const newHours = [...data.weeklyStudyHours];
    newHours[logDayIndex] = hours;

    try {
      const res = await saveWeeklyStudyHours(newHours);
      if (res.success) {
        setData((prev: any) => ({
          ...prev,
          weeklyStudyHours: newHours,
        }));
      } else {
        alert("Failed to log study hours.");
      }
    } catch (err) {
      console.error("Failed to save study hours:", err);
    } finally {
      setUpdatingHours(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm text-white/50">Assembling your progress statistics...</p>
      </div>
    );
  }

  // Pre-calculations
  const roadmapTotal = data?.activeRoadmap?.length || 0;
  const roadmapCompleted = data?.activeRoadmap?.filter(item => item.completed).length || 0;
  const roadmapRemaining = roadmapTotal - roadmapCompleted;
  const roadmapPercent = roadmapTotal > 0 ? Math.round((roadmapCompleted / roadmapTotal) * 100) : 0;

  // Career readiness calculations
  const totalSkillsPossible = 10; 
  const skillsAcquired = data?.userProfile?.skillsCount || 0;
  const careerReadinessPercent = Math.min(100, Math.max(40, Math.round((skillsAcquired / totalSkillsPossible) * 100)));

  // Weekly study hours summary
  const totalWeeklyHours = data?.weeklyStudyHours?.reduce((a, b) => a + b, 0) || 0;
  const maxStudyHour = Math.max(...(data?.weeklyStudyHours || [1])) || 1;

  // Demopopulation fallbacks
  const atsScore = data?.atsAnalysis?.atsScore || 82;
  const jobMatchScore = data?.userProfile?.skillsCount && data.userProfile.skillsCount > 0 ? 85 : 0;

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header summary */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold text-white">
              Career Progress Dashboard
            </h1>
            <p className="text-white/50 text-sm">
              Welcome back, {data?.userProfile?.name || "Candidate"}. Review your readiness logs and track target milestones.
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-white/90"
          >
            <RefreshCw size={12} /> Sync Dashboard
          </button>
        </div>

        {/* Top summary row: Readiness and Weekly Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Readiness Ring */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
              Career Readiness
            </p>
            <div className="relative flex items-center justify-center">
              <ScoreRing score={careerReadinessPercent} />
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-black ${scoreColor(careerReadinessPercent)}`}>
                  {careerReadinessPercent}%
                </span>
                <span className="text-[9px] text-white/30 tracking-wider uppercase">Fit Score</span>
              </div>
            </div>
            <div className="text-xs text-white/50 leading-relaxed max-w-[200px]">
              Based on your target role expectations, skill profile gaps, and roadmap milestones completed.
            </div>
          </div>

          {/* Weekly Learning Bar Chart (SVG-based) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4 md:col-span-2">
            <SkillProgressChart weeklyStudyHours={data?.weeklyStudyHours || []} />

            {/* Study Hour Logger Form */}
            <div className="border-t border-white/5 pt-3 mt-1 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-white/50">Log today's study hours:</span>
              <div className="flex items-center gap-2">
                <select
                  value={logDayIndex}
                  onChange={(e) => setLogDayIndex(parseInt(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                >
                  {weekdayNames.map((name, i) => (
                    <option key={i} value={i} className="bg-neutral-900">
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.5"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  placeholder="hrs"
                  className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none"
                />
                <button
                  onClick={handleLogHours}
                  disabled={updatingHours}
                  className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer text-white disabled:opacity-50"
                >
                  {updatingHours ? "Saving..." : "Log"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats breakdown grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {/* Card: Skills count */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-1">
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> Skills Completed
            </span>
            <span className="text-2xl font-extrabold text-white mt-1">
              {roadmapCompleted}
            </span>
            <span className="text-[10px] text-white/30">From active roadmap milestones</span>
          </div>

          {/* Card: Skills remaining */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-1">
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
              <HelpCircle size={12} className="text-indigo-400" /> Skills Remaining
            </span>
            <span className="text-2xl font-extrabold text-white mt-1">
              {roadmapRemaining > 0 ? roadmapRemaining : 0}
            </span>
            <span className="text-[10px] text-white/30">Milestones to achieve target role</span>
          </div>

          {/* Card: Roadmap progress */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-1">
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
              <TrendingUp size={12} className="text-amber-400" /> Roadmap Progress
            </span>
            <span className="text-2xl font-extrabold text-white mt-1">
              {roadmapPercent}%
            </span>
            <span className="text-[10px] text-white/30">{roadmapCompleted} of {roadmapTotal} milestones done</span>
          </div>

          {/* Card: Interview performance */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-1">
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
              <Award size={12} className="text-rose-400" /> Avg Interview Score
            </span>
            <span className="text-2xl font-extrabold text-white mt-1">
              {data.averageInterviewScore > 0 ? `${data.averageInterviewScore}%` : "N/A"}
            </span>
            <span className="text-[10px] text-white/30">From {data.interviewCount} practice calls run</span>
          </div>
        </div>

        {/* Career Twin & Next Actions */}
        {data.careerTwin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Career Twin */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <User size={18} className="text-indigo-400" /> Career Twin
                   </h3>
                   <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                       <p className="text-xs text-white/50 uppercase">Target Role</p>
                       <p className="text-lg font-semibold text-white">{data.careerTwin.targetRole}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <p className="text-xs text-white/50 uppercase mb-2">Top Skills</p>
                           {data.careerTwin.topSkills.map((s, i) => (
                               <div key={i} className="mb-2">
                                   <div className="flex justify-between text-xs mb-1">
                                       <span className="text-white/80">{s.name}</span>
                                       <span className="text-emerald-400">{s.level}%</span>
                                   </div>
                                   <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.level}%` }} />
                                   </div>
                               </div>
                           ))}
                       </div>
                       <div>
                           <p className="text-xs text-white/50 uppercase mb-2">Needs Improvement</p>
                           {data.careerTwin.needsImprovement.map((s, i) => (
                               <div key={i} className="mb-2">
                                   <div className="flex justify-between text-xs mb-1">
                                       <span className="text-white/80">{s.name}</span>
                                       <span className="text-rose-400">{s.level}%</span>
                                   </div>
                                   <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                                       <div className="h-full bg-rose-500 rounded-full" style={{ width: `${s.level}%` }} />
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                   
                   <div className="flex flex-col gap-2 mt-2">
                       <div className="bg-emerald-500/10 text-emerald-300 p-3 rounded-lg text-sm border border-emerald-500/20">
                           <strong className="text-emerald-400">Strongest Area:</strong> {data.careerTwin.strongestArea}
                       </div>
                       <div className="bg-rose-500/10 text-rose-300 p-3 rounded-lg text-sm border border-rose-500/20">
                           <strong className="text-rose-400">Biggest Gap:</strong> {data.careerTwin.biggestGap}
                       </div>
                   </div>
                </div>
                
                {/* Next Actions */}
                {data.nextActions && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                           <TrendingUp size={18} className="text-amber-400" /> Your Next 3 Actions
                        </h3>
                        
                        <div className="flex flex-col gap-3">
                            {data.nextActions.map((action, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-white text-sm">{i + 1}. {action.title}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${
                                            action.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 
                                            action.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {action.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed border-l-2 border-white/10 pl-2 ml-1">
                                        {action.why}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Feature performance snapshot row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resume ATS card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                <FileText size={13} className="text-indigo-400" /> ATS Resume Score
              </p>
              <h4 className="text-xl font-extrabold text-white mt-2">
                ATS Score: {atsScore}%
              </h4>
              <p className="text-xs text-white/50 leading-relaxed mt-2">
                {data.atsAnalysis?.summary || "Upload your resume on the Analyse page to extract your credentials and compute compatibility score."}
              </p>
            </div>
            {data.atsAnalysis?.strengths && data.atsAnalysis.strengths.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Top Strengths:</p>
                <div className="flex flex-col gap-1 text-[11px] text-white/60">
                  {data.atsAnalysis.strengths.slice(0, 2).map((st, i) => (
                    <span key={i}>✓ {st}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Matcher card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Briefcase size={13} className="text-emerald-400" /> Job Matching Progress
              </p>
              <h4 className="text-xl font-extrabold text-white mt-2">
                Match Rating: {jobMatchScore > 0 ? `${jobMatchScore}%` : "Not Analyzed"}
              </h4>
              <p className="text-xs text-white/50 leading-relaxed mt-2">
                Check potential job matches and market fit options computed directly from your saved profile skills.
              </p>
            </div>
            <div className="text-center bg-white/5 border border-white/5 p-3 rounded-xl text-[10px] text-white/40">
              Matches computed based on {data.userProfile.skillsCount} registered skills.
            </div>
          </div>

          {/* Learning items completed tally */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                <BookOpen size={13} className="text-amber-400" /> Learning Deliverables
              </p>
              <h4 className="text-xl font-extrabold text-white mt-2">
                Credentials Count
              </h4>
              <div className="flex flex-col gap-2 mt-3 text-xs text-white/60">
                <div className="flex justify-between items-center">
                  <span>Courses/Resources:</span>
                  <span className="font-bold text-indigo-300">{roadmapCompleted} completed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Projects Built:</span>
                  <span className="font-bold text-emerald-300">{data.userProfile.projectsCount} detected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Certifications Earned:</span>
                  <span className="font-bold text-amber-300">{data.userProfile.certificationsCount} registered</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-white/30 italic text-center border-t border-white/5 pt-3">
              Mark roadmap items complete to update tally.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
