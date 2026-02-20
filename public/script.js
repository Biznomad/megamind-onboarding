// MegaMind 26-Question Personalization Quiz
let currentQuestion = 1;
const totalQuestions = 26;

// Questions that allow multiple selections (checkboxes)
const multiSelectQuestions = {
    5: 'q5_unwind',
    7: 'q7_topics',
    8: 'q8_creative',
    9: 'q9_content',
    10: 'q10_music',
    11: 'q11_community',
    24: 'q24_features'  // pick exactly 2
};

const sections = {
    about: { title: "About You", subtitle: "Getting to know the real you", range: [1, 6] },
    interests: { title: "Interests & Passions", subtitle: "What lights you up", range: [7, 11] },
    goals: { title: "Goals & Dreams", subtitle: "Where you're headed", range: [12, 16] },
    work: { title: "Work Style", subtitle: "How you get things done", range: [17, 21] },
    settings: { title: "MegaMind Settings", subtitle: "Fine-tuning your assistant", range: [22, 26] }
};

const form = document.getElementById('quizForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const loadingState = document.getElementById('loadingState');
const featureHint = document.getElementById('featureHint');
const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');

document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    setupEventListeners();

    // Check for startAt param (from dashboard edit button)
    const urlParams = new URLSearchParams(window.location.search);
    const startAt = parseInt(urlParams.get('startAt'));
    if (startAt && startAt >= 1 && startAt <= totalQuestions) {
        loadSavedProgress();
        showQuestion(startAt);
    } else {
        loadSavedProgress();
    }
});

function setupEventListeners() {
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    form.addEventListener('submit', handleSubmit);

    // Auto-advance on radio selection (single-select questions only)
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentQuestion < totalQuestions && !multiSelectQuestions[currentQuestion]) {
                setTimeout(nextQuestion, 300);
            }
        });
    });

    // Feature validation (Q24 - pick exactly 2)
    document.querySelectorAll('input[name="q24_features"]').forEach(checkbox => {
        checkbox.addEventListener('change', validateFeatures);
    });

    // Update multi-select hints when checkboxes change
    for (const [qNum, fieldName] of Object.entries(multiSelectQuestions)) {
        if (parseInt(qNum) === 24) continue; // features has its own validator
        document.querySelectorAll(`input[name="${fieldName}"]`).forEach(cb => {
            cb.addEventListener('change', () => updateMultiHint(qNum, fieldName));
        });
    }
}

function updateMultiHint(qNum, fieldName) {
    const hint = document.getElementById(`q${qNum}Hint`);
    if (!hint) return;
    const count = document.querySelectorAll(`input[name="${fieldName}"]:checked`).length;
    if (count > 0) {
        hint.textContent = `${count} selected - tap Next when ready`;
        hint.style.color = 'var(--success)';
    } else {
        hint.textContent = 'Tap to select, then press Next';
        hint.style.color = '';
    }
}

