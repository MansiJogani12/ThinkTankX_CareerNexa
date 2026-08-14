import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, incrementRequestCount } from "@/lib/verifyAuth";
import { ResumeAnalyserPrompt } from "@/lib/prompt";
import { db } from "@/firebase/admin";
import { computeDetailedATSAnalysis } from "@/lib/ai-career-utils";
import crypto from "crypto";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isDev = process.env.NODE_ENV === "development";

    if (!isDev && !user.canMakeRequest()) {
      return NextResponse.json({ message: "Upgrade Your plan to continue" }, { status: 403 });
    }

    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ message: "PDF data is required" }, { status: 400 });
    }

    // Generate hash for caching to ensure consistent results for the same input
    const hash = crypto.createHash('sha256').update(pdfBase64).digest('hex');
    const cacheRef = db.collection("scoreCache").doc(`${user.uid}_${hash}`);
    
    const saveProfileToDb = async (data: any) => {
      if (data.skillsExtracted) {
        try {
          await db.collection("users").doc(user.uid).set({
            skillProfile: {
              technicalSkills: data.skillsExtracted.technicalSkills || [],
              softSkills: data.skillsExtracted.softSkills || [],
              toolsFrameworks: data.skillsExtracted.toolsFrameworks || [],
              programmingLanguages: data.skillsExtracted.programmingLanguages || [],
              certifications: data.skillsExtracted.certifications || [],
              experienceLevel: data.skillsExtracted.experienceLevel || "Mid",
              projects: data.skillsExtracted.projects || [],
            },
            atsAnalysis: {
              atsScore: data.atsScore || 0,
              summary: data.summary || "",
              strengths: data.strengths || [],
              suggestionsCount: data.suggestions?.length || 0,
            }
          }, { merge: true });
          console.log(`Saved normalized skill profile for user: ${user.uid}`);
        } catch (dbErr) {
          console.error("Failed to save user skill profile to Firestore:", dbErr);
        }
      }
    };

    try {
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cachedData = cacheDoc.data();
        if (cachedData && cachedData.result) {
          console.log("Returning cached analysis result for consistency");
          await saveProfileToDb(cachedData.result);
          return NextResponse.json(cachedData.result);
        }
      }
    } catch (e) {
      console.error("Cache read error", e);
    }

    let jsonResponse;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: ResumeAnalyserPrompt },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
                },
              },
            ],
          },
        ],
      });

      const rawText = response.text?.replace(/```json|```/g, "").trim();

      if (!rawText) {
        throw new Error("Ai returned empty response");
      }

      jsonResponse = JSON.parse(rawText);
      
      // Compute detailed deterministic ATS score and breakdown
      if (jsonResponse.skillsExtracted) {
        const atsData = computeDetailedATSAnalysis(jsonResponse.skillsExtracted);
        
        jsonResponse = {
          ...jsonResponse,
          atsScore: atsData.atsScore,
          scoreBreakdown: atsData.scoreBreakdown,
          suggestions: atsData.suggestions,
          strengths: atsData.strengths,
          summary: atsData.summary
        };
      }
    } catch (err) {
      console.error("Gemini API failed for resume analysis:", err);
      // Do NOT save fake/mock data to Firestore — return an error so the user retries
      return NextResponse.json(
        { message: "Resume analysis failed. Please try again in a moment." },
        { status: 503 }
      );
    }

    // Save the normalized skill profile to Firestore under user profile
    await saveProfileToDb(jsonResponse);

    // Save result to cache
    try {
      await cacheRef.set({ result: jsonResponse });
    } catch (e) {
      console.error("Failed to save to cache", e);
    }

    if (!user.hasProAccess()) {
      await incrementRequestCount(user.uid);
    }

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Analyse error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
