// Netlify Function: Submit 25-Question Personalization Quiz
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

// Human-readable labels for quiz values
const LABELS = {
  q1_name: { jacquie: 'Jacquie', mrs_jones: 'Mrs. Jones', j: 'J', boss: 'Boss' },
  q2_rhythm: { early_bird: 'Early bird', midday: 'Midday person', night_owl: 'Night owl', depends: 'Depends on the day' },
  q3_personality: { creative: 'Creative & imaginative', organized: 'Organized & dependable', caring: 'Caring & generous', determined: 'Determined & driven' },
  q4_unwind: { reading: 'Reading or devotionals', cooking: 'Cooking or baking', tv_music: 'Music, TV, or movies', outdoors: 'Walking or gardening' },
  q5_energy: { helping: 'Helping others', learning: 'Learning something new', creating: 'Creating something', connecting: 'Connecting with people' },
  q6_topics: { health_wellness: 'Health & wellness', faith_spirituality: 'Faith & spirituality', business_money: 'Business & money', technology: 'Technology & innovation' },
  q7_creative: { writing: 'Writing & journaling', art_design: 'Art, design, or crafting', cooking_baking: 'Cooking or baking', all_creative: 'All creative activities' },
  q8_content: { documentaries: 'Documentaries & real stories', faith_inspiration: 'Faith & inspiration', business_tutorials: 'Business & how-tos', variety: 'A little bit of everything' },
  q9_music: { gospel: 'Gospel & worship', jazz_soul: 'Jazz, soul, or R&B', oldies: 'Oldies & classics', all_music: 'All music' },
  q10_community: { church_faith: 'Church & faith community', family: 'Family above all', entrepreneurs: 'Fellow entrepreneurs', neighborhood: 'Local neighborhood' },
  q11_goal: { launch_product: 'Launch a digital product', learn_skills: 'Learn new tech skills', get_organized: 'Get life organized', build_income: 'Build passive income' },
  q12_extra_hour: { learn: 'Read or learn', projects: 'Work on projects', relax: 'Rest and recharge', family: 'Spend with family' },
  q13_skill: { tech: 'Technology & computers', writing: 'Writing & storytelling', design: 'Design & visual arts', marketing: 'Marketing & sales' },
  q14_legacy: { help_plan: 'Help families be prepared', inspire: 'Inspire creativity in kids', knowledge: 'Share wisdom & knowledge', financial: 'Financial freedom for family' },
  q15_future: { business_owner: 'Running my own business', creative_retired: 'Retired & creating freely', mentor: 'Teaching & mentoring others', traveling: 'Traveling & enjoying life' },
  q16_project: { end_of_life_planner: 'End of Life Planner', kids_coloring_book: 'Kids Coloring Book', website_building: 'Website Building', ai_mastery: 'AI Mastery' },
  q17_challenges: { research: 'Research it myself first', ask_help: 'Ask for help right away', push_through: 'Push through it', step_back: 'Step back & come fresh' },
  q18_organized: { very: 'Very organized', somewhat: 'Somewhat organized', working_on_it: 'Working on it', creative_chaos: 'Beautiful creative chaos' },
  q19_tech_frustration: { complicated: 'Too complicated', changes_fast: 'Changes too fast', no_time: 'Not enough time to learn', where_to_start: "Don't know where to start" },
  q20_work_style: { solo: 'Solo focused time', partner: 'With a thinking partner', group: 'In a group or team', mix: 'Mix of all' },
  q21_communication: { brief: 'Brief - get to the point', detailed: 'Detailed - explain everything', conversational: 'Conversational - like a friend', adaptive: 'Depends on the topic' },
  q22_checkin: { daily: 'Daily motivation', few_days: 'Every 2-3 days', weekly: 'Weekly deep dive', on_demand: 'Only when asked' },
  q23_features: { research: 'Research & answers', organization: 'Organization & planning', content: 'Content & writing', automation: 'Automating tasks' },
  q24_level: { beginner: 'Keep it simple', intermediate: 'I know the basics', advanced: 'Challenge me' },
  q25_role: { coach: 'Proactive coach', partner: 'Thinking partner', helper: 'On-call helper', cheerleader: 'Cheerleader' }
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

    // 1. Save QUIZ_STATE.json
    const quizState = JSON.stringify({
      status: 'completed',
      completed_at: timestamp,
      version: '2.0-25q',
      responses: r
    }, null, 2);

    await sshExec(`mkdir -p /root/.openclaw/workspace/onboarding && cat > /root/.openclaw/workspace/onboarding/QUIZ_STATE.json << 'QUIZEOF'
${quizState}
QUIZEOF`);

    // 2. Update USER.md with comprehensive personalization
    const userUpdate = `

## Personalization Profile (25-Question Quiz - ${dateStr})

### Identity
- **Preferred Name:** ${preferredName}
- **Daily Rhythm:** ${label('q2_rhythm', r.q2_rhythm)}
- **Personality:** ${label('q3_personality', r.q3_personality)}
- **Unwind Activity:** ${label('q4_unwind', r.q4_unwind)}
- **Energy Source:** ${label('q5_energy', r.q5_energy)}

### Interests & Passions
- **Fascinated By:** ${label('q6_topics', r.q6_topics)}
- **Creative Outlet:** ${label('q7_creative', r.q7_creative)}
- **Content Preference:** ${label('q8_content', r.q8_content)}
- **Music:** ${label('q9_music', r.q9_music)}
- **Community:** ${label('q10_community', r.q10_community)}

### Goals & Dreams
- **Biggest Goal:** ${label('q11_goal', r.q11_goal)}
- **Extra Hour:** ${label('q12_extra_hour', r.q12_extra_hour)}
- **Skill to Master:** ${label('q13_skill', r.q13_skill)}
- **Legacy:** ${label('q14_legacy', r.q14_legacy)}
- **2-Year Vision:** ${label('q15_future', r.q15_future)}

### Work Style
- **Priority Project:** ${label('q16_project', r.q16_project)}
- **Challenge Approach:** ${label('q17_challenges', r.q17_challenges)}
- **Organization Level:** ${label('q18_organized', r.q18_organized)}
- **Tech Frustration:** ${label('q19_tech_frustration', r.q19_tech_frustration)}
- **Work Preference:** ${label('q20_work_style', r.q20_work_style)}

### MegaMind Settings
- **Communication Style:** ${label('q21_communication', r.q21_communication)}
- **Check-in Frequency:** ${label('q22_checkin', r.q22_checkin)}
- **Feature Priorities:** ${label('q23_features', r.q23_features)}
- **Skill Level:** ${label('q24_level', r.q24_level)}
- **MegaMind Role:** ${label('q25_role', r.q25_role)}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/USER.md << 'USEREOF'
${userUpdate}
USEREOF`);

    // 3. Update SOUL.md with personality calibration
    const commStyle = r.q21_communication;
    const roleStyle = r.q25_role;
    const levelStyle = r.q24_level;
    const techFrust = r.q19_tech_frustration;

    let toneGuide = '';
    if (commStyle === 'brief') toneGuide = 'Keep responses concise and action-focused. Lead with the answer, then context if needed.';
    else if (commStyle === 'detailed') toneGuide = 'Provide thorough context and examples. Explain the why, not just the what.';
    else if (commStyle === 'conversational') toneGuide = 'Be warm and personable. Chat like a trusted friend who happens to be brilliant.';
    else toneGuide = 'Adapt tone to the topic - brief for quick tasks, detailed for learning, warm for encouragement.';

    let roleGuide = '';
    if (roleStyle === 'coach') roleGuide = 'Be proactive. Push forward, suggest next steps, set mini-goals. Celebrate wins.';
    else if (roleStyle === 'partner') roleGuide = 'Collaborate as equals. Think out loud together. Offer options, not directives.';
    else if (roleStyle === 'helper') roleGuide = 'Be ready and responsive. Wait for requests, then deliver excellently.';
    else roleGuide = 'Lead with encouragement. Highlight progress, celebrate effort, keep morale high.';

    let levelGuide = '';
    if (levelStyle === 'beginner') levelGuide = 'Explain everything step by step. No jargon. Use analogies and examples.';
    else if (levelStyle === 'intermediate') levelGuide = 'Skip obvious basics. Focus on tips and best practices. Introduce new concepts gently.';
    else levelGuide = 'Be direct and advanced. Introduce complex concepts. Challenge thinking.';

    let techGuide = '';
    if (techFrust === 'complicated') techGuide = 'Simplify everything. Break into tiny steps. One thing at a time.';
    else if (techFrust === 'changes_fast') techGuide = 'Focus on stable fundamentals. Flag changes gently. Minimize overwhelm.';
    else if (techFrust === 'no_time') techGuide = 'Prioritize efficiency. Quick wins first. Automate what you can.';
    else techGuide = 'Provide clear starting points. Curate the best path. Remove decision paralysis.';

    const soulUpdate = `

## Personality Calibration (${dateStr})
- **Address user as:** ${preferredName}
- **Tone:** ${toneGuide}
- **Role:** ${roleGuide}
- **Level:** ${levelGuide}
- **Tech approach:** ${techGuide}
- **Best time to engage:** ${label('q2_rhythm', r.q2_rhythm)}
- **Motivators:** ${label('q5_energy', r.q5_energy)}, ${label('q14_legacy', r.q14_legacy)}
- **Interests for conversation:** ${label('q6_topics', r.q6_topics)}, ${label('q9_music', r.q9_music)}, ${label('q8_content', r.q8_content)}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/SOUL.md << 'SOULEOF'
${soulUpdate}
SOULEOF`);

    // 4. Update AGENTS.md with response framework
    const agentsUpdate = `

## Response Framework (${dateStr})
- **Primary project focus:** ${label('q16_project', r.q16_project)}
- **Feature priorities:** ${label('q23_features', r.q23_features)}
- **Check-in schedule:** ${label('q22_checkin', r.q22_checkin)}
- **When user is stuck:** ${label('q17_challenges', r.q17_challenges)} - match this approach
- **Organization support:** User is "${label('q18_organized', r.q18_organized)}" - ${r.q18_organized === 'very' ? 'maintain their system' : 'offer organizational help proactively'}
- **Work style match:** ${label('q20_work_style', r.q20_work_style)}
- **Skill development:** Help master ${label('q13_skill', r.q13_skill)}
`;

    await sshExec(`cat >> /root/.openclaw/workspace/AGENTS.md << 'AGENTEOF'
${agentsUpdate}
AGENTEOF`);

    // 5. Send WhatsApp confirmation
    const whatsappMsg = `Hey ${preferredName}! Your personalization is complete!

Here's what I learned about you:
- You're ${label('q3_personality', r.q3_personality).toLowerCase()}
- Fascinated by ${label('q6_topics', r.q6_topics).toLowerCase()}
- Your goal: ${label('q11_goal', r.q11_goal)}
- Priority project: ${label('q16_project', r.q16_project)}

I'll check in ${label('q22_checkin', r.q22_checkin).toLowerCase()} and focus on ${label('q23_features', r.q23_features).toLowerCase()}.

Ready to get started? Just message me anytime!`;

    try {
      await sshExec(`openclaw message send --channel whatsapp --account ${WHATSAPP.account} --target '${WHATSAPP.target}' --message '${whatsappMsg.replace(/'/g, "'\"'\"'")}'`);
    } catch (msgErr) {
      console.error('WhatsApp message failed (non-fatal):', msgErr.message);
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
