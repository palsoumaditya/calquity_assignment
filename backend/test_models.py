import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in .env")
else:
    print(f"✅ Key found: {api_key[:10]}...")
    try:
        genai.configure(api_key=api_key)
        print("🔍 Listing available models for this key...")
        
        found_any = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"   - {m.name}")
                found_any = True
        
        if not found_any:
            print("⚠️ No generateContent models found. Your API key might be invalid or region-blocked.")
    except Exception as e:
        print(f"❌ Connection Error: {e}")