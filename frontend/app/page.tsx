"use client";

import { useEffect } from "react";
import { useChatStore } from "./store/useChatStore";
import { usePdfStore } from "./store/usePdfStore";
import PdfViewer from "../app/components/PDFViewer";

export default function Home() {
  const {
    messages,
    startAssistantMessage,
    appendText,
    addTool,
    addCitation,
    reset,
  } = useChatStore();

  const { openPdf } = usePdfStore();

  useEffect(() => {
    reset();
    startAssistantMessage();

    const es = new EventSource("http://127.0.0.1:8000/stream/test123");

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "tool") addTool(data.name);
      if (data.type === "text") appendText(data.content);
      if (data.type === "citation") addCitation(data.page);
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, []);

  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* CHAT */}
      <div className="flex-1 flex justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          <h1 className="text-2xl font-semibold">AI Search Chat</h1>

          {messages.map((m, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border bg-white space-y-2"
            >
              {m.tools.map((t, idx) => (
                <div key={idx} className="text-sm text-gray-500">
                  🔍 {t.replace("_", " ")}...
                </div>
              ))}

              <div className="whitespace-pre-wrap">{m.content}</div>

              <div className="flex gap-2">
                {m.citations.map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => openPdf(page)}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    [{idx + 1}]
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF VIEWER */}
      <PdfViewer />
    </main>
  );
}