function getSectionForQuestion(num) {
    for (const [key, sec] of Object.entries(sections)) {
        if (num >= sec.range[0] && num <= sec.range[1]) return { key, ...sec };
    }
    return null;
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentQuestion} of ${totalQuestions}`;

    const section = getSectionForQuestion(currentQuestion);
    if (section && sectionTitle && sectionSubtitle) {
        const emoji = { about: "👋", interests: "💡", goals: "🎯", work: "⚙️", settings: "🔧" };
        sectionTitle.textContent = `${emoji[section.key] || ''} ${section.title}`;
        sectionSubtitle.textContent = section.subtitle;
    }

    prevBtn.style.display = currentQuestion === 1 ? 'none' : 'block';
    nextBtn.style.display = currentQuestion === totalQuestions ? 'none' : 'block';
    submitBtn.style.display = currentQuestion === totalQuestions ? 'block' : 'none';

    localStorage.setItem('megamind_question', currentQuestion);
}

function showQuestion(num) {
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });

    const target = document.querySelector(`.question-card[data-question="${num}"]`);
    if (target) target.classList.add('active');

    currentQuestion = num;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextQuestion() {
    const current = document.querySelector(`.question-card[data-question="${currentQuestion}"]`);
    let isValid = false;

    if (currentQuestion === 24) {
        // Q24 features: exactly 2
        const checked = current.querySelectorAll('input[type="checkbox"]:checked');
        isValid = checked.length === 2;
        if (!isValid) {
            featureHint.textContent = checked.length < 2 ? 'Please select 2 options' : 'Select only 2';
            featureHint.classList.add('error');
            return;
        }
    } else if (multiSelectQuestions[currentQuestion]) {
        // Other multi-select: at least 1
        const checked = current.querySelectorAll('input[type="checkbox"]:checked');
        isValid = checked.length >= 1;
        if (!isValid) {
            alert('Please select at least one option');
            return;
        }
    } else {
        // Radio: one selected
        current.querySelectorAll('input[type="radio"]').forEach(input => {
            if (input.checked) isValid = true;
        });
        if (!isValid) {
            alert('Please select an option');
            return;
        }
    }

    saveAnswer();
    if (currentQuestion < totalQuestions) {
        showQuestion(currentQuestion + 1);
    }
}

function previousQuestion() {
    if (currentQuestion > 1) {
        showQuestion(currentQuestion - 1);
    }
}

function validateFeatures() {
    const checked = document.querySelectorAll('input[name="q24_features"]:checked');
    if (checked.length === 2) {
        featureHint.textContent = 'Perfect!';
        featureHint.classList.remove('error');
        featureHint.style.color = 'var(--success)';
    } else if (checked.length > 2) {
        const last = Array.from(checked).pop();
        last.checked = false;
        featureHint.textContent = 'Select only 2';
        featureHint.classList.add('error');
    } else {
        featureHint.textContent = `${checked.length}/2 selected`;
        featureHint.classList.remove('error');
        featureHint.style.color = '';
    }
}

function saveAnswer() {
    const formData = new FormData(form);
    const answers = {};
    const multiFields = Object.values(multiSelectQuestions);

    for (let [key, value] of formData.entries()) {
        if (multiFields.includes(key)) {
            answers[key] = formData.getAll(key);
        } else {
            answers[key] = value;
        }
    }
    localStorage.setItem('megamind_answers', JSON.stringify(answers));
}

function loadSavedProgress() {
    const saved = localStorage.getItem('megamind_question');
    const answers = localStorage.getItem('megamind_answers');

    if (saved) {
        currentQuestion = parseInt(saved);
        showQuestion(currentQuestion);
    }

    if (answers) {
        const data = JSON.parse(answers);
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    const input = document.querySelector(`input[name="${key}"][value="${v}"]`);
                    if (input) input.checked = true;
                });
            } else {
                const input = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (input) input.checked = true;
            }
        });
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);
    const multiFields = Object.values(multiSelectQuestions);

    const responses = {};
    const allFields = [
        'q1_name','q2_rhythm','q3_timezone','q4_personality',
        'q5_unwind','q6_energy',
        'q7_topics','q8_creative','q9_content','q10_music','q11_community',
        'q12_goal','q13_extra_hour','q14_skill','q15_legacy','q16_future',
        'q17_project','q18_challenges','q19_organized','q20_tech_frustration','q21_work_style',
        'q22_communication','q23_checkin','q24_features','q25_level','q26_role'
    ];

    for (const key of allFields) {
        if (multiFields.includes(key)) {
            responses[key] = formData.getAll(key);
        } else {
            responses[key] = formData.get(key);
        }
    }

    // Validate all answered
    for (let key in responses) {
        if (!responses[key] || (Array.isArray(responses[key]) && responses[key].length === 0)) {
            alert('Please answer all questions before submitting');
            return;
        }
    }

    if (responses.q24_features.length !== 2) {
        alert('Please select exactly 2 feature priorities (Question 24)');
        return;
    }

    form.style.display = 'none';
    loadingState.style.display = 'block';

    try {
        const response = await fetch('/.netlify/functions/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responses)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.removeItem('megamind_question');
            localStorage.removeItem('megamind_answers');
            localStorage.setItem('megamind_completed', 'true');
            window.location.href = '/dashboard.html';
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    } catch (error) {
        loadingState.style.display = 'none';
        form.style.display = 'block';
        alert(`Error: ${error.message}`);
    }
}

window.addEventListener('beforeunload', (e) => {
    if (localStorage.getItem('megamind_answers') && currentQuestion < totalQuestions) {
        e.preventDefault();
        e.returnValue = '';
    }
});
