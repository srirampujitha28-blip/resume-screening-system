/**
 * AI Resume Screening System - Main JavaScript Application
 * 
 * This file contains the complete logic for:
 * 1. Initializing PDF.js for client-side PDF parsing.
 * 2. Extracting text from PDF files using FileReader and PDF.js API.
 * 3. Standard skill dictionary and automatic skill extraction from Job Descriptions.
 * 4. Case-insensitive skill matching and match percentage calculations.
 * 5. Formatting dynamic results (circular score progress, badges, recommendations).
 * 6. Responsive UI event handlers (drag-and-drop, modals, accordion).
 */

// Global Error Handler to display errors directly on the UI for easier debugging
window.onerror = function (message, source, lineno, colno, error) {
    const errorBanner = document.createElement("div");
    errorBanner.style.position = "fixed";
    errorBanner.style.top = "20px";
    errorBanner.style.left = "50%";
    errorBanner.style.transform = "translateX(-50%)";
    errorBanner.style.backgroundColor = "#ef4444";
    errorBanner.style.color = "#ffffff";
    errorBanner.style.padding = "14px 28px";
    errorBanner.style.borderRadius = "8px";
    errorBanner.style.zIndex = "100000";
    errorBanner.style.fontWeight = "600";
    errorBanner.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
    errorBanner.style.fontFamily = "sans-serif";
    errorBanner.style.fontSize = "0.95rem";
    errorBanner.innerHTML = `⚠️ System Error: ${message} (Line ${lineno}:${colno})`;
    document.body.appendChild(errorBanner);
    console.error("Global Error caught:", error);
};

// Configure PDF.js Worker. A worker is an independent background script 
// that handles heavy tasks like decoding and parsing PDF binary data.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

/* ==========================================================================
   1. GLOBAL STATE & DICTIONARIES
   ========================================================================== */

// Predefined dictionary of 150+ common skills (technical, concepts, and soft skills)
// used to automatically scan the Job Description.
const SKILL_DICTIONARY = [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", 
    "Swift", "Go", "Rust", "Kotlin", "Scala", "R", "Bash", "Shell", "SQL", 
    "HTML", "CSS", "Sass", "Less", "GraphQL", "Perl", "Julia", "MATLAB",

    // Frameworks & Libraries
    "React", "Angular", "Vue", "Next.js", "Nuxt.js", "Svelte", "Node.js", 
    "Express", "Koa", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", 
    "Hibernate", "ASP.NET", "Laravel", "Symfony", "Ruby on Rails", "Rails", 
    "jQuery", "Bootstrap", "Tailwind CSS", "Tailwind", "Material UI", "Chakra UI",
    "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Pandas", "NumPy", 
    "OpenCV", "Selenium", "Playwright", "Jest", "Mocha", "Cypress",

    // Databases & Cache
    "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Memcached", 
    "Oracle", "DynamoDB", "Firebase", "Firestore", "Cassandra", "MariaDB", 
    "Neo4j", "Elasticsearch",

    // Cloud, DevOps & Systems
    "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP", "Docker", 
    "Kubernetes", "Jenkins", "CI/CD", "Git", "GitHub", "GitLab", "Bitbucket", 
    "Terraform", "Ansible", "Linux", "Unix", "Nginx", "Apache", "Heroku", 
    "Netlify", "Vercel", "Kubectl", "System Administration",

    // Methodologies, Concepts & Fields
    "Agile", "Scrum", "Kanban", "SDLC", "OOP", "Functional Programming", 
    "TDD", "Test Driven Development", "Microservices", "Serverless", 
    "System Design", "REST API", "RESTful", "OAuth", "JWT", "Cryptography", 
    "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing", 
    "Computer Vision", "Data Science", "Artificial Intelligence", "AI", 
    "Data Structures", "Algorithms", "UI/UX", "UI Design", "UX Design", 
    "Responsive Design", "Object Oriented Programming", "Cyber Security", 
    "QA Testing", "Quality Assurance",

    // Business & Soft Skills
    "Project Management", "Communication", "Teamwork", "Collaboration", 
    "Leadership", "Problem Solving", "Analytical Skills", "Technical Support", 
    "Time Management", "Public Speaking", "Conflict Resolution", "Mentoring", 
    "Adaptability", "Technical Writing", "Creative Thinking", "Critical Thinking"
];

// Core Application State
let appState = {
    jobDescription: "",
    requiredSkills: new Set(), // Set ensures duplicate skills aren't added
    resumeText: "",
    fileName: "",
    candidateName: "Unknown",
    analysisCompleted: false
};

