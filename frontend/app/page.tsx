"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Playfair_Display, Inter } from "next/font/google";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStore } from "./store/useChatStore";
import { usePdfStore } from "./store/usePdfStore";
import PdfViewer from "../app/components/PDFViewer";
import ChatInput from "../app/components/ChatInput";

// --- Typography ---
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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

  const { openPdf, setSearchText } = usePdfStore();
  const hasMessages = messages.length > 0;

  // --- Upload State ---
  const [isUploading, setIsUploading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handle File Upload ---
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
        setIsFileUploaded(true);
      } else {
        alert(" Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
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
        if (data.type === "citation") addCitation(data.page, data.snippet);
        if (data.type === "component")
          addComponent({ name: data.name, data: data.data });

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
    <main
      className={`relative flex w-full h-screen overflow-hidden bg-white text-neutral-900 ${inter.variable} ${playfair.variable} font-sans`}
    >
      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10 max-w-4xl mx-auto w-full">
        {/* --- STATE A: HERO (Empty) --- */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="max-w-2xl w-full text-center space-y-8">
              <h1 className="font-serif text-5xl md:text-6xl text-neutral-900 tracking-tight leading-[1.1]">
                What do you want to know?
              </h1>

              {/* --- UPLOAD SECTION --- */}
              {!isFileUploaded && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-neutral-500 text-lg max-w-lg mx-auto leading-relaxed">
                    Upload a PDF to analyze contracts, research papers, or
                    financial reports instantly.
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
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        <span>Upload PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* --- CHAT INPUT & SUGGESTIONS --- */}
              {isFileUploaded && (
                <>
                  <div className="w-full pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <ChatInput
                      onSend={handleSend}
                      disabled={isStreaming}
                      placeholder="Ask anything about the document..."
                      autoFocus={true}
                    />
                  </div>

                  {/* Suggestions */}
                  <div className="flex flex-wrap justify-center gap-3 pt-4 opacity-60 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {[
                      "Summarize the key points",
                      "What are the risks?",
                      "Explain the methodology",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="text-sm px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors text-neutral-600"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- STATE B: CHAT (Active) --- */}
        {hasMessages && (
          <div className="flex-1 flex flex-col h-full relative">
            {/* Scrollable Message List */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth pb-32"
            >
              <div className="max-w-3xl mx-auto space-y-8 pt-10">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {/* USER MESSAGE */}
                    {m.role === "user" && (
                      <div className="flex justify-end">
                        <div className="bg-neutral-100 text-neutral-800 px-5 py-3 rounded-2xl max-w-xl text-lg leading-relaxed">
                          {m.content}
                        </div>
                      </div>
                    )}

                    {/* ASSISTANT MESSAGE */}
                    {m.role === "assistant" && (
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
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wider"
                                >
                                  <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse"></span>
                                  {t.replace(/_/g, " ")}...
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 2. Generative UI Components */}
                          {m.components &&
                            m.components.map((comp, idx) => {
                              // A. INFO CARD
                              if (comp.name === "info_card") {
                                return (
                                  <div
                                    key={idx}
                                    className="my-4 rounded-xl border border-neutral-200 bg-neutral-50/50 overflow-hidden max-w-md shadow-sm"
                                  >
                                    <div className="px-4 py-3 border-b border-neutral-100 bg-white flex items-center gap-2">
                                      <div className="w-1 h-4 bg-teal-500 rounded-full" />
                                      <h3 className="font-semibold text-neutral-800 text-sm">
                                        Analysis Summary
                                      </h3>
                                    </div>
                                    <div className="p-4">
                                      <h4 className="font-serif text-lg text-neutral-900 mb-2">
                                        {comp.data.title}
                                      </h4>
                                      <ul className="space-y-2">
                                        {comp.data.details.map(
                                          (item: string, i: number) => (
                                            <li
                                              key={i}
                                              className="flex gap-2 text-sm text-neutral-600 leading-relaxed"
                                            >
                                              <span className="text-teal-500 font-bold">
                                                •
                                              </span>
                                              {item}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                );
                              }

                              // B. DATA TABLE
                              if (comp.name === "data_table") {
                                return (
                                  <div
                                    key={idx}
                                    className="my-4 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm max-w-md"
                                  >
                                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                                      <h3 className="font-semibold text-sm text-neutral-700">
                                        {comp.data.title}
                                      </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                                          <tr>
                                            {comp.data.headers.map(
                                              (h: string, i: number) => (
                                                <th
                                                  key={i}
                                                  className="px-4 py-2 font-medium"
                                                >
                                                  {h}
                                                </th>
                                              )
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {comp.data.rows.map(
                                            (row: string[], i: number) => (
                                              <tr
                                                key={i}
                                                className="border-b last:border-0 hover:bg-neutral-50"
                                              >
                                                {row.map(
                                                  (cell: string, j: number) => (
                                                    <td
                                                      key={j}
                                                      className="px-4 py-2 text-neutral-700"
                                                    >
                                                      {cell}
                                                    </td>
                                                  )
                                                )}
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              }

                              // C. RISK CHART
                              if (comp.name === "risk_chart") {
                                return (
                                  <div
                                    key={idx}
                                    className="my-4 rounded-xl border border-neutral-200 bg-white p-4 max-w-md shadow-sm"
                                  >
                                    <h3 className="font-medium text-sm text-neutral-500 mb-3 uppercase tracking-wider">
                                      {comp.data.title}
                                    </h3>
                                    <div className="space-y-3">
                                      {comp.data.labels.map(
                                        (label: string, i: number) => (
                                          <div
                                            key={i}
                                            className="flex items-center gap-3"
                                          >
                                            <div className="w-24 text-xs font-medium text-neutral-600 truncate">
                                              {label}
                                            </div>
                                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{
                                                  width: `${comp.data.values[i]}%`,
                                                }}
                                              />
                                            </div>
                                            <div className="w-8 text-xs text-neutral-400 text-right">
                                              {comp.data.values[i]}%
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            })}

                          {/* 3. Main Text Content */}
                          <div className="prose prose-lg prose-neutral max-w-none text-neutral-800 font-serif leading-8">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-4 last:mb-0">
                                    {children}
                                    {isStreaming &&
                                      i === messages.length - 1 && (
                                        <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse rounded-sm align-middle" />
                                      )}
                                  </p>
                                ),
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>

                          {/* 4. SOURCE CARDS */}
                          {m.citations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-neutral-100">
                              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                                Sources
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {m.citations.map((cite, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSearchText(cite.snippet);
                                      openPdf(cite.page);
                                    }}
                                    className="group flex flex-col items-start gap-1 p-3 rounded-lg border border-neutral-200 bg-white hover:border-teal-500 hover:shadow-md transition-all w-48 text-left"
                                  >
                                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 group-hover:text-teal-600">
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                      <span>Page {cite.page}</span>
                                    </div>
                                    <div className="text-[10px] text-neutral-400 line-clamp-2 leading-tight w-full">
                                      {cite.snippet}
                                    </div>
                                  </button>
                                ))}
                              </div>
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
              <ChatInput onSend={handleSend} disabled={isStreaming} />
            </div>
          </div>
        )}
      </div>

      {/* PDF Side Panel */}
      <PdfViewer />
    </main>
  );
}
