"use server";

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

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
    return "Thank you for your time! That concludes our interview session today. We will generate your detailed feedback report now.";
  }

  const currentQuestion = qList[userTurns];
  const fallbackResponse = `Thank you for sharing. Next question: ${currentQuestion}`;

  try {
    const activeKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      return fallbackResponse;
    }

    const questionsListStr = qList.map((q, i) => `${i + 1}. ${q}`).join("\n");

    const systemPrompt =
      type === "generate"
        ? `You are a friendly, encouraging AI career coach helping a candidate prepare for interviews.
Evaluate the candidate's last response:
- If their answer is correct, accurate, or well-structured, praise them specifically (e.g., "Spot on!", "Great explanation! You're right that...").
- If their answer is incorrect, weak, or incomplete, give immediate constructive feedback or a brief correction (e.g., "Good try, but actually...", "That's partially correct, however...").
Then ask a follow-up question. Keep your total response under 3 sentences maximum.`
        : `You are a sharp, expert technical interviewer conducting a real-time mock interview.

Master List of Questions:
${questionsListStr}

CRITICAL RULES:
1. EVALUATE THE CANDIDATE'S LAST RESPONSE DYNAMICALLY:
   - If the candidate's answer is ACCURATE / CORRECT / STRONG: Praise them directly and highlight why it was good (e.g., "Spot on!", "Great answer!", "That is correct!", "Excellent point about...").
   - If the candidate's answer is INCORRECT / WEAK / INCOMPLETE: Politely explain what was wrong or missing and provide the correct approach before proceeding (e.g., "That's a common misconception, but actually...", "Not quite. A better approach would be...", "You're on the right track, but don't forget...").
2. ASK THE NEXT QUESTION:
   - Next, state question #${userTurns + 1}: "${currentQuestion}".
3. Keep your total response concise (2-4 sentences max). Do NOT ramble.`;

    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        contents,
      });
      responseText = response.text?.trim() || "";
    } catch (err) {
      console.warn("Primary gemini-2.5-flash failed, trying gemini-2.0-flash fallback:", err);
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
