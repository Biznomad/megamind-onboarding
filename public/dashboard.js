// MegaMind Dashboard Logic

const LABELS = {
    q1_name: { _t: 'Name', jacquie: 'Jacquie', mrs_jones: 'Mrs. Jones', j: 'J', boss: 'Boss' },
    q2_rhythm: { _t: 'Daily Rhythm', early_bird: 'Early bird', midday: 'Midday', night_owl: 'Night owl', depends: 'Flexible' },
    q3_timezone: { _t: 'Time Zone', eastern: 'Eastern (ET)', central: 'Central (CT)', mountain: 'Mountain (MT)', pacific: 'Pacific (PT)' },
    q4_personality: { _t: 'Personality', creative: 'Creative & imaginative', organized: 'Organized & dependable', caring: 'Caring & generous', determined: 'Determined & driven' },
    q5_unwind: { _t: 'Unwind Activities', reading: 'Reading', cooking: 'Cooking', tv_music: 'Music/TV', outdoors: 'Outdoors' },
    q6_energy: { _t: 'Energized By', helping: 'Helping others', learning: 'Learning', creating: 'Creating', connecting: 'Connecting' },
    q7_topics: { _t: 'Fascinated By', health_wellness: 'Health & wellness', faith_spirituality: 'Faith & spirituality', business_money: 'Business & money', technology: 'Technology' },
    q8_creative: { _t: 'Creative Outlets', writing: 'Writing', art_design: 'Art & design', cooking_baking: 'Cooking', all_creative: 'All creative' },
    q9_content: { _t: 'Enjoys Watching', documentaries: 'Documentaries', faith_inspiration: 'Faith & inspiration', business_tutorials: 'Business how-tos', variety: 'Everything' },
    q10_music: { _t: 'Music', gospel: 'Gospel', jazz_soul: 'Jazz/Soul/R&B', oldies: 'Oldies & classics', all_music: 'All music' },
    q11_community: { _t: 'Community', church_faith: 'Church & faith', family: 'Family', entrepreneurs: 'Entrepreneurs', neighborhood: 'Neighborhood' },
    q12_goal: { _t: 'Biggest Goal', launch_product: 'Launch a digital product', learn_skills: 'Learn new tech skills', get_organized: 'Get life organized', build_income: 'Build passive income' },
    q13_extra_hour: { _t: 'Extra Hour', learn: 'Read or learn', projects: 'Work on projects', relax: 'Rest & recharge', family: 'Family time' },
    q14_skill: { _t: 'Want to Master', tech: 'Technology', writing: 'Writing', design: 'Design', marketing: 'Marketing' },
    q15_legacy: { _t: 'Legacy', help_plan: 'Help families plan', inspire: 'Inspire kids', knowledge: 'Share wisdom', financial: 'Financial freedom' },
    q16_future: { _t: '2-Year Vision', business_owner: 'Business owner', creative_retired: 'Creative retirement', mentor: 'Teaching & mentoring', traveling: 'Traveling' },
    q17_project: { _t: 'Priority Project', end_of_life_planner: 'End of Life Planner', kids_coloring_book: 'Kids Coloring Book', website_building: 'Website Building', ai_mastery: 'AI Mastery' },
    q18_challenges: { _t: 'Challenge Style', research: 'Research first', ask_help: 'Ask for help', push_through: 'Push through', step_back: 'Step back' },
    q19_organized: { _t: 'Organization', very: 'Very organized', somewhat: 'Somewhat', working_on_it: 'Working on it', creative_chaos: 'Creative chaos' },
    q20_tech_frustration: { _t: 'Tech Pain Point', complicated: 'Too complicated', changes_fast: 'Changes too fast', no_time: 'Not enough time', where_to_start: "Don't know where to start" },
    q21_work_style: { _t: 'Work Style', solo: 'Solo', partner: 'With a partner', group: 'In a group', mix: 'Mix of all' },
    q22_communication: { _t: 'Communication', brief: 'Brief & direct', detailed: 'Detailed', conversational: 'Conversational', adaptive: 'Adaptive' },
    q23_checkin: { _t: 'Check-ins', daily: 'Daily', few_days: 'Every 2-3 days', weekly: 'Weekly', on_demand: 'Only when asked' },
    q24_features: { _t: 'Focus Areas', research: 'Research', organization: 'Organization', content: 'Content & writing', automation: 'Automation' },
    q25_level: { _t: 'Skill Level', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    q26_role: { _t: 'MegaMind Role', coach: 'Proactive coach', partner: 'Thinking partner', helper: 'On-call helper', cheerleader: 'Cheerleader' }
};

const SECTIONS = {
    about: ['q1_name', 'q2_rhythm', 'q3_timezone', 'q4_personality', 'q5_unwind', 'q6_energy'],
    interests: ['q7_topics', 'q8_creative', 'q9_content', 'q10_music', 'q11_community'],
    goals: ['q12_goal', 'q13_extra_hour', 'q14_skill', 'q15_legacy', 'q16_future'],
    work: ['q17_project', 'q18_challenges', 'q19_organized', 'q20_tech_frustration', 'q21_work_style'],
    settings: ['q22_communication', 'q23_checkin', 'q24_features', 'q25_level', 'q26_role']
};

// Section question ranges for edit redirect
const SECTION_START = { about: 1, interests: 7, goals: 12, work: 17, settings: 22 };

let profileData = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadInstalledSkills();
    checkAppConnections();
});

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PROFILE =====
async function loadProfile() {
    const loading = document.getElementById('profileLoading');
    const content = document.getElementById('profileContent');
    const empty = document.getElementById('profileEmpty');

    try {
        const res = await fetch('/.netlify/functions/get-profile');
        const data = await res.json();

        if (data.status === 'completed' && data.responses) {
            profileData = data.responses;

            // Update welcome message
            const name = resolve('q1_name', profileData.q1_name);
            document.getElementById('welcomeMsg').textContent = `Hey ${name}!`;
            document.getElementById('welcomeSub').textContent = 'Your personal AI command center';

            // Render each section
            for (const [section, keys] of Object.entries(SECTIONS)) {
                const container = document.getElementById(`profile-${section}`);
                container.innerHTML = '';
                for (const key of keys) {
                    const val = profileData[key];
                    if (!val) continue;
                    const title = LABELS[key]?._t || key;
                    const display = Array.isArray(val)
                        ? val.map(v => resolve(key, v)).join(', ')
                        : resolve(key, val);
                    container.innerHTML += `<div class="profile-row"><span class="profile-label">${title}</span><span class="profile-value">${display}</span></div>`;
                }
            }

            loading.style.display = 'none';
            content.style.display = 'block';
        } else {
            loading.style.display = 'none';
            empty.style.display = 'block';
        }
    } catch (err) {
        // Try localStorage fallback
        const saved = localStorage.getItem('megamind_answers');
        if (saved) {
            profileData = JSON.parse(saved);
            loading.innerHTML = '<p>Profile loaded from local cache.</p>';
            setTimeout(() => loadProfile(), 2000);
        } else {
            loading.style.display = 'none';
            empty.style.display = 'block';
        }
    }
}

