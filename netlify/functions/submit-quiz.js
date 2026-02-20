// Netlify Function: Submit 26-Question Personalization Quiz
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

const LABELS = {
  q1_name: { jacquie: 'Jacquie', mrs_jones: 'Mrs. Jones', j: 'J', boss: 'Boss' },
  q2_rhythm: { early_bird: 'Early bird', midday: 'Midday person', night_owl: 'Night owl', depends: 'Depends on the day' },
  q3_timezone: { eastern: 'Eastern (ET)', central: 'Central (CT)', mountain: 'Mountain (MT)', pacific: 'Pacific (PT)' },
  q4_personality: { creative: 'Creative & imaginative', organized: 'Organized & dependable', caring: 'Caring & generous', determined: 'Determined & driven' },
  q5_unwind: { reading: 'Reading/devotionals', cooking: 'Cooking/baking', tv_music: 'Music/TV/movies', outdoors: 'Walking/gardening' },
  q6_energy: { helping: 'Helping others', learning: 'Learning something new', creating: 'Creating something', connecting: 'Connecting with people' },
  q7_topics: { health_wellness: 'Health & wellness', faith_spirituality: 'Faith & spirituality', business_money: 'Business & money', technology: 'Technology & innovation' },
  q8_creative: { writing: 'Writing & journaling', art_design: 'Art, design, crafting', cooking_baking: 'Cooking/baking', all_creative: 'All creative activities' },
  q9_content: { documentaries: 'Documentaries & real stories', faith_inspiration: 'Faith & inspiration', business_tutorials: 'Business & how-tos', variety: 'A bit of everything' },
  q10_music: { gospel: 'Gospel & worship', jazz_soul: 'Jazz, soul, R&B', oldies: 'Oldies & classics', all_music: 'All music' },
  q11_community: { church_faith: 'Church & faith', family: 'Family', entrepreneurs: 'Entrepreneurs', neighborhood: 'Local neighborhood' },
  q12_goal: { launch_product: 'Launch a digital product', learn_skills: 'Learn new tech skills', get_organized: 'Get life organized', build_income: 'Build passive income' },
  q13_extra_hour: { learn: 'Read or learn', projects: 'Work on projects', relax: 'Rest and recharge', family: 'Spend with family' },
  q14_skill: { tech: 'Technology & computers', writing: 'Writing & storytelling', design: 'Design & visual arts', marketing: 'Marketing & sales' },
  q15_legacy: { help_plan: 'Help families be prepared', inspire: 'Inspire creativity in kids', knowledge: 'Share wisdom & knowledge', financial: 'Financial freedom for family' },
  q16_future: { business_owner: 'Running my own business', creative_retired: 'Retired & creating freely', mentor: 'Teaching & mentoring', traveling: 'Traveling & enjoying life' },
  q17_project: { end_of_life_planner: 'End of Life Planner', kids_coloring_book: 'Kids Coloring Book', website_building: 'Website Building', ai_mastery: 'AI Mastery' },
  q18_challenges: { research: 'Research it first', ask_help: 'Ask for help', push_through: 'Push through', step_back: 'Step back & come fresh' },
  q19_organized: { very: 'Very organized', somewhat: 'Somewhat organized', working_on_it: 'Working on it', creative_chaos: 'Beautiful creative chaos' },
  q20_tech_frustration: { complicated: 'Too complicated', changes_fast: 'Changes too fast', no_time: 'Not enough time', where_to_start: "Don't know where to start" },
  q21_work_style: { solo: 'Solo focused time', partner: 'With a thinking partner', group: 'In a group', mix: 'Mix of all' },
  q22_communication: { brief: 'Brief', detailed: 'Detailed', conversational: 'Conversational', adaptive: 'Adaptive' },
  q23_checkin: { daily: 'Daily', few_days: 'Every 2-3 days', weekly: 'Weekly', on_demand: 'Only when asked' },
  q24_features: { research: 'Research & answers', organization: 'Organization & planning', content: 'Content & writing', automation: 'Automating tasks' },
  q25_level: { beginner: 'Keep it simple', intermediate: 'I know the basics', advanced: 'Challenge me' },
  q26_role: { coach: 'Proactive coach', partner: 'Thinking partner', helper: 'On-call helper', cheerleader: 'Cheerleader' }
};

