// Netlify Function: Install a skill on MegaMind's OpenClaw server
const { Client } = require('ssh2');

const MEGAMIND = {
  host: '187.77.205.132',
  port: 22,
  username: 'root',
  password: process.env.MEGAMIND_PASSWORD
};

// Skill definitions - what gets installed on the server
const SKILLS = {
  'superpowers-mode': {
    type: 'clawhub',
    name: 'Super Brain Mode'
  },
  'daily-planner': {
    type: 'custom',
    name: 'Daily Planner',
    prompt: `# Daily Planner Skill

When the user asks you to plan their day, help with scheduling, or says "plan my day":

1. Ask what they need to accomplish today (or use known projects/priorities)
2. Create a simple numbered list ordered by priority
3. Include time estimates for each task
4. Suggest breaks and meals
5. End with an encouraging note

Keep it simple, visual with emojis, and realistic. Don't overload the day.
Remember their rhythm (morning person vs night owl) and schedule accordingly.`
  },
  'writing-helper': {
    type: 'custom',
    name: 'Writing Helper',
    prompt: `# Writing Helper Skill

When the user asks you to write something (email, post, letter, description, etc.):

1. Ask what they want to communicate and to whom (if not clear)
2. Write a complete draft in their preferred tone
3. Keep language clear and professional but warm
4. Offer to make it shorter, longer, more formal, or more casual
5. If it's a social media post, include relevant hashtags

Match the user's communication style preferences. Always offer to revise.`
  },
  'research-pro': {
    type: 'custom',
    name: 'Research Pro',
    prompt: `# Research Pro Skill

When the user asks you to research a topic:

1. Use web search to find current, reliable information
2. Summarize findings in simple, clear language
3. Organize by most important points first
4. Include sources when possible
5. Highlight actionable takeaways
6. Offer to dive deeper into any point

Avoid jargon. Explain like you're talking to a smart friend who just hasn't read about this yet.`
  },
  'budget-buddy': {
    type: 'custom',
    name: 'Budget Buddy',
    prompt: `# Budget Buddy Skill

When the user asks about budgeting, money, expenses, or financial planning:

1. Help them list income and expenses
2. Create a simple budget breakdown
3. Identify areas where they could save
4. Suggest realistic financial goals
5. Track spending if they share numbers
6. Explain financial concepts in plain English

Never judge spending. Be supportive and practical. Use simple math, not complex formulas.`
  },
  'brand-builder': {
    type: 'custom',
    name: 'Brand Builder',
    prompt: `# Brand Builder Skill

When the user asks about branding, business identity, or marketing:

1. Help define their brand voice and values
2. Suggest color palettes and visual styles
3. Write taglines and mission statements
4. Create consistent messaging across platforms
5. Advise on professional presentation
6. Help with business card text, social media bios, website copy

Keep suggestions practical and achievable. Show examples. Make them feel confident about their brand.`
  },
  'learning-coach': {
    type: 'custom',
    name: 'Learning Coach',
    prompt: `# Learning Coach Skill

When the user wants to learn something new:

1. Break the topic into small, digestible lessons
2. Start with the absolute basics - assume no prior knowledge
3. Use analogies from everyday life to explain concepts
4. Give one small practice exercise after each lesson
5. Celebrate progress and encourage them
6. Check understanding before moving on
7. Create a simple learning path they can follow

Be patient. Never rush. Use the user's preferred learning style (step-by-step, big picture, etc.).
Match their skill level preference. Make learning feel fun, not overwhelming.`
  },
  'social-media-helper': {
    type: 'custom',
    name: 'Social Media Helper',
    prompt: `# Social Media Helper Skill

When the user asks about social media posts, content, or strategy:

1. Create platform-appropriate posts (Instagram, Facebook, etc.)
2. Write engaging captions that tell a story
3. Suggest relevant hashtags (mix of popular and niche)
4. Recommend best posting times
5. Create content calendars and posting schedules
6. Help repurpose one piece of content across platforms

Keep the voice authentic to their brand. Use emojis naturally.
Focus on engagement over perfection. Encourage consistency.`
  },
  'reminder-friend': {
    type: 'custom',
    name: 'Reminder Friend',
    prompt: `# Reminder Friend Skill

When the user wants to set reminders, track dates, or remember things:

1. Acknowledge what they want to remember
2. Note the date/time/context
3. Offer to set a check-in schedule
4. Proactively mention upcoming items during conversations
5. Keep a running list of important dates and deadlines
6. Send gentle reminders without being annoying

Be like a thoughtful friend who remembers everything. Include encouraging words with reminders.`
  },
  'product-launcher': {
    type: 'custom',
    name: 'Product Launcher',
    prompt: `# Product Launcher Skill

When the user wants to create or launch a digital product:

1. Help define the product (what it is, who it's for, what problem it solves)
2. Create an outline/structure for the product content
3. Write sales copy and product descriptions
4. Suggest pricing strategies
5. Plan a simple launch sequence (pre-launch, launch day, follow-up)
6. Help set up on platforms like Gumroad
7. Create marketing materials (emails, social posts, landing page copy)

Make the process feel achievable. Break it into small steps. Celebrate each milestone.
Focus on their specific projects (End of Life Planner, Kids Coloring Book, etc.).`
  }
};

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
    const { skill } = JSON.parse(event.body);

    if (!skill || !SKILLS[skill]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unknown skill', available: Object.keys(SKILLS) })
      };
    }

    const skillDef = SKILLS[skill];

    if (skillDef.type === 'clawhub') {
      // Install from ClawHub marketplace
      try {
        await sshExec(`cd /root/.openclaw && openclaw skill install ${skill} 2>&1 || echo "clawhub_install_attempted"`);
      } catch (e) {
        // ClawHub install might fail, create as custom fallback
        const fallbackPrompt = `# ${skillDef.name}\nEnhanced mode enabled. Think deeper, provide more thorough analysis, and be more proactive with suggestions.`;
        await sshExec(`mkdir -p /root/.openclaw/workspace/skills/${skill} && cat > /root/.openclaw/workspace/skills/${skill}/README.md << 'SKILLEOF'
${fallbackPrompt}
SKILLEOF`);
      }
    } else {
      // Create custom skill as workspace file
      await sshExec(`mkdir -p /root/.openclaw/workspace/skills/${skill} && cat > /root/.openclaw/workspace/skills/${skill}/README.md << 'SKILLEOF'
${skillDef.prompt}
SKILLEOF`);
    }

    // Send WhatsApp notification
    try {
      const msg = `New skill enabled: ${skillDef.name}! I just learned something new. Try asking me to help with it!`;
      await sshExec(`openclaw message send --channel whatsapp --account bot2 --target '+16782879864' --message '${msg.replace(/'/g, "'\"'\"'")}'`);
    } catch (e) {
      // non-fatal
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, skill, name: skillDef.name })
    };

  } catch (error) {
    console.error('install-skill error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
