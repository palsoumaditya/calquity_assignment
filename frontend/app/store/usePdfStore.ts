import { create } from "zustand";

type PdfState = {
  isOpen: boolean;
  page: number;
  searchText: string; // New field
  openPdf: (page: number) => void;
  closePdf: () => void;
  setPage: (page: number) => void;
  setSearchText: (text: string) => void; // New action
};

export const usePdfStore = create<PdfState>((set) => ({
  isOpen: false,
  page: 1,
  searchText: "", // Default empty

  openPdf: (page) =>
    set({
      isOpen: true,
      page,
    }),

  closePdf: () =>
    set({
      isOpen: false,
      page: 1,
      searchText: "", // Optional: clear search on close
    }),

  setPage: (page) => set({ page }),
  
  setSearchText: (text) => set({ searchText: text }),
}));