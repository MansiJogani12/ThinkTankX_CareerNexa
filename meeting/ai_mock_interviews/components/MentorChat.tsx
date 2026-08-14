"use client";

import React, { useState } from "react";
import { useChat } from "ai/react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

export function MentorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai/mentor",
    onError: (e) => {
      console.error("Mentor chat error:", e);
    }
  });

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold text-sm">SkillForge Mentor</h3>
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
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 && (
              <div className="text-center text-white/40 text-xs mt-10 px-4">
                Hi! I'm your AI mentor. Ask me about your career, interview prep, or what you should learn next based on your profile!
              </div>
            )}
            {messages.map(m => (
              <div 
                key={m.id} 
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user" 
                    ? "bg-indigo-600 text-white self-end rounded-br-none" 
                    : "bg-white/10 text-white/90 self-start rounded-bl-none"
                }`}
              >
                {/* Very basic markdown rendering for simplicity (real app might use react-markdown) */}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-white/10 text-white/90 self-start rounded-xl rounded-bl-none px-3 py-2 text-sm">
                <Loader2 size={14} className="animate-spin text-white/50" />
              </div>
            )}
            {error && (
              <div className="text-red-400 text-xs text-center">
                Something went wrong. Please try again.
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#161625] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask for advice..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
