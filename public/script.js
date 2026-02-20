// MegaMind 26-Question Personalization Quiz - All Multi-Select
let currentQuestion = 1;
const totalQuestions = 26;

// ALL questions are now multi-select
const allFields = [
    'q1_name','q2_rhythm','q3_timezone','q4_personality',
    'q5_unwind','q6_energy',
    'q7_topics','q8_creative','q9_content','q10_music','q11_community',
    'q12_goal','q13_extra_hour','q14_skill','q15_legacy','q16_future',
    'q17_project','q18_challenges','q19_organized','q20_tech_frustration','q21_work_style',
    'q22_communication','q23_checkin','q24_features','q25_level','q26_role'
];

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
const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');

document.addEventListener('DOMContentLoaded', () => {
    addHintElements();
    updateProgress();
    setupEventListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const startAt = parseInt(urlParams.get('startAt'));
    if (startAt && startAt >= 1 && startAt <= totalQuestions) {
        loadSavedProgress();
        showQuestion(startAt);
    } else {
        loadSavedProgress();
    }
});

// Dynamically add hint <p> below each question's options div if not already present
function addHintElements() {
    for (let i = 1; i <= totalQuestions; i++) {
        const card = document.querySelector(`.question-card[data-question="${i}"]`);
        if (!card) continue;
        let hint = card.querySelector('.multi-hint, .validation-hint');
        if (!hint) {
            hint = document.createElement('p');
            hint.className = 'multi-hint';
            hint.id = `q${i}Hint`;
            hint.textContent = 'Tap to select, then press Next';
            const optionsDiv = card.querySelector('.options');
            if (optionsDiv) optionsDiv.after(hint);
        }
    }
}

function setupEventListeners() {
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    form.addEventListener('submit', handleSubmit);

    // Update hints when any checkbox changes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const card = cb.closest('.question-card');
            if (!card) return;
            const qNum = card.dataset.question;
            const fieldName = cb.name;
            updateMultiHint(qNum, fieldName);
        });
    });
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
    const checked = current.querySelectorAll('input[type="checkbox"]:checked');

    if (checked.length === 0) {
        const hint = current.querySelector('.multi-hint, .validation-hint');
        if (hint) {
            hint.textContent = 'Please select at least one option';
            hint.style.color = 'var(--danger)';
        }
        return;
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

function saveAnswer() {
    const formData = new FormData(form);
    const answers = {};

    for (const field of allFields) {
        const values = formData.getAll(field);
        if (values.length > 0) {
            answers[field] = values;
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
            const values = Array.isArray(value) ? value : [value];
            values.forEach(v => {
                const input = document.querySelector(`input[name="${key}"][value="${v}"]`);
                if (input) input.checked = true;
            });
        });
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);
    const responses = {};

    for (const field of allFields) {
        responses[field] = formData.getAll(field);
    }

    // Validate all answered
    for (const key of allFields) {
        if (!responses[key] || responses[key].length === 0) {
            alert('Please answer all questions before submitting');
            return;
        }
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
