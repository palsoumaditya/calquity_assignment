import os
import asyncio
import random
from typing import List, Dict
import google.generativeai as genai
from pdf import extract_pdf_text

# Global storage
PDF_PATH = "sample.pdf"
pdf_content = []

def load_pdf_content(specific_path: str = None):
    """
    Loads PDF content into memory.
    If specific_path is provided, it loads that file.
    Otherwise, it loads the default sample.pdf.
    """
    global pdf_content
    # Use provided path or default to global PDF_PATH
    file_path = specific_path if specific_path else os.path.join(os.getcwd(), PDF_PATH)
    
    if os.path.exists(file_path):
        try:
            # Clear old content
            pdf_content = extract_pdf_text(file_path)
            print(f" PDF Loaded: {len(pdf_content)} pages.")
            return True
        except Exception as e:
            print(f" Error reading PDF: {e}")
            return False
    else:
        print(f" ERROR: PDF not found at {file_path}")
        return False

def search_pdf(query: str) -> List[Dict]:
    """
    Searches PDF for keywords and extracts a relevant snippet context 
    around the match for highlighting.
    """
    results = []
    terms = query.lower().split()
    
    for page in pdf_content:
        score = 0
        text_lower = page['text'].lower()
        snippet = ""
        
        # Simple scoring and snippet extraction
        for term in terms:
            if term in text_lower:
                score += 1
                # Find the term index to extract context (approx 100 chars around it)
                idx = text_lower.find(term)
                start = max(0, idx - 50)
                end = min(len(page['text']), idx + 100)
                # Get original casing text for snippet
                snippet = page['text'][start:end].replace("\n", " ") + "..."

        if score > 0:
            results.append({
                "page": page['page'], 
                "text": page['text'][:1000], # Context for LLM
                "snippet": snippet or page['text'][:100], # Snippet for Highlighter
                "score": score
            })
            
    return sorted(results, key=lambda x: x['score'], reverse=True)[:3]

def get_working_model():
    """Finds the first model that supports content generation."""
    try:
        # Prefer flash models for speed
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if 'flash' in m.name:
                    return m.name
        
        # Fallback to any generic model
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if 'gemini' in m.name:
                    return m.name
                
    except Exception as e:
        print(f"Error listing models: {e}")
    
    return "gemini-1.5-flash"

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
        
        model_name = get_working_model()
        print(f"Using Gemini Model: {model_name}") 
        
        model = genai.GenerativeModel(model_name)

        # 1. Searching Tool Event
        yield {"type": "tool", "name": "searching_documents"}
        await asyncio.sleep(0.5)
        
        context_pages = search_pdf(query)
        
        # Fallback if no exact match found
        if not context_pages:
             print(f"No exact keywords for '{query}'. Using summary mode.")
             context_pages = pdf_content[:3] 
             for p in context_pages:
                 p['snippet'] = "Overview of page content..."

        context_text = "\n\n".join([f"Page {p['page']}: {p['text']}" for p in context_pages])
        
        # 2. Analyzing Tool Event
        yield {"type": "tool", "name": "analyzing_content"}
        await asyncio.sleep(0.5)

        # 3. Ask AI to generate components based on the content
        import json
        import re
        
        component_prompt = f"""Analyze the following document context and user query, then generate structured UI components in JSON format.

Context:
{context_text[:4000]}

User Query: {query}

Based on the content, generate appropriate UI components. Return ONLY a valid JSON object with this structure:
{{
  "info_card": {{
    "title": "Summary title based on content",
    "details": ["key insight 1", "key insight 2", "key insight 3"]
  }},
  "data_table": {{
    "title": "Relevant data extracted from document",
    "headers": ["Column1", "Column2", "Column3"],
    "rows": [
      ["data1", "data2", "data3"]
    ]
  }},
  "risk_chart": {{
    "title": "Chart showing relevant metrics",
    "labels": ["Category1", "Category2", "Category3"],
    "values": [percentage1, percentage2, percentage3]
  }}
}}

Guidelines:
- For risk-related queries: Focus on risk_chart with actual risk categories and percentages from the document
- For financial queries: Create data_table with financial metrics
- For summary queries: Create info_card with key points
- Extract REAL data from the document, don't make up numbers
- Return ONLY valid JSON, no markdown, no explanations"""

        components_sent = False
        
        try:
            # Generate components using AI
            component_response = await model.generate_content_async(component_prompt)
            component_text = component_response.text.strip()
            
            # Clean up the response - remove markdown code blocks
            component_text = re.sub(r'^```json\s*', '', component_text)
            component_text = re.sub(r'^```\s*', '', component_text)
            component_text = re.sub(r'```\s*$', '', component_text)
            component_text = component_text.strip()
            
            # Try to extract JSON if wrapped in other text
            json_match = re.search(r'\{.*\}', component_text, re.DOTALL)
            if json_match:
                component_text = json_match.group(0)
            
            components_data = json.loads(component_text)
            
            # Send Info Card if available and has valid data
            if "info_card" in components_data and components_data["info_card"]:
                info_data = components_data["info_card"]
                if isinstance(info_data, dict) and "title" in info_data and "details" in info_data:
                    yield {
                        "type": "component",
                        "name": "info_card",
                        "data": info_data
                    }
                    components_sent = True
                    await asyncio.sleep(0.2)
            
            # Send Data Table if available and has valid data
            if "data_table" in components_data and components_data["data_table"]:
                table_data = components_data["data_table"]
                if isinstance(table_data, dict) and "headers" in table_data and "rows" in table_data:
                    yield {
                        "type": "component",
                        "name": "data_table",
                        "data": table_data
                    }
                    components_sent = True
                    await asyncio.sleep(0.2)
            
            # Send Risk Chart if available and has valid data
            if "risk_chart" in components_data and components_data["risk_chart"]:
                chart_data = components_data["risk_chart"]
                if isinstance(chart_data, dict) and "labels" in chart_data and "values" in chart_data:
                    # Ensure values are numbers
                    if isinstance(chart_data["values"], list):
                        chart_data["values"] = [int(v) if isinstance(v, (int, float)) else 0 for v in chart_data["values"]]
                    yield {
                        "type": "component",
                        "name": "risk_chart",
                        "data": chart_data
                    }
                    components_sent = True
                    await asyncio.sleep(0.2)
                    
        except json.JSONDecodeError as e:
            print(f"JSON parsing error for components: {e}")
            if 'component_text' in locals():
                print(f"Response was: {component_text[:500]}")
        except Exception as e:
            print(f"Error generating components: {e}")
            import traceback
            traceback.print_exc()
        
        # Send fallback info card only if no components were successfully sent
        if not components_sent:
            yield {
                "type": "component",
                "name": "info_card",
                "data": {
                    "title": "Document Analysis",
                    "details": [
                        f"Scanned {len(pdf_content)} pages",
                        f"Identified {len(context_pages)} relevant sections",
                        "Analyzing content and generating insights..."
                    ]
                }
            }

        prompt = f"""You are a helpful AI assistant. Answer based ONLY on the context below.
        Cite pages like [1] where possible.
        
        Context:
        {context_text}

        User Question: {query}
        """

        # 6. Stream Text
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield {"type": "text", "content": chunk.text}

        # 7. Citations with Snippets
        for page in context_pages[:3]:
            yield {
                "type": "citation", 
                "page": page['page'], 
                "snippet": page['snippet']
            }

    except Exception as e:
        print(f"Gemini Error: {e}")
        yield {"type": "error", "content": f"AI Error: {str(e)}"}