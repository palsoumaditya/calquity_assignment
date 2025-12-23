import { create } from "zustand";

export type Message = {
  role: "assistant" | "user";
  content: string;
  tools: string[];
  citations: number[];
};

type ChatState = {
  messages: Message[];
  isStreaming: boolean;
  
  addUserMessage: (content: string) => void;
  startAssistantMessage: () => void;
  appendText: (char: string) => void;
  addTool: (tool: string) => void;
  addCitation: (page: number) => void;
  setStreaming: (loading: boolean) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,

  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "user", content, tools: [], citations: [] },
      ],
    })),

  startAssistantMessage: () =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "assistant", content: "", tools: [], citations: [] },
      ],
    })),

  appendText: (char) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
         lastMsg.content += char;
      }
      return { messages };
    }),

  addTool: (tool) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) lastMsg.tools.push(tool);
      return { messages };
    }),

  addCitation: (page) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      // Avoid duplicate citations for the same message
      if (lastMsg && !lastMsg.citations.includes(page)) {
          lastMsg.citations.push(page);
      }
      return { messages };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  reset: () => set({ messages: [], isStreaming: false }),
}));