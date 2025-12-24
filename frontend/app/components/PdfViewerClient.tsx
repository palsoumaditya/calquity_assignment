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
  const { isOpen, page, closePdf } = usePdfStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(500);

  // Reset scroll when page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [page]);

  // Calculate responsive page width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setPageWidth(Math.min(containerWidth - 32, 500)); // 32px for padding
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full md:w-2/5 h-screen border-l bg-gray-100 flex flex-col shadow-2xl z-50 fixed right-0 top-0 md:static overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-2 sm:p-3 border-b bg-white shadow-sm flex-shrink-0">
            <span className="font-medium text-sm sm:text-base text-gray-700">Source PDF</span>
            <button
              onClick={closePdf}
              className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors"
            >
              Close
            </button>
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto p-2 sm:p-4 flex justify-center bg-gray-50" ref={containerRef}>
            <Document
              file="/sample.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              className="shadow-lg"
              loading={
                <div className="flex items-center justify-center h-full text-gray-400 animate-pulse text-sm sm:text-base">
                  Loading Document...
                </div>
              }
            >
              {numPages && (
                <Page
                  pageNumber={page > 0 && page <= numPages ? page : 1}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  width={pageWidth}
                  className="mb-4"
                />
              )}
            </Document>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}