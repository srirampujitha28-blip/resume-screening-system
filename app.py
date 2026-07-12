# pyrefly: ignore [missing-import]
import streamlit as st
import os
from resume_reader import read_resume, extract_candidate_name
from screening import calculate_match

# Page Title
st.set_page_config(page_title="Resume Screening System")

st.title("📄  Resume Screening System")

st.write("Upload a resume and check the match percentage.")

# Read Job Description
job_desc_path = "job_description.txt"
if not os.path.exists(job_desc_path):
    st.error(f"Job Description file '{job_desc_path}' not found! Please create it.")
    required_skills = []
else:
    with open(job_desc_path, "r") as file:
        required_skills = file.readlines()

uploaded_file = st.file_uploader(
    "Upload Resume",
    type=["pdf", "docx"]
)

if uploaded_file is not None and required_skills:
    # Save uploaded file temporarily
    temp_path = uploaded_file.name
    with open(temp_path, "wb") as f:
        f.write(uploaded_file.getbuffer())

    try:
        resume_text = read_resume(temp_path)
    finally:
        # Clean up temp file immediately after reading
        if os.path.exists(temp_path):
            os.remove(temp_path)

    candidate_name = extract_candidate_name(resume_text)
    
    percentage, matched, missing = calculate_match(
        resume_text,
        required_skills
    )

    st.subheader("Screening Result")
    
    st.write(f"**Candidate Name:** {candidate_name}")
    st.write(f"### Match Percentage: {percentage:.2f}%")

    col1, col2 = st.columns(2)
    with col1:
        st.write("### ✅ Matched Skills")
        if matched:
            for skill in matched:
                st.write(f"- {skill}")
        else:
            st.write("None")
            
    with col2:
        st.write("### ❌ Missing Skills")
        if missing:
            for skill in missing:
                st.write(f"- {skill}")
        else:
            st.write("None (100% Match!)")

    if percentage >= 70:
        st.success("Status: SELECTED ✅ (Strong Match)")
    elif percentage >= 40:
        st.warning("Status: POTENTIAL FIT ⚠️ (Moderate Match)")
    else:
        st.error("Status: REJECTED ❌ (Weak Match)")
