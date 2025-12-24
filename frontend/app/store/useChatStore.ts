import { create } from "zustand";

export type Citation = {
  page: number;
  snippet: string;
};

export type Message = {
  role: "assistant" | "user";
  content: string;
  tools: string[];
  citations: Citation[];
  components: { name: string; data: any }[]; // Changed to array to support multiple components
};

type ChatState = {
  messages: Message[];
  isStreaming: boolean;
  
  addUserMessage: (content: string) => void;
  startAssistantMessage: () => void;
  appendText: (char: string) => void;
  addTool: (tool: string) => void;
  addCitation: (page: number, snippet: string) => void;
  addComponent: (component: { name: string; data: any }) => void;
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
        { role: "user", content, tools: [], citations: [], components: [] },
      ],
    })),

  startAssistantMessage: () =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "assistant", content: "", tools: [], citations: [], components: [] },
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

  addCitation: (page, snippet) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
          // Avoid duplicates
          const exists = lastMsg.citations.some((c) => c.page === page);
          if (!exists) {
             lastMsg.citations.push({ page, snippet });
          }
      }
      return { messages };
    }),

  addComponent: (component) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        lastMsg.components.push(component);
      }
      return { messages };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  reset: () => set({ messages: [], isStreaming: false }),
}));