const TZ_MAP = {
  eastern: 'America/New_York',
  central: 'America/Chicago',
  mountain: 'America/Denver',
  pacific: 'America/Los_Angeles'
};

function label(key, val) {
  if (Array.isArray(val)) return val.map(v => (LABELS[key] && LABELS[key][v]) || v).join(', ');
  return (LABELS[key] && LABELS[key][val]) || val;
}

function sshExec(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => { conn.end(); reject(new Error('SSH timeout')); }, 30000);
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) { clearTimeout(timeout); conn.end(); return reject(err); }
        let stdout = '', stderr = '';
        stream.on('close', (code) => {
          clearTimeout(timeout);
          conn.end();
          code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || `Exit code ${code}`));
        });
        stream.on('data', (data) => { stdout += data; });
        stream.stderr.on('data', (data) => { stderr += data; });
      });
    });
    conn.on('error', (err) => { clearTimeout(timeout); reject(err); });
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
    const dateStr = timestamp.split('T')[0];
    const preferredName = label('q1_name', r.q1_name);
    const timezone = TZ_MAP[r.q3_timezone] || 'America/New_York';

    // 1. Save QUIZ_STATE.json
    const quizState = JSON.stringify({
      status: 'completed',
      completed_at: timestamp,
      version: '3.0-26q',
      responses: r
    }, null, 2);

    await sshExec(`mkdir -p /root/.openclaw/workspace/onboarding && cat > /root/.openclaw/workspace/onboarding/QUIZ_STATE.json << 'QUIZEOF'
${quizState}
QUIZEOF`);

    // 2. Update USER.md
    const userUpdate = `

## Personalization Profile (26-Question Quiz - ${dateStr})

### Identity
- **Preferred Name:** ${preferredName}
- **Daily Rhythm:** ${label('q2_rhythm', r.q2_rhythm)}
- **Time Zone:** ${label('q3_timezone', r.q3_timezone)} (${timezone})
- **Personality:** ${label('q4_personality', r.q4_personality)}
- **Unwind Activities:** ${label('q5_unwind', r.q5_unwind)}
- **Energy Source:** ${label('q6_energy', r.q6_energy)}

### Interests & Passions
- **Fascinated By:** ${label('q7_topics', r.q7_topics)}
- **Creative Outlets:** ${label('q8_creative', r.q8_creative)}
- **Content Preference:** ${label('q9_content', r.q9_content)}
- **Music:** ${label('q10_music', r.q10_music)}
- **Community:** ${label('q11_community', r.q11_community)}

### Goals & Dreams
- **Biggest Goal:** ${label('q12_goal', r.q12_goal)}
- **Extra Hour:** ${label('q13_extra_hour', r.q13_extra_hour)}
- **Skill to Master:** ${label('q14_skill', r.q14_skill)}
- **Legacy:** ${label('q15_legacy', r.q15_legacy)}
- **2-Year Vision:** ${label('q16_future', r.q16_future)}

### Work Style
- **Priority Project:** ${label('q17_project', r.q17_project)}
- **Challenge Approach:** ${label('q18_challenges', r.q18_challenges)}
- **Organization Level:** ${label('q19_organized', r.q19_organized)}
- **Tech Frustration:** ${label('q20_tech_frustration', r.q20_tech_frustration)}
- **Work Preference:** ${label('q21_work_style', r.q21_work_style)}

### MegaMind Settings
- **Communication Style:** ${label('q22_communication', r.q22_communication)}
- **Check-in Frequency:** ${label('q23_checkin', r.q23_checkin)}
- **Feature Priorities:** ${label('q24_features', r.q24_features)}
- **Skill Level:** ${label('q25_level', r.q25_level)}
- **MegaMind Role:** ${label('q26_role', r.q26_role)}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/USER.md << 'USEREOF'
${userUpdate}
USEREOF`);

    // 3. Update SOUL.md
    const commStyle = r.q22_communication;
    const roleStyle = r.q26_role;
    const levelStyle = r.q25_level;
    const techFrust = r.q20_tech_frustration;

    let toneGuide = '';
    if (commStyle === 'brief') toneGuide = 'Keep responses concise and action-focused. Lead with the answer.';
    else if (commStyle === 'detailed') toneGuide = 'Provide thorough context and examples. Explain the why.';
    else if (commStyle === 'conversational') toneGuide = 'Be warm and personable. Chat like a trusted friend.';
    else toneGuide = 'Adapt tone to the topic - brief for tasks, detailed for learning, warm for encouragement.';

    let roleGuide = '';
    if (roleStyle === 'coach') roleGuide = 'Be proactive. Push forward, suggest next steps, set mini-goals.';
    else if (roleStyle === 'partner') roleGuide = 'Collaborate as equals. Think out loud together. Offer options.';
    else if (roleStyle === 'helper') roleGuide = 'Be ready and responsive. Wait for requests, then deliver.';
    else roleGuide = 'Lead with encouragement. Highlight progress, celebrate effort.';

    let levelGuide = '';
    if (levelStyle === 'beginner') levelGuide = 'Explain step by step. No jargon. Use analogies.';
    else if (levelStyle === 'intermediate') levelGuide = 'Skip obvious basics. Focus on tips and best practices.';
    else levelGuide = 'Be direct. Introduce complex concepts. Challenge thinking.';

    let techGuide = '';
    if (techFrust === 'complicated') techGuide = 'Simplify everything. One thing at a time.';
    else if (techFrust === 'changes_fast') techGuide = 'Focus on stable fundamentals. Minimize overwhelm.';
    else if (techFrust === 'no_time') techGuide = 'Prioritize efficiency. Quick wins first.';
    else techGuide = 'Provide clear starting points. Remove decision paralysis.';

    const soulUpdate = `

## Personality Calibration (${dateStr})
- **Address user as:** ${preferredName}
- **Time Zone:** ${timezone}
- **Tone:** ${toneGuide}
- **Role:** ${roleGuide}
- **Level:** ${levelGuide}
- **Tech approach:** ${techGuide}
- **Best time to engage:** ${label('q2_rhythm', r.q2_rhythm)}
- **Motivators:** ${label('q6_energy', r.q6_energy)}, ${label('q15_legacy', r.q15_legacy)}
- **Interests:** ${label('q7_topics', r.q7_topics)}, ${label('q10_music', r.q10_music)}
- **Unwind:** ${label('q5_unwind', r.q5_unwind)}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/SOUL.md << 'SOULEOF'
${soulUpdate}
SOULEOF`);

    // 4. Update AGENTS.md
    const agentsUpdate = `

## Response Framework (${dateStr})
- **Primary project:** ${label('q17_project', r.q17_project)}
- **Feature priorities:** ${label('q24_features', r.q24_features)}
- **Check-in schedule:** ${label('q23_checkin', r.q23_checkin)}
- **User timezone:** ${timezone}
- **When stuck:** ${label('q18_challenges', r.q18_challenges)} - match this approach
- **Organization:** "${label('q19_organized', r.q19_organized)}" - ${r.q19_organized === 'very' ? 'maintain their system' : 'offer organizational help proactively'}
- **Work style:** ${label('q21_work_style', r.q21_work_style)}
- **Skill development:** Help master ${label('q14_skill', r.q14_skill)}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/AGENTS.md << 'AGENTEOF'
${agentsUpdate}
AGENTEOF`);

    // 5. WhatsApp confirmation
    const whatsappMsg = `Hey ${preferredName}! Your personalization is complete!

Here is what I learned:
- You are ${label('q4_personality', r.q4_personality).toLowerCase()}
- Fascinated by ${label('q7_topics', r.q7_topics).toLowerCase()}
- Your goal: ${label('q12_goal', r.q12_goal)}
- Priority: ${label('q17_project', r.q17_project)}
- Time zone: ${label('q3_timezone', r.q3_timezone)}

I will check in ${label('q23_checkin', r.q23_checkin).toLowerCase()} and focus on ${label('q24_features', r.q24_features).toLowerCase()}.

Ready when you are! Just message me anytime.`;

    try {
      await sshExec(`openclaw message send --channel whatsapp --account ${WHATSAPP.account} --target '${WHATSAPP.target}' --message '${whatsappMsg.replace(/'/g, "'\"'\"'")}'`);
    } catch (msgErr) {
      console.error('WhatsApp send failed (non-fatal):', msgErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, timestamp, name: preferredName })
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
