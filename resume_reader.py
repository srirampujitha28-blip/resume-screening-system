import re
import pdfplumber
from docx import Document

def read_resume(file_path):
    text = ""

    if file_path.endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"

    return text

def extract_candidate_name(resume_text):
    """
    Attempts to extract the candidate's name from the top lines of a resume.
    Uses regex patterns to identify a typical capitalization format and skip meta details.
    """
    if not resume_text:
        return "Unknown"
        
    # Split text into non-empty, trimmed lines
    lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
    
    # Check if name is explicitly labeled first (e.g. "Name: Jane Doe")
    for line in lines[:10]:
        if line.lower().startswith("name:"):
            return line[5:].strip()
            
    # Scan the first 5 lines to find a line that looks like a name
    for line in lines[:5]:
        # Skip common contact metadata, section headers, or very long/short lines
        if ("@" in line or 
            re.search(r'\+?\d[\d\s\(\)-]{8,}', line) or 
            any(keyword in line.lower() for keyword in ["resume", "cv", "curriculum", "profile", "summary", "experience", "education"]) or
            ":" in line or
            len(line) < 3 or 
            len(line) > 30):
            continue
            
        # Match standard English name pattern (e.g., John Doe, Alice M. Smith)
        if re.match(r'^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z.]+)+$', line):
            return line
            
        # Fallback: first reasonable line as candidate name
        if 3 < len(line) < 24:
            return line
            
    return "Unknown"