import {
  BarChart2,
  Briefcase,
  Compass,
  FileEdit,
  FileText,
  MessageSquare,
  ScanText,
} from "lucide-react";
import type { Analysis, InterviewData, ResumeData } from "@/types/ai-career";

export const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    badge: null,
    desc: "Try before you commit",
    features: [
      "3 AI requests total",
      "ATS score report",
      "Basic job matches",
      "1 resume template",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro Monthly",
    price: "₹299",
    period: "/ month",
    badge: "Most Flexible",
    desc: "Full access, cancel anytime",
    features: [
      "Unlimited resume analyses",
      "Full ATS + strength/weakness report",
      "Unlimited job matching",
      "All resume templates + PDF export",
      "Unlimited interview prep",
      "Priority AI processing",
      "Email support",
    ],
    cta: "Get Pro Monthly",
    highlight: false,
  },
  {
    name: "Pro 6-Month",
    price: "₹1,499",
    period: "/ 6 months",
    badge: "Best Value",
    desc: "Save 17% vs monthly",
    features: [
      "Everything in Pro Monthly",
      "Early access to new features",
      "Resume review by AI weekly",
      "LinkedIn profile tips",
      "Dedicated support",
    ],
    cta: "Get Best Value",
    highlight: true,
  },
];

export const Features = [
  {
    icon: ScanText,
    color: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/20",
    title: "AI Resume Analyser",
    desc: "Upload your resume and get an instant ATS compatibility score. Our AI pinpoints strengths, weaknesses, missing keywords, and formatting issues so you can fix them before recruiters even see it.",
    bullets: [
      "ATS score out of 100",
      "Strengths & weaknesses breakdown",
      "Keyword gap analysis",
      "Section-by-section feedback",
    ],
  },
  {
    icon: Briefcase,
    color: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/20",
    title: "Smart Job Matcher",
    desc: "After analysing your resume, CareerAI matches you with roles that actually fit your skills and experience — no more applying blindly and wondering why you hear nothing back.",
    bullets: [
      "Personalised job recommendations",
      "Match % per role",
      "Skill gap for each job",
      "One-click apply guidance",
    ],
  },
  {
    icon: FileEdit,
    color: "from-pink-500 to-rose-400",
    glow: "shadow-pink-500/20",
    title: "AI Resume Creator",
    desc: "Answer a few questions about your experience and goals. Our AI crafts a recruiter-ready, ATS-optimised resume tailored to the roles you're targeting.",
    bullets: [
      "Auto-generated content",
      "Industry-specific templates",
      "ATS-friendly formatting",
      "Export as PDF instantly",
    ],
  },
  {
    icon: MessageSquare,
    color: "from-amber-500 to-orange-400",
    glow: "shadow-amber-500/20",
    title: "Interview Preparation",
    desc: "Get personalised interview questions based on your skills or resume. Practice with AI feedback, sharpen your answers, and walk into every interview with confidence.",
    bullets: [
      "Resume-based question sets",
      "Skill-specific practice",
      "AI answer feedback",
      "Behavioural & technical rounds",
    ],
  },
];

export const features = [
  { icon: FileText, label: "Resume Builder" },
  { icon: BarChart2, label: "Resume Analyser" },
  { icon: Compass, label: "Career Guide" },
  { icon: MessageSquare, label: "Interview Prep" },
];

export function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export const matchColor = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-red-400";
export const matchBg = (s: number) =>
  s >= 80
    ? "bg-emerald-500/10 border-emerald-500/25"
    : s >= 60
    ? "bg-amber-500/10 border-amber-500/25"
    : "bg-red-500/10 border-red-500/25";

/* ── Download as PDF using jsPDF ── */
export async function downloadInterview(data: InterviewData) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ml = 15,
    tw = 180;
  let y = 20;

  const checkPage = () => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(99, 102, 241);
  doc.text("Interview Questions", ml, y);
  y += 7;
  doc
    .setFontSize(10)
    .setFont("helvetica", "normal")
    .setTextColor(100, 100, 100);
  doc.text(
    `Role: ${data.role}  ·  Round: ${
      data.round === "hr" ? "HR Round" : "Technical Round"
    }`,
    ml,
    y
  );
  y += 10;

  data.questions.forEach((q, i) => {
    checkPage();
    doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(99, 102, 241);
    doc.text(`Q${i + 1}  [${q.category}]`, ml, y);
    y += 5;

    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(26, 26, 26);
    const qLines = doc.splitTextToSize(q.question, tw);
    doc.text(qLines, ml, y);
    y += qLines.length * 5 + 2;

    doc
      .setFontSize(8.5)
      .setFont("helvetica", "italic")
      .setTextColor(120, 120, 120);
    const hLines = doc.splitTextToSize(`Hint: ${q.hint}`, tw);
    doc.text(hLines, ml, y);
    y += hLines.length * 4.5 + 2;

    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y, ml + tw, y);
    y += 6;
  });

  doc.save(`${data.role.replace(/\s+/g, "_")}_${data.round}_interview.pdf`);
}

