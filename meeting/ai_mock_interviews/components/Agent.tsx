"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";
import { getInterviewerResponse } from "@/lib/actions/interview-conversation.action";

// ─── Types ────────────────────────────────────────────────────────────────────
enum CallStatus {
  INACTIVE    = "INACTIVE",
  CONNECTING  = "CONNECTING",
  AI_SPEAKING = "AI_SPEAKING",
  WAITING     = "WAITING",   // waiting for user to type response
  PROCESSING  = "PROCESSING",
  FINISHED    = "FINISHED",
}

interface SavedMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();

  const [callStatus,   setCallStatus]   = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages,     setMessages]     = useState<SavedMessage[]>([]);
  const [lastMessage,  setLastMessage]  = useState("");
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [userInput,    setUserInput]    = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCallSetup, setShowCallSetup] = useState(false);

  const callActiveRef    = useRef(false);
  const historyRef       = useRef<SavedMessage[]>([]);
  const resolveInputRef  = useRef<((val: string) => void) | null>(null);
  const textareaRef      = useRef<HTMLTextAreaElement>(null);

  // ── TTS (AI Speaks out loud) ──────────────────────────────────────────────
  const speakMessage = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance       = new SpeechSynthesisUtterance(text);
      utterance.rate        = 0.95;
      utterance.pitch       = 1.0;
      utterance.volume      = 1.0;
      utterance.lang        = "en-US";

      const voices = synth.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && (
          v.name.includes("Google") || v.name.includes("Zira") ||
          v.name.includes("Hazel") || v.name.includes("Aria")  ||
          v.name.includes("Female") || v.name.includes("Natural")
        )
      );
      if (preferred) utterance.voice = preferred;

      // Safety timeout — if onend never fires, unblock anyway
      const maxMs = Math.max(8000, text.length * 70);
      const timer = setTimeout(() => {
        setIsSpeaking(false);
        resolve();
      }, maxMs);

      const done = () => {
        clearTimeout(timer);
        setIsSpeaking(false);
        resolve();
      };

      utterance.onstart = () => { setIsSpeaking(true); setCallStatus(CallStatus.AI_SPEAKING); };
      utterance.onend   = done;
      utterance.onerror = done;

      synth.speak(utterance);
    });
  }, []);

  // ── Wait for user to type and submit ─────────────────────────────────────
  const waitForUserInput = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      resolveInputRef.current = resolve;
      setCallStatus(CallStatus.WAITING);
      setUserInput("");
      setTimeout(() => textareaRef.current?.focus(), 200);
    });
  }, []);

  // ── Submit typed answer ───────────────────────────────────────────────────
  const handleSubmitAnswer = useCallback(async () => {
    const text = userInput.trim();
    if (!text || isSubmitting || !resolveInputRef.current) return;

    setIsSubmitting(true);
    const resolve = resolveInputRef.current;
    resolveInputRef.current = null;
    setUserInput("");
    resolve(text);
    setIsSubmitting(false);
  }, [userInput, isSubmitting]);

  // ── Main interview loop ───────────────────────────────────────────────────
  const runInterviewLoop = useCallback(async () => {
    const MAX_TURNS = 15;
    const history: SavedMessage[] = [];
    historyRef.current = history;
    let turn = 0;

    const addAI = async (text: string) => {
      history.push({ role: "assistant", content: text });
      historyRef.current = [...history];
      setMessages([...history]);
      setLastMessage(text);
      await speakMessage(text);
    };

    // Opening greeting
    setCallStatus(CallStatus.CONNECTING);
    await addAI("Hello! I'm your AI interviewer today. I'll ask you questions, and you can type your answers. Let's get started!");

    // First Question
    if (!callActiveRef.current) return;
    setCallStatus(CallStatus.PROCESSING);
    const firstQ = await getInterviewerResponse(history, questions ?? [], type);
    if (!callActiveRef.current) return;
    await addAI(firstQ);

    // Conversation loop
    while (callActiveRef.current && turn < MAX_TURNS) {
      turn++;
      if (!callActiveRef.current) break;

      // Wait for candidate to type their answer
      const userAnswer = await waitForUserInput();
      if (!callActiveRef.current) break;
      if (!userAnswer.trim()) continue;

      history.push({ role: "user", content: userAnswer });
      historyRef.current = [...history];
      setMessages([...history]);
      setLastMessage(userAnswer);

      if (!callActiveRef.current) break;

      // AI response / next question
      setCallStatus(CallStatus.PROCESSING);
      const aiReply = await getInterviewerResponse(history, questions ?? [], type);
      if (!callActiveRef.current) break;
      await addAI(aiReply);

      // Check if session concluded
      const lower = aiReply.toLowerCase();
      if (
        lower.includes("thank you for your time") ||
        lower.includes("that concludes") ||
        lower.includes("end of the interview") ||
        lower.includes("we'll be in touch") ||
        lower.includes("all the best")
      ) break;
    }

    callActiveRef.current = false;
    setCallStatus(CallStatus.FINISHED);
  }, [speakMessage, waitForUserInput, questions, type]);

  // ── Start Call ────────────────────────────────────────────────────────────
  const handleCall = async () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length === 0) {
        await new Promise<void>((res) => {
          window.speechSynthesis.onvoiceschanged = () => res();
          setTimeout(res, 800);
        });
      }
    }
    callActiveRef.current = true;
    setMessages([]);
    setLastMessage("");
    toast.success("Interview starting…");
    runInterviewLoop();
  };

  // ── End Call ──────────────────────────────────────────────────────────────
  const handleDisconnect = () => {
    callActiveRef.current = false;
    window.speechSynthesis?.cancel();
    if (resolveInputRef.current) {
      resolveInputRef.current("");
      resolveInputRef.current = null;
    }
    setCallStatus(CallStatus.FINISHED);
  };

  // ── Keyboard handling ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      callActiveRef.current = false;
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Generate Feedback on Finish ───────────────────────────────────────────
  useEffect(() => {
    if (callStatus !== CallStatus.FINISHED) return;
    window.speechSynthesis?.cancel();

    const finish = async () => {
      if (type === "generate") {
        toast.info("Practice session ended.");
        router.push("/");
        return;
      }
      const finalMessages = historyRef.current;
      if (finalMessages.length < 2) {
        toast.info("Interview too short for detailed feedback.");
        router.push("/");
        return;
      }

      toast.loading("Generating your interview performance report…");
      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: finalMessages as any,
          feedbackId,
        });

        if (success && id) {
          toast.success("Feedback generated!");
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          toast.error("Failed to generate feedback report.");
          router.push("/");
        }
      } catch (err) {
        console.error("Error creating feedback:", err);
        toast.error("Failed to generate feedback report.");
        router.push("/");
      }
    };

    finish();
  }, [callStatus, feedbackId, interviewId, router, type, userId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isActive =
    callStatus === CallStatus.AI_SPEAKING ||
    callStatus === CallStatus.WAITING     ||
    callStatus === CallStatus.PROCESSING  ||
    callStatus === CallStatus.CONNECTING;

  const statusText: Record<CallStatus, string> = {
    [CallStatus.INACTIVE]:    "",
    [CallStatus.CONNECTING]:  "Starting interview…",
    [CallStatus.AI_SPEAKING]: "AI Interviewer is speaking…",
    [CallStatus.WAITING]:     "Your turn — type your answer below ✍️",
    [CallStatus.PROCESSING]:  "AI is thinking…",
    [CallStatus.FINISHED]:    "Interview complete! Evaluating responses…",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!showCallSetup) {
    return (
      <div className="w-full bg-[#131525] border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="flex-1 flex flex-col items-start gap-4 z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Get Interview-Ready<br />with AI-Powered<br />Practice & Feedback
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Practice real interview questions & get instant feedback
          </p>
          <button
            onClick={() => setShowCallSetup(true)}
            className="mt-2 bg-[#b4b7f8] hover:bg-[#a2a6f5] text-[#131525] font-extrabold px-8 py-3 rounded-full transition-all text-sm cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
          >
            Start an interview
          </button>
        </div>
        <div className="relative flex-1 max-w-[360px] md:max-w-[400px] w-full flex justify-center items-center">
          <Image
            src="/robot.png"
            alt="AI Interviewer Robot"
            width={400}
            height={300}
            className="object-contain animate-float"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cards */}
      <div className="call-view">
        {/* AI card */}
        <div className="card-interviewer">
          <div className="avatar relative">
            <Image src="/ai-avatar.png" alt="AI Interviewer" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
          {callStatus === CallStatus.AI_SPEAKING && (
            <p className="text-xs text-indigo-400 mt-1 animate-pulse">Speaking…</p>
          )}
          {callStatus === CallStatus.PROCESSING && (
            <p className="text-xs text-amber-400 mt-1 animate-pulse">Thinking…</p>
          )}
        </div>

        {/* Candidate card */}
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="Candidate" width={539} height={539} className="rounded-full object-cover size-[120px]" />
            <h3>{userName || "Candidate"}</h3>
            {callStatus === CallStatus.WAITING && (
              <p className="text-xs text-emerald-400 mt-1 animate-pulse">Your turn to speak / type ✍️</p>
            )}
          </div>
        </div>
      </div>

      {/* Transcript / Last message */}
      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="transition-opacity duration-300 opacity-100 leading-relaxed">
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {isActive && (
        <p className="text-center text-xs text-white/50 mt-2 animate-pulse font-medium">
          {statusText[callStatus]}
        </p>
      )}

      {/* Text area input — shown while candidate is typing answer */}
      {callStatus === CallStatus.WAITING && (
        <div className="w-full mt-4 flex flex-col gap-3 px-2">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your detailed answer here… (Press Enter to submit, Shift+Enter for new line)"
            rows={4}
            className={cn(
              "w-full rounded-2xl p-4 text-sm leading-relaxed resize-none",
              "bg-white/5 border border-white/10 text-white placeholder-white/30",
              "focus:outline-none focus:border-indigo-500/60 focus:bg-white/8",
              "transition-all duration-200"
            )}
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!userInput.trim() || isSubmitting}
            className={cn(
              "self-end px-8 py-2.5 rounded-full font-semibold text-sm transition-all cursor-pointer",
              "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            Submit Answer →
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="w-full flex justify-center mt-6">
        {!isActive && callStatus !== CallStatus.FINISHED ? (
          <button
            className="relative btn-call flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleCall}
          >
            <span className="relative font-semibold">Start Interview Call</span>
          </button>
        ) : (
          <button
            className="btn-disconnect cursor-pointer font-semibold"
            onClick={handleDisconnect}
          >
            End Interview
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
