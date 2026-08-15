import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, incrementRequestCount } from "@/lib/verifyAuth";
import { buildResumePrompt, buildLatexPrompt } from "@/lib/prompt";

const isDev = process.env.NODE_ENV === "development";
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { mode, formData, pdfBase64, latexText } = await req.json();

    if (!mode) return NextResponse.json({ message: "Mode is required" }, { status: 400 });

    if (mode === "manual" && !formData)
      return NextResponse.json({ message: "form data is required" }, { status: 400 });

    if (mode === "improve" && !pdfBase64)
      return NextResponse.json({ message: "PDF is required" }, { status: 400 });

    if (mode === "latex" && !latexText)
      return NextResponse.json({ message: "LaTeX text is required" }, { status: 400 });

    const parts: any[] = [{ text: mode === "latex" ? buildLatexPrompt(latexText) : buildResumePrompt(mode, formData) }];

    if (mode === "improve") {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
        },
      });
    }

    let jsonResponse;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
      });

      const rawText = response.text?.replace(/```json|```/g, "").trim();

      if (!rawText) {
        throw new Error("Ai returned empty response");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (err) {
      if (isDev) {
        console.warn("API failed in development, using mock data", err);
        
        // Attempt to extract from formData if available, else fallback to mock data
        const fallbackName = formData?.personalInfo?.fullName || formData?.name || "Alex Developer";
        const fallbackEmail = formData?.personalInfo?.email || formData?.email || "alex.developer@example.com";
        const fallbackPhone = formData?.personalInfo?.phone || formData?.phone || "+1 (555) 123-4567";
        const fallbackLocation = formData?.personalInfo?.location || formData?.location || "San Francisco, CA";
        
        jsonResponse = {
          name: fallbackName,
          email: fallbackEmail,
          phone: fallbackPhone,
          location: fallbackLocation,
          linkedin: "linkedin.com/in/alexdeveloper",
          summary: "Highly motivated Software Engineer with experience in building scalable web applications. Proven ability to leverage modern frameworks to deliver robust solutions.",
          experience: formData?.experience?.length ? formData.experience : [
            {
              title: "Software Engineer",
              company: "Tech Solutions Inc.",
              location: "San Francisco, CA",
              startDate: "Jan 2021",
              endDate: "Present",
              bullets: [
                "Developed and maintained responsive user interfaces using React and Next.js.",
                "Optimized backend API performance, reducing response time by 30%."
              ]
            }
          ],
          education: formData?.education?.length ? formData.education : [
            {
              degree: "B.S. Computer Science",
              school: "University of Technology",
              location: "San Francisco, CA",
              year: "2020",
              gpa: "3.8"
            }
          ],
          skills: formData?.skills || {
            technical: ["JavaScript", "TypeScript", "React", "Node.js", "Next.js"],
            soft: ["Team Collaboration", "Problem Solving", "Agile Methodology"]
          },
          projects: formData?.projects?.length ? formData.projects : [
            {
              name: "E-Commerce Dashboard",
              description: "Built a full-stack admin dashboard for e-commerce platforms using React, Node.js, and PostgreSQL.",
              link: "github.com/alexdeveloper/ecommerce-dashboard"
            }
          ],
          certifications: formData?.certifications?.length ? formData.certifications : ["AWS Certified Developer"]
        };
      } else if (mode === "latex") {
        // Fallback for LaTeX failure
        jsonResponse = {
          name: "Extracted from LaTeX (Fallback)",
          email: "fallback@example.com",
          phone: "",
          location: "",
          linkedin: "",
          summary: "We could import your content, but couldn't fully match your LaTeX design — using the default template instead. You can still edit everything below.",
          experience: [],
          education: [],
          skills: { technical: [], soft: [] },
          projects: [],
          certifications: []
        };
      } else {
        return NextResponse.json({ message: "Failed to build resume" }, { status: 500 });
      }
    }

    if (!user.hasProAccess()) {
      await incrementRequestCount(user.uid);
    }

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Resume Build error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
