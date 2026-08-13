"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

// ─── Types ────────────────────────────────────────────────────────────────────
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
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

  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCallSetup, setShowCallSetup] = useState(false);

  // ── Vapi Listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      toast.success("Interview started! Speak into your microphone.");
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      toast.info("Interview call ended.");
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Vapi Error:", error);
      toast.error("An error occurred during the voice interview.");
      setCallStatus(CallStatus.INACTIVE);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // ── Handle last message and feedback redirection ──────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  useEffect(() => {
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      try {
        toast.info("Saving transcript and generating feedback report...");
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          toast.success("Feedback report ready!");
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          toast.error("Could not save interview feedback.");
          router.push("/");
        }
      } catch (err) {
        console.error("Error creating feedback:", err);
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [callStatus, messages, feedbackId, interviewId, router, type, userId]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setMessages([]);
    setLastMessage("");

    try {
      // Pre-acquire microphone access to guarantee active audio tracks are initialized
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (micErr) {
      console.error("Microphone access denied or error:", micErr);
      toast.error("Microphone access is required to start the voice interview. Please enable it in your browser settings.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (err) {
      console.error("Failed to start Vapi call:", err);
      toast.error("Could not connect to voice interviewer. Check your microphone permissions.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
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

  const isActive = callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING;

  return (
    <>
      {/* Cards */}
      <div className="call-view">
        {/* AI card */}
        <div className="card-interviewer">
          <div className="avatar relative">
            <Image src="/ai-avatar.png" alt="AI Interviewer" width={65} height={54} className="object-cover" />
            {callStatus === CallStatus.ACTIVE && isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
          {callStatus === CallStatus.ACTIVE && isSpeaking && (
            <p className="text-xs text-indigo-400 mt-1 animate-pulse">Speaking…</p>
          )}
          {callStatus === CallStatus.ACTIVE && !isSpeaking && (
            <p className="text-xs text-indigo-200 mt-1">Listening…</p>
          )}
        </div>

        {/* User card */}
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="Candidate" width={539} height={539} className="rounded-full object-cover size-[120px]" />
            <h3>{userName || "Candidate"}</h3>
            {callStatus === CallStatus.ACTIVE && !isSpeaking && (
              <p className="text-xs text-emerald-400 mt-1 animate-pulse">Your turn to speak 🎙️</p>
            )}
          </div>
        </div>
      </div>

      {/* Last message / transcript */}
      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="transition-opacity duration-300 opacity-100 leading-relaxed text-white">
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Start / End buttons */}
      <div className="w-full flex justify-center mt-6">
        {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED ? (
          <button
            className="relative btn-call flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleCall}
          >
            <span className="relative font-semibold">Start Interview Call</span>
          </button>
        ) : callStatus === CallStatus.CONNECTING ? (
          <button
            disabled
            className="relative btn-call flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
          >
            <span className="relative font-semibold animate-pulse">Connecting...</span>
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