function resolve(key, val) {
    return LABELS[key]?.[val] || val?.replace(/_/g, ' ') || '';
}

function editSection(section) {
    const startQ = SECTION_START[section];
    window.location.href = `index.html?startAt=${startQ}`;
}

// ===== APP CONNECTIONS =====
async function checkAppConnections() {
    try {
        const res = await fetch('/.netlify/functions/get-profile');
        const data = await res.json();
        if (data.integrations) {
            for (const [app, info] of Object.entries(data.integrations)) {
                if (info.connected) {
                    markAppConnected(app);
                }
            }
        }
    } catch (err) {
        // silent fail
    }
}

function markAppConnected(app) {
    const row = document.getElementById(`app-${app}`);
    if (!row) return;
    row.classList.add('connected');
    const btn = row.querySelector('.connect-btn');
    btn.textContent = 'Connected';
    btn.classList.add('connected');
    btn.disabled = true;
}

async function connectApp(app) {
    const btn = document.querySelector(`#app-${app} .connect-btn`);
    btn.textContent = 'Loading...';
    btn.disabled = true;

    try {
        const res = await fetch(`/.netlify/functions/initiate-oauth?app=${app}`);
        const data = await res.json();

        if (data.auth_url) {
            window.location.href = data.auth_url;
        } else if (data.setup_needed) {
            btn.textContent = 'Coming Soon';
            btn.disabled = true;
        } else {
            throw new Error(data.error || 'Failed');
        }
    } catch (err) {
        btn.textContent = 'Coming Soon';
        btn.style.background = 'var(--text-light)';
        btn.disabled = true;
    }
}

// ===== SKILLS =====
function loadInstalledSkills() {
    const installed = JSON.parse(localStorage.getItem('megamind_skills') || '[]');
    installed.forEach(id => {
        markSkillInstalled(id);
    });
}

function markSkillInstalled(skillId) {
    const card = document.getElementById(`skill-${skillId}`);
    if (!card) return;
    const btn = card.querySelector('.enable-btn');
    if (btn) {
        btn.textContent = 'Enabled';
        btn.classList.add('installed');
        btn.disabled = true;
    }
}

async function installSkill(skillId, btn) {
    btn.textContent = 'Enabling...';
    btn.classList.add('installing');
    btn.disabled = true;

    try {
        const res = await fetch('/.netlify/functions/install-skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skillId })
        });

        const data = await res.json();

        if (data.success) {
            btn.textContent = 'Enabled';
            btn.classList.remove('installing');
            btn.classList.add('installed');

            // Save locally
            const installed = JSON.parse(localStorage.getItem('megamind_skills') || '[]');
            if (!installed.includes(skillId)) {
                installed.push(skillId);
                localStorage.setItem('megamind_skills', JSON.stringify(installed));
            }
        } else {
            throw new Error(data.error || 'Failed');
        }
    } catch (err) {
        btn.textContent = 'Retry';
        btn.classList.remove('installing');
        btn.disabled = false;
        console.error('Skill install failed:', err);
    }
}

// ===== COPY TEXT =====
function copyText(el) {
    const text = el.querySelector('span:first-child').textContent.replace(/"/g, '');
    navigator.clipboard.writeText(text).then(() => {
        el.classList.add('copied');
        el.querySelector('.copy-hint').textContent = 'copied!';
        setTimeout(() => {
            el.classList.remove('copied');
            el.querySelector('.copy-hint').textContent = 'tap to copy';
        }, 2000);
    });
}
