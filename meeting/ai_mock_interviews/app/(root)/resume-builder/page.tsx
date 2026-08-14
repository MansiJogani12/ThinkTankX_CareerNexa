"use client";

import { useRef, useState } from "react";
import type { Education, Experience, Project, ResumeData, DynamicResumeData, DynamicSection, DynamicEntry } from "@/types/ai-career";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Plus,
  Trash,
  Upload,
} from "lucide-react";
import { generateResumePDF, toBase64 } from "@/lib/ai-career-utils";

const blankExp = (): Experience => ({
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  bullets: [""],
});
const blankEdu = (): Education => ({
  degree: "",
  school: "",
  location: "",
  year: "",
  gpa: "",
});

const blankProj = (): Project => ({ name: "", description: "", link: "" });

const Field = ({ label, value, onChange, placeholder, textarea }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/40 uppercase tracking-widest">
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
      />
    )}
  </div>
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/10 transition-colors"
      >
        <span className="text-sm font-semibold text-white/90">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-white/40" />
        ) : (
          <ChevronDown size={16} className="text-white/40" />
        )}
      </button>
      {open && <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

export default function BuildResumePage() {
  const [mode, setMode] = useState<"manual" | "improve" | "latex">("manual");
  const [latexText, setLatexText] = useState("");
  const [dynamicData, setDynamicData] = useState<DynamicResumeData | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingProjectIndex, setGeneratingProjectIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [basics, setBasics] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  });

  const [summary, setSummary] = useState("");
  const [experience, setExp] = useState<Experience[]>([blankExp()]);
  const [education, setEdu] = useState<Education[]>([blankEdu()]);
  const [techSkills, setTech] = useState("");
  const [softSkills, setSoft] = useState("");
  const [projects, setProjects] = useState<Project[]>([blankProj()]);
  const [certs, setCerts] = useState("");

  function updateExp(i: number, key: keyof Experience, val: any) {
    setExp((p) => p.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)));
  }

  function updateButtet(ei: number, bi: number, val: string) {
    setExp((p) =>
      p.map((e, i) =>
        i === ei
          ? { ...e, bullets: e.bullets.map((b, j) => (j === bi ? val : b)) }
          : e
      )
    );
  }

  async function handleFileChange(f: File) {
    if (mode === "latex") {
      if (!f.name.endsWith(".tex") && f.type !== "text/plain" && f.type !== "application/x-tex") {
        return setError("Please upload a .tex file.");
      }
      if (f.size > 5 * 1024 * 1024) return setError("File size should be less than 5MB.");
      const text = await f.text();
      setLatexText(text);
      setFile(f);
      setError("");
      return;
    }

    if (f.type !== "application/pdf")
      return setError("Please upload a pdf file.");
    if (f.size > 5 * 1024 * 1024)
      return setError("File size should be less than 5MB.");

    setError("");
    setFile(f);
  }

  async function handleGenerateProjectBullets(index: number) {
      const proj = projects[index];
      if (!proj.name || !proj.description) {
          return alert("Please enter both a Project Name and Description/Tech Stack before generating bullets.");
      }
      setGeneratingProjectIndex(index);
      try {
          const res = await fetch("/api/ai/project-resume", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: proj.name, description: proj.description })
          });
          const data = await res.json();
          if (data.bullets && data.bullets.length > 0) {
              // Convert bullets into a single string if we want to save it in description
              // OR in this case, we just append them to the description text area, or replace it.
              const newDesc = proj.description + "\n\nAI Generated Bullets:\n" + data.bullets.map((b: string) => `• ${b}`).join("\n");
              
              setProjects((p) =>
                  p.map((e, i) =>
                    i === index ? { ...e, description: newDesc } : e
                  )
              );
          }
      } catch (err) {
          console.error("Failed to generate project bullets", err);
          alert("Failed to generate AI bullets for the project.");
      } finally {
          setGeneratingProjectIndex(null);
      }
  }

  async function handleSubmit() {
    setError("");
    setResult(null);
    if (mode === "improve" && !file) {
      return setError("Please upload your resume pdf.");
    }
    if (mode === "latex" && !latexText.trim() && !file) {
      return setError("Please paste your LaTeX code or upload a .tex file.");
    }

    if (mode === "manual" && !basics.name.trim()) {
      return setError("Please Enter your name");
    }
    setLoading(true);
    try {
      let payload: any = { mode };
      if (mode === "latex") {
        payload.latexText = latexText;
      } else if (mode === "manual") {
        payload.formData = {
          ...basics,
          summary,
          experience,
          education,
          skills: {
            technical: techSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            soft: softSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          projects,
          certifications: certs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
      } else {
        payload.pdfBase64 = await toBase64(file!);
      }

      const response = await fetch("/api/ai/resume-build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock_token_for_now`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to build resume");
      }

      if (mode === "latex" && data.isDynamic) {
         setDynamicData(data);
      } else {
         setResult(data);
      }
    } catch (error: any) {
      setError(error.message || "Failed to build resume");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-1.5">
          {(["manual", "improve", "latex"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResult(null);
                setDynamicData(null);
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                mode === m
                  ? "bg-white/10 border border-white/20 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "manual"
                ? "Build from Scratch"
                : m === "improve" ? "Improve Existing Resume" : "Import from LaTeX"}
            </button>
          ))}
        </div>

        {mode === "manual" && (
          <>
            <Section title="Personal Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  value={basics.name}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, name: v }))
                  }
                  placeholder="John Doe"
                />
                <Field
                  label="Email"
                  value={basics.email}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, email: v }))
                  }
                  placeholder="John@Doe.com"
                />
                <Field
                  label="Phone"
                  value={basics.phone}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, phone: v }))
                  }
                  placeholder="+91 1234567890"
                />
                <Field
                  label="Location"
                  value={basics.location}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, location: v }))
                  }
                  placeholder="Ranchi, 812345"
                />
                <Field
                  label="Linkedin Url"
                  value={basics.linkedin}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, linkedin: v }))
                  }
                  placeholder="linkedin.com/in/msd"
                />
                <Field
                  label="Professinal Summary (AI will enhance it)"
                  value={summary}
                  onChange={setSummary}
                  placeholder="Brief summary of your experience and goals..."
                  textarea
                />
              </div>
            </Section>

            <Section title="Work Experience">
              {experience.map((exp, ei) => (
                <div
                  key={ei}
                  className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Position {ei + 1}
                    </span>
                    {experience.length > 1 && (
                      <button
                        onClick={() =>
                          setExp((p) => p.filter((_, i) => i !== ei))
                        }
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Job Title"
                      value={exp.title}
                      onChange={(v: string) => updateExp(ei, "title", v)}
                      placeholder="Software Engineer"
                    />
                    <Field
                      label="Company"
                      value={exp.company}
                      onChange={(v: string) => updateExp(ei, "company", v)}
                      placeholder="Google"
                    />
                    <Field
                      label="Location"
                      value={exp.location}
                      onChange={(v: string) => updateExp(ei, "location", v)}
                      placeholder="Remote"
                    />
                    <Field
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v: string) => updateExp(ei, "startDate", v)}
                      placeholder="April 2023"
                    />
                    <Field
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v: string) => updateExp(ei, "endDate", v)}
                      placeholder="Present"
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-xs text-white/40 uppercase tracking-widest">
                      Key Achivements / Responsibilities
                    </label>
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <input
                          value={b}
                          onChange={(e) => updateButtet(ei, bi, e.target.value)}
                          placeholder={`Bullet ${
                            bi + 1
                          } - start with an action verb`}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors flex-1"
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            onClick={() =>
                              updateExp(
                                ei,
                                "bullets",
                                exp.bullets.filter((_, j) => j !== bi)
                              )
                            }
                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        updateExp(ei, "bullets", [...exp.bullets, ""])
                      }
                      className="mt-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold self-start flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={12} /> Add Bullet
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setExp((p) => [...p, blankExp()])}
                className="mt-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold self-start flex items-center gap-2 transition-colors"
              >
                <Plus size={14} /> Add Experience
              </button>
            </Section>

            <Section title="Education">
              {education.map((edu, ei) => (
                <div
                  key={ei}
                  className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Education {ei + 1}
                    </span>
                    {education.length > 1 && (
                      <button
                        onClick={() =>
                          setEdu((p) => p.filter((_, i) => i !== ei))
                        }
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Degree"
                      value={edu.degree}
                      onChange={(v: string) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, degree: v } : e))
                        )
                      }
                      placeholder="B.Tech CS"
                    />
                    <Field
                      label="School"
                      value={edu.school}
                      onChange={(v: string) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, school: v } : e))
                        )
                      }
                      placeholder="IIT Bombay"
                    />
                    <Field
                      label="Location"
                      value={edu.location}
                      onChange={(v: string) =>
                        setEdu((p) =>
                          p.map((e, i) =>
                            i === ei ? { ...e, location: v } : e
                          )
                        )
                      }
                      placeholder="Mumbai, India"
                    />
                    <Field
                      label="Year"
                      value={edu.year}
                      onChange={(v: string) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, year: v } : e))
                        )
                      }
                      placeholder="2026"
                    />

                    <Field
                      label="GPA (optional)"
                      value={edu.gpa}
                      onChange={(v: string) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, gpa: v } : e))
                        )
                      }
                      placeholder="8.5/10"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setEdu((p) => [...p, blankEdu()])}
                className="mt-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold self-start flex items-center gap-2 transition-colors"
              >
                <Plus size={14} /> Add Education
              </button>
            </Section>

            <Section title="Skills">
              <Field
                label="Technical Skills (comma separated)"
                value={techSkills}
                onChange={setTech}
                placeholder="React, Node.js ...."
              />
              <Field
                label="Soft Skills (comma separated)"
                value={softSkills}
                onChange={setSoft}
                placeholder="Leadership, problem solving ...."
              />
            </Section>

            <Section title="Projects (Optional)">
              {projects.map((proj, pi) => (
                <div
                  key={pi}
                  className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Project {pi + 1}
                    </span>
                    {projects.length > 1 && (
                      <button
                        onClick={() =>
                          setProjects((p) => p.filter((_, i) => i !== pi))
                        }
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Project Name"
                      value={proj.name}
                      onChange={(v: string) =>
                        setProjects((p) =>
                          p.map((e, i) => (i === pi ? { ...e, name: v } : e))
                        )
                      }
                      placeholder="AI SaaS app"
                    />
                    <Field
                      label="Description"
                      value={proj.description}
                      onChange={(v: string) =>
                        setProjects((p) =>
                          p.map((e, i) =>
                            i === pi ? { ...e, description: v } : e
                          )
                        )
                      }
                      placeholder="Built with React and Node.js..."
                      textarea
                    />
                    <div className="flex flex-col gap-1.5 mt-1 sm:col-span-2">
                        <button
                          onClick={() => handleGenerateProjectBullets(pi)}
                          disabled={generatingProjectIndex === pi}
                          className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-semibold self-start flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {generatingProjectIndex === pi ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />} 
                          {generatingProjectIndex === pi ? "Generating..." : "Generate ATS Bullets with AI"}
                        </button>
                    </div>
                    <Field
                      label="Link (optional)"
                      value={proj.link}
                      onChange={(v: string) =>
                        setProjects((p) =>
                          p.map((e, i) => (i === pi ? { ...e, link: v } : e))
                        )
                      }
                      placeholder="github.com/pkc/project"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setProjects((p) => [...p, blankProj()])}
                className="mt-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold self-start flex items-center gap-2 transition-colors"
              >
                <Plus size={14} /> Add Project
              </button>
            </Section>

            <Section title="Certifications (Optional)">
              <Field 
                label="Certifications (comma separated)" 
                value={certs} 
                onChange={setCerts} 
                placeholder="AWS Developer, Google Analytics...."
              />
            </Section>
          </>
        )}

        {mode === "improve" && (
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
          </>
        )}

        
        {mode === "latex" && !dynamicData && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <label className="text-sm font-semibold text-white/90">Paste LaTeX Code</label>
              <textarea
                value={latexText}
                onChange={(e) => setLatexText(e.target.value)}
                rows={10}
                placeholder="\documentclass{article}..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors font-mono"
              />
            </div>
            
            <div className="text-center text-white/40 text-sm">OR</div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFileChange(f);
              }}
              onClick={() => fileRef.current?.click()}
              className="bg-white/5 backdrop-blur-xl border-dashed border-white/20 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 py-8 cursor-pointer hover:border-violet-500/40 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload size={32} className="text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white/80">
                  {file ? file.name : "Upload .tex file"}
                </p>
              </div>
              <input type="file" ref={fileRef} accept=".tex" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); e.target.value = ""; }} />
            </div>

            <button
              onClick={handleSubmit}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 transition-colors py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <FileText size={16} /> Convert LaTeX
            </button>
          </div>
        )}

        {dynamicData && (
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Dynamic LaTeX Resume</h3>
            
            <Section title="Personal Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={dynamicData.name} onChange={(v: string) => setDynamicData({ ...dynamicData, name: v })} />
                <Field label="Email" value={dynamicData.email} onChange={(v: string) => setDynamicData({ ...dynamicData, email: v })} />
                <Field label="Phone" value={dynamicData.phone} onChange={(v: string) => setDynamicData({ ...dynamicData, phone: v })} />
                <Field label="Location" value={dynamicData.location} onChange={(v: string) => setDynamicData({ ...dynamicData, location: v })} />
                <Field label="Linkedin Url" value={dynamicData.linkedin} onChange={(v: string) => setDynamicData({ ...dynamicData, linkedin: v })} />
              </div>
            </Section>

            {dynamicData.sections.map((sec, sIdx) => (
              <Section key={sec.id} title={sec.title}>
                 <div className="flex justify-between items-center mb-2">
                    <input value={sec.title} onChange={e => {
                        const newSecs = [...dynamicData.sections];
                        newSecs[sIdx].title = e.target.value;
                        setDynamicData({ ...dynamicData, sections: newSecs });
                    }} className="bg-transparent border-b border-white/20 font-semibold focus:outline-none" />
                    <button onClick={() => {
                        const newSecs = dynamicData.sections.filter((_, i) => i !== sIdx);
                        setDynamicData({ ...dynamicData, sections: newSecs });
                    }} className="text-red-400 hover:text-red-300"><Trash size={14}/></button>
                 </div>
                 
                 {sec.entries.map((entry, eIdx) => (
                    <div key={entry.id} className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">ENTRY {eIdx + 1}</span>
                            <button onClick={() => {
                                const newSecs = [...dynamicData.sections];
                                newSecs[sIdx].entries = newSecs[sIdx].entries.filter((_, i) => i !== eIdx);
                                setDynamicData({ ...dynamicData, sections: newSecs });
                            }} className="text-red-400 hover:text-red-300"><Trash size={14}/></button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(entry.fields).map(([k, v]) => (
                                <div key={k} className="flex gap-2 items-start">
                                    <input value={k} onChange={e => {
                                        const newSecs = [...dynamicData.sections];
                                        const newFields = { ...newSecs[sIdx].entries[eIdx].fields };
                                        newFields[e.target.value] = newFields[k];
                                        delete newFields[k];
                                        newSecs[sIdx].entries[eIdx].fields = newFields;
                                        setDynamicData({ ...dynamicData, sections: newSecs });
                                    }} className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs" />
                                    {Array.isArray(v) ? (
                                        <div className="flex-1 flex flex-col gap-2">
                                            {v.map((b, bIdx) => (
                                                <div key={bIdx} className="flex gap-2">
                                                    <input value={b} onChange={e => {
                                                        const newSecs = [...dynamicData.sections];
                                                        const arr = [...(newSecs[sIdx].entries[eIdx].fields[k] as string[])];
                                                        arr[bIdx] = e.target.value;
                                                        newSecs[sIdx].entries[eIdx].fields[k] = arr;
                                                        setDynamicData({ ...dynamicData, sections: newSecs });
                                                    }} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs" />
                                                    <button onClick={() => {
                                                        const newSecs = [...dynamicData.sections];
                                                        const arr = [...(newSecs[sIdx].entries[eIdx].fields[k] as string[])];
                                                        arr.splice(bIdx, 1);
                                                        newSecs[sIdx].entries[eIdx].fields[k] = arr;
                                                        setDynamicData({ ...dynamicData, sections: newSecs });
                                                    }} className="text-red-400 p-2"><Trash size={12}/></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newSecs = [...dynamicData.sections];
                                                const arr = [...(newSecs[sIdx].entries[eIdx].fields[k] as string[])];
                                                arr.push("");
                                                newSecs[sIdx].entries[eIdx].fields[k] = arr;
                                                setDynamicData({ ...dynamicData, sections: newSecs });
                                            }} className="text-xs text-indigo-400 self-start">+ Add Bullet</button>
                                        </div>
                                    ) : (
                                        <textarea value={v as string} rows={2} onChange={e => {
                                            const newSecs = [...dynamicData.sections];
                                            newSecs[sIdx].entries[eIdx].fields[k] = e.target.value;
                                            setDynamicData({ ...dynamicData, sections: newSecs });
                                        }} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs" />
                                    )}
                                    <button onClick={() => {
                                        const newSecs = [...dynamicData.sections];
                                        delete newSecs[sIdx].entries[eIdx].fields[k];
                                        setDynamicData({ ...dynamicData, sections: newSecs });
                                    }} className="text-red-400 p-2"><Trash size={14}/></button>
                                </div>
                            ))}
                            <button onClick={() => {
                                const newSecs = [...dynamicData.sections];
                                newSecs[sIdx].entries[eIdx].fields["New Field"] = "";
                                setDynamicData({ ...dynamicData, sections: newSecs });
                            }} className="mt-2 text-xs text-indigo-400 self-start">+ Add Field</button>
                        </div>
                    </div>
                 ))}
                 
                 <button onClick={() => {
                     const newSecs = [...dynamicData.sections];
                     newSecs[sIdx].entries.push({ id: Math.random().toString(), fields: { "Field 1": "" } });
                     setDynamicData({ ...dynamicData, sections: newSecs });
                 }} className="mt-3 bg-white/10 text-xs px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1 w-fit">
                     <Plus size={12} /> Add Entry
                 </button>
              </Section>
            ))}
            
            <button onClick={() => {
                setDynamicData({
                    ...dynamicData,
                    sections: [...dynamicData.sections, { id: Math.random().toString(), title: "New Section", entries: [] }]
                });
            }} className="mt-2 bg-indigo-600/50 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                <Plus size={14} /> Add Section
            </button>
            
            <button
                onClick={() => setResult(dynamicData as any)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 transition-colors py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
                Preview & Download PDF
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {!loading && (
          <button
            onClick={handleSubmit}
            className="mt-2 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 text-white"
          >
            <FileText size={16} />{" "}
            {mode === "manual" ? "Build my Resume" : "Improve My Resume"}
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Building your ATS optimized resume...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4 mt-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-5 font-mono text-sm text-white">
              <div className="border-b border-white/20 pb-5">
                <h2 className="text-2xl font-bold">{result.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/50 text-xs">
                  {[
                    result.email,
                    result.phone,
                    result.location,
                    result.linkedin,
                  ]
                    .filter(Boolean)
                    .map((v, i) => (
                      <span key={i}>{v}</span>
                    ))}
                </div>
              </div>
              
              {result.isDynamic && result.sections?.map((sec: any) => (
                <div key={sec.id}>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">{sec.title}</p>
                  {sec.entries?.map((entry: any) => {
                      const title = entry.fields["Title"] || entry.fields["Degree"] || entry.fields["Name"];
                      const subtitle = entry.fields["Company"] || entry.fields["School"] || entry.fields["Organization"];
                      const dates = entry.fields["Dates"] || entry.fields["Year"];
                      
                      return (
                        <div key={entry.id} className="mb-4">
                          {(title || subtitle) && (
                            <div className="flex justify-between flex-wrap gap-1">
                                <span className="font-semibold text-white/90">
                                  {title}{title && subtitle ? ' • ' : ''}{subtitle}
                                </span>
                                {dates && <span className="text-white/50 text-xs">{dates}</span>}
                            </div>
                          )}
                          <div className="mt-1.5 flex flex-col gap-1 pl-1">
                              {Object.entries(entry.fields).map(([k, v]) => {
                                  if (["Title", "Degree", "Name", "Company", "School", "Organization", "Dates", "Year"].includes(k)) return null;
                                  if (Array.isArray(v)) {
                                      return <ul key={k} className="flex flex-col gap-1 pl-3">
                                          {v.filter(Boolean).map((b, j) => (
                                              <li key={j} className="text-white/70 text-xs before:content-['-'] before:mr-2">{b}</li>
                                          ))}
                                      </ul>
                                  }
                                  return v ? <p key={k} className="text-white/70 text-xs mt-1">{v as string}</p> : null;
                              })}
                          </div>
                        </div>
                      )
                  })}
                </div>
              ))}

              {result.summary && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
                    Summary
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}
              {result.experience?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                    Experience
                  </p>
                  {result.experience.map((e, i) => (
                    <div className="mb-4" key={i}>
                      <div className="flex justify-between flex-wrap gap-1">
                        <span className="font-semibold text-white/90">
                          {e.title} • {e.company}
                        </span>
                        <span className="text-white/50 text-xs">
                          {e.startDate} • {e.endDate}
                        </span>
                      </div>
                      <ul className="mt-1.5 flex flex-col gap-1 pl-3">
                        {e.bullets.filter(Boolean).map((b, j) => (
                          <li
                            key={j}
                            className="text-white/70 text-xs before:content-['-'] before:mr-2"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {result.education?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                    Education
                  </p>
                  {result.education.map((e, i) => (
                    <div
                      key={i}
                      className="flex justify-between flex-wrap gap-1 mb-2"
                    >
                      <span className=" text-white/90 font-medium">
                        {e.degree} • {e.school}
                      </span>
                      <span className="text-white/50 text-xs">
                        {e.year} {e.gpa ? ` • GPA ${e.gpa}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {(result.skills?.technical?.length > 0 ||
                result.skills?.soft?.length > 0) && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                    Skills
                  </p>
                  {result.skills.technical?.length > 0 && (
                    <p className="text-white/70 text-xs mb-1">
                      <span className="text-white/50 font-semibold">
                        Technical:{" "}
                      </span>
                      {result.skills.technical.join(", ")}
                    </p>
                  )}
                  {result.skills.soft?.length > 0 && (
                    <p className="text-white/70 text-xs mb-1">
                      <span className="text-white/50 font-semibold">
                        Soft:{" "}
                      </span>
                      {result.skills.soft.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {result.projects?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                    Projects
                  </p>
                  {result.projects.map((p, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-white/90 font-semibold">
                        {p.name}
                        {p.link ? (
                          <span className="text-indigo-400 ml-2 text-xs font-normal">
                            {p.link}
                          </span>
                        ) : (
                          ""
                        )}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.certifications?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.certifications.map((c, i) => (
                      <span key={i} className="bg-white/10 px-2.5 py-1 rounded-md text-xs font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => generateResumePDF(result)}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
              >
                <Download size={16} /> Download PDF
              </button>
              <button
                onClick={() => generateResumeWord(result)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
              >
                <Download size={16} /> Download Word
              </button>
              <button
                onClick={() => generateResumeLatex(result)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
              >
                <Download size={16} /> Download LaTeX
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
