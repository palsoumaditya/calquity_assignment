"use client";

import { useChatStore } from "@/store/useChatStore";
import ChatInput from "./ChatInput";

export default function Chat() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              m.role === "user"
                ? "bg-white border"
                : m.role === "tool"
                ? "text-sm text-gray-500"
                : "bg-gray-100"
            }`}
          >
            {m.content}
          </div>
        ))}

        {isStreaming && (
          <div className="text-gray-400 animate-pulse">
            AI is typing…
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}
