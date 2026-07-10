def calculate_match(resume_text, required_skills):
    resume_text = resume_text.lower()

    matched_skills = []
    missing_skills = []

    # Clean and filter out empty or whitespace-only skills
    cleaned_skills = [skill.strip() for skill in required_skills if skill.strip()]

    if not cleaned_skills:
        return 0.0, [], []

    for skill in cleaned_skills:
        if skill.lower() in resume_text:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    total_skills = len(cleaned_skills)
    matched_count = len(matched_skills)

    match_percentage = (matched_count / total_skills) * 100

    return match_percentage, matched_skills, missing_skills