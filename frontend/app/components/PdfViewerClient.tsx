"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { usePdfStore } from "../store/usePdfStore";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Fix worker source
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfViewerClient() {
  const { isOpen, page, closePdf, setPage } = usePdfStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(500);

  // Reset scroll when page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [page]);

  // Handle Resize for Responsive Width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 40); // 40px padding
      }
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [isOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    if (numPages) {
      const newPage = Math.min(Math.max(page + offset, 1), numPages);
      setPage(newPage);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full md:w-[45%] h-screen border-l bg-gray-100 flex flex-col shadow-2xl z-50 fixed right-0 top-0 md:static overflow-hidden"
        >
          {/* --- HEADER (Controls) --- */}
          <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm z-10">
            <div className="flex items-center gap-3">
               <span className="font-semibold text-sm text-gray-800">Source Viewer</span>
               <div className="h-4 w-[1px] bg-gray-300"></div>
               {/* Zoom Controls */}
               <div className="flex items-center gap-1">
                 <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-1 hover:bg-gray-100 rounded text-gray-600 font-bold">-</button>
                 <span className="text-xs text-gray-500 w-8 text-center">{Math.round(scale * 100)}%</span>
                 <button onClick={() => setScale(s => Math.min(s + 0.1, 2.0))} className="p-1 hover:bg-gray-100 rounded text-gray-600 font-bold">+</button>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {/* Page Navigation */}
               {numPages && (
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border">
                    <button disabled={page <= 1} onClick={() => changePage(-1)} className="disabled:opacity-30 hover:text-black">◀</button>
                    <span>{page} / {numPages}</span>
                    <button disabled={page >= numPages} onClick={() => changePage(1)} className="disabled:opacity-30 hover:text-black">▶</button>
                 </div>
               )}
               
               <button
                 onClick={closePdf}
                 className="text-xs px-3 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors shadow-sm"
               >
                 Close
               </button>
            </div>
          </div>

          {/* --- PDF CONTENT --- */}
          <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100/50" ref={containerRef}>
            <Document
              file="/sample.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              className="shadow-xl"
              loading={
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-pulse">
                   <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                   <span className="text-sm font-medium">Loading Document...</span>
                </div>
              }
            >
              <Page
                pageNumber={page}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={containerWidth}
                scale={scale}
                className="bg-white"
              />
            </Document>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}