"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { usePdfStore } from "../store/usePdfStore";
import { useEffect, useRef, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/**
 * ✅ CORRECT, STABLE FIX
 * Use CDN worker that EXACTLY matches react-pdf's pdfjs version (5.4.296)
 * This avoids version mismatch issues
 */
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.mjs`;

export default function PdfViewerClient() {
  const { isOpen, page, closePdf } = usePdfStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    console.error("PDF load error", err);
    setIsLoading(false);
  };

  // Validate page number
  const validPage = numPages && page > 0 && page <= numPages ? page : 1;

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-2/5 h-screen border-l bg-gray-100 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b bg-white">
        <span className="font-medium">Source PDF</span>
        <button
          onClick={closePdf}
          className="text-sm px-2 py-1 bg-gray-200 rounded"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 flex justify-center" ref={containerRef}>
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading PDF...</div>
          </div>
        )}
        <Document
          file="/sample.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          {numPages && (
            <Page
              pageNumber={validPage}
              onRenderError={(err) => console.error("Page render error", err)}
            />
          )}
        </Document>
      </div>
    </div>
  );
}
