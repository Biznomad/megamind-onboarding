// MegaMind 25-Question Personalization Quiz
let currentQuestion = 1;
const totalQuestions = 25;

const sections = {
    about: { title: "About You", subtitle: "Getting to know the real you", range: [1, 5] },
    interests: { title: "Interests & Passions", subtitle: "What lights you up", range: [6, 10] },
    goals: { title: "Goals & Dreams", subtitle: "Where you're headed", range: [11, 15] },
    work: { title: "Work Style", subtitle: "How you get things done", range: [16, 20] },
    settings: { title: "MegaMind Settings", subtitle: "Fine-tuning your assistant", range: [21, 25] }
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
    loadSavedProgress();
});

function setupEventListeners() {
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    form.addEventListener('submit', handleSubmit);

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentQuestion < totalQuestions) {
                setTimeout(nextQuestion, 300);
            }
        });
    });

    document.querySelectorAll('input[name="q23_features"]').forEach(checkbox => {
        checkbox.addEventListener('change', validateFeatures);
    });
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

    if (currentQuestion === 23) {
        const checked = current.querySelectorAll('input[type="checkbox"]:checked');
        isValid = checked.length === 2;
        if (!isValid) {
            featureHint.textContent = checked.length < 2 ? 'Please select 2 options' : 'Select only 2';
            featureHint.classList.add('error');
            return;
        }
    } else {
        current.querySelectorAll('input[type="radio"]').forEach(input => {
            if (input.checked) isValid = true;
        });
    }

    if (!isValid) {
        alert('Please select an option');
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

function validateFeatures() {
    const checked = document.querySelectorAll('input[name="q23_features"]:checked');
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
    for (let [key, value] of formData.entries()) {
        if (key === 'q23_features') {
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
    const responses = {
        q1_name: formData.get('q1_name'),
        q2_rhythm: formData.get('q2_rhythm'),
        q3_personality: formData.get('q3_personality'),
        q4_unwind: formData.get('q4_unwind'),
        q5_energy: formData.get('q5_energy'),
        q6_topics: formData.get('q6_topics'),
        q7_creative: formData.get('q7_creative'),
        q8_content: formData.get('q8_content'),
        q9_music: formData.get('q9_music'),
        q10_community: formData.get('q10_community'),
        q11_goal: formData.get('q11_goal'),
        q12_extra_hour: formData.get('q12_extra_hour'),
        q13_skill: formData.get('q13_skill'),
        q14_legacy: formData.get('q14_legacy'),
        q15_future: formData.get('q15_future'),
        q16_project: formData.get('q16_project'),
        q17_challenges: formData.get('q17_challenges'),
        q18_organized: formData.get('q18_organized'),
        q19_tech_frustration: formData.get('q19_tech_frustration'),
        q20_work_style: formData.get('q20_work_style'),
        q21_communication: formData.get('q21_communication'),
        q22_checkin: formData.get('q22_checkin'),
        q23_features: formData.getAll('q23_features'),
        q24_level: formData.get('q24_level'),
        q25_role: formData.get('q25_role')
    };

    // Validate all answered
    for (let key in responses) {
        if (!responses[key] || (Array.isArray(responses[key]) && responses[key].length === 0)) {
            alert('Please answer all questions before submitting');
            return;
        }
    }

    if (responses.q23_features.length !== 2) {
        alert('Please select exactly 2 feature priorities (Question 23)');
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
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(responses)) {
                if (Array.isArray(v)) {
                    v.forEach(item => params.append(k, item));
                } else {
                    params.set(k, v);
                }
            }
            window.location.href = `/success.html?${params.toString()}`;
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
