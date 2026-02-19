// MegaMind 10-Question Quiz Logic
let currentQuestion = 1;
const totalQuestions = 10;

const form = document.getElementById('quizForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const loadingState = document.getElementById('loadingState');
const featureHint = document.getElementById('featureHint');

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

    document.querySelectorAll('input[name="q5_features"]').forEach(checkbox => {
        checkbox.addEventListener('change', validateFeatures);
    });
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentQuestion} of ${totalQuestions}`;

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

    if (currentQuestion === 5) {
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
    const checked = document.querySelectorAll('input[name="q5_features"]:checked');
    if (checked.length === 2) {
        featureHint.textContent = '✓ Perfect!';
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
    }
}

function saveAnswer() {
    const formData = new FormData(form);
    const answers = {};
    for (let [key, value] of formData.entries()) {
        if (key === 'q5_features') {
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
        q1_project: formData.get('q1_project'),
        q2_learning: formData.get('q2_learning'),
        q3_communication: formData.get('q3_communication'),
        q4_challenge: formData.get('q4_challenge'),
        q5_features: formData.getAll('q5_features'),
        q6_schedule: formData.get('q6_schedule'),
        q7_checkin: formData.get('q7_checkin'),
        q8_format: formData.get('q8_format'),
        q9_timeline: formData.get('q9_timeline'),
        q10_support: formData.get('q10_support')
    };

    // Validate all answered
    for (let key in responses) {
        if (!responses[key] || (Array.isArray(responses[key]) && responses[key].length === 0)) {
            alert('Please answer all questions');
            return;
        }
    }

    if (responses.q5_features.length !== 2) {
        alert('Please select exactly 2 feature priorities');
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
            const params = new URLSearchParams(responses);
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
