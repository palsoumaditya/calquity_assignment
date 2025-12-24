import { create } from "zustand";

type PdfState = {
  isOpen: boolean;
  page: number;
  openPdf: (page: number) => void;
  closePdf: () => void;
  setPage: (page: number) => void; // <--- ADD THIS
};

export const usePdfStore = create<PdfState>((set) => ({
  isOpen: false,
  page: 1,

  openPdf: (page) =>
    set({
      isOpen: true,
      page,
    }),

  closePdf: () =>
    set({
      isOpen: false,
      page: 1,
    }),

  // <--- ADD THIS FUNCTION
  setPage: (page) => set({ page }), 
}));