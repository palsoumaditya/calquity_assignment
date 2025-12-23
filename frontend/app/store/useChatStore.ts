import { create } from "zustand";

export type ChatMessage = {
  role: "user" | "ai" | "tool";
  content: string;
};

type ChatState = {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: ChatMessage) => void;
  setStreaming: (v: boolean) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setStreaming: (v) => set({ isStreaming: v }),
}));
