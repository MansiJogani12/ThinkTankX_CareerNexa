"use client";

import { useRef, useState } from "react";
import type { InterviewData, Question } from "@/types/ai-career";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Upload,
  Users,
  Target,
  CheckCircle2,
  Plus,
  X
} from "lucide-react";
import { downloadInterview, toBase64 } from "@/lib/ai-career-utils";

function QCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  
  const diffColor = 
    q.difficulty === "Easy" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
    q.difficulty === "Hard" ? "text-red-400 bg-red-400/10 border-red-400/20" :
    "text-amber-400 bg-amber-400/10 border-amber-400/20"; // Medium default

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 px-5 text-left hover:bg-white/10 transition-colors"
      >
        <div className="flex gap-3 items-start">
          <span className="text-xs font-bold text-indigo-400 mt-0.5">
            Q{q.id}
          </span>
          <div>
            <p className="text-sm text-white/90 leading-relaxed">
              {q.question}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block">
                {q.category}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${diffColor}`}>
                {q.difficulty || "Medium"}
              </span>
            </div>
          </div>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-white/40 shrink-0 mt-1" />
        ) : (
          <ChevronDown size={14} className="text-white/40 shrink-0 mt-1" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 flex flex-col gap-4 border-t border-white/10 pt-4 bg-white/[0.02]">
          <div className="flex items-start gap-2">
            <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-1">Hint</p>
              <p className="text-xs text-white/70 leading-relaxed">{q.hint}</p>
            </div>
          </div>
          
          {q.whyAsked && (
            <div className="flex items-start gap-2">
              <Target size={13} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-1">Why this is asked</p>
                <p className="text-xs text-white/70 leading-relaxed">{q.whyAsked}</p>
              </div>
            </div>
          )}

          {q.strongAnswer && q.strongAnswer.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-1">What a strong answer covers</p>
                <ul className="text-xs text-white/70 leading-relaxed space-y-1 list-disc list-inside">
                  {q.strongAnswer.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrep() {
  const [mode, setMode] = useState<"manual" | "resume">("manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [round, setRound] = useState<"hr" | "technical">("hr");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExp] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<InterviewData | null>(null);

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

  async function handleFileChange(f: File) {
    if (f.type !== "application/pdf")
      return setError("Please upload a pdf file.");
    if (f.size > 5 * 1024 * 1024)
      return setError("File size should be less than 5MB.");

    setError("");
    setFile(f);
    setLoading(true);

    try {
      const base64 = await toBase64(f);
      const res = await fetch("/api/ai/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token_for_now`,
        },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to parse resume.");
      }

      if (data.skillsExtracted) {
        const aggregatedSkills = [
          ...(data.skillsExtracted.technicalSkills || []),
          ...(data.skillsExtracted.toolsFrameworks || []),
          ...(data.skillsExtracted.programmingLanguages || [])
        ];
        const uniqueSkills = Array.from(new Set(aggregatedSkills));
        
        let extractedExp = `${data.skillsExtracted.experienceLevel || ""} level experience.`;
        if (data.skillsExtracted.projects?.length > 0) {
          extractedExp += ` Projects: ${data.skillsExtracted.projects.map((p: any) => p.name).join(", ")}.`;
        }

        setSkills(uniqueSkills);
        setExp(extractedExp);
        setMode("manual");
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse resume.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestions(isMore = false) {
    setError("");
    if (!isMore) setResult(null);

    if (mode === "manual" && (skills.length === 0 || !experience.trim())) {
      return setError("Please add at least one skill and your experience.");
    }
    if (mode === "resume" && !file) {
      return setError("Please upload your resume pdf.");
    }

    setLoading(true);
    try {
      let payload: any = { mode, round };
      if (mode === "manual") {
        payload.skills = skills.join(", ");
        payload.experience = experience;
      } else {
        payload.pdfBase64 = await toBase64(file!);
      }

      if (isMore && result) {
         payload.existingQuestions = result.questions.map(q => q.question);
      }

      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token_for_now`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate questions.");
      }

      if (isMore) {
        setResult(prev => {
          if (!prev) return data;
          const startId = prev.questions.length;
          const newQs = data.questions.map((q: any, i: number) => ({...q, id: startId + i + 1}));
          return {
            ...prev,
            questions: [...prev.questions, ...newQs]
          };
        });
      } else {
        setResult(data);
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-1.5">
          {(["manual", "resume"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResult(null);
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                mode === m
                  ? "bg-white/10 border border-white/20 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "manual" ? "Enter Skills Manually" : "Upload Resume"}
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-1.5 mt-2">
          {(
            [
              { key: "hr", label: "HR Round", Icon: Users },
              { key: "technical", label: "Technical Round", Icon: Code2 },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => {
                setRound(key);
                setResult(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                round === key
                  ? "bg-white/10 border border-white/20 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {mode === "manual" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-5 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Your Skills
              </label>
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
                  className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {skills.length > 0 ? (
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
                  No skills entered yet.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Experience & Background
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExp(e.target.value)}
                rows={4}
                placeholder="e.g. 2 Years of frontend development, worked on e-commerce projects, familiar with agile teams..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {mode === "resume" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFileChange(f);
            }}
            onClick={() => fileRef.current?.click()}
            className="bg-white/5 backdrop-blur-xl border-dashed border-white/20 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 py-10 mt-2 cursor-pointer hover:border-violet-500/40 hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              {file ? (
                <FileText size={22} className="text-emerald-400" />
              ) : (
                <Upload size={32} className="text-indigo-400" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-white/80">
                {file ? file.name : "Drop your resume here"}
              </p>
              <p className="text-white/35 text-sm mt-0.5">
                or click to browse • PDF only • max 5MB
              </p>
            </div>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5 mt-2">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {!loading && (
          <button
            onClick={() => fetchQuestions(false)}
            className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 text-white"
          >
            <Code2 size={16} /> Get Interview Questions
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Getting Interview Questions...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col mt-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3 mb-2">
              <div>
                <p className="font-semibold text-white">{result.role}</p>
                <p className="text-white/50 text-sm mt-0.5">
                  {result.round === "hr" ? "HR Round" : "Technical Round"} •{" "}
                  {result.questions.length} questions
                </p>
              </div>
              <button
                onClick={() => downloadInterview(result)}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} /> Download PDF
              </button>
            </div>

            {result.questions.map((q) => (
              <QCard key={q.id} q={q} />
            ))}

            <button
              onClick={() => fetchQuestions(true)}
              disabled={loading}
              className="mt-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 w-full text-white/80"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Code2 size={16} /> Generate More Questions
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
