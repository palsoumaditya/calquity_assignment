# CalQuity AI Search - Frontend

The frontend for the CalQuity AI Search application is a modern, responsive web interface built with **Next.js 16** and **React 19**. It features a Perplexity-style chat interface, real-time streaming of generative UI components, and a split-view PDF viewer with interactive citations.

## ✨ Key Features

* **Perplexity-Style Interface:** Clean, centered chat layout with a focus on readability and smooth typography.
* **Real-Time Streaming:** Renders AI responses (text, tool updates, and UI components) incrementally as they arrive from the backend using Server-Sent Events (SSE).
* **Generative UI:** Dynamically renders React components (e.g., info cards) injected by the AI model during the stream.
* **Interactive Citations:** Inline citation badges (`[1]`) that, when clicked, open the PDF viewer.
* **Split-View PDF Viewer:** A seamless split-screen experience that displays the source document and automatically scrolls to the cited page.
* **Responsive Design:** Mobile-first layout optimized for various screen sizes using Tailwind CSS v4.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16.1.1 (App Router)
* **Library:** React 19.2.3
* **Styling:** Tailwind CSS v4 + `@tailwindcss/typography`
* **State Management:** Zustand (v5) for managing chat history and PDF viewer state.
* **Animations:** Framer Motion
* **PDF Rendering:** `react-pdf` & `pdfjs-dist`
* **Markdown:** `react-markdown` with `remark-gfm`

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ (Recommended for Next.js 16)
* The Backend API running locally (usually at `http://localhost:8000`)

### 1. Installation

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install