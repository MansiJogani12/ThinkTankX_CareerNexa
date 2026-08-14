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
} from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";

export default function AnalysePage() {
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf")
      return setError("Please upload a pdf file.");
    if (file.size > 5 * 1024 * 1024)
      return setError("File size should be less than 5MB.");

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const pdfBase64 = await toBase64(file);
      
      const response = await fetch("/api/ai/analyse", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Pass mock token or real token if using Firebase Auth on client
          "Authorization": `Bearer mock_token_for_now` 
        },
        body: JSON.stringify({ pdfBase64 })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis Failed. Please try again");
      }

      setResult(data);
    } catch (error: any) {
      setError(error.message || "Analysis Failed. Please try again");
    } finally {
      setLoading(false);
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };
  
  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-dashed border-white/20 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer hover:border-indigo-500/40 hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload size={32} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white/80">
              {result ? "Analyse another resume" : "Drop your resume here"}
            </p>
            <p className="text-white/40 text-sm mt-0.5">
              or click to browse • PDF only • max 5MB
            </p>
          </div>
          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
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
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">Analysing your resume...</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 flex-wrap mt-4">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={result.atsScore} />
                <div className="absolute flex flex-col items-center">
                  <span
                    className={`text-2xl font-black ${scoreColor(
                      result.atsScore
                    )}`}
                  >
                    {result.atsScore}
                  </span>
                  <span className="text-[10px] text-white/30">ATS</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-1">Overall Score</p>
                <p className="text-white/50 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 w-full mt-4">
                <p className="text-xs text-white/40 uppercase tracking-widest">
                  Score Breakdown
                </p>
                {Object.entries(result.scoreBreakdown).map(([key, val]) => (
                  <div className="flex flex-col gap-1.5" key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60 capitalize">{key}</span>
                      <span
                        className={`font-semibold ${scoreColor(val.score)}`}
                      >
                        {val.score}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreBar(
                          val.score
                        )} rounded-full transition-all duration-700`}
                        style={{ width: `${val.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/40">{val.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 w-full mt-4">
                <p className="text-xs text-white/40 uppercase tracking-widest">
                  Strengths
                </p>
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/70"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />{" "}
                    {s}
                  </div>
                ))}
              </div>

              {/* Extracted Skill Profile */}
              {result.skillsExtracted && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 w-full mt-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <p className="text-xs text-white/40 uppercase tracking-widest">
                      Extracted Skill Profile
                    </p>
                    <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                      Experience: {result.skillsExtracted.experienceLevel}
                    </span>
                  </div>

                  {/* Programming Languages */}
                  {result.skillsExtracted.programmingLanguages?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Programming Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {result.skillsExtracted.programmingLanguages.map((lang, idx) => (
                          <span key={idx} className="bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs text-white/80">
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
                          <span key={idx} className="bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs text-white/80">
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
                          <span key={idx} className="bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs text-white/80">
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
                          <span key={idx} className="bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs text-white/80">
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
                          <span key={idx} className="bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs text-white/80">
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 w-full mt-4">
                <p className="text-xs text-white/40 uppercase tracking-widest">
                  Suggestions
                </p>
                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      prioBg[s.priority as keyof typeof prioBg]
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/90">
                        {s.category}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-widest ${
                          prioColor[s.priority as keyof typeof prioColor]
                        }`}
                      >
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-sm text-white/60">{s.issue}</p>
                    <div className="flex items-start gap-2 text-sm text-white/80">
                      <ChevronRight
                        size={14}
                        className="shrink-0 mt-0.5 text-indigo-400"
                      />
                      {s.recommendation}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => downloadReport(result)}
                  className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] text-white flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold transition-all duration-300"
                >
                  <Download size={16} /> Download Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