// Common English Stop Words to filter out when doing high-frequency keyword fallback extraction
const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "for", 
    "in", "on", "at", "with", "by", "of", "from", "as", "about", "into", "through", 
    "during", "including", "until", "against", "among", "throughout", "despite", 
    "towards", "upon", "concerning", "you", "your", "we", "our", "us", "they", 
    "them", "he", "she", "it", "i", "me", "my", "this", "that", "these", "those", 
    "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", 
    "can", "could", "may", "might", "must", "be", "been", "being", "want", "need", 
    "like", "looking", "seeking", "join", "team", "work", "experience", "years", 
    "role", "position", "candidate", "responsibilities", "requirements", "skills", 
    "job", "description", "plus", "required", "preferred", "strong", "excellent", 
    "ability", "knowledge", "understanding", "using", "working", "development", 
    "developer", "engineer", "designer", "manager", "lead", "senior", "junior", 
    "highly", "proficient", "highly-motivated"
]);

/* ==========================================================================
   2. DOM ELEMENT REFERENCES
   ========================================================================== */
const elements = {
    // Inputs
    jobInput: document.getElementById("job-description-input"),
    skillsBadgesContainer: document.getElementById("required-skills-badges"),
    addSkillBtn: document.getElementById("add-skill-btn"),
    fileInput: document.getElementById("file-input"),
    dropzone: document.getElementById("dropzone"),
    
    // Status/Progress
    uploadStatusCard: document.getElementById("upload-status-card"),
    fileNameLabel: document.getElementById("file-name"),
    uploadPercentLabel: document.getElementById("upload-percent"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    statusMessageLabel: document.getElementById("status-message"),
    
    // Primary Controls
    resetBtn: document.getElementById("reset-btn"),
    analyzeBtn: document.getElementById("analyze-btn"),
    
    // Results Layout Containers
    resultsEmptyState: document.getElementById("results-empty-state"),
    resultsDashboard: document.getElementById("results-dashboard"),
    
    // Scores and details
    scoreNumber: document.getElementById("score-number"),
    progressRingCircle: document.getElementById("progress-ring-circle"),
    matchStatusBadge: document.getElementById("match-status-badge"),
    matchedSkillsCount: document.getElementById("matched-skills-count"),
    candidateNameLabel: document.getElementById("detected-candidate-name"),
    recommendationContent: document.getElementById("recommendation-content"),
    
    // Skill matches columns
    matchedSkillsList: document.getElementById("matched-skills-list"),
    missingSkillsList: document.getElementById("missing-skills-list"),
    
    // Accordion Raw Text Viewer
    togglePreviewBtn: document.getElementById("toggle-preview-btn"),
    togglePreviewArrow: document.getElementById("toggle-preview-arrow"),
    resumeTextPreview: document.getElementById("resume-text-preview"),
    rawTextContent: document.getElementById("raw-text-content"),
    
    // Modals
    customSkillModal: document.getElementById("custom-skill-modal"),
    customSkillInput: document.getElementById("custom-skill-input"),
    modalCancelBtn: document.getElementById("modal-cancel-btn"),
    modalSubmitBtn: document.getElementById("modal-submit-btn")
};

/* ==========================================================================
   3. TEXT PARSING & SKILLS EXTRACTION HELPERS
   ========================================================================== */

/**
 * Escapes special regex characters in a string to safely use in RegExp constructors.
 * Required to support skills containing characters like C++, C#, .NET, etc.
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Performs a robust case-insensitive check to see if a skill is present in text.
 * Uses custom boundary checks instead of default '\b' to support special chars (e.g. C++).
 */
function checkSkillPresence(text, skill) {
    const escapedSkill = escapeRegExp(skill.toLowerCase());
    let regexStr = "";

    // 1. Handle starting boundary
    // If the skill starts with letters/digits (like "Java"), require a non-alphanumeric character 
    // or beginning of string before it (prevents matching "Java" in "Javascript").
    if (skill.charAt(0).match(/[a-zA-Z0-9]/)) {
        regexStr += '(?:^|[^a-zA-Z0-9])';
    }
    
    // Add the escaped skill itself
    regexStr += escapedSkill;

    // 2. Handle ending boundary
    // If the skill ends with letters/digits (like "React"), require a non-alphanumeric character
    // or end of string after it (prevents matching "React" in "Reaction").
    if (skill.charAt(skill.length - 1).match(/[a-zA-Z0-9]/)) {
        regexStr += '(?:$|[^a-zA-Z0-9])';
    }

    const regex = new RegExp(regexStr, 'i');
    return regex.test(text);
}

/**
 * Automatically extracts skills from the job description text.
 * Scans against standard dictionary, and falls back to frequency analysis if empty.
 */
function extractJobSkills(text) {
    const extracted = new Set();
    if (!text.trim()) return extracted;

    // Match against our standard 150+ skills dictionary
    SKILL_DICTIONARY.forEach(skill => {
        if (checkSkillPresence(text, skill)) {
            extracted.add(skill);
        }
    });

    // Fallback: If no dictionary skills match, extract high-frequency terms
    if (extracted.size === 0) {
        // Clean text: convert to lower, remove punctuation, split to words
        const words = text.toLowerCase()
            .replace(/[^\w\s-+#]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));
        
        // Count frequencies of words
        const frequencies = {};
        words.forEach(word => {
            frequencies[word] = (frequencies[word] || 0) + 1;
        });

        // Sort by frequency and take the top 8 words as fallback skills
        const topWords = Object.keys(frequencies)
            .sort((a, b) => frequencies[b] - frequencies[a])
            .slice(0, 8);

        // Capitalize the fallback keywords for professional badge representation
        topWords.forEach(word => {
            const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
            extracted.add(capitalized);
        });
    }

    return extracted;
}

/**
 * Attempts to extract the candidate's name from the top lines of a resume.
 */
function extractCandidateName(text) {
    if (!text) return "Unknown";
    
    // Split text into non-empty, trimmed lines
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    // Scan the first 5 lines to find a line that looks like a name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        
        // Skip common contact metadata, section headers, or very long lines
        if (line.includes('@') || 
            line.match(/\+?\d[\d\s\(\)-]{8,}/) || // phone patterns
            line.toLowerCase().includes('resume') || 
            line.toLowerCase().includes('curriculum') || 
            line.toLowerCase().includes('cv') || 
            line.toLowerCase().includes('profile') || 
            line.toLowerCase().includes('summary') || 
            line.toLowerCase().includes('experience') ||
            line.includes(':') ||
            line.length < 3 || 
            line.length > 30) {
            continue;
        }
        
        // A standard full name starts with capital letters (e.g. John Doe, Alice M. Smith)
        if (line.match(/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z.]+)+$/)) {
            return line;
        }
        
        // Fallback: If nothing fits, return the first reasonable-looking line as candidate name
        if (line.length > 3 && line.length < 24) {
            return line;
        }
    }
    
    return "Unknown (Candidate Name Not Found)";
}

