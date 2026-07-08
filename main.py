import os
from resume_reader import read_resume
from screening import calculate_match

# Read job description
with open("job_description.txt", "r") as file:
    required_skills = file.readlines()

# Read resume

for file in os.listdir("resumes"):
    if file.endswith(".pdf"):
        print("\n" + "=" * 50)
        print("Resume:", file)
        print("=" * 50)

        resume_text = read_resume(f"resumes/{file}")

        percentage, matched, missing = calculate_match(
            resume_text,
            required_skills
        )

        print(f"Match Percentage: {percentage:.2f}%")

        print("\nMatched Skills:")
        for skill in matched:
            print("-", skill)

        print("\nMissing Skills:")
        for skill in missing:
            print("-", skill)

        if percentage >= 70:
            print("\nStatus: SELECTED")
        else:
            print("\nStatus: REJECTED")
# Calculate match

for file in os.listdir("resumes"):
    if file.endswith(".pdf"):
        print("\n" + "=" * 50)
        print("Resume:", file)
        print("=" * 50)

        resume_text = read_resume(f"resumes/{file}")

        percentage, matched, missing = calculate_match(
            resume_text,
            required_skills
        )

        print(f"Match Percentage: {percentage:.2f}%")

        print("\nMatched Skills:")
        for skill in matched:
            print("-", skill)

        print("\nMissing Skills:")
        for skill in missing:
            print("-", skill)

        if percentage >= 70:
            print("\nStatus: SELECTED")
        else:
            print("\nStatus: REJECTED")