import { create } from "zustand";

export type Message = {
  role: "assistant" | "user";
  content: string;
  tools: string[];
  citations: number[];
};

type ChatState = {
  messages: Message[];
  startAssistantMessage: () => void;
  appendText: (char: string) => void;
  addTool: (tool: string) => void;
  addCitation: (page: number) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  startAssistantMessage: () =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role: "assistant",
          content: "",
          tools: [],
          citations: [],
        },
      ],
    })),

  appendText: (char) =>
    set((state) => {
      const messages = [...state.messages];
      messages[messages.length - 1].content += char;
      return { messages };
    }),

  addTool: (tool) =>
    set((state) => {
      const messages = [...state.messages];
      messages[messages.length - 1].tools.push(tool);
      return { messages };
    }),

  addCitation: (page) =>
    set((state) => {
      const messages = [...state.messages];
      messages[messages.length - 1].citations.push(page);
      return { messages };
    }),

  reset: () => set({ messages: [] }),
}));