/* ==========================================================================
   4. UI RENDERING & COMPONENT BUILDERS
   ========================================================================== */

/**
 * Renders the skill badges in the Job Description section.
 */
function renderRequiredSkillsBadges() {
    elements.skillsBadgesContainer.innerHTML = "";
    
    if (appState.requiredSkills.size === 0) {
        elements.skillsBadgesContainer.innerHTML = `
            <span class="badge-placeholder">Skills will automatically appear here once you type a job description...</span>
        `;
        return;
    }

    appState.requiredSkills.forEach(skill => {
        const badge = document.createElement("span");
        badge.className = "skill-badge";
        badge.innerHTML = `
            ${skill}
            <span class="badge-remove" data-skill="${skill}">&times;</span>
        `;
        elements.skillsBadgesContainer.appendChild(badge);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll(".badge-remove").forEach(button => {
        button.addEventListener("click", (e) => {
            const skillToRemove = e.target.getAttribute("data-skill");
            appState.requiredSkills.delete(skillToRemove);
            renderRequiredSkillsBadges();
            updateAnalyzeButtonState();
            
            // Re-run matching automatically if we have already compiled results
            if (appState.analysisCompleted) {
                runScreening();
            }
        });
    });
}

/**
 * Enables or disables the "Screen Resume" button depending on active inputs.
 */
function updateAnalyzeButtonState() {
    // Both requirements must be met: skills must be extracted AND resume text loaded
    const hasSkills = appState.requiredSkills.size > 0;
    const hasResume = appState.resumeText.trim().length > 0;
    
    elements.analyzeBtn.disabled = !(hasSkills && hasResume);
}

/**
 * Updates the visual SVG circular progress ring based on percentage.
 */
function setCircularProgress(percent) {
    const circle = elements.progressRingCircle;
    if (!circle) return;
    
    // Use the hardcoded radius 70 from the SVG structure to prevent compatibility issues
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    
    // Set dasharray to full circumference
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Compute dashoffset: 100% -> offset 0 (full circle), 0% -> offset 440 (empty)
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

/* ==========================================================================
   5. PDF TEXT EXTRACTION ENGINE (PDF.js Integration)
   ========================================================================== */

/**
 * Reads and parses text content from a PDF file.
 */
async function processPDFResume(file) {
    // Save file metadata
    appState.fileName = file.name;
    elements.fileNameLabel.textContent = file.name;
    
    // Reset file-specific state
    appState.resumeText = "";
    appState.candidateName = "Unknown";
    
    // Show progress container
    elements.uploadStatusCard.classList.remove("hidden");
    elements.progressBarFill.style.width = "0%";
    elements.uploadPercentLabel.textContent = "0%";
    elements.statusMessageLabel.textContent = "Reading file buffer...";

    const reader = new FileReader();

    // Event handler when FileReader completes loading the PDF into memory
    reader.onload = async function (e) {
        try {
            const arrayBuffer = e.target.result;
            elements.statusMessageLabel.textContent = "Connecting to PDF engine...";
            
            // Pass array buffer into PDF.js
            const typedarray = new Uint8Array(arrayBuffer);
            const loadingTask = pdfjsLib.getDocument({ data: typedarray });
            
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;
            
            elements.statusMessageLabel.textContent = `Extracting text (0 of ${totalPages} pages)...`;
            
            let fullText = "";
            
            // Loop through each page of the document
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Merge text strings from current page
                const pageText = textContent.items.map(item => item.str).join(" ");
                fullText += pageText + "\n";
                
                // Update file progress bar
                const percentComplete = Math.round((pageNum / totalPages) * 100);
                elements.progressBarFill.style.width = `${percentComplete}%`;
                elements.uploadPercentLabel.textContent = `${percentComplete}%`;
                elements.statusMessageLabel.textContent = `Extracting text (${pageNum} of ${totalPages} pages)...`;
            }
            
            // Save state
            appState.resumeText = fullText;
            appState.candidateName = extractCandidateName(fullText);
            
            elements.statusMessageLabel.textContent = "Text extraction complete! Ready to screen.";
            updateAnalyzeButtonState();
            
        } catch (error) {
            console.error("PDF Parsing Error: ", error);
            elements.statusMessageLabel.textContent = "Error parsing PDF. Please make sure it's not password-protected.";
            elements.progressBarFill.style.backgroundColor = "var(--color-error)";
            appState.resumeText = "";
            updateAnalyzeButtonState();
        }
    };

    reader.onerror = function() {
        elements.statusMessageLabel.textContent = "Failed to read file.";
        updateAnalyzeButtonState();
    };

    // Read file as ArrayBuffer for binary processing
    reader.readAsArrayBuffer(file);
}

/* ==========================================================================
   6. CORE SCREENING ALGORITHM & RESULTS RENDERING
   ========================================================================== */

/**
 * Compares extracted resume text against required skills and builds dashboard results.
 */
function runScreening() {
    try {
        // Validation Check: If no skills are present in the job description, alert the user.
        if (appState.requiredSkills.size === 0) {
            alert("Please enter a Job Description (the system will extract required skills).");
            elements.jobInput.focus();
            return;
        }

        // Validation Check: If no resume text has been extracted, alert the user.
        if (!appState.resumeText || appState.resumeText.trim().length === 0) {
            alert("Please upload a PDF resume first and wait for extraction to complete.");
            return;
        }

        const matchedSkills = [];
        const missingSkills = [];
        
        // Check presence of each required skill in the resume
        appState.requiredSkills.forEach(skill => {
            if (checkSkillPresence(appState.resumeText, skill)) {
                matchedSkills.push(skill);
            } else {
                missingSkills.push(skill);
            }
        });

        const totalSkills = appState.requiredSkills.size;
        const matchedCount = matchedSkills.length;
        
        // Compute percentage (handle division by zero just in case)
        const matchPercentage = totalSkills > 0 ? Math.round((matchedCount / totalSkills) * 100) : 0;
        
        // Update Application State
        appState.analysisCompleted = true;

        // Display Results Grid Panels
        elements.resultsEmptyState.classList.add("hidden");
        elements.resultsDashboard.classList.remove("hidden");

        // 1. Update Match Score, Progress Circle, and Stats
        elements.scoreNumber.textContent = `${matchPercentage}%`;
        setCircularProgress(matchPercentage);
        
        elements.matchedSkillsCount.textContent = `${matchedCount} / ${totalSkills}`;
        elements.candidateNameLabel.textContent = appState.candidateName;

        // 2. Set Status Badge class and text
        let statusText = "UNDER REVIEW";
        let statusClass = "review";
        
        if (matchPercentage >= 70) {
            statusText = "STRONG MATCH ✅";
            statusClass = "selected";
        } else if (matchPercentage >= 40) {
            statusText = "POTENTIAL FIT ⚠️";
            statusClass = "review";
        } else {
            statusText = "WEAK FIT ❌";
            statusClass = "rejected";
        }
        
        elements.matchStatusBadge.textContent = statusText;
        elements.matchStatusBadge.className = `badge-status ${statusClass}`;

        // 3. Generate Final Recommendations Text
        generateRecommendation(matchPercentage, matchedSkills, missingSkills);

        // 4. Render Skills Column lists
        renderResultsSkills(matchedSkills, missingSkills);

        // 5. Populate Raw Text Preview code tag
        elements.rawTextContent.textContent = appState.resumeText;
        
        // Scroll results page into view on smaller viewports
        elements.resultsDashboard.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        alert("Error during screening calculation: " + error.message + "\nStack: " + error.stack);
        console.error("Screening calculation error:", error);
    }
}

/**
 * Formats a clean recommendation card with tailored hiring manager feedback.
 */
function generateRecommendation(percentage, matched, missing) {
    const contentBox = elements.recommendationContent;
    contentBox.className = "recommendation-content"; // Reset

    let header = "";
    let body = "";
    
    // Select status type
    if (percentage >= 70) {
        contentBox.classList.add("rec-strong");
        header = `<strong>Highly Recommended Candidate:</strong> `;
        body = `The candidate's resume shows an excellent match rate of <strong>${percentage}%</strong>. 
                They possess core required skills like <em>${matched.slice(0, 4).join(', ')}</em>. 
                They cover the majority of the requirements. <strong>Action:</strong> Proceed to technical phone screen immediately.`;
    } else if (percentage >= 40) {
        contentBox.classList.add("rec-moderate");
        header = `<strong>Consider with Review:</strong> `;
        body = `The candidate is a moderate match (<strong>${percentage}%</strong>). 
                They have key strengths in <em>${matched.slice(0, 3).join(', ')}</em>, but lack important elements such as 
                <em>${missing.slice(0, 3).join(', ')}</em>. <strong>Action:</strong> Review projects/work history manually to verify if they have transferable skillsets before scheduling an interview.`;
    } else {
        contentBox.classList.add("rec-weak");
        header = `<strong>Low Fit Profile:</strong> `;
        body = `The candidate has a low match rate of <strong>${percentage}%</strong> and is missing crucial skills like 
                <em>${missing.slice(0, 4).join(', ')}</em>. <strong>Action:</strong> Reject candidate or check suitability for alternative roles.`;
    }

    contentBox.innerHTML = `<p>${header}${body}</p>`;
}

/**
 * Fills matched/missing skill boxes in the detailed breakdown panel.
 */
function renderResultsSkills(matched, missing) {
    // Render Matched Badges
    elements.matchedSkillsList.innerHTML = "";
    if (matched.length === 0) {
        elements.matchedSkillsList.innerHTML = `
            <span class="badge-result-placeholder">No matching skills detected.</span>
        `;
    } else {
        matched.forEach(skill => {
            const badge = document.createElement("span");
            badge.className = "badge-result matched";
            badge.textContent = skill;
            elements.matchedSkillsList.appendChild(badge);
        });
    }

    // Render Missing Badges
    elements.missingSkillsList.innerHTML = "";
    if (missing.length === 0) {
        elements.missingSkillsList.innerHTML = `
            <span class="badge-result-placeholder">No missing skills! Candidate matches all requirements.</span>
        `;
    } else {
        missing.forEach(skill => {
            const badge = document.createElement("span");
            badge.className = "badge-result missing";
            badge.textContent = skill;
            elements.missingSkillsList.appendChild(badge);
        });
    }
}

/**
 * Resets application state and rolls UI back to empty templates.
 */
function resetApplication() {
    appState = {
        jobDescription: "",
        requiredSkills: new Set(),
        resumeText: "",
        fileName: "",
        candidateName: "Unknown",
        analysisCompleted: false
    };

    // Reset Inputs
    elements.jobInput.value = "";
    elements.fileInput.value = "";
    renderRequiredSkillsBadges();
    
    // Hide progress bar card
    elements.uploadStatusCard.classList.add("hidden");
    elements.progressBarFill.style.width = "0%";
    elements.progressBarFill.style.backgroundColor = "";
    elements.fileNameLabel.textContent = "resume.pdf";
    elements.uploadPercentLabel.textContent = "0%";
    
    // Reset Results UI
    elements.resultsEmptyState.classList.remove("hidden");
    elements.resultsDashboard.classList.add("hidden");
    
    // Reset Text Preview accordion
    elements.resumeTextPreview.classList.add("hidden");
    elements.togglePreviewArrow.classList.remove("rotated");
    elements.rawTextContent.textContent = "";

    updateAnalyzeButtonState();
}

/* ==========================================================================
   7. INTERACTIVE INPUT HANDLERS & LISTENERS
   ========================================================================== */

// Debounce helper to prevent heavy parsing functions on every keystroke
function debounce(func, delay = 350) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Auto-extract skills in real-time as user types in job description
elements.jobInput.addEventListener("input", debounce(function (e) {
    const text = e.target.value;
    appState.jobDescription = text;
    
    // Parse skills
    const skills = extractJobSkills(text);
    
    // Update Set
    appState.requiredSkills = skills;
    
    // Render
    renderRequiredSkillsBadges();
    updateAnalyzeButtonState();
    
    // Auto-update match score if analysis was already run
    if (appState.analysisCompleted) {
        runScreening();
    }
}));

// Setup custom skill addition modal popups
elements.addSkillBtn.addEventListener("click", () => {
    elements.customSkillModal.classList.remove("hidden");
    elements.customSkillInput.focus();
});

// Close Custom Skill Modal
function closeSkillModal() {
    elements.customSkillModal.classList.add("hidden");
    elements.customSkillInput.value = "";
}

elements.modalCancelBtn.addEventListener("click", closeSkillModal);

// Add custom skill logic
elements.modalSubmitBtn.addEventListener("click", () => {
    const skillValue = elements.customSkillInput.value.trim();
    if (skillValue) {
        // Add capitalization formatting
        appState.requiredSkills.add(skillValue);
        renderRequiredSkillsBadges();
        updateAnalyzeButtonState();
        closeSkillModal();
        
        // Re-run matching automatically if results are active
        if (appState.analysisCompleted) {
            runScreening();
        }
    }
});

// Submit modal skill on Enter key press
elements.customSkillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        elements.modalSubmitBtn.click();
    }
});

