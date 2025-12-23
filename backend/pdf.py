import pdfplumber
from typing import List, Dict

def extract_pdf_text(path: str) -> List[Dict]:
    pages = []

    with pdfplumber.open(path) as pdf:
        for index, page in enumerate(pdf.pages):
            pages.append({
                "page": index + 1,
                "text": page.extract_text() or ""
            })

    return pages
