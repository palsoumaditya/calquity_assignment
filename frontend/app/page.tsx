"use client";

import { useState } from "react";
import { useChatStore } from "./store/useChatStore";
import { usePdfStore } from "./store/usePdfStore";
import PdfViewer from "../app/components/PDFViewer";

export default function Home() {
  const [input, setInput] = useState("");
  const {
    messages,
    isStreaming,
    addUserMessage,
    startAssistantMessage,
    appendText,
    addTool,
    addCitation,
    setStreaming,
  } = useChatStore();

  const { openPdf } = usePdfStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userQuery = input;
    setInput("");
    addUserMessage(userQuery);
    setStreaming(true);

    try {
      // 1. Start the job
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });
      
      const { job_id } = await res.json();

      // 2. Connect to the stream
      startAssistantMessage();
      const es = new EventSource(`http://127.0.0.1:8000/stream/${job_id}`);

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "tool") addTool(data.name);
        if (data.type === "text") appendText(data.content);
        if (data.type === "citation") addCitation(data.page);
        
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
    <main className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* LEFT: CHAT AREA */}
      <div className="flex-1 flex flex-col h-screen relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-center mt-8 text-gray-800">
                AI Search Chat
            </h1>

            {messages.length === 0 && (
                <p className="text-center text-gray-400 mt-10">
                    Ask a question about the uploaded PDF...
                </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border ${
                  m.role === "user" 
                  ? "bg-gray-100 border-transparent" 
                  : "bg-white border-gray-200 shadow-sm"
                } space-y-3`}
              >
                {/* Tool Indicators */}
                {m.tools.length > 0 && (
                    <div className="flex flex-col gap-1 mb-2">
                        {m.tools.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-400 font-mono animate-pulse">
                                <span>⚡</span>
                                <span>{t.replace("_", " ").toUpperCase()}...</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                    {m.content}
                    {isStreaming && i === messages.length - 1 && m.role === "assistant" && (
                        <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
                    )}
                </div>

                {/* Citations Footer */}
                {m.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-3">
                    <span className="text-xs text-gray-400 self-center">Sources:</span>
                    {m.citations.map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => openPdf(page)}
                        className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        📄 Page {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full p-4 pr-12 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isStreaming}
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isStreaming}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* RIGHT: PDF VIEWER */}
      <PdfViewer />
    </main>
  );
}