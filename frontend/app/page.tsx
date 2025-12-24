'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Playfair_Display, Bebas_Neue, Jersey_10 } from 'next/font/google';
import { useChatStore } from './store/useChatStore';
import { usePdfStore } from './store/usePdfStore';
import PdfViewer from '../app/components/PDFViewer';

// --- Font Configuration ---
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-playfair',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
});

const jersey = Jersey_10({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jersey',
});

export default function Home() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isStreaming,
    addUserMessage,
    startAssistantMessage,
    appendText,
    addTool,
    addCitation,
    addComponent,
    setStreaming,
  } = useChatStore();

  const { openPdf } = usePdfStore();
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userQuery = input;
    setInput("");
    addUserMessage(userQuery);
    setStreaming(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });
      
      const { job_id } = await res.json();

      startAssistantMessage();
      const es = new EventSource(`http://127.0.0.1:8000/stream/${job_id}`);

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "tool") addTool(data.name);
        if (data.type === "text") appendText(data.content);
        if (data.type === "citation") addCitation(data.page);
        if (data.type === "component") addComponent({ name: data.name, data: data.data });
        
        if (data.type === "error") {
            console.error(data.content);
            es.close();
            setStreaming(false);
        }
      };

      es.onerror = () => {
        es.close();
        setStreaming(false);
      };

    } catch (error) {
      console.error("Failed to start chat:", error);
      setStreaming(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <main className="relative flex w-full h-screen overflow-hidden bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      
      {/* BACKGROUND TEXTURE */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        
        {/* TOP BAR (Visible only when chatting) */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: hasMessages ? 1 : 0, y: hasMessages ? 0 : -20 }}
          className="absolute top-0 left-0 w-full p-3 sm:p-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-neutral-100 z-20"
        >
            <span className={`${playfair.className} font-semibold text-base sm:text-lg`}>Fableframe</span>
            <span className={`${jersey.className} text-neutral-400 text-[10px] sm:text-xs hidden sm:inline`}>SYSTEM : ONLINE</span>
        </motion.header>

        {/* 1. EMPTY STATE (HERO SECTION) */}
        {!hasMessages && (
           <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
             <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               exit="exit"
               className="max-w-3xl w-full text-center flex flex-col items-center"
             >
                {/* Decorative Index */}
                <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
                  <span className={`${jersey.className} text-neutral-400 text-base sm:text-xl`}>
                    ( Fig. 01 )
                  </span>
                </motion.div>

                {/* Kicker */}
                <motion.span
                  variants={itemVariants}
                  className={`${bebas.className} inline-block mb-4 sm:mb-6 text-sm sm:text-xl tracking-[0.15em] text-neutral-500 uppercase px-4`}
                >
                  AI-Powered Research Engine
                </motion.span>

                {/* Main Headline */}
                <motion.h1
                  variants={itemVariants}
                  className={`${playfair.className} mb-6 sm:mb-8 text-3xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-neutral-900 leading-[1.1] px-4`}
                >
                  Turn documents into <br className="hidden sm:block" />
                  <span className="italic text-neutral-500">intelligent</span> insights.
                </motion.h1>

                {/* Search Input (Replaces the Button) */}
                <motion.div 
                    variants={itemVariants} 
                    className="w-full max-w-lg relative group px-4"
                >
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="absolute inset-0 bg-neutral-200 rounded-full blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-60 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-white rounded-full border-2 border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-neutral-400 hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)] focus-within:border-neutral-900 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.15)] transition-all duration-300 p-3 sm:p-4 pl-4 sm:pl-6">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question about your PDF..."
                                className={`${playfair.className} w-full bg-transparent text-base sm:text-lg text-neutral-900 placeholder:text-neutral-400 placeholder:italic focus:outline-none`}
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim()}
                                className={`ml-2 w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                                    input.trim() 
                                        ? 'bg-neutral-900 text-white hover:scale-110 hover:shadow-lg active:scale-95 shadow-md' 
                                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                }`}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </form>
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                         <span className={`${jersey.className} text-neutral-400 text-xs sm:text-sm`}>
                            STATUS: READY
                         </span>
                         <span className={`${jersey.className} text-neutral-400 text-xs sm:text-sm`}>
                            MODEL: GEMINI 1.5
                         </span>
                    </div>
                </motion.div>
             </motion.div>
           </div>
        )}

        {/* 2. CHAT INTERFACE (Active State) */}
        {hasMessages && (
          <div className="flex-1 flex flex-col relative animate-in fade-in duration-500">
             
             {/* Messages Scroll Area */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-0 scroll-smooth pb-24 sm:pb-32">
                <div className="max-w-3xl mx-auto py-6 sm:py-12 space-y-6 sm:space-y-12">
                   {messages.map((m, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} w-full`}
                      >
                         {/* Label */}
                         <span className={`${bebas.className} text-[10px] sm:text-xs text-neutral-400 mb-2 tracking-widest uppercase`}>
                            {m.role === 'user' ? 'Inquiry' : 'Response'}
                         </span>

                         <div className={`relative w-full max-w-[95%] sm:max-w-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 rounded-3xl text-base sm:text-lg leading-relaxed ${
                            m.role === 'user' 
                            ? 'bg-neutral-900 text-white rounded-tr-sm shadow-xl' 
                            : 'bg-white border border-neutral-100 rounded-tl-sm text-neutral-800 shadow-sm'
                         }`}>
                             
                            {/* Tools */}
                            {m.tools.length > 0 && (
                                <div className="flex flex-col gap-2 mb-4 sm:mb-6 border-b border-neutral-100 pb-3 sm:pb-4">
                                    {m.tools.map((t, idx) => (
                                        <div key={idx} className={`${jersey.className} flex items-center gap-2 sm:gap-3 text-neutral-500 text-xs sm:text-sm animate-pulse`}>
                                            <span>▶</span>
                                            <span className="uppercase tracking-wider">{t.replace(/_/g, " ")}...</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Info Card Component */}
                            {m.component && m.component.name === "info_card" && (
                                <div className="mb-4 sm:mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                    <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-neutral-200 bg-white">
                                        <h3 className={`${playfair.className} font-semibold text-sm sm:text-base text-neutral-900 italic`}>
                                            {m.component.data.title}
                                        </h3>
                                    </div>
                                    <div className="p-3 sm:p-5">
                                        <ul className="space-y-2 sm:space-y-3">
                                            {m.component.data.details.map((item: string, idx: number) => (
                                                <li key={idx} className={`${jersey.className} text-neutral-600 text-xs sm:text-sm flex items-start gap-2 sm:gap-3`}>
                                                    <span className="text-neutral-400">0{idx+1}</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className={m.role === 'assistant' ? playfair.className : 'font-sans'}>
                                {m.content}
                                {isStreaming && i === messages.length - 1 && m.role === "assistant" && (
                                    <span className="inline-block w-2 h-4 ml-1 bg-neutral-400 animate-pulse" />
                                )}
                            </div>

                            {/* Citations */}
                            {m.citations.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 sm:pt-6 mt-2 border-t border-neutral-100/50">
                                    {m.citations.map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => openPdf(page)}
                                            className={`${jersey.className} flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-[10px] sm:text-xs transition-colors`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                                            <span>REF. PAGE {page}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                         </div>
                      </motion.div>
                   ))}
                </div>
             </div>

             {/* Bottom Input Area (Active Mode) */}
             <div className="absolute bottom-4 sm:bottom-8 left-0 w-full px-3 sm:px-4 z-20">
                <div className="max-w-xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-neutral-200 rounded-full blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-60 transition-opacity duration-300"></div>
                        <div className="relative flex items-center bg-white/95 backdrop-blur-md border-2 border-neutral-200 shadow-lg hover:border-neutral-400 hover:shadow-xl focus-within:border-neutral-900 focus-within:shadow-2xl transition-all duration-300 rounded-full p-3 sm:p-4 pl-4 sm:pl-6">
                             <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Follow up question..."
                                className={`${playfair.className} w-full bg-transparent text-base sm:text-lg text-neutral-900 placeholder:text-neutral-400 placeholder:italic focus:outline-none`}
                                disabled={isStreaming}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isStreaming}
                                className={`ml-2 w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                                    input.trim() && !isStreaming
                                        ? 'bg-neutral-900 text-white hover:scale-110 hover:shadow-lg active:scale-95 shadow-md' 
                                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                }`}
                            >
                                {isStreaming ? (
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                                ) : (
                                    <span className={`${bebas.className} pt-1 text-xs sm:text-sm`}>GO</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* PDF VIEWER */}
      <PdfViewer />
    </main>
  );
}