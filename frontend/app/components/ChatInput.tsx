'use client';

import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Ask a follow-up question...",
  autoFocus = false 
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative group">
      {/* Soft Glow Behind Input */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className={`
          relative flex items-center p-2 pl-6 pr-2
          bg-white border transition-all duration-300 rounded-full shadow-sm
          ${disabled 
            ? 'border-neutral-100 bg-neutral-50 cursor-not-allowed' 
            : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md focus-within:ring-2 focus-within:ring-neutral-100 focus-within:border-neutral-400'
          }
        `}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={`
              w-full bg-transparent text-base sm:text-lg text-neutral-800 
              placeholder:text-neutral-400 focus:outline-none
              ${disabled ? 'opacity-50' : ''}
            `}
          />
          
          <button 
            type="submit" 
            disabled={!input.trim() || disabled}
            className={`
              ml-2 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200
              ${input.trim() && !disabled
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-105 active:scale-95' 
                : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
              }
            `}
          >
            {disabled ? (
               <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}