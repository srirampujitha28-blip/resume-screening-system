import streamlit as st
from resume_reader import read_resume
from screening import calculate_match

# Page Title
st.set_page_config(page_title="Resume Screening System")

st.title("📄 AI Resume Screening System")

st.write("Upload a resume and check the match percentage.")

# Read Job Description
with open("job_description.txt", "r") as file:
    required_skills = file.readlines()

uploaded_file = st.file_uploader(
    "Upload Resume",
    type=["pdf", "docx"]
)

if uploaded_file is not None:

    # Save uploaded file temporarily
    with open(uploaded_file.name, "wb") as f:
        f.write(uploaded_file.getbuffer())

    resume_text = read_resume(uploaded_file.name)

    percentage, matched, missing = calculate_match(
        resume_text,
        required_skills
    )

    st.subheader("Screening Result")

    st.write(f"### Match Percentage: {percentage:.2f}%")

    st.write("### ✅ Matched Skills")
    st.write(matched)

    st.write("### ❌ Missing Skills")
    st.write(missing)

    if percentage >= 40:
        st.success("Status: SELECTED ✅")
    else:
        st.error("Status: REJECTED ❌")