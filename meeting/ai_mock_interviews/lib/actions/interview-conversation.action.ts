"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "" });

// Helper to parse individual questions if questions array contains concatenated/bulleted text
function parseIndividualQuestions(questions?: string[]): string[] {
  const defaultQuestions = [
    "Tell me about yourself and your technical background.",
    "What are your key technical strengths and experience?",
    "Describe a challenging project you worked on recently and how you handled obstacles.",
    "Where do you see your career heading in the next few years?"
  ];

  if (!questions || questions.length === 0) return defaultQuestions;

  const parsed: string[] = [];

  questions.forEach((q) => {
    if (!q || !q.trim()) return;

    // Split by newlines first
    const lines = q.split(/\n+/);
    lines.forEach((line) => {
      // Strip leading bullet numbers or dashes like "1. ", "1) ", "- "
      const cleanLine = line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim();
      if (!cleanLine) return;

      // Split by question marks if multiple questions exist in one line (e.g. "Q1? Q2?")
      const subQs = cleanLine.split(/(?<=\?)\s+/);
      subQs.forEach((sq) => {
        const trimmed = sq.trim();
        if (trimmed.length > 5) {
          parsed.push(trimmed);
        }
      });
    });
  });

  return parsed.length > 0 ? parsed : defaultQuestions;
}

export async function getInterviewerResponse(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  questions: string[],
  type: "generate" | "interview"
): Promise<string> {
  const qList = parseIndividualQuestions(questions);
  const userTurns = conversationHistory.filter((m) => m.role === "user").length;

  // If candidate has answered all questions, conclude the session
  if (userTurns >= qList.length) {
    return "Thank you for your time! That concludes our interview session today. We will generate your feedback report now.";
  }

  const currentQuestion = qList[userTurns];
  const fallbackResponse = `Thank you for sharing. Next question: ${currentQuestion}`;

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return fallbackResponse;
    }

    const questionsListStr = qList.map((q, i) => `${i + 1}. ${q}`).join("\n");

    const systemPrompt =
      type === "generate"
        ? `You are a friendly AI career coach helping a candidate prepare for interviews. 
Ask them about their background, skills, and career goals in a conversational way.
Keep ALL responses under 2-3 sentences. Ask ONLY ONE question at a time.`
        : `You are a professional job interviewer conducting a real-time interview.

Here is the master list of interview questions:
${questionsListStr}

CRITICAL RULE:
You MUST ONLY ask question #${userTurns + 1} right now: "${currentQuestion}".
DO NOT ask any other questions from the list yet.

Instructions:
1. Briefly acknowledge the candidate's previous response in 1 short sentence.
2. Ask question #${userTurns + 1}: "${currentQuestion}".
3. Keep your total response under 3 sentences maximum.`;

    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
        contents,
      });
      responseText = response.text?.trim() || "";
    } catch {
      // Secondary fallback
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt,
        contents,
      });
      responseText = response.text?.trim() || "";
    }

    if (responseText) {
      return responseText;
    }

    return fallbackResponse;
  } catch (error) {
    console.warn("Gemini API error, using fallback question:", error);
    return fallbackResponse;
  }
}
