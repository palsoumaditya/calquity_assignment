"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { usePdfStore } from "../store/usePdfStore";
import { useEffect, useRef, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ✅ FIX: Use the local worker file we copied to public/ folder
// This bypasses all CDN version mismatch issues
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfViewerClient() {
  const { isOpen, page, closePdf } = usePdfStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reset scroll when page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [page]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("PDF load error:", err);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-2/5 h-screen border-l bg-gray-100 flex flex-col shadow-xl z-50 fixed right-0 md:static">
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <span className="font-medium text-gray-700">Source PDF</span>
        <button
          onClick={closePdf}
          className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-50" ref={containerRef}>
        {isLoading && (
          <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
            Loading Document...
          </div>
        )}
        
        <Document
          file="/sample.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="shadow-lg"
        >
          {numPages && (
            <Page
              pageNumber={page > 0 && page <= numPages ? page : 1}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              width={500}
              className="mb-4"
              onRenderError={(err) => console.error("Page render error:", err)}
            />
          )}
        </Document>
      </div>
    </div>
  );
}