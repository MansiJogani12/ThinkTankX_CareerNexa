"use client";

import { useRef, useState } from "react";
import type { Analysis } from "@/types/ai-career";
import {
  downloadReport,
  prioBg,
  prioColor,
  scoreBar,
  scoreColor,
  toBase64,
} from "@/lib/ai-career-utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Loader2,
  Upload,
  FileText,
  Sparkles,
  Zap,
} from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";

const DEFAULT_ANALYSIS_RESULT: Analysis = {
  atsScore: 82,
  summary:
    "Your resume is generally ATS-friendly but needs more targeted keywords to pass higher thresholds. Structurally, it is sound and easy for parsers to read.",
  scoreBreakdown: {
    formatting: {
      score: 90,
      feedback: "Clean layout, but consider using standard fonts.",
    },
    keywords: {
      score: 75,
      feedback: "Missing some industry-standard keywords.",
    },
    structure: {
      score: 85,
      feedback: "Good logical flow of sections.",
    },
    readability: {
      score: 80,
      feedback: "Bullet points are slightly too long.",
    },
  },
  strengths: [
    "Clear section headings",
    "Consistent date formatting",
    "Strong action verbs used in experience section",
  ],
  skillsExtracted: {
    experienceLevel: "Mid",
    programmingLanguages: ["JavaScript", "TypeScript", "HTML5", "CSS3"],
    technicalSkills: [
      "Frontend Development",
      "React State Management",
      "Tailwind CSS Layouts",
      "API Integration",
      "Webpack Build Systems",
    ],
    toolsFrameworks: ["React.js", "Next.js", "Git", "Webpack", "Vite", "ESLint"],
    softSkills: [
      "Team Collaboration",
      "Problem Solving",
      "Adaptability",
      "Active Listening",
    ],
    certifications: ["Meta Frontend Developer Professional Certificate"],
    projects: [
      {
        name: "E-Commerce Admin Dashboard",
        description:
          "Built a robust administrative dashboard using React, Tailwind CSS, and Recharts to visualize sales metrics and manage product inventories.",
      },
      {
        name: "Real-time Chat App",
        description:
          "Developed a secure messaging platform with WebSockets integration to support instant messaging and channel broadcasts.",
      },
    ],
  },
  suggestions: [
    {
      category: "Keywords",
      priority: "High",
      issue: "Missing key technical terms for modern web development.",
      recommendation:
        "Add terms like 'TypeScript', 'Next.js', and 'GraphQL' if applicable.",
    },
    {
      category: "Formatting",
      priority: "Medium",
      issue: "Non-standard bullet points.",
      recommendation:
        "Use standard round bullets to ensure ATS parses them correctly.",
    },
  ],
};

export default function AnalysePage() {
  // Start with null so no fake data is shown before upload
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf")
      return setError("Please upload a PDF file.");
    if (file.size > 5 * 1024 * 1024)
      return setError("File size should be less than 5MB.");

    setError("");
    setLoading(true);
    try {
      const pdfBase64 = await toBase64(file);
      
      const response = await fetch("/api/ai/analyse", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer mock_token_for_now` 
        },
        body: JSON.stringify({ pdfBase64 })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis Failed. Please try again.");
      }

      setResult(data);
      setHasUploaded(true);
    } catch (error: any) {
      setError(error.message || "Analysis Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };
  
  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Upload Box */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-dashed border-white/20 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer hover:border-indigo-500/40 hover:bg-white/5 transition-all duration-300 group bg-white/[0.01]"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload size={32} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white/80 text-base">
              {hasUploaded ? "Analyse another resume" : "Upload your resume"}
            </p>
            <p className="text-white/40 text-sm mt-0.5">
              or click to browse • PDF only • max 5MB
            </p>
          </div>
          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5 mt-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        <input
          type="file"
          ref={fileRef}
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/5 border border-white/10 rounded-2xl">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/60 text-sm">Performing AI ATS analysis on your resume...</p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-6">
            {/* Top Score Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 flex-wrap backdrop-blur-xl">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={result.atsScore} />
                <div className="absolute flex flex-col items-center">
                  <span className={`text-2xl font-black ${scoreColor(result.atsScore)}`}>
                    {result.atsScore}
                  </span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">ATS</span>
                </div>
              </div>
              <div className="flex-1 min-w-[240px]">
                <h3 className="font-bold text-lg text-white mb-1">Overall Score</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Score Breakdown Card */}
            {result.scoreBreakdown && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-xl">
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                  Score Breakdown
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.scoreBreakdown).map(([key, val]) => (
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col gap-2" key={key}>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80 capitalize font-medium">{key}</span>
                        <span className={`font-bold ${scoreColor(val.score)}`}>
                          {val.score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${scoreBar(val.score)} rounded-full transition-all duration-700`}
                          style={{ width: `${val.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/50">{val.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Strengths Card */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-xl">
                <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Strengths
                </p>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {result.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="bg-emerald-500/[0.05] border border-emerald-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-sm text-emerald-200"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Skill Profile Card */}
            {result.skillsExtracted && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 backdrop-blur-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-400" /> Extracted Skill Profile
                  </p>
                  <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    Experience: {result.skillsExtracted.experienceLevel || "Mid"}
                  </span>
                </div>

                {/* Programming Languages */}
                {result.skillsExtracted.programmingLanguages?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Programming Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsExtracted.programmingLanguages.map((lang, idx) => (
                        <span key={idx} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/90 font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {result.skillsExtracted.technicalSkills?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsExtracted.technicalSkills.map((skill, idx) => (
                        <span key={idx} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/90 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools & Frameworks */}
                {result.skillsExtracted.toolsFrameworks?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Tools & Frameworks</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsExtracted.toolsFrameworks.map((tool, idx) => (
                        <span key={idx} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/90 font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {result.skillsExtracted.softSkills?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Soft Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsExtracted.softSkills.map((skill, idx) => (
                        <span key={idx} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/90 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {result.skillsExtracted.certifications?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsExtracted.certifications.map((cert, idx) => (
                        <span key={idx} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/90 font-medium">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Detected */}
                {result.skillsExtracted.projects?.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Projects Detected</p>
                    <div className="flex flex-col gap-3">
                      {result.skillsExtracted.projects.map((proj, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                          <p className="text-sm font-semibold text-white/90">{proj.name}</p>
                          <p className="text-xs text-white/60 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Improvement Suggestions Card */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-xl">
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  Suggestions
                </p>
                <div className="flex flex-col gap-3">
                  {result.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border flex flex-col gap-2 ${
                        prioBg[s.priority as keyof typeof prioBg] || "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white/90">
                          {s.category}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border ${
                            prioColor[s.priority as keyof typeof prioColor] || "text-white/60"
                          }`}
                        >
                          {s.priority}
                        </span>
                      </div>
                      <p className="text-xs text-white/70">{s.issue}</p>
                      <div className="flex items-start gap-2 text-xs text-white/90 pt-1">
                        <ChevronRight
                          size={14}
                          className="shrink-0 mt-0.5 text-indigo-400"
                        />
                        <span>{s.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => downloadReport(result)}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <Download size={16} /> Download Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
