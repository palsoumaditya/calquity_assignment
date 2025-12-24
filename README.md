# CalQuity AI Search Chat & PDF Citation Viewer

A production-ready, full-stack AI search interface inspired by Perplexity. This application features real-time streaming of AI responses, generative UI components, and an interactive PDF viewer that highlights cited sources.

## 🚀 Project Overview

This project implements a sophisticated RAG (Retrieval-Augmented Generation) style chat interface. It is designed to handle complex user queries by processing documents and providing evidence-based answers with direct citations.

**Key Features:**
* **Perplexity-Style Chat:** Clean interface with real-time text streaming and typing indicators.
* **Generative UI:** Dynamically streams UI components (charts, cards, tables) alongside text responses.
* **Interactive Citations:** Inline citations (`[1]`, `[2]`) that users can click to verify sources.
* **Split-View PDF Viewer:** Smoothly transitions to a PDF viewer that automatically scrolls to and highlights the referenced text.
* **Reasoning Transparency:** Displays "Tool Call" indicators to show users what the AI is thinking (e.g., "Searching documents...", "Analyzing results").

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Styling:** Tailwind CSS v4
* **State Management:** Zustand
* **PDF Rendering:** React-PDF & PDF.js
* **Animations:** Framer Motion

### Backend
* **Framework:** Python FastAPI
* **Language:** Python 3.11+
* **AI Model:** Google Gemini (via `google-generativeai`)
* **Concurrency:** Server-Sent Events (SSE) for streaming
* **PDF Processing:** `pdfplumber`

### DevOps
* **Containerization:** Docker & Docker Compose

---

## 🏗️ Architecture Overview

The application follows a modern asynchronous architecture to ensure the UI remains responsive while handling heavy AI processing tasks.

1.  **Request Flow:** The User submits a query via the **Next.js Frontend**.
2.  **Job Queue:** The **FastAPI Backend** receives the request and manages it via an async job queue (`stream.py`).
3.  **Processing:** A background worker searches the PDF documents and queries Google Gemini for an answer.
4.  **Streaming:** The backend streams the results (text chunks, tool calls, and UI components) back to the frontend in real-time using **Server-Sent Events (SSE)**.
5.  **Rendering:** The frontend progressively renders the text and generative UI components as data arrives.

---

## ⚙️ Setup Instructions

You can run the entire stack using Docker (recommended) or set up each service manually.

### Prerequisites
* Docker & Docker Compose (for Docker method)
* Node.js 18+ and Python 3.11+ (for manual method)
* A Google Gemini API Key

### Option 1: Quick Start (Docker)
This allows you to spin up the frontend and backend with a single command.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/calquity-ai-search.git](https://github.com/your-username/calquity-ai-search.git)
    cd calquity-ai-search
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root directory containing your API key:
    ```ini
    GEMINI_API_KEY=your_google_gemini_key
    ```

3.  **Build and Run:**
    ```bash
    docker-compose up --build
    ```
    * The Backend will start on port `8000`.
    * The Frontend will start on port `3000`.

4.  Access the app at `http://localhost:3000`.

### Option 2: Manual Setup

#### Backend Setup
1.  Navigate to `/backend`:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Set your API key in a `.env` file or export it:
    ```bash
    export GEMINI_API_KEY=your_key
    ```
5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```

#### Frontend Setup
1.  Navigate to `/frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:3000`.

---

## 🔑 Environment Variables

**Root / Backend (`.env`):**
* `GEMINI_API_KEY`: Your Google Gemini API key.

**Frontend (`docker-compose.yml` defaults):**
* `NEXT_PUBLIC_API_URL`: The URL of the backend (default: `http://localhost:8000`).

---

## 💡 Design Decisions

### Next.js 16 & React 19
We utilized the latest versions of Next.js and React to leverage the newest server-side rendering capabilities and performance optimizations provided by the App Router and React Server Components.

### Tailwind CSS v4
The project uses Tailwind v4 for a highly optimized, zero-runtime CSS-in-JS experience, configured via `@tailwindcss/postcss`.

### Generative UI Implementation
Instead of sending raw text, the backend streams structured data. The frontend parses this stream to decide whether to render a Markdown text block, a Chart component, or a "Thinking" indicator. This separates the logic: the backend decides *what* to show, and the frontend decides *how* to show it.

---



* **Streaming Interface:** [GIF showing text and UI streaming]
* **PDF Transition:** [GIF showing the split-view animation]
* **Tool Usage:** [Image showing "Searching documents..." reasoning step]

---

*This project was built as a Take-Home Assignment for the Full Stack AI Developer role.*