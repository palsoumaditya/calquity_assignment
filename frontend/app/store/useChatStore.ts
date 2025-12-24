import { create } from "zustand";

export type Citation = {
  page: number;
  snippet: string;
};

// ✅ FIX: 'components' must be an array []
export type Message = {
  role: "assistant" | "user";
  content: string;
  tools: string[];
  citations: Citation[];
  components: { name: string; data: any }[]; 
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
          const exists = lastMsg.citations.some((c) => c.page === page);
          if (!exists) {
             lastMsg.citations.push({ page, snippet });
          }
      }
      return { messages };
    }),

  // ✅ FIX: Properly create new message object with immutable update
  addComponent: (component) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        // Create a new message object with updated components array
        messages[messages.length - 1] = {
          ...lastMsg,
          components: [...(lastMsg.components || []), component],
        };
      }
      return { messages };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  reset: () => set({ messages: [], isStreaming: false }),
}));