export async function generateResumePDF(r: ResumeData) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210,
    ml = 15,
    mr = 15,
    tw = W - ml - mr;
  let y = 18;

  const heading = (text: string) => {
    doc.setFontSize(7).setFont("helvetica", "bold").setTextColor(99, 102, 241);
    doc.text(text.toUpperCase(), ml, y);
    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y + 1, ml + tw, y + 1);
    y += 6;
  };
  const addText = (
    text: string,
    size: number,
    style: "normal" | "bold",
    color: [number, number, number],
    indent = 0,
    maxWidth?: number
  ) => {
    doc
      .setFontSize(size)
      .setFont("helvetica", style)
      .setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth ?? tw - indent);
    doc.text(lines, ml + indent, y);
    y += lines.length * (size * 0.45) + 1;
  };
  const gap = (n = 3) => {
    y += n;
  };
  const checkPage = (needed = 12) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 15;
    }
  };

  if (r.isDynamic) {
    const s = r.style || {};
    const font = s.fontPairing === "serif" ? "times" : "helvetica";
    const headerColor: [number, number, number] = s.headerStyle === "colored-accent" ? [99, 102, 241] : [26, 26, 26];
    
    // Header
    doc.setFontSize(22).setFont(font, "bold").setTextColor(26, 26, 26);
    doc.text(r.name || "", ml, y);
    y += 7;
    const contacts = [r.email, r.phone, r.location, r.linkedin].filter(Boolean).join("  •  ");
    doc.setFontSize(9).setFont(font, "normal").setTextColor(100, 100, 100);
    doc.text(contacts, ml, y);
    y += 8;

    r.sections?.forEach((sec: any) => {
      checkPage(15);
      
      doc.setFontSize(11).setFont(font, "bold").setTextColor(...headerColor);
      doc.text(sec.title.toUpperCase(), ml, y);
      if (s.headerStyle !== "normal") {
          doc.setDrawColor(200, 200, 200).setLineWidth(0.3).line(ml, y + 1.5, ml + tw, y + 1.5);
      }
      y += 6;

      sec.entries?.forEach((entry: any) => {
          checkPage(10);
          
          let title = entry.fields["Title"] || entry.fields["Degree"] || entry.fields["Name"] || "";
          let subtitle = entry.fields["Company"] || entry.fields["School"] || entry.fields["Organization"] || "";
          let dates = entry.fields["Dates"] || entry.fields["Year"] || "";
          
          if (title || subtitle) {
              doc.setFontSize(10).setFont(font, "bold").setTextColor(26, 26, 26);
              doc.text(`${title}${title && subtitle ? '  ·  ' : ''}${subtitle}`, ml, y);
              
              if (dates) {
                  doc.setFontSize(9).setFont(font, "normal").setTextColor(120, 120, 120);
                  doc.text(dates, W - mr - doc.getTextWidth(dates), y);
              }
              y += 5;
          }

          // render bullets and other fields
          Object.entries(entry.fields).forEach(([k, v]) => {
              if (["Title", "Degree", "Name", "Company", "School", "Organization", "Dates", "Year"].includes(k)) return;
              
              if (Array.isArray(v)) {
                  v.filter(Boolean).forEach((b: string) => {
                      checkPage(6);
                      addText(`• ${b}`, 9, "normal", [55, 65, 81], 3, tw - 3);
                  });
              } else if (v && typeof v === "string") {
                  checkPage(6);
                  addText(v, 9, "normal", [55, 65, 81], 0, tw);
              }
          });
          gap(2);
      });
      gap();
    });

    doc.save(`${(r.name || "Resume").replace(/\s+/g, "_")}.pdf`);
    return;
  }

  // ── Header ──
  doc.setFontSize(20).setFont("helvetica", "bold").setTextColor(26, 26, 26);
  doc.text(r.name, ml, y);
  y += 7;
  const contacts = [r.email, r.phone, r.location, r.linkedin]
    .filter(Boolean)
    .join("  •  ");
  doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(100, 100, 100);
  doc.text(contacts, ml, y);
  y += 8;

  // ── Summary ──
  if (r.summary) {
    heading("Summary");
    addText(r.summary, 9, "normal", [55, 65, 81], 0, tw);
    gap();
  }

  // ── Experience ──
  if (r.experience?.length) {
    heading("Experience");
    r.experience.forEach((e) => {
      checkPage(14);
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(26, 26, 26);
      doc.text(
        `${e.title}  ·  ${e.company}${e.location ? `, ${e.location}` : ""}`,
        ml,
        y
      );
      doc
        .setFontSize(8)
        .setFont("helvetica", "normal")
        .setTextColor(130, 130, 130);
      const dateText = `${e.startDate} – ${e.endDate}`;
      doc.text(dateText, W - mr - doc.getTextWidth(dateText), y);
      y += 5;
      e.bullets.filter(Boolean).forEach((b) => {
        checkPage(6);
        addText(`• ${b}`, 8.5, "normal", [55, 65, 81], 3, tw - 3);
      });
      gap(2);
    });
  }

  // ── Education ──
  if (r.education?.length) {
    heading("Education");
    r.education.forEach((e) => {
      checkPage(10);
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(26, 26, 26);
      doc.text(
        `${e.degree}  ·  ${e.school}${e.location ? `, ${e.location}` : ""}`,
        ml,
        y
      );
      const yr = `${e.year}${e.gpa ? `  ·  GPA ${e.gpa}` : ""}`;
      doc
        .setFontSize(8)
        .setFont("helvetica", "normal")
        .setTextColor(130, 130, 130);
      doc.text(yr, W - mr - doc.getTextWidth(yr), y);
      y += 6;
    });
    gap();
  }

  // ── Skills ──
  if (r.skills?.technical?.length || r.skills?.soft?.length) {
    heading("Skills");
    if (r.skills.technical?.length) {
      doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(55, 65, 81);
      doc.text("Technical: ", ml, y);
      const lw = doc.getTextWidth("Technical: ");
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(r.skills.technical.join(", "), tw - lw);
      doc.text(lines, ml + lw, y);
      y += lines.length * 4 + 2;
    }
    if (r.skills.soft?.length) {
      doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(55, 65, 81);
      doc.text("Soft: ", ml, y);
      const lw = doc.getTextWidth("Soft: ");
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(r.skills.soft.join(", "), tw - lw);
      doc.text(lines, ml + lw, y);
      y += lines.length * 4 + 2;
    }
    gap();
  }

  // ── Projects ──
  if (r.projects?.length) {
    heading("Projects");
    r.projects.forEach((p) => {
      checkPage(12);
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(26, 26, 26);
      doc.text(p.name, ml, y);
      if (p.link) {
        doc
          .setFontSize(8)
          .setFont("helvetica", "normal")
          .setTextColor(99, 102, 241);
        doc.text(`  ${p.link}`, ml + doc.getTextWidth(p.name), y);
      }
      y += 5;
      addText(p.description, 8.5, "normal", [55, 65, 81], 0, tw);
      gap(2);
    });
  }

  // ── Certifications ──
  if (r.certifications?.length) {
    heading("Certifications");
    addText(r.certifications.join("  •  "), 9, "normal", [55, 65, 81], 0, tw);
  }

  doc.save(`${r.name.replace(/\s+/g, "_")}_Resume.pdf`);
}

