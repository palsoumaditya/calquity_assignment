'use client';

import React, { useRef, useEffect, useState } from 'react'; // <--- ADDED useState
import { motion } from 'framer-motion';
import { Playfair_Display, Inter } from 'next/font/google';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from './store/useChatStore';
import { usePdfStore } from './store/usePdfStore';
import PdfViewer from '../app/components/PDFViewer';
import ChatInput from '../app/components/ChatInput';

// --- Typography ---
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function Home() {
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

  // --- NEW: Upload State ---
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- NEW: Handle File Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ PDF Uploaded & Processed Successfully!");
      } else {
        alert("❌ Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Handle sending a message
  const handleSend = async (userQuery: string) => {
    if (isStreaming) return;

    addUserMessage(userQuery);
    setStreaming(true);

    try {
      // 1. Start the Chat Job
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });
      
      const { job_id } = await res.json();

      // 2. Connect to the Stream
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

  return (
    <main className={`relative flex w-full h-screen overflow-hidden bg-white text-neutral-900 ${inter.variable} ${playfair.variable} font-sans`}>
      
      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10 max-w-4xl mx-auto w-full">
        
        {/* --- STATE A: HERO (Empty) --- */}
        {!hasMessages && (
           <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
             <div className="max-w-2xl w-full text-center space-y-8">
                
                <h1 className="font-serif text-5xl md:text-6xl text-neutral-900 tracking-tight leading-[1.1]">
                  What do you want to know?
                </h1>
                
                {/* --- NEW: Upload Section --- */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-neutral-500 text-lg max-w-lg mx-auto leading-relaxed">
                    Upload a PDF to analyze contracts, research papers, or financial reports instantly.
                  </p>

                  <input 
                    type="file" 
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform active:scale-95"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Uploading...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span>Upload PDF</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="w-full pt-4">
                    <ChatInput 
                        onSend={handleSend} 
                        disabled={isStreaming} 
                        placeholder="Ask anything about the document..." 
                        autoFocus={true}
                    />
                </div>
                
                {/* Suggestions */}
                <div className="flex flex-wrap justify-center gap-3 pt-4 opacity-60">
                    {["Summarize the key points", "What are the risks?", "Explain the methodology"].map((s) => (
                        <button key={s} onClick={() => handleSend(s)} className="text-sm px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors text-neutral-600">
                            {s}
                        </button>
                    ))}
                </div>
             </div>
           </div>
        )}

        {/* --- STATE B: CHAT (Active) --- */}
        {hasMessages && (
          <div className="flex-1 flex flex-col h-full relative">
             
             {/* Scrollable Message List */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth pb-32">
                <div className="max-w-3xl mx-auto space-y-8 pt-10">
                   {messages.map((m, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                      >
                         {/* USER MESSAGE */}
                         {m.role === 'user' && (
                             <div className="flex justify-end">
                                 <div className="bg-neutral-100 text-neutral-800 px-5 py-3 rounded-2xl max-w-xl text-lg leading-relaxed">
                                     {m.content}
                                 </div>
                             </div>
                         )}

                         {/* ASSISTANT MESSAGE */}
                         {m.role === 'assistant' && (
                             <div className="flex gap-4 md:gap-6">
                                {/* Avatar */}
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        AI
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 space-y-4">
                                    
                                    {/* 1. Tool / Status Indicators */}
                                    {m.tools.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {m.tools.map((t, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                                    <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse"></span>
                                                    {t.replace(/_/g, " ")}...
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 2. Generative UI Component (Card) */}
                                    {m.component && m.component.name === "info_card" && (
                                        <div className="my-4 rounded-xl border border-neutral-200 bg-neutral-50/50 overflow-hidden max-w-md shadow-sm">
                                            <div className="px-4 py-3 border-b border-neutral-100 bg-white flex items-center gap-2">
                                                <div className="w-1 h-4 bg-teal-500 rounded-full" />
                                                <h3 className="font-semibold text-neutral-800 text-sm">Analysis Summary</h3>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-serif text-lg text-neutral-900 mb-2">{m.component.data.title}</h4>
                                                <ul className="space-y-2">
                                                    {m.component.data.details.map((item: string, idx: number) => (
                                                        <li key={idx} className="flex gap-2 text-sm text-neutral-600 leading-relaxed">
                                                            <span className="text-teal-500 font-bold">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Main Text Content */}
                                    <div className="prose prose-lg prose-neutral max-w-none text-neutral-800 font-serif leading-8">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({children}) => (
                                                    <p className="mb-4 last:mb-0">
                                                        {children}
                                                        {isStreaming && i === messages.length - 1 && (
                                                            <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse rounded-sm align-middle" />
                                                        )}
                                                    </p>
                                                )
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* 4. Citations */}
                                    {m.citations.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {m.citations.map((page, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => openPdf(page)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-600 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50 transition-all"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    <span>Page {page}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                             </div>
                         )}
                      </motion.div>
                   ))}
                </div>
             </div>

             {/* Sticky Input Area */}
             <div className="absolute bottom-6 left-0 w-full px-4 z-20">
                 <ChatInput 
                    onSend={handleSend} 
                    disabled={isStreaming} 
                />
             </div>
          </div>
        )}

      </div>

      {/* PDF Side Panel */}
      <PdfViewer />
    </main>
  );
}