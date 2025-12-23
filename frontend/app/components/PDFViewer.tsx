import dynamic from "next/dynamic";

// 🚫 Disable SSR completely
const PdfViewer = dynamic(() => import("./PdfViewerClient"), {
  ssr: false,
});

export default PdfViewer;
