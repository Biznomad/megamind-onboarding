// MegaMind Dashboard + Chat Logic

// ===== CONSTANTS =====
const LABELS = {
    q1_name: { _t: 'Name', jacquie: 'Jacquie', mrs_jones: 'Mrs. Jones', j: 'J', boss: 'Boss' },
    q2_rhythm: { _t: 'Rhythm', early_bird: 'Early bird', midday: 'Midday', night_owl: 'Night owl', depends: 'Flexible' },
    q3_timezone: { _t: 'Time Zone', eastern: 'Eastern (ET)', central: 'Central (CT)', mountain: 'Mountain (MT)', pacific: 'Pacific (PT)' },
    q4_personality: { _t: 'Personality', creative: 'Creative', organized: 'Organized', caring: 'Caring', determined: 'Determined' },
    q5_unwind: { _t: 'Unwind', reading: 'Reading', cooking: 'Cooking', tv_music: 'Music/TV', outdoors: 'Outdoors' },
    q6_energy: { _t: 'Energized By', helping: 'Helping others', learning: 'Learning', creating: 'Creating', connecting: 'Connecting' },
    q7_topics: { _t: 'Fascinated By', health_wellness: 'Health', faith_spirituality: 'Faith', business_money: 'Business', technology: 'Technology' },
    q8_creative: { _t: 'Creative', writing: 'Writing', art_design: 'Art/design', cooking_baking: 'Cooking', all_creative: 'All creative' },
    q9_content: { _t: 'Watches', documentaries: 'Docs', faith_inspiration: 'Faith', business_tutorials: 'Business', variety: 'Everything' },
    q10_music: { _t: 'Music', gospel: 'Gospel', jazz_soul: 'Jazz/Soul', oldies: 'Oldies', all_music: 'All' },
    q11_community: { _t: 'Community', church_faith: 'Church', family: 'Family', entrepreneurs: 'Entrepreneurs', neighborhood: 'Neighborhood' },
    q12_goal: { _t: 'Goal', launch_product: 'Launch product', learn_skills: 'Learn skills', get_organized: 'Get organized', build_income: 'Build income' },
    q13_extra_hour: { _t: 'Extra Hour', learn: 'Learn', projects: 'Projects', relax: 'Rest', family: 'Family' },
    q14_skill: { _t: 'Master', tech: 'Technology', writing: 'Writing', design: 'Design', marketing: 'Marketing' },
    q15_legacy: { _t: 'Legacy', help_plan: 'Help families', inspire: 'Inspire kids', knowledge: 'Share wisdom', financial: 'Financial freedom' },
    q16_future: { _t: 'Vision', business_owner: 'Business owner', creative_retired: 'Creative retirement', mentor: 'Mentor', traveling: 'Traveling' },
    q17_project: { _t: 'Priority', end_of_life_planner: 'End of Life Planner', kids_coloring_book: 'Coloring Book', website_building: 'Website', ai_mastery: 'AI Mastery' },
    q18_challenges: { _t: 'Challenges', research: 'Research first', ask_help: 'Ask for help', push_through: 'Push through', step_back: 'Step back' },
    q19_organized: { _t: 'Organization', very: 'Very organized', somewhat: 'Somewhat', working_on_it: 'Working on it', creative_chaos: 'Creative chaos' },
    q20_tech_frustration: { _t: 'Tech Pain', complicated: 'Too complex', changes_fast: 'Changes fast', no_time: 'No time', where_to_start: 'Where to start' },
    q21_work_style: { _t: 'Work Style', solo: 'Solo', partner: 'Partner', group: 'Group', mix: 'Mixed' },
    q22_communication: { _t: 'Communication', brief: 'Brief', detailed: 'Detailed', conversational: 'Conversational', adaptive: 'Adaptive' },
    q23_checkin: { _t: 'Check-ins', daily: 'Daily', few_days: 'Every 2-3 days', weekly: 'Weekly', on_demand: 'On demand' },
    q24_features: { _t: 'Focus', research: 'Research', organization: 'Organization', content: 'Content', automation: 'Automation' },
    q25_level: { _t: 'Level', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    q26_role: { _t: 'Role', coach: 'Coach', partner: 'Partner', helper: 'Helper', cheerleader: 'Cheerleader' }
};

const SECTIONS = {
    about: ['q1_name','q2_rhythm','q3_timezone','q4_personality','q5_unwind','q6_energy'],
    interests: ['q7_topics','q8_creative','q9_content','q10_music','q11_community'],
    goals: ['q12_goal','q13_extra_hour','q14_skill','q15_legacy','q16_future'],
    work: ['q17_project','q18_challenges','q19_organized','q20_tech_frustration','q21_work_style'],
    settings: ['q22_communication','q23_checkin','q24_features','q25_level','q26_role']
};
const SECTION_START = { about: 1, interests: 7, goals: 12, work: 17, settings: 22 };

let profileData = null;
let activeConvoId = null;
let syncInProgress = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadInstalledSkills();
    syncChatsFromServer().then(() => {
        loadConversations();
        initChat();
    });
});

