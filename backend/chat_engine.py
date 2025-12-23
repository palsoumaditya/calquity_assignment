import os
import asyncio
from typing import List, Dict
import google.generativeai as genai
from pdf import extract_pdf_text

# Global storage
PDF_PATH = "sample.pdf"
pdf_content = []

def load_pdf_content():
    global pdf_content
    file_path = os.path.join(os.getcwd(), PDF_PATH)
    
    if os.path.exists(file_path):
        try:
            pdf_content = extract_pdf_text(file_path)
            print(f"✅ PDF Loaded: {len(pdf_content)} pages.")
        except Exception as e:
            print(f"❌ Error reading PDF: {e}")
    else:
        print(f"❌ ERROR: 'sample.pdf' not found at {file_path}")

def search_pdf(query: str) -> List[Dict]:
    results = []
    terms = query.lower().split()
    
    for page in pdf_content:
        score = 0
        text_lower = page['text'].lower()
        for term in terms:
            if term in text_lower:
                score += 1
        
        if score > 0:
            results.append({"page": page['page'], "text": page['text'][:1000], "score": score})
            
    return sorted(results, key=lambda x: x['score'], reverse=True)[:3]

# ---------------------------------------------------------
# ✅ NEW: Function to automatically find a working model
# ---------------------------------------------------------
def get_working_model():
    """Finds the first model that supports content generation."""
    try:
        # List all models available to your key
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                # Prefer Flash or Pro if available
                if 'flash' in m.name or 'pro' in m.name:
                    return m.name
        
        # If no specific one found, return the very first one that works
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                return m.name
                
    except Exception as e:
        print(f"Error listing models: {e}")
    
    # Ultimate fallback
    return "gemini-pro"

async def chat_generator(query: str, job_id: str):
    if not pdf_content:
        yield {"type": "error", "content": "Server Error: PDF not loaded."}
        return

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        yield {"type": "error", "content": "Missing API Key."}
        return

    try:
        genai.configure(api_key=api_key)
        
        # ✅ Auto-select the correct model
        model_name = get_working_model()
        print(f"🤖 Using Gemini Model: {model_name}") # Debug print
        
        model = genai.GenerativeModel(model_name)

        # 1. Searching
        yield {"type": "tool", "name": "searching_documents"}
        await asyncio.sleep(0.5)
        
        context_pages = search_pdf(query)
        
        # Fallback if no exact match found
        if not context_pages:
             print(f"⚠️ No exact keywords for '{query}'. Using summary mode.")
             context_pages = pdf_content[:3] 

        context_text = "\n\n".join([f"Page {p['page']}: {p['text']}" for p in context_pages])
        
        # 2. Analyzing
        yield {"type": "tool", "name": "analyzing_content"}
        await asyncio.sleep(0.5)

        prompt = f"""You are a helpful AI assistant. Answer based ONLY on the context below.
        Cite pages like [1] where possible.
        
        Context:
        {context_text}

        User Question: {query}
        """

        # 3. Stream Text
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield {"type": "text", "content": chunk.text}

        # 4. Citations
        for page in context_pages[:3]:
            yield {"type": "citation", "page": page['page']}

    except Exception as e:
        print(f"Gemini Error: {e}")
        yield {"type": "error", "content": f"AI Error: {str(e)}"}