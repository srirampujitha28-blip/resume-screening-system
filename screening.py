def calculate_match(resume_text, required_skills):
    resume_text = resume_text.lower()

    matched_skills = []
    missing_skills = []

    for skill in required_skills:
        skill = skill.strip()

        if skill.lower() in resume_text:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    total_skills = len(required_skills)
    matched_count = len(matched_skills)

    match_percentage = (matched_count / total_skills) * 100

    return match_percentage, matched_skills, missing_skills