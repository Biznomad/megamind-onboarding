#!/bin/bash
# MegaMind 10-Question Portal - Build Script
# Generates all missing files for deployment

set -e

cd "$(dirname "$0")"

echo "=========================================="
echo "MegaMind 10-Question Portal Builder"
echo "=========================================="
echo ""

# Create public/index.html with all 10 questions
echo "Creating index.html (10-question quiz)..."
cat > public/index.html << 'EOF_HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MegaMind Onboarding - Personalize Your AI</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>👋 Welcome to MegaMind!</h1>
            <p class="subtitle">Let's personalize your AI assistant in 10 quick questions</p>
        </header>

        <div class="progress-bar">
            <div class="progress-fill" id="progressBar"></div>
        </div>
        <p class="progress-text" id="progressText">Question 1 of 10</p>

        <form id="quizForm">
            <!-- Q1: Project Priority -->
            <div class="question-card active" data-question="1">
                <h2>Which project should I prioritize first?</h2>
                <p class="help-text">This helps me focus my suggestions and research</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q1_project" value="end_of_life_planner" required>
                        <span class="option-content">
                            <span class="option-emoji">📋</span>
                            <span class="option-text">End of Life Planner</span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q1_project" value="kids_coloring_book">
                        <span class="option-content">
                            <span class="option-emoji">🎨</span>
                            <span class="option-text">Kids Coloring Book</span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q1_project" value="website_building">
                        <span class="option-content">
                            <span class="option-emoji">🌐</span>
                            <span class="option-text">Website Building Skills</span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q1_project" value="ai_mastery">
                        <span class="option-content">
                            <span class="option-emoji">🤖</span>
                            <span class="option-text">AI Mastery</span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q2: Learning Style -->
            <div class="question-card" data-question="2">
                <h2>How do you prefer to learn new things?</h2>
                <p class="help-text">I'll adapt my teaching style to match</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q2_learning" value="step_by_step" required>
                        <span class="option-content">
                            <span class="option-emoji">📝</span>
                            <span class="option-text">Step-by-step<br><small>Detailed walkthroughs</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q2_learning" value="big_picture">
                        <span class="option-content">
                            <span class="option-emoji">🎯</span>
                            <span class="option-text">Big picture first<br><small>Then details</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q2_learning" value="quick_reference">
                        <span class="option-content">
                            <span class="option-emoji">⚡</span>
                            <span class="option-text">Quick bullet points<br><small>Fast reference</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q2_learning" value="visual">
                        <span class="option-content">
                            <span class="option-emoji">🎨</span>
                            <span class="option-text">Visual learner<br><small>Diagrams & examples</small></span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q3: Communication -->
            <div class="question-card" data-question="3">
                <h2>When I share information:</h2>
                <p class="help-text">Sets my response detail level</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q3_communication" value="brief" required>
                        <span class="option-content">
                            <span class="option-emoji">💬</span>
                            <span class="option-text">Brief and to the point</span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q3_communication" value="detailed">
                        <span class="option-content">
                            <span class="option-emoji">📚</span>
                            <span class="option-text">Detailed with examples</span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q3_communication" value="adaptive">
                        <span class="option-content">
                            <span class="option-emoji">🎭</span>
                            <span class="option-text">Mix based on topic</span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q4: Challenge Level -->
            <div class="question-card" data-question="4">
                <h2>How should I approach new topics?</h2>
                <p class="help-text">Matches explanations to your level</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q4_challenge" value="beginner" required>
                        <span class="option-content">
                            <span class="option-emoji">🌱</span>
                            <span class="option-text">Start simple<br><small>Assume I'm new</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q4_challenge" value="intermediate">
                        <span class="option-content">
                            <span class="option-emoji">📈</span>
                            <span class="option-text">Moderate<br><small>I know basics</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q4_challenge" value="advanced">
                        <span class="option-content">
                            <span class="option-emoji">🚀</span>
                            <span class="option-text">Challenge me<br><small>I learn fast</small></span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q5: Features (Pick 2) -->
            <div class="question-card" data-question="5">
                <h2>What would help most? (Pick 2)</h2>
                <p class="help-text">I'll focus on these first</p>
                <div class="options">
                    <label class="option-card checkbox-card">
                        <input type="checkbox" name="q5_features" value="research">
                        <span class="option-content">
                            <span class="option-emoji">🔍</span>
                            <span class="option-text">Research & info</span>
                        </span>
                    </label>
                    <label class="option-card checkbox-card">
                        <input type="checkbox" name="q5_features" value="organization">
                        <span class="option-content">
                            <span class="option-emoji">📁</span>
                            <span class="option-text">Organization & files</span>
                        </span>
                    </label>
                    <label class="option-card checkbox-card">
                        <input type="checkbox" name="q5_features" value="content">
                        <span class="option-content">
                            <span class="option-emoji">✍️</span>
                            <span class="option-text">Content creation</span>
                        </span>
                    </label>
                    <label class="option-card checkbox-card">
                        <input type="checkbox" name="q5_features" value="automation">
                        <span class="option-content">
                            <span class="option-emoji">⚙️</span>
                            <span class="option-text">Automation</span>
                        </span>
                    </label>
                </div>
                <p class="validation-hint" id="featureHint"></p>
            </div>

            <!-- Q6: Schedule -->
            <div class="question-card" data-question="6">
                <h2>When do you typically work?</h2>
                <p class="help-text">Best times for check-ins</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q6_schedule" value="morning" required>
                        <span class="option-content">
                            <span class="option-emoji">🌅</span>
                            <span class="option-text">Mornings<br><small>6am - 12pm</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q6_schedule" value="afternoon">
                        <span class="option-content">
                            <span class="option-emoji">☀️</span>
                            <span class="option-text">Afternoons<br><small>12pm - 6pm</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q6_schedule" value="evening">
                        <span class="option-content">
                            <span class="option-emoji">🌙</span>
                            <span class="option-text">Evenings<br><small>6pm - 12am</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q6_schedule" value="flexible">
                        <span class="option-content">
                            <span class="option-emoji">🔄</span>
                            <span class="option-text">Flexible<br><small>Varies daily</small></span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q7: Check-in Frequency -->
            <div class="question-card" data-question="7">
                <h2>How often should I check in?</h2>
                <p class="help-text">Proactive updates & suggestions</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q7_checkin" value="daily" required>
                        <span class="option-content">
                            <span class="option-emoji">📅</span>
                            <span class="option-text">Daily<br><small>Quick tips</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q7_checkin" value="few_days">
                        <span class="option-content">
                            <span class="option-emoji">📆</span>
                            <span class="option-text">Every 2-3 days<br><small>Balanced</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q7_checkin" value="weekly">
                        <span class="option-content">
                            <span class="option-emoji">🗓️</span>
                            <span class="option-text">Weekly<br><small>Deep dives</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q7_checkin" value="on_demand">
                        <span class="option-content">
                            <span class="option-emoji">🔕</span>
                            <span class="option-text">Only when I ask</span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q8: Content Format -->
            <div class="question-card" data-question="8">
                <h2>What content format do you prefer?</h2>
                <p class="help-text">For tutorials & guides</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q8_format" value="text" required>
                        <span class="option-content">
                            <span class="option-emoji">📄</span>
                            <span class="option-text">Written text<br><small>Articles & guides</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q8_format" value="video">
                        <span class="option-content">
                            <span class="option-emoji">🎥</span>
                            <span class="option-text">Video tutorials<br><small>Visual demos</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q8_format" value="interactive">
                        <span class="option-content">
                            <span class="option-emoji">🎮</span>
                            <span class="option-text">Interactive<br><small>Hands-on practice</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q8_format" value="mixed">
                        <span class="option-content">
                            <span class="option-emoji">🎨</span>
                            <span class="option-text">Mix of all</span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q9: Timeline -->
            <div class="question-card" data-question="9">
                <h2>What's your project timeline?</h2>
                <p class="help-text">Helps gauge urgency</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q9_timeline" value="urgent" required>
                        <span class="option-content">
                            <span class="option-emoji">🏃</span>
                            <span class="option-text">Urgent<br><small>ASAP</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q9_timeline" value="moderate">
                        <span class="option-content">
                            <span class="option-emoji">🚶</span>
                            <span class="option-text">Moderate<br><small>Weeks to months</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q9_timeline" value="longterm">
                        <span class="option-content">
                            <span class="option-emoji">🌳</span>
                            <span class="option-text">Long-term<br><small>Taking my time</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q9_timeline" value="exploring">
                        <span class="option-content">
                            <span class="option-emoji">🧭</span>
                            <span class="option-text">Just exploring<br><small>No rush</small></span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Q10: Support Style -->
            <div class="question-card" data-question="10">
                <h2>How do you prefer help?</h2>
                <p class="help-text">Last question!</p>
                <div class="options">
                    <label class="option-card">
                        <input type="radio" name="q10_support" value="proactive" required>
                        <span class="option-content">
                            <span class="option-emoji">🎯</span>
                            <span class="option-text">Be proactive<br><small>Suggest next steps</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q10_support" value="collaborative">
                        <span class="option-content">
                            <span class="option-emoji">🤝</span>
                            <span class="option-text">Collaborative<br><small>Work together</small></span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q10_support" value="reactive">
                        <span class="option-content">
                            <span class="option-emoji">🙋</span>
                            <span class="option-text">Wait for me to ask</span>
                        </span>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="q10_support" value="cheerleader">
                        <span class="option-content">
                            <span class="option-emoji">🎉</span>
                            <span class="option-text">Encourage & celebrate<br><small>Keep me motivated</small></span>
                        </span>
                    </label>
                </div>
            </div>

            <div class="button-group">
                <button type="button" class="btn btn-secondary" id="prevBtn" style="display: none;">← Previous</button>
                <button type="button" class="btn btn-primary" id="nextBtn">Next →</button>
                <button type="submit" class="btn btn-success" id="submitBtn" style="display: none;">Complete ✓</button>
            </div>
        </form>

        <div id="loadingState" style="display: none;">
            <div class="spinner"></div>
            <p>Personalizing MegaMind...</p>
        </div>

        <footer>
            <p>Your responses are saved securely</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>
