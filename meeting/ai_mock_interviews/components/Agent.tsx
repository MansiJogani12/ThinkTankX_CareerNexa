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
  WAITING     = "WAITING",   // waiting for user to type
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

  const callActiveRef    = useRef(false);
  const historyRef       = useRef<SavedMessage[]>([]);
  const resolveInputRef  = useRef<((val: string) => void) | null>(null);
  const textareaRef      = useRef<HTMLTextAreaElement>(null);

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speakMessage = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance       = new SpeechSynthesisUtterance(text);
      utterance.rate        = 0.93;
      utterance.pitch       = 1.0;
      utterance.volume      = 1.0;
      utterance.lang        = "en-US";

      const voices = synth.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && (
          v.name.includes("Google") || v.name.includes("Zira") ||
          v.name.includes("Hazel") || v.name.includes("Aria")  ||
          v.name.includes("Female")
        )
      );
      if (preferred) utterance.voice = preferred;

      // Safety timeout — if onend never fires (Chrome bug), resolve anyway
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

    // Opening
    setCallStatus(CallStatus.CONNECTING);
    await addAI("Hello! I'm your AI interviewer. I'll ask you questions and you can type your responses. Let's begin!");

    // First question
    if (!callActiveRef.current) return;
    setCallStatus(CallStatus.PROCESSING);
    const firstQ = await getInterviewerResponse(history, questions ?? [], type);
    if (!callActiveRef.current) return;
    await addAI(firstQ);

    // Conversation
    while (callActiveRef.current && turn < MAX_TURNS) {
      turn++;
      if (!callActiveRef.current) break;

      // Wait for user
      const userAnswer = await waitForUserInput();
      if (!callActiveRef.current) break;
      if (!userAnswer.trim()) continue;

      history.push({ role: "user", content: userAnswer });
      historyRef.current = [...history];
      setMessages([...history]);
      setLastMessage(userAnswer);

      if (!callActiveRef.current) break;

      // AI reply
      setCallStatus(CallStatus.PROCESSING);
      const aiReply = await getInterviewerResponse(history, questions ?? [], type);
      if (!callActiveRef.current) break;
      await addAI(aiReply);

      // Natural end check
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

  // ── Feedback after finish ─────────────────────────────────────────────────
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
        toast.info("Interview too short for feedback.");
        router.push("/");
        return;
      }
      const tid = toast.loading("Generating feedback report…");
      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: finalMessages,
          feedbackId,
        });
        toast.dismiss(tid);
        if (success && id) {
          toast.success("Feedback ready!");
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          router.push("/");
        }
      } catch {
        toast.dismiss(tid);
        router.push("/");
      }
    };
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  // ── Start ─────────────────────────────────────────────────────────────────
  const handleCall = async () => {
    // Pre-load voices
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

  // ── End ───────────────────────────────────────────────────────────────────
  const handleDisconnect = () => {
    callActiveRef.current = false;
    window.speechSynthesis?.cancel();
    // If waiting for input, resolve with empty to unblock the loop
    if (resolveInputRef.current) {
      resolveInputRef.current("");
      resolveInputRef.current = null;
    }
    setCallStatus(CallStatus.FINISHED);
  };

  // ── Keyboard: Enter to submit ─────────────────────────────────────────────
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
    [CallStatus.WAITING]:     "Your turn — type your answer below",
    [CallStatus.PROCESSING]:  "AI is thinking…",
    [CallStatus.FINISHED]:    "Interview complete",
  };

  // ── Render ────────────────────────────────────────────────────────────────
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

        {/* User card */}
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="Candidate" width={539} height={539} className="rounded-full object-cover size-[120px]" />
            <h3>{userName || "Candidate"}</h3>
            {callStatus === CallStatus.WAITING && (
              <p className="text-xs text-emerald-400 mt-1 animate-pulse">Your turn ✍️</p>
            )}
          </div>
        </div>
      </div>

      {/* Last message / transcript */}
      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="transition-opacity duration-300 opacity-100 leading-relaxed">
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      {isActive && (
        <p className="text-center text-xs text-white/50 mt-2 animate-pulse">
          {statusText[callStatus]}
        </p>
      )}

      {/* Text input — shown while waiting for user answer */}
      {callStatus === CallStatus.WAITING && (
        <div className="w-full mt-4 flex flex-col gap-3 px-2">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here… (Press Enter to submit, Shift+Enter for new line)"
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

      {/* Start / End buttons */}
      <div className="w-full flex justify-center mt-6">
        {!isActive && callStatus !== CallStatus.FINISHED ? (
          <button
            className="relative btn-call flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleCall}
          >
            <span className="relative font-semibold">Start Interview Call</span>
          </button>
        ) : isActive && callStatus !== CallStatus.WAITING ? (
          <button
            className="btn-disconnect cursor-pointer font-semibold"
            onClick={handleDisconnect}
          >
            End Interview
          </button>
        ) : isActive ? (
          <button
            className="btn-disconnect cursor-pointer font-semibold"
            onClick={handleDisconnect}
          >
            End Interview
          </button>
        ) : null}
      </div>
    </>
  );
};

export default Agent;
