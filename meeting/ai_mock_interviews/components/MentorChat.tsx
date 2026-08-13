"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function FormattedMessage({ text }: { text: string }) {
  if (!text) return null;

  // Split text by double line breaks into paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="flex flex-col gap-2.5 leading-relaxed text-xs sm:text-sm">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split(/\n/);
        return (
          <div key={pIdx} className="flex flex-col gap-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Check if bullet point or numbered item
              const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
              const isNumbered = /^\d+\./.test(trimmed);

              const contentText = isBullet 
                ? trimmed.replace(/^[•\-\*]\s*/, "") 
                : isNumbered 
                ? trimmed.replace(/^\d+\.\s*/, "") 
                : trimmed;

              // Parse **bold** syntax
              const parts = contentText.split(/(\*\*.*?\*\*)/g);
              const formattedContent = parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={i} className="font-semibold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              });

              if (isBullet || isNumbered) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5 my-0.5">
                    <span className="text-indigo-400 font-bold shrink-0">
                      {isBullet ? "•" : trimmed.match(/^\d+\./)?.[0]}
                    </span>
                    <span className="flex-1 text-white/95">{formattedContent}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="text-white/95">{formattedContent}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export function MentorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          prompt: userText,
        }),
      });

      const data = await res.json();
      const replyContent = data.reply || "I am ready to help you with your career development!";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyContent,
        },
      ]);
    } catch (err) {
      console.error("Mentor chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I am ready to help you with career advice, resume tips, and interview prep!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[520px] max-h-[80vh] bg-[#161626] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex justify-between items-center shadow-md">
            <div>
              <h3 className="text-white font-bold text-sm">CareerNexa Mentor</h3>
              <p className="text-white/70 text-[10px]">AI Career & Learning Guide</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 && (
              <div className="text-center text-white/50 text-xs mt-10 px-4 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                👋 Hi! I'm your **CareerNexa AI mentor**. Ask me anything about career guidance, skill roadmaps, or technical interview strategies!
              </div>
            )}
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm ${
                  m.role === "user" 
                    ? "bg-indigo-600 text-white self-end rounded-br-none shadow-md" 
                    : "bg-white/10 text-white/90 self-start rounded-bl-none border border-white/5 shadow-sm"
                }`}
              >
                <FormattedMessage text={m.content} />
              </div>
            ))}
            {isLoading && (
              <div className="bg-white/10 text-white/90 self-start rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs flex items-center gap-2 border border-white/5">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                <span className="text-xs text-white/50">Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#0f0f1c] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 active:scale-95 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