EOF_HTML

echo "[OK] Created index.html (10 questions)"

# Create public/script.js
echo "Creating script.js (10-question logic)..."
cat > public/script.js << 'EOF_JS'
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
EOF_JS

echo "[OK] Created script.js"

# Create netlify/functions/submit-quiz.js (continued in next message due to length)
echo "Creating submit-quiz.js (backend function)..."
cat > netlify/functions/submit-quiz.js << 'EOF_FUNCTION'
// Netlify Function: Submit 10-Question Quiz
const { Client } = require('ssh2');

const MEGAMIND = {
  host: '187.77.205.132',
  port: 22,
  username: 'root',
  password: process.env.MEGAMIND_PASSWORD
};

const WHATSAPP = {
  target: '+16782879864',
  account: 'bot2'
};

function sshExec(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let stdout = '', stderr = '';
        stream.on('close', (code) => {
          conn.end();
          code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr));
        });
        stream.on('data', (data) => { stdout += data; });
        stream.stderr.on('data', (data) => { stderr += data; });
      });
    });
    conn.on('error', reject);
    conn.connect(MEGAMIND);
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const r = JSON.parse(event.body);
    const timestamp = new Date().toISOString();

    // Build comprehensive workspace updates
    const quizState = JSON.stringify({
      status: 'completed',
      completed_at: timestamp,
      responses: r
    }, null, 2);

    await sshExec(`cat > /root/.openclaw/workspace/onboarding/QUIZ_STATE.json << 'EOF'
${quizState}
EOF`);

    const userUpdate = `

## Personalization (10-Question Quiz - ${timestamp.split('T')[0]})
- **Priority Project:** ${r.q1_project.replace(/_/g, ' ')}
- **Learning Style:** ${r.q2_learning.replace(/_/g, ' ')}
- **Communication:** ${r.q3_communication}
- **Challenge Level:** ${r.q4_challenge}
- **Feature Focus:** ${r.q5_features.join(', ')}
- **Work Schedule:** ${r.q6_schedule}
- **Check-in Frequency:** ${r.q7_checkin.replace(/_/g, ' ')}
- **Content Format:** ${r.q8_format}
- **Project Timeline:** ${r.q9_timeline}
- **Support Style:** ${r.q10_support}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/USER.md << 'EOF'
${userUpdate}
EOF`);

    await sshExec(`cat >> /root/.openclaw/workspace/SOUL.md << 'EOF'

## Communication Calibration (${timestamp.split('T')[0]})
- **Tone:** ${r.q3_communication === 'brief' ? 'Concise' : 'Detailed'}
- **Support Style:** ${r.q10_support}
EOF`);

    const whatsappMsg = `Perfect! ✅ MegaMind personalized!

• Project: ${r.q1_project.replace(/_/g, ' ')}
• Learning: ${r.q2_learning.replace(/_/g, ' ')}
• Schedule: ${r.q6_schedule}
• Check-ins: ${r.q7_checkin.replace(/_/g, ' ')}

I'm ready to help! Message me anytime.`;

    await sshExec(`openclaw message send --channel whatsapp --account ${WHATSAPP.account} --target '${WHATSAPP.target}' --message '${whatsappMsg.replace(/'/g, "'\"'\"'")}'`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, timestamp })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
EOF_FUNCTION

echo "[OK] Created submit-quiz.js"

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.netlify/
.env
*.log
.DS_Store
EOF

echo "[OK] Created .gitignore"

echo ""
echo "=========================================="
echo "✅ Build Complete!"
echo "=========================================="
echo ""
echo "Files created:"
echo "  ✓ public/index.html (10-question quiz)"
echo "  ✓ public/script.js (quiz logic)"
echo "  ✓ netlify/functions/submit-quiz.js (backend)"
echo "  ✓ .gitignore"
echo ""
echo "Next steps:"
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Deploy to Netlify:"
echo "   netlify deploy --prod"
echo ""
echo "3. Set password:"
echo "   netlify env:set MEGAMIND_PASSWORD 'Knumoney0226?'"
echo ""
echo "4. Get URL and send to Jacquie!"
echo "=========================================="
