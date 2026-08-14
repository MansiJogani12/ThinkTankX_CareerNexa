import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, incrementRequestCount } from "@/lib/verifyAuth";
import { JobMatcherPrompt, LiveJobMatcherPrompt } from "@/lib/prompt";
import { computeDeterministicJobMatch } from "@/lib/ai-career-utils";
import { fetchLiveJobs } from "@/lib/live-jobs";
import { getDistanceCategory } from "@/lib/location-utils";
import { generateMockJobs } from "@/lib/mock-jobs";
import crypto from "crypto";
import { db } from "@/firebase/admin";

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

    const { mode, skills, experience, pdfBase64, preferredCity, page = 1 } = await req.json();

    if (!mode) return NextResponse.json({ message: "Mode is required" }, { status: 400 });
    if (mode === "manual" && (!skills?.length || !experience?.trim()))
      return NextResponse.json({ message: "Skills and experience are required" }, { status: 400 });

    if (mode === "resume" && !pdfBase64)
      return NextResponse.json({ message: "PDF is required" }, { status: 400 });

    // Generate hash for caching
    const hashPayload = mode === "resume" ? pdfBase64 + (preferredCity||"") + page : JSON.stringify({ skills, experience, preferredCity, page });
    const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');
    const cacheRef = db.collection("scoreCache").doc(`${user.uid}_jobmatch_${hash}`);
    
    try {
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cachedData = cacheDoc.data();
        if (cachedData && cachedData.result) {
          console.log("Returning cached job match result for consistency");
          return NextResponse.json(cachedData.result);
        }
      }
    } catch (e) {
      console.error("Cache read error", e);
    }

    // Try fetching real jobs for the city from Adzuna
    const searchQuery = mode === "manual" ? skills.join(" ") : "Software Developer";
    let liveJobs = await fetchLiveJobs(searchQuery, preferredCity, page);
    

    // Compute distance category and sort initially
    if (preferredCity) {
      liveJobs = liveJobs.map(job => ({
        ...job,
        distanceCategory: getDistanceCategory(preferredCity, job.location)
      }));
    }

    // We only want to feed ~15 jobs to LLM to prevent context overflow
    // Prioritize Same City -> Nearby -> Farther
    if (preferredCity) {
        liveJobs.sort((a, b) => {
            const order: any = { "Same City": 1, "Nearby": 2, "Farther Away": 3 };
            return (order[a.distanceCategory] || 4) - (order[b.distanceCategory] || 4);
        });
    }
    
    // Take top 15
    liveJobs = liveJobs.slice(0, 15);

    let parts: any[] = [];
    if (liveJobs.length > 0) {
      parts = [{ text: LiveJobMatcherPrompt(mode, skills, experience, JSON.stringify(liveJobs, null, 2)) }];
    } else {
      parts = [{ text: JobMatcherPrompt(mode, skills, experience) }];
    }

    if (mode === "resume") {
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

      // Override LLM's guessed matchScore with deterministic formula
      if (jsonResponse.jobs && Array.isArray(jsonResponse.jobs)) {
        let userSkills = skills || [];
        let expLevel = experience || "Mid";
        
        if (mode === "resume") {
            try {
                const userDoc = await db.collection("users").doc(user.uid).get();
                if (userDoc.exists) {
                    const profile = userDoc.data()?.skillProfile;
                    if (profile) {
                        userSkills = [
                            ...(profile.technicalSkills || []),
                            ...(profile.toolsFrameworks || []),
                            ...(profile.programmingLanguages || [])
                        ];
                        expLevel = profile.experienceLevel || "Mid";
                    }
                }
            } catch (e) {
                console.error("Failed to fetch user profile for job matching", e);
            }
        }

        const { getMissingSkillResources } = await import('@/lib/skill-resources');

        jsonResponse.jobs = jsonResponse.jobs.map((job: any) => {
          const matchData = computeDeterministicJobMatch(userSkills, job.skills || [], expLevel);
          job.matchScore = matchData.matchScore;
          job.matchedSkills = matchData.matchedSkills;
          job.missingSkills = matchData.missingSkills;
          
          // Inject learning resources for missing skills
          job.learningResources = matchData.missingSkills.map((s: string) => ({
             skill: s,
             resources: getMissingSkillResources(s, job.title)
          })).filter((r: any) => r.resources !== null);

          if (preferredCity) {
             job.distanceCategory = getDistanceCategory(preferredCity, job.location);
          }
          return job;
        });

        // Final Sort: by match score descending, then distance
        if (preferredCity) {
            jsonResponse.jobs.sort((a: any, b: any) => {
                // Secondary sort: Distance
                const order: any = { "Same City": 1, "Nearby": 2, "Farther Away": 3 };
                const aDist = order[a.distanceCategory] || 4;
                const bDist = order[b.distanceCategory] || 4;
                
                // Primary sort: matchScore
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                
                return aDist - bDist;
            });
        } else {
            jsonResponse.jobs.sort((a: any, b: any) => b.matchScore - a.matchScore);
        }
      }
    } catch (err) {
      if (isDev) {
        console.warn("API failed in development, using mock data", err);
        jsonResponse = {
          summary: "Based on your demo profile, you have a strong background in software development. These roles are a great fit for your current skill set.",
          jobs: [
            {
              title: "Senior Software Engineer",
              company: "Tech Startups",
              matchScore: 92,
              location: "Remote",
              type: "Full-time",
              skills: ["React", "TypeScript", "Node.js", "AWS"],
              whyMatch: "Your extensive experience with scalable web apps aligns perfectly with this role's requirements.",
              applyTip: "Highlight your most impactful project involving backend scaling in your cover letter."
            }
          ]
        };
      } else {
        return NextResponse.json({ message: "Failed to generate job matches" }, { status: 500 });
      }
    }

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
    console.error("Job Matcher error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
