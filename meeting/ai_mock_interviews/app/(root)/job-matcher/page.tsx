"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Job } from "@/types/ai-career";
import { matchBg, matchColor, toBase64 } from "@/lib/ai-career-utils";

const JobMap = dynamic(() => import("./JobMap"), { ssr: false });
import {
  AlertCircle,
  Briefcase,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Upload,
  X,
  BookmarkPlus,
  BookOpenCheck
} from "lucide-react";
import { getUserSkillProfile } from "@/lib/actions/general.action";
import { saveUserJob } from "@/lib/actions/jobs.action";
import { useRouter } from "next/navigation";

interface Result {
  jobs: Job[];
  summary: string;
}

export default function JobMatcherPage() {
  const [mode, setMode] = useState<"manual" | "resume">("manual");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setskill] = useState("");
  const [experience, setExp] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getUserSkillProfile();
        if (profile) {
          const aggregatedSkills = [
            ...(profile.programmingLanguages || []),
            ...(profile.technicalSkills || []),
            ...(profile.toolsFrameworks || []),
            ...(profile.softSkills || []),
          ];
          setSkills(Array.from(new Set(aggregatedSkills)));
          if (profile.experienceLevel) {
            setExp(profile.experienceLevel);
          }
        }
      } catch (err) {
        console.error("Failed to load user skill profile in JobMatcher:", err);
      }
    }
    loadProfile();
  }, []);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setskill("");
  }

  function handleFileChange(f: File) {
    if (f.type !== "application/pdf")
      return setError("Please upload a pdf file.");
    if (f.size > 5 * 1024 * 1024)
      return setError("File size should be less than 5MB.");

    setError("");
    setFile(f);
  }

  async function handleSubmit(isLoadMore = false) {
    if (!isLoadMore) {
      setError("");
      setResult(null);
      setPage(1);
    }

    if (mode === "manual" && (!skills.length || !experience.trim())) {
      return setError("Please add at least one skill and your experience.");
    }
    if (mode === "resume" && !file) {
      return setError("Please upload your resume pdf.");
    }

    const currentPage = isLoadMore ? page + 1 : 1;
    if (isLoadMore) {
        setLoadingMore(true);
        setPage(currentPage);
    } else {
        setLoading(true);
    }
    
    try {
      let payload: any = { mode, page: currentPage };
      if (mode === "manual") {
        payload = { ...payload, skills, experience, preferredCity: preferredCity.trim() };
      } else {
        payload = { ...payload, pdfBase64: await toBase64(file!), preferredCity: preferredCity.trim() };
      }

      const response = await fetch("/api/ai/job-matcher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token_for_now`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch job matches.");
      }

      if (isLoadMore && result) {
          setResult({
              summary: result.summary,
              jobs: [...result.jobs, ...data.jobs]
          });
      } else {
          setResult(data);
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch job matches.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function handleSaveJob(job: Job) {
      if (!job) return;
      setSavingJobId(job.id || job.title);
      try {
          const res = await saveUserJob(job);
          if (res.success) {
              alert("Job saved successfully!");
          } else {
              alert("Failed to save job.");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setSavingJobId(null);
      }
  }
  
  function handlePrepareForJob(job: Job) {
      // Pass data to Interview Prep via localStorage
      localStorage.setItem("prepwise_job_prep", JSON.stringify({
          title: job.title,
          description: job.description || job.whyMatch,
          skills: job.skills,
          missingSkills: job.missingSkills || []
      }));
      router.push("/interview-prep");
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

        {mode === "manual" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Your Skills
              </label>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setskill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="e.g. React, Python, SQL..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  onClick={addSkill}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.map((s) => (
                    <span
                      className="bg-white/10 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                      key={s}
                    >
                      {s}{" "}
                      <button
                        onClick={() => {
                          setSkills((p) => p.filter((x) => x !== s));
                        }}
                        className="text-white/40 hover:text-red-400"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Preferred City / Location (Optional)
              </label>
              <input
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Remote..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
              />
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
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFileChange(f);
              }}
              onClick={() => fileRef.current?.click()}
              className="bg-white/5 backdrop-blur-xl border-dashed border-white/20 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer hover:border-violet-500/40 hover:bg-white/10 transition-all duration-300 group"
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
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <label className="text-xs text-white/30 uppercase tracking-widest">
                  Preferred City / Location (Optional)
                </label>
                <input
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                  placeholder="e.g. Bangalore, Mumbai, Remote..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
                />
            </div>
          </>
        )}
        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {!loading && (
          <button
            onClick={() => handleSubmit(false)}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] text-white flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold transition-all duration-300"
          >
            <Briefcase size={16} /> Find Matching Jobs
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Finding your best job matches...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4 mt-4">
            
            <div className="flex items-center justify-between bg-white/5 border border-white/10 p-1.5 rounded-2xl">
              {(['list', 'map'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                    viewMode === m
                      ? "bg-white/10 border border-white/20 text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {m} View
                </button>
              ))}
            </div>

            {viewMode === "map" ? (
              <JobMap jobs={result.jobs} />
            ) : (
              <>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                    Summary
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

            {(() => {
                const hasSameCity = result.jobs.some(j => j.distanceCategory === "Same City");
                const hasNearby = result.jobs.some(j => j.distanceCategory === "Nearby" || j.distanceCategory === "Same City");
                
                const displayedJobs = (showAllJobs || !hasNearby) 
                  ? result.jobs 
                  : result.jobs.filter(j => j.distanceCategory !== "Farther Away");
                  
                const canShowMore = !showAllJobs && hasNearby && result.jobs.length > displayedJobs.length;

                return (
                  <>
                    {preferredCity && !hasSameCity && hasNearby && (
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200/90 p-4 rounded-xl text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>No exact matches found in <strong>{preferredCity}</strong>. Showing top jobs from nearby cities.</p>
                      </div>
                    )}
                    
                    {displayedJobs.map((job, i) => (
              <div
                key={i}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 group hover:border-violet-500/30 transition-colors ${matchBg(
                  job.matchScore
                )}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2 flex-wrap">
                      {job.title}
                      {job.distanceCategory && (
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          job.distanceCategory === "Same City" ? "bg-emerald-500/20 text-emerald-400" :
                          job.distanceCategory === "Nearby" ? "bg-blue-500/20 text-blue-400" :
                          "bg-white/10 text-white/50"
                        }`}>
                           {job.distanceCategory === "Same City" ? "📍 " : ""}{job.distanceCategory}
                        </span>
                      )}
                    </h3>
                    <p className="text-white/50 text-sm mt-0.5">
                      {job.company} • {job.location} • {job.type} {job.salaryMin && `• ${job.salaryCurrency} ${job.salaryMin} - ${job.salaryMax || ""}`}
                    </p>
                  </div>

                  <span
                    className={`text-2xl font-black shrink-0 ${matchColor(
                      job.matchScore
                    )}`}
                  >
                    {job.matchScore}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-white/10 px-2.5 py-1 rounded-md text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="h-px w-full bg-white/10 my-1" />

                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Match Breakdown
                  </p>
                  
                  {job.matchedSkills && job.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                          {job.matchedSkills.map(s => (
                              <span key={s} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1">
                                  ✓ {s}
                              </span>
                          ))}
                      </div>
                  )}
                  {job.missingSkills && job.missingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                          {job.missingSkills.map(s => (
                              <span key={s} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1">
                                  ✕ {s}
                              </span>
                          ))}
                      </div>
                  )}

                  <p className="text-sm text-white/70 leading-relaxed mt-2 bg-white/5 p-3 rounded-xl border-l-2 border-indigo-500">
                    {job.whyMatch}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-sm text-white/70 bg-white/10 rounded-xl p-3 mt-1">
                  <ChevronRight
                    size={16}
                    className="text-indigo-400 shrink-0 mt-0.5"
                  />
                  {job.applyTip}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  {job.applyUrl && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 font-semibold"
                    >
                      Apply Now <ChevronRight size={14} />
                    </a>
                  )}
                  
                  <button
                    onClick={() => handleSaveJob(job)}
                    disabled={savingJobId === (job.id || job.title)}
                    className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {savingJobId === (job.id || job.title) ? <Loader2 size={16} className="animate-spin" /> : <BookmarkPlus size={16} />} Save
                  </button>
                  
                  <button
                    onClick={() => handlePrepareForJob(job)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    title="Prepare for this Job"
                  >
                    <BookOpenCheck size={16} /> Prepare
                  </button>
                </div>
              </div>
            ))}
            
            <div className="flex flex-col gap-2 w-full mt-2">
              {canShowMore && (
                 <button
                   onClick={() => setShowAllJobs(true)}
                   className="bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 w-full text-white/70"
                 >
                   Show Distant Jobs
                 </button>
              )}
              
              <button
                 onClick={() => handleSubmit(true)}
                 disabled={loadingMore}
                 className="bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 w-full text-white"
              >
                 {loadingMore ? <><Loader2 size={16} className="animate-spin" /> Fetching...</> : <><Plus size={16} /> Load More Real Jobs</>}
              </button>
            </div>
              </>
            );
            })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