export const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-red-400";
export const scoreBar = (s: number) =>
  s >= 80
    ? "from-emerald-500 to-teal-400"
    : s >= 60
    ? "from-amber-500 to-orange-400"
    : "from-red-500 to-rose-400";
export const prioBg = {
  high: "bg-red-500/10 border-red-500/20",
  medium: "bg-amber-500/10 border-amber-500/20",
  low: "bg-emerald-500/10 border-emerald-500/20",
};
export const prioColor = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};
export const prioEmoji = { high: "🔴", medium: "🟡", low: "🟢" };

export function downloadReport(result: Analysis) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Resume Analysis Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;padding:40px}
  .header{background:linear-gradient(135deg,#6366f1,#34d399);border-radius:16px;padding:32px;color:white;margin-bottom:24px;display:flex;align-items:center;gap:24px}
  .circle{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
  .circle-num{font-size:32px;font-weight:900}
  .circle-lbl{font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:1px}
  .title{font-size:20px;font-weight:800;margin-bottom:8px}
  .summary{font-size:14px;opacity:.9;line-height:1.6}
  .card{background:white;border-radius:12px;padding:24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
  .label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:16px;font-weight:600}
  .bar-row{margin-bottom:14px}
  .bar-hd{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px}
  .bar-track{height:6px;background:#e2e8f0;border-radius:99px;overflow:hidden}
  .bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366f1,#34d399)}
  .bar-fb{font-size:12px;color:#64748b;margin-top:4px}
  .strength{display:flex;gap:8px;font-size:13px;color:#334155;margin-bottom:8px}
  .sug{border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid}
  .sug.high{background:#fff5f5;border-color:#fecaca}
  .sug.medium{background:#fffbeb;border-color:#fde68a}
  .sug.low{background:#f0fdf4;border-color:#bbf7d0}
  .sug-hd{display:flex;justify-content:space-between;margin-bottom:6px}
  .sug-cat{font-weight:600;font-size:13px}
  .sug-prio{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
  .sug-issue{font-size:12px;color:#64748b;margin-bottom:6px}
  .sug-rec{font-size:12px;color:#334155}
  .footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:24px}
</style></head><body>

<div class="header">
  <div class="circle">
    <span class="circle-num">${result.atsScore}</span>
    <span class="circle-lbl">ATS</span>
  </div>
  <div>
    <div class="title">Resume Analysis Report</div>
    <div class="summary">${result.summary}</div>
  </div>
</div>

<div class="card">
  <div class="label">Score Breakdown</div>
  ${Object.entries(result.scoreBreakdown)
    .map(
      ([key, val]) => `
    <div class="bar-row">
      <div class="bar-hd"><span style="text-transform:capitalize">${key}</span><strong>${val.score}/100</strong></div>
      <div class="bar-track"><div class="bar-fill" style="width:${val.score}%"></div></div>
      <div class="bar-fb">${val.feedback}</div>
    </div>`
    )
    .join("")}
</div>

<div class="card">
  <div class="label">Strengths</div>
  ${result.strengths
    .map((s) => `<div class="strength"><span>✓</span>${s}</div>`)
    .join("")}
</div>

<div class="card">
  <div class="label">Suggestions</div>
  ${result.suggestions
    .map(
      (s) => `
    <div class="sug ${s.priority}">
      <div class="sug-hd">
        <span class="sug-cat">${s.category}</span>
        <span class="sug-prio">${prioEmoji[s.priority as keyof typeof prioEmoji]} ${s.priority}</span>
      </div>
      <div class="sug-issue">${s.issue}</div>
      <div class="sug-rec">→ ${s.recommendation}</div>
    </div>`
    )
    .join("")}
</div>

<div class="footer">Generated by CareerAI · ${new Date().toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  )}</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume-analysis.html";
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadFeedbackReport(interview: any, feedback: any) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210,
    ml = 15,
    mr = 15,
    tw = W - ml - mr;
  let y = 18;

  const checkPage = (needed = 12) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 15;
    }
  };

  const addHeading = (text: string) => {
    checkPage(12);
    doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(99, 102, 241);
    doc.text(text.toUpperCase(), ml, y);
    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y + 1.5, ml + tw, y + 1.5);
    y += 8;
  };

  const addText = (
    text: string,
    size: number,
    style: "normal" | "bold" | "italic",
    color: [number, number, number],
    indent = 0,
    maxWidth?: number
  ) => {
    doc
      .setFontSize(size)
      .setFont("helvetica", style)
      .setTextColor(...color);
    const lines = doc.splitTextToSize(text, (maxWidth ?? tw) - indent);
    doc.text(lines, ml + indent, y);
    y += lines.length * (size * 0.45) + 1.5;
  };

  // --- Title Header ---
  doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(26, 26, 26);
  doc.text("Interview Performance Report", ml, y);
  y += 6;

  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100, 100, 100);
  doc.text(
    `Role: ${interview.role}  ·  Type: ${interview.type}  ·  Score: ${feedback.totalScore}/100`,
    ml,
    y
  );
  y += 10;

  // --- Summary ---
  addHeading("Interview Summary");
  addText(feedback.finalAssessment || feedback.summary || "No summary provided.", 9.5, "normal", [55, 65, 81]);
  y += 4;

  // --- Category Scores ---
  addHeading("Category Breakdown");
  feedback.categoryScores.forEach((cat: any) => {
    checkPage(18);
    doc.setFontSize(9.5).setFont("helvetica", "bold").setTextColor(55, 65, 81);
    doc.text(`${cat.name}: `, ml, y);
    const scoreText = `${cat.score}/100`;
    
    // Choose color based on score (green, amber, red)
    let c: [number, number, number] = [99, 102, 241];
    if (cat.score >= 80) c = [16, 185, 129];
    else if (cat.score >= 60) c = [245, 158, 11];
    else c = [239, 68, 68];
    
    doc.setFont("helvetica", "bold").setTextColor(...c);
    doc.text(scoreText, ml + doc.getTextWidth(`${cat.name}: `) + 1, y);
    y += 5;
    
    addText(cat.comment, 8.5, "normal", [100, 110, 120], 3);
    y += 2;
  });
  y += 2;

  // --- Strengths ---
  if (feedback.strengths?.length > 0) {
    addHeading("Strengths");
    feedback.strengths.forEach((str: string) => {
      checkPage(8);
      addText(`• ${str}`, 8.5, "normal", [55, 65, 81], 2);
    });
    y += 3;
  }

  // --- Weaknesses ---
  if (feedback.weaknesses?.length > 0) {
    addHeading("Weaknesses");
    feedback.weaknesses.forEach((weak: string) => {
      checkPage(8);
      addText(`• ${weak}`, 8.5, "normal", [55, 65, 81], 2);
    });
    y += 3;
  }

  // --- Areas for Improvement ---
  if (feedback.areasForImprovement?.length > 0) {
    addHeading("Areas for Improvement");
    feedback.areasForImprovement.forEach((area: string) => {
      checkPage(8);
      addText(`• ${area}`, 8.5, "normal", [55, 65, 81], 2);
    });
    y += 3;
  }

  // --- Improvement Suggestions ---
  if (feedback.improvementSuggestions?.length > 0) {
    addHeading("Actionable Suggestions");
    feedback.improvementSuggestions.forEach((sug: string) => {
      checkPage(8);
      addText(`• ${sug}`, 8.5, "normal", [55, 65, 81], 2);
    });
    y += 3;
  }

  // --- Recommended Topics ---
  if (feedback.recommendedTopics?.length > 0) {
    addHeading("Recommended Practice Topics");
    feedback.recommendedTopics.forEach((topic: string) => {
      checkPage(8);
      addText(`• ${topic}`, 8.5, "normal", [55, 65, 81], 2);
    });
    y += 3;
  }

  doc.save(`${interview.role.replace(/\s+/g, "_")}_Performance_Report.pdf`);
}

import { normalizeSkill } from "./skill-dictionary";

/* ── Deterministic Scoring Helpers ── */
export function computeDeterministicATSScore(
  skills: string[],
  experience: any[],
  education: any[],
  projectsCount: number,
  certificationsCount: number
): number {
  let score = 0;
  
  // 1. Skill completeness (Max 30 points)
  const numSkills = skills.length;
  if (numSkills > 15) score += 30;
  else if (numSkills > 10) score += 20;
  else if (numSkills > 5) score += 10;
  else score += 5;

  // 2. Experience completeness & length (Max 35 points)
  if (experience.length > 2) score += 35;
  else if (experience.length === 2) score += 25;
  else if (experience.length === 1) score += 15;

  // 3. Education (Max 15 points)
  if (education.length > 0) score += 15;

  // 4. Projects bonus (Max 10 points)
  if (projectsCount > 2) score += 10;
  else if (projectsCount > 0) score += 5;

  // 5. Certifications bonus (Max 10 points)
  if (certificationsCount > 0) score += 10;

  // Formatting penalty checks could go here in the future
  return Math.min(Math.max(Math.round(score), 40), 100);
}

export function computeDeterministicJobMatch(
  userSkillsRaw: string[], 
  requiredSkillsRaw: string[], 
  experienceLevel: string
): { matchScore: number; matchedSkills: string[]; missingSkills: string[] } {
  if (!requiredSkillsRaw || requiredSkillsRaw.length === 0) return { matchScore: 75, matchedSkills: [], missingSkills: [] };
  
  // Normalize skills
  const userSkills = userSkillsRaw.map(normalizeSkill).filter(Boolean);
  const reqSkills = requiredSkillsRaw.map(normalizeSkill).filter(Boolean);
  
  if (!userSkills || userSkills.length === 0) return { matchScore: 40, matchedSkills: [], missingSkills: reqSkills };
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  reqSkills.forEach(req => {
    // Exact or substring match in normalized strings
    if (userSkills.some(u => req.toLowerCase() === u.toLowerCase() || req.toLowerCase().includes(u.toLowerCase()) || u.toLowerCase().includes(req.toLowerCase()))) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const matchRatio = matchedSkills.length / reqSkills.length;
  let score = 40 + (matchRatio * 50); // 40 to 90 based on skills
  
  // Experience bump
  if (experienceLevel?.toLowerCase().includes("senior")) score += 10;
  else if (experienceLevel?.toLowerCase().includes("mid")) score += 5;

  return {
    matchScore: Math.min(Math.round(score), 100),
    matchedSkills: Array.from(new Set(matchedSkills)),
    missingSkills: Array.from(new Set(missingSkills))
  };
}

export function computeDetailedATSAnalysis(extractedData: any) {
  const skills = [
    ...(extractedData.technicalSkills || []),
    ...(extractedData.toolsFrameworks || []),
    ...(extractedData.programmingLanguages || []),
    ...(extractedData.softSkills || [])
  ];
  const experience = extractedData.experience || [];
  const education = extractedData.education || [];
  const projectsCount = (extractedData.projects || []).length;
  const certsCount = (extractedData.certifications || []).length;

  const atsScore = computeDeterministicATSScore(skills, experience, education, projectsCount, certsCount);

  // Generate deterministic scoreBreakdown
  const scoreBreakdown = {
    formatting:  { score: Math.min(100, 70 + (experience.length > 0 ? 15 : 0) + (education.length > 0 ? 15 : 0)), feedback: "Evaluated based on presence of core sections." },
    keywords:    { score: Math.min(100, 50 + (skills.length * 2)), feedback: "Evaluated based on volume of extracted keywords." },
    structure:   { score: 85, feedback: "Assumes standard top-down chronological structure." },
    readability: { score: 90, feedback: "Parsable text detected successfully." }
  };

  // Generate deterministic suggestions
  const suggestions = [];
  if (skills.length < 10) {
    suggestions.push({
      category: "Keywords",
      issue: "Low keyword density detected.",
      recommendation: "Add more specific tools, frameworks, and methodologies relevant to your field.",
      priority: "high"
    });
  }
  if (experience.length === 0) {
    suggestions.push({
      category: "Content",
      issue: "No work experience detected.",
      recommendation: "If you have internships or freelance work, include them in an Experience section.",
      priority: "high"
    });
  }
  if (projectsCount === 0) {
    suggestions.push({
      category: "Content",
      issue: "No projects detected.",
      recommendation: "Add a Projects section to demonstrate practical application of your skills.",
      priority: "medium"
    });
  }
  if (education.length === 0) {
    suggestions.push({
      category: "Content",
      issue: "No education history detected.",
      recommendation: "Include your highest degree or current academic pursuit.",
      priority: "medium"
    });
  }

  // Generate deterministic strengths
  const strengths = [];
  if (skills.length >= 10) strengths.push("Strong keyword presence for technical skills.");
  if (experience.length >= 2) strengths.push("Solid progression of work experience.");
  if (projectsCount > 0) strengths.push("Practical experience demonstrated through projects.");
  if (certsCount > 0) strengths.push("Continuous learning shown through certifications.");
  if (strengths.length === 0) strengths.push("Basic resume structure parsed successfully.");

  return {
    atsScore,
    scoreBreakdown,
    suggestions,
    strengths,
    summary: extractedData.rawTextSummary || "ATS analysis complete. Review the suggestions to improve parsability and impact."
  };
}


import { Document, Paragraph, TextRun, Packer, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export async function generateResumeWord(r: any) {
  const children: any[] = [];

  // Header
  children.push(
    new Paragraph({
      text: r.name || "",
      heading: HeadingLevel.HEADING_1,
    })
  );

  const contacts = [r.email, r.phone, r.location, r.linkedin].filter(Boolean);
  if (contacts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun(contacts.join("  |  "))],
      })
    );
  }

  if (r.isDynamic) {
    for (const sec of r.sections || []) {
      children.push(
        new Paragraph({
          text: sec.title,
          heading: HeadingLevel.HEADING_2,
        })
      );
      for (const entry of sec.entries || []) {
        const fields = entry.fields || {};
        const title = fields["Title"] || fields["Degree"] || fields["Name"] || "";
        const subtitle = fields["Company"] || fields["School"] || fields["Organization"] || "";
        const dates = fields["Dates"] || fields["Year"] || "";

        if (title || subtitle) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: title, bold: true }),
                new TextRun({ text: (title && subtitle) ? " | " : "" }),
                new TextRun({ text: subtitle }),
                new TextRun({ text: dates ? `   [${dates}]` : "" }),
              ],
            })
          );
        }

        for (const [k, v] of Object.entries(fields)) {
          if (["Title", "Degree", "Name", "Company", "School", "Organization", "Dates", "Year"].includes(k)) continue;
          if (Array.isArray(v)) {
            for (const b of v.filter(Boolean)) {
              children.push(
                new Paragraph({
                  text: String(b),
                  bullet: { level: 0 },
                })
              );
            }
          } else if (v) {
            children.push(
              new Paragraph({
                text: String(v),
              })
            );
          }
        }
      }
    }
  } else {
    if (r.summary) {
      children.push(new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph({ text: r.summary }));
    }
    if (r.experience && r.experience.length > 0) {
      children.push(new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }));
      for (const e of r.experience) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: e.title, bold: true }),
              new TextRun({ text: ` | ${e.company}${e.location ? `, ${e.location}` : ""}   [${e.startDate} - ${e.endDate}]` }),
            ],
          })
        );
        for (const b of e.bullets.filter(Boolean)) {
          children.push(new Paragraph({ text: b, bullet: { level: 0 } }));
        }
      }
    }
    if (r.education && r.education.length > 0) {
      children.push(new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }));
      for (const e of r.education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: e.degree, bold: true }),
              new TextRun({ text: ` | ${e.school}${e.location ? `, ${e.location}` : ""}   [${e.year}]${e.gpa ? ` GPA: ${e.gpa}` : ""}` }),
            ],
          })
        );
      }
    }
    if (r.skills) {
      children.push(new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }));
      if (r.skills.technical && r.skills.technical.length > 0) {
        children.push(new Paragraph({ text: `Technical: ${r.skills.technical.join(", ")}` }));
      }
      if (r.skills.soft && r.skills.soft.length > 0) {
        children.push(new Paragraph({ text: `Soft: ${r.skills.soft.join(", ")}` }));
      }
    }
    if (r.projects && r.projects.length > 0) {
      children.push(new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2 }));
      for (const p of r.projects) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: p.name, bold: true }),
              new TextRun({ text: p.link ? `   ${p.link}` : "" }),
            ],
          })
        );
        children.push(new Paragraph({ text: p.description }));
      }
    }
    if (r.certifications && r.certifications.length > 0) {
      children.push(new Paragraph({ text: "Certifications", heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph({ text: r.certifications.join(" | ") }));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${(r.name || "Resume").replace(/\s+/g, "_")}.docx`);
}

export function generateResumeLatex(r: any) {
  let tex = '\\documentclass[11pt,a4paper]{article}\n';
  tex += '\\usepackage[utf8]{inputenc}\n';
  tex += '\\usepackage{geometry}\n';
  tex += '\\geometry{a4paper, margin=1in}\n';
  tex += '\\usepackage{hyperref}\n';
  tex += '\\begin{document}\n\n';
  
  // Header
  tex += '\\begin{center}\n';
  tex += '  \\Huge \\textbf{' + (r.name || '').replace(/&/g, '\\&') + '} \\\\\n';
  
  const contacts = [r.email, r.phone, r.location, r.linkedin].filter(Boolean);
  if (contacts.length > 0) {
      tex += '  \\vspace{2mm}\n';
      tex += '  ' + contacts.map(c => c.replace(/&/g, '\\&')).join(' $|$ ') + ' \\\\\n';
  }
  tex += '\\end{center}\n\n';
  
  if (r.isDynamic) {
    for (const sec of (r.sections || [])) {
        tex += '\\section*{' + sec.title.replace(/&/g, '\\&') + '}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        
        for (const entry of (sec.entries || [])) {
            const fields = entry.fields || {};
            const title = fields["Title"] || fields["Degree"] || fields["Name"] || "";
            const subtitle = fields["Company"] || fields["School"] || fields["Organization"] || "";
            const dates = fields["Dates"] || fields["Year"] || "";
            
            if (title || subtitle) {
                tex += '\\noindent ';
                if (title) tex += '\\textbf{' + title.replace(/&/g, '\\&') + '}';
                if (title && subtitle) tex += ' $|$ ';
                if (subtitle) tex += subtitle.replace(/&/g, '\\&');
                if (dates) tex += ' \\hfill ' + dates.replace(/&/g, '\\&');
                tex += '\\\\\n';
            }
            
            for (const [k, v] of Object.entries(fields)) {
                if (["Title", "Degree", "Name", "Company", "School", "Organization", "Dates", "Year"].includes(k)) continue;
                if (Array.isArray(v)) {
                    tex += '\\begin{itemize}\n';
                    for (const b of v.filter(Boolean)) {
                        tex += '  \\item ' + String(b).replace(/&/g, '\\&') + '\n';
                    }
                    tex += '\\end{itemize}\n';
                } else if (v) {
                    tex += String(v).replace(/&/g, '\\&') + ' \\\\\n';
                }
            }
            tex += '\\vspace{2mm}\n';
        }
    }
  } else {
    // Normal static resume rendering to latex
    if (r.summary) {
        tex += '\\section*{Summary}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        tex += r.summary.replace(/&/g, '\\&') + '\n\n';
    }
    if (r.experience && r.experience.length) {
        tex += '\\section*{Experience}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        for (const e of r.experience) {
            tex += '\\noindent \\textbf{' + e.title.replace(/&/g, '\\&') + '} $|$ ' + e.company.replace(/&/g, '\\&') + (e.location ? ', ' + e.location.replace(/&/g, '\\&') : '') + ' \\hfill ' + e.startDate + ' -- ' + e.endDate + '\\\\\n';
            if (e.bullets && e.bullets.length) {
                tex += '\\begin{itemize}\n';
                for (const b of e.bullets.filter(Boolean)) {
                    tex += '  \\item ' + b.replace(/&/g, '\\&') + '\n';
                }
                tex += '\\end{itemize}\n';
            }
            tex += '\\vspace{2mm}\n';
        }
    }
    if (r.education && r.education.length) {
        tex += '\\section*{Education}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        for (const e of r.education) {
            tex += '\\noindent \\textbf{' + e.degree.replace(/&/g, '\\&') + '} $|$ ' + e.school.replace(/&/g, '\\&') + (e.location ? ', ' + e.location.replace(/&/g, '\\&') : '') + ' \\hfill ' + e.year + (e.gpa ? ' $|$ GPA ' + e.gpa : '') + '\\\\\n';
            tex += '\\vspace{2mm}\n';
        }
    }
    if (r.skills) {
        tex += '\\section*{Skills}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        if (r.skills.technical && r.skills.technical.length) {
            tex += '\\textbf{Technical:} ' + r.skills.technical.join(", ").replace(/&/g, '\\&') + '\\\\\n';
        }
        if (r.skills.soft && r.skills.soft.length) {
            tex += '\\textbf{Soft:} ' + r.skills.soft.join(", ").replace(/&/g, '\\&') + '\\\\\n';
        }
        tex += '\\vspace{2mm}\n';
    }
    if (r.projects && r.projects.length) {
        tex += '\\section*{Projects}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        for (const p of r.projects) {
            tex += '\\noindent \\textbf{' + p.name.replace(/&/g, '\\&') + '} ' + (p.link ? '\\hfill ' + p.link.replace(/&/g, '\\&') : '') + '\\\\\n';
            tex += p.description.replace(/&/g, '\\&') + '\\\\\n';
            tex += '\\vspace{2mm}\n';
        }
    }
    if (r.certifications && r.certifications.length) {
        tex += '\\section*{Certifications}\n';
        tex += '\\hrule \\vspace{2mm}\n';
        tex += r.certifications.join(" $|$ ").replace(/&/g, '\\&') + '\n\n';
    }
  }
  
  tex += '\\end{document}\n';
  
  const blob = new Blob([tex], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(r.name || "Resume").replace(/\s+/g, "_")}.tex`;
  a.click();
  URL.revokeObjectURL(url);
}
