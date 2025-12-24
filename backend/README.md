# CalQuity AI Search - Backend API

The backend for the CalQuity AI Search application is a high-performance, asynchronous REST API built with **FastAPI**. It handles PDF processing, manages Retrieval-Augmented Generation (RAG) pipelines, and streams AI responses with citations and generative UI components using Server-Sent Events (SSE).

## ⚡ Key Features

* **FastAPI Framework:** High-performance, easy-to-use Python web framework.
* **RAG Pipeline:** Ingests PDF documents, extracts text via `pdfplumber`, and performs semantic search to ground AI responses.
* **Google Gemini Integration:** Utilizes `google-generativeai` (Gemini Pro/Flash) for high-quality, context-aware answers.
* **Asynchronous Job Queue:** Implements an in-memory `asyncio.Queue` system to handle concurrent chat requests without blocking the main server thread.
* **Real-time Streaming:** Uses Server-Sent Events (SSE) to stream text, tool calls, and UI components to the frontend.
* **Diagnostics:** Includes utility scripts to verify API key connectivity and model availability.
* **Dockerized:** Ready for containerized deployment.

---

## 🛠️ Tech Stack

* **Language:** Python 3.11+
* **Framework:** FastAPI + Uvicorn
* **AI/LLM:** Google Gemini (`google-generativeai`)
* **PDF Processing:** `pdfplumber`
* **Validation:** Pydantic
* **Environment:** `python-dotenv`

---

## 🚀 Getting Started

### Prerequisites

* Python 3.11 or higher
* A Google Gemini API Key (Get one [here](https://aistudio.google.com/))

### 1. Installation

Navigate to the `backend` directory and set up a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate