# AI Resume Screening System

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, AI-powered Resume Screening System designed to parse, analyze, and match candidate resumes against specific job description criteria. The system calculates matching percentages, categorizes candidate statuses, identifies matched and missing skills, and extracts candidate names.

To cater to different developer and business needs, this project comes built with **four distinct user interfaces**:
1. **Client-Side Web Dashboard** (Interactive HTML/CSS/JavaScript with local PDF parsing via PDF.js)
2. **Streamlit Web Application** (Modern Python-based dashboard for interactive uploads)
3. **Tkinter Desktop GUI** (Desktop app built in Python, saving automated results to an Excel spreadsheet)
4. **Command Line Interface (CLI)** (Batch processing engine for fast scanning of resumes)

---
## Live demo
https://srirampujitha28-blip-resume-screening-system-app-wkq1vt.streamlit.app/

## 🌟 Key Features

* **Multi-Format Parsing**: Extracts text from both PDF (`.pdf`) and Microsoft Word (`.docx`) documents.
* **Flexible UI Options**: Access the application via Web, Desktop, Streamlit, or Terminal interface.
* **Intelligent Skill Matching**: Evaluates resumes against target requirements defined by the hiring manager.
* **Real-time Extraction**: The Web Interface extracts skills automatically from job descriptions using a predefined technical skill dictionary.
* **Smart Name Extraction**: Automatically detects the candidate's name using heuristic name-matching regex.
* **Candidate Classification**: Labels profiles based on their match score:
  - **Strong Match** (Score $\ge$ 70%): Candidate recommended for immediate technical review.
  - **Potential Fit** (Score 40% - 69%): Candidate requires manual check of transferable skills.
  - **Weak Match** (Score < 40%): Candidate profile has low alignment.
* **Spreadsheet Reporting**: The Tkinter GUI exports candidate names, match percentages, and final recommendations directly to a structured Excel spreadsheet (`results.xlsx`).

---

## 🛠️ Technologies Used

### Frontend (Web UI)
* **HTML5 & Vanilla CSS3**: Sleek, responsive grid-based UI incorporating premium dark mode elements, gradients, and micro-interactions.
* **Vanilla JavaScript (ES6)**: Real-time skill extraction, state management, and score progress ring animations.
* **PDF.js (Mozilla)**: Parses binary PDF buffers directly in the browser, enabling **100% client-side, serverless, and private resume processing**.

### Backend & Python Scripts
* **Streamlit**: Python web app engine for simple, fast dashboard generation.
* **Tkinter**: Built-in Python GUI framework for the desktop experience.
* **pdfplumber**: Rich text extractor for PDF documents.
* **python-docx**: Library for reading Word Document formats.
* **openpyxl**: Reads/writes Excel spreadsheet reports.

---

## 📁 Project Structure

```text
├── resumes/                      # Folder containing candidate resumes (.pdf, .docx)
│   ├── sample_resume.pdf
│   ├── text_resume.pdf
│   └── resume1.pdf.docx
├── app.js                        # Main JavaScript file containing client-side matching algorithms
├── app.py                        # Streamlit web app interface
├── gui.py                        # Tkinter Desktop GUI interface
├── index.html                    # Client-side web dashboard page
├── job_description.txt           # Input file containing required skills (one per line)
├── main.py                       # CLI batch screening script
├── requirements.txt              # Python library dependencies
├── resume_reader.py              # Parsing module for PDF/DOCX and candidate name extraction
├── save_results.py               # Utility to log screening results to results.xlsx
├── screening.py                  # Matching algorithm and candidate scoring calculations
├── styles.css                    # Modern UI styles, typography, and responsive grid layouts
└── .gitignore                    # Prevents build files and logs from being committed
```

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/resume-screening-system.git
cd resume-screening-system
```

### 2. Configure Virtual Environment (Recommended)
Set up a clean environment to install requirements:
```bash
# Create environment
python -m venv venv

# Activate on Windows (Command Prompt)
venv\Scripts\activate
# Activate on Windows (PowerShell)
.\venv\Scripts\activate.ps1
# Activate on macOS/Linux
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

---

## 📖 Usage Instructions

Before running the Python interfaces, edit `job_description.txt` to contain your target skills (list one skill per line, e.g. `Python`, `SQL`, `Docker`).

### 1. Client-Side Web Dashboard
The Web UI is fully self-contained and does not require a running backend server.
* Open `index.html` in any web browser.
* Paste your job description. The interface will extract keywords dynamically in real time.
* Drag and drop a PDF resume or browse/upload a file.
* Click **Screen Resume** to view the score, status, detailed skill analysis, and resume preview.

### 2. Streamlit Web App
Streamlit offers an interactive web experience running on your local machine:
```bash
streamlit run app.py
```
* Upload PDF or Word format resumes using the drag-and-drop uploader.
* View match scores, status updates, and visual column breakdowns of matched vs. missing skills instantly.

### 3. Tkinter Desktop GUI
```bash
python gui.py
```
* Click **📂 Upload Resume** to select a PDF or Word document.
* The application processes the document, performs matches, displays results, and saves the outcome automatically to `results.xlsx` in the project directory.

### 4. CLI Batch Screening Script
Perfect for automated, high-throughput parsing of multiple resumes placed in the `resumes/` folder:
```bash
python main.py
```
* Reads all `.pdf` and `.docx` files in the `resumes/` directory, checks them against `job_description.txt`, and logs structured results directly to the terminal.

---

## 📈 Matchmaking Logic & Rules

Match percentages are calculated using case-insensitive matching logic:
$$\text{Match \%} = \left( \frac{\text{Skills Matched}}{\text{Total Skills Specified}} \right) \times 100$$

### Decision Tree:
* **Match $\ge$ 70%** $\rightarrow$ **SELECTED** (Strong Candidate)
* **Match 40% - 69%** $\rightarrow$ **POTENTIAL FIT** (Requires Manual Review)
* **Match < 40%** $\rightarrow$ **REJECTED** (Weak Candidate Alignment)

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
