import os
from resume_reader import read_resume, extract_candidate_name
from screening import calculate_match

# Read job description
job_desc_path = "job_description.txt"
if not os.path.exists(job_desc_path):
    print(f"Error: Job description file '{job_desc_path}' not found.")
    exit(1)

with open(job_desc_path, "r") as file:
    required_skills = file.readlines()

resumes_dir = "resumes"
if not os.path.exists(resumes_dir):
    print(f"Error: Resumes directory '{resumes_dir}' not found. Creating it...")
    os.makedirs(resumes_dir)

# Scan resumes
files_to_scan = [f for f in os.listdir(resumes_dir) if f.endswith((".pdf", ".docx"))]

if not files_to_scan:
    print(f"No PDF or DOCX resumes found in '{resumes_dir}' folder.")
else:
    print(f"Found {len(files_to_scan)} resume(s) in '{resumes_dir}'. Starting screening...")
    
    for filename in files_to_scan:
        print("\n" + "=" * 60)
        print("Resume File:", filename)
        print("=" * 60)

        file_path = os.path.join(resumes_dir, filename)
        resume_text = read_resume(file_path)
        
        candidate_name = extract_candidate_name(resume_text)
        print(f"Candidate Name: {candidate_name}")

        percentage, matched, missing = calculate_match(
            resume_text,
            required_skills
        )

        print(f"Match Percentage: {percentage:.2f}%")

        print("\nMatched Skills:")
        if matched:
            for skill in matched:
                print("-", skill)
        else:
            print("(None)")

        print("\nMissing Skills:")
        if missing:
            for skill in missing:
                print("-", skill)
        else:
            print("(None)")

        if percentage >= 70:
            print("\nStatus: SELECTED [Strong Match]")
        elif percentage >= 40:
            print("\nStatus: POTENTIAL FIT [Moderate Match]")
        else:
            print("\nStatus: REJECTED [Weak Match]")
    print("\nScreening complete.")