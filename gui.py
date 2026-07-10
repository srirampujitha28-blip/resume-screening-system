from save_results import save_result
import tkinter as tk
from tkinter import filedialog

from resume_reader import read_resume, extract_candidate_name
from screening import calculate_match

# Read Job Description
with open("job_description.txt", "r") as file:
    required_skills = file.readlines()


def upload_resume():
    file_path = filedialog.askopenfilename(
        title="Select Resume",
        filetypes=[
            ("Supported Files", ("*.pdf", "*.docx")),
            ("PDF Files", "*.pdf"),
            ("Word Files", "*.docx"),
            ("All Files", "*.*")
        ]
    )

    if file_path:

        print("Step 1: Resume Selected")

        # Read Resume
        resume_text = read_resume(file_path)

        print("Step 2: Resume Read Successfully")
        print(resume_text)

        # Candidate Name
        candidate_name = extract_candidate_name(resume_text)

        print("Step 3: Calculating Match")

        # Calculate Match
        percentage, matched, missing = calculate_match(
            resume_text,
            required_skills
        )

        # Candidate Status
        if percentage >= 40:
            status = "SELECTED"
        else:
            status = "REJECTED"

        # Save Result
        save_result(candidate_name, file_path, percentage, status)

        # Display Result
        result = f"""
Candidate Name : {candidate_name}

Match Percentage : {percentage:.2f}%

Matched Skills:
{', '.join(matched)}

Missing Skills:
{', '.join(missing)}

Status : {status}
"""

        result_label.config(text=result)


# ---------------- GUI ----------------

window = tk.Tk()
window.title("AI Resume Screening System")
window.geometry("700x500")
window.configure(bg="#EAF2F8")

title = tk.Label(
    window,
    text="AI Resume Screening System",
    font=("Arial", 22, "bold"),
    bg="#EAF2F8",
    fg="navy"
)
title.pack(pady=20)

btn = tk.Button(
    window,
    text="📂 Upload Resume",
    font=("Arial", 14, "bold"),
    bg="#3498DB",
    fg="white",
    padx=20,
    pady=10,
    command=upload_resume
)
btn.pack(pady=20)

reset_btn = tk.Button(
    window,
    text="🔄 Reset",
    font=("Arial", 14, "bold"),
    bg="#E74C3C",
    fg="white",
    padx=20,
    pady=10,
    command=lambda: result_label.config(text="Result will appear here")
)
reset_btn.pack(pady=10)

result_label = tk.Label(
    window,
    text="Result will appear here",
    font=("Arial", 14),
    bg="#EAF2F8",
    justify="left"
)
result_label.pack(pady=20)

window.mainloop()