// ===== TAB SWITCHING =====
function switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${name}`).classList.add('active');
    document.querySelector(`.tab[data-tab="${name}"]`).classList.add('active');
    if (name !== 'chat') window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'chat') document.getElementById('chatInput').focus();
}

// ===== PROFILE =====
function resolve(key, val) { return LABELS[key]?.[val] || val?.toString().replace(/_/g, ' ') || ''; }

async function loadProfile() {
    const loading = document.getElementById('profileLoading');
    const content = document.getElementById('profileContent');
    const empty = document.getElementById('profileEmpty');

    try {
        const res = await fetch('/.netlify/functions/get-profile');
        const data = await res.json();
        if (data.status === 'completed' && data.responses) {
            profileData = data.responses;
            const name = resolve('q1_name', profileData.q1_name);
            document.getElementById('welcomeMsg').textContent = `Hey ${name}!`;

            for (const [section, keys] of Object.entries(SECTIONS)) {
                const el = document.getElementById(`profile-${section}`);
                el.innerHTML = '';
                for (const key of keys) {
                    const val = profileData[key];
                    if (!val) continue;
                    const title = LABELS[key]?._t || key;
                    const display = Array.isArray(val) ? val.map(v => resolve(key, v)).join(', ') : resolve(key, val);
                    el.innerHTML += `<div class="profile-row"><span class="profile-label">${title}</span><span class="profile-value">${display}</span></div>`;
                }
            }
            loading.style.display = 'none';
            content.style.display = 'block';

            // Check integrations
            if (data.integrations) {
                for (const [app, info] of Object.entries(data.integrations)) {
                    if (info && info.connected) markAppConnected(app);
                }
            }
        } else {
            loading.style.display = 'none';
            empty.style.display = 'block';
        }
    } catch (err) {
        loading.style.display = 'none';
        empty.style.display = 'block';
    }
}

function editSection(section) { window.location.href = `index.html?startAt=${SECTION_START[section]}`; }

// ===== APPS =====
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
        if (data.auth_url) { window.location.href = data.auth_url; }
        else { btn.textContent = 'Coming Soon'; btn.disabled = true; }
    } catch (err) { btn.textContent = 'Coming Soon'; btn.disabled = true; }
}

// ===== SKILLS =====
function loadInstalledSkills() {
    const installed = JSON.parse(localStorage.getItem('megamind_skills') || '[]');
    installed.forEach(id => {
        const card = document.getElementById(`skill-${id}`);
        if (!card) return;
        const btn = card.querySelector('.enable-btn');
        if (btn) { btn.textContent = 'Enabled'; btn.classList.add('installed'); btn.disabled = true; }
    });
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
            const installed = JSON.parse(localStorage.getItem('megamind_skills') || '[]');
            if (!installed.includes(skillId)) { installed.push(skillId); localStorage.setItem('megamind_skills', JSON.stringify(installed)); }
        } else throw new Error(data.error);
    } catch (err) {
        btn.textContent = 'Retry';
        btn.classList.remove('installing');
        btn.disabled = false;
    }
}

// ===== CHAT =====
function getChats() { return JSON.parse(localStorage.getItem('megamind_chats') || '{}'); }
function saveChats(chats) { localStorage.setItem('megamind_chats', JSON.stringify(chats)); }

// Sync a single conversation to the server (fire-and-forget)
function syncChatToServer(chatId) {
    const chats = getChats();
    const convo = chats[chatId];
    if (!convo) return;

    fetch('/.netlify/functions/save-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, conversation: convo })
    }).catch(() => {}); // silent fail, local copy is always available
}

// Load all chats from server and merge with local
async function syncChatsFromServer() {
    if (syncInProgress) return;
    syncInProgress = true;
    try {
        const res = await fetch('/.netlify/functions/get-chats');
        const data = await res.json();
        const serverChats = data.chats || {};
        const localChats = getChats();

        // Merge: server wins for older, local wins for newer
        let merged = { ...localChats };
        for (const [id, serverConvo] of Object.entries(serverChats)) {
            const localConvo = localChats[id];
            if (!localConvo) {
                // Server has a chat we don't have locally
                merged[id] = serverConvo;
            } else {
                // Keep whichever has more messages or is newer
                const serverMsgCount = serverConvo.messages?.length || 0;
                const localMsgCount = localConvo.messages?.length || 0;
                if (serverMsgCount > localMsgCount) {
                    merged[id] = serverConvo;
                }
                // else keep local (it's newer)
            }
        }
        saveChats(merged);
    } catch (err) {
        // Offline or error - just use local
    } finally {
        syncInProgress = false;
    }
}

function initChat() {
    const chats = getChats();
    const ids = Object.keys(chats).sort((a, b) => (chats[b].updated || 0) - (chats[a].updated || 0));
    if (ids.length > 0) {
        activeConvoId = ids[0];
        renderConversation(activeConvoId);
    }
    renderConvoList();
}

function loadConversations() {
    renderConvoList();
}

function renderConvoList() {
    const list = document.getElementById('conversationList');
    const chats = getChats();
    const ids = Object.keys(chats).sort((a, b) => (chats[b].updated || 0) - (chats[a].updated || 0));

    list.innerHTML = '';
    for (const id of ids) {
        const c = chats[id];
        const div = document.createElement('div');
        div.className = `convo-item${id === activeConvoId ? ' active' : ''}`;
        div.onclick = () => { activeConvoId = id; renderConversation(id); renderConvoList(); };
        const title = c.title || 'New Chat';
        const time = c.updated ? new Date(c.updated).toLocaleDateString() : '';
        div.innerHTML = `${escapeHtml(title)}<span class="convo-time">${time}</span>`;
        list.appendChild(div);
    }
}

function newConversation() {
    const id = 'chat_' + Date.now();
    const chats = getChats();
    chats[id] = { title: 'New Chat', messages: [], created: Date.now(), updated: Date.now() };
    saveChats(chats);
    activeConvoId = id;
    renderConversation(id);
    renderConvoList();
    document.getElementById('chatInput').focus();
    // Close sidebar on mobile
    document.getElementById('chatSidebar').classList.remove('open');
}

function renderConversation(id) {
    const container = document.getElementById('chatMessages');
    const chats = getChats();
    const convo = chats[id];

    if (!convo || convo.messages.length === 0) {
        container.innerHTML = `
            <div class="chat-welcome">
                <div style="font-size:48px; margin-bottom:12px;">🧠</div>
                <h3>Hey! I'm MegaMind</h3>
                <p>Your personal AI assistant. Ask me anything!</p>
                <div class="quick-prompts">
                    <button class="quick-prompt" onclick="sendQuick('Help me plan my day')">Plan my day</button>
                    <button class="quick-prompt" onclick="sendQuick('Give me 5 social media post ideas')">Social media ideas</button>
                    <button class="quick-prompt" onclick="sendQuick('What should I work on for my End of Life Planner?')">Project help</button>
                    <button class="quick-prompt" onclick="sendQuick('Write a professional email for me')">Write an email</button>
                </div>
            </div>`;
        return;
    }

    container.innerHTML = '';
    for (const msg of convo.messages) {
        appendMessage(msg.role, msg.content, msg.timestamp, false);
    }
    scrollToBottom();
}

function appendMessage(role, content, timestamp, scroll = true) {
    const container = document.getElementById('chatMessages');
    // Remove welcome if present
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `msg ${role}`;
    const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    div.innerHTML = `${formatContent(content)}<div class="msg-time">${time}</div>`;
    container.appendChild(div);
    if (scroll) scrollToBottom();
}

function formatContent(text) {
    // Basic markdown: bold, italic, code, line breaks
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

function sendQuick(text) {
    if (!activeConvoId) newConversation();
    document.getElementById('chatInput').value = text;
    sendMessage(new Event('submit'));
}

async function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    // Create conversation if none
    if (!activeConvoId) newConversation();

    const chats = getChats();
    const convo = chats[activeConvoId];
    const ts = Date.now();

    // Add user message
    convo.messages.push({ role: 'user', content: text, timestamp: ts });
    if (convo.messages.length === 1) {
        convo.title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
    }
    convo.updated = ts;
    saveChats(chats);
    syncChatToServer(activeConvoId);

    appendMessage('user', text, ts);
    input.value = '';
    renderConvoList();

    // Show typing
    const typing = document.getElementById('typingIndicator');
    typing.style.display = 'flex';
    document.getElementById('sendBtn').disabled = true;

    try {
        // Build messages for API (last 20)
        const apiMessages = convo.messages.map(m => ({ role: m.role, content: m.content }));

        const res = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages, profile: profileData })
        });

        const data = await res.json();
        const reply = data.response || data.error || 'Sorry, something went wrong. Try again?';
        const replyTs = Date.now();

        // Save assistant message
        const freshChats = getChats();
        freshChats[activeConvoId].messages.push({ role: 'assistant', content: reply, timestamp: replyTs });
        freshChats[activeConvoId].updated = replyTs;
        saveChats(freshChats);
        syncChatToServer(activeConvoId);

        appendMessage('assistant', reply, replyTs);
    } catch (err) {
        appendMessage('assistant', 'Hmm, I had trouble connecting. Try again or chat via WhatsApp at +1 (678) 287-9864.', Date.now());
    } finally {
        typing.style.display = 'none';
        document.getElementById('sendBtn').disabled = false;
        input.focus();
    }
}

function toggleSidebar() {
    document.getElementById('chatSidebar').classList.toggle('open');
}

// ===== COPY TEXT =====
function copyText(el) {
    const text = el.querySelector('span:first-child').textContent.replace(/"/g, '');
    navigator.clipboard.writeText(text).then(() => {
        el.classList.add('copied');
        el.querySelector('.copy-hint').textContent = 'copied!';
        setTimeout(() => { el.classList.remove('copied'); el.querySelector('.copy-hint').textContent = 'tap to copy'; }, 2000);
    });
}