// Primary Button triggers
elements.analyzeBtn.addEventListener("click", runScreening);
elements.resetBtn.addEventListener("click", resetApplication);

// Collapsible raw text accordion preview click handler
elements.togglePreviewBtn.addEventListener("click", () => {
    const isHidden = elements.resumeTextPreview.classList.toggle("hidden");
    elements.togglePreviewArrow.classList.toggle("rotated", !isHidden);
});

/* ==========================================================================
   8. DRAG AND DROP FILE INPUT HANDLERS
   ========================================================================== */

// Trigger file input click when clicking on the dropzone panel
elements.dropzone.addEventListener("click", () => {
    elements.fileInput.click();
});

// File input selection handler
elements.fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
        processPDFResume(file);
    } else if (file) {
        alert("Please select a valid PDF file.");
    }
});

// Dragover styling effects
elements.dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    elements.dropzone.classList.add("dragover");
});

elements.dropzone.addEventListener("dragleave", () => {
    elements.dropzone.classList.remove("dragover");
});

// Drop handler
elements.dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    elements.dropzone.classList.remove("dragover");
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
        processPDFResume(file);
    } else if (file) {
        alert("Only PDF files are supported.");
    }
});

// Function to initialize the application and parse pre-filled HTML content
function initializeApp() {
    if (typeof pdfjsLib === 'undefined') {
        console.error("PDF.js library is not loaded. Ensure you have an internet connection.");
    }
    
    // Check if there is already text inside the job description box (pre-filled in HTML)
    const text = elements.jobInput.value;
    if (text.trim()) {
        appState.jobDescription = text;
        appState.requiredSkills = extractJobSkills(text);
        renderRequiredSkillsBadges();
        updateAnalyzeButtonState();
    }
}

// Safely handle DOMContentLoaded timing issue (already loaded vs loading states)
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}
