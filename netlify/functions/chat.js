// Netlify Function: Chat with MegaMind via OpenRouter API
// Direct API call for fast responses (no SSH overhead)

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

// Safely convert any value (string or array) to a display string
function str(val, fallback) {
  if (!val) return fallback || '';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}
function clean(val, fallback) {
  return str(val, fallback).replace(/_/g, ' ');
}
function first(val) {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

function buildSystemPrompt(profile) {
  if (!profile) {
    return `You are MegaMind, an elite personal AI assistant. You are warm, helpful, and proactive. Keep responses concise but thorough. Use simple language. Be encouraging.`;
  }

  const p = profile;
  const name = first(p.q1_name) || 'friend';
  const nameMap = { jacquie: 'Jacquie', mrs_jones: 'Mrs. Jones', j: 'J', boss: 'Boss' };
  const displayName = nameMap[name] || name;

  const commMap = {
    brief: 'Keep responses short and action-focused. Lead with the answer.',
    detailed: 'Give thorough explanations with examples and context.',
    conversational: 'Chat warmly like a trusted friend. Be personable.',
    adaptive: 'Adapt your style - brief for tasks, detailed for learning, warm for encouragement.'
  };

  const roleMap = {
    coach: 'Be proactive. Push forward, suggest next steps, celebrate wins.',
    partner: 'Collaborate as equals. Think together. Offer options, not directives.',
    helper: 'Be ready and responsive. Deliver excellent help when asked.',
    cheerleader: 'Lead with encouragement. Highlight progress. Keep spirits high.'
  };

  const levelMap = {
    beginner: 'Explain everything step by step. No jargon. Use everyday analogies.',
    intermediate: 'Skip obvious basics. Share tips and best practices.',
    advanced: 'Be direct. Introduce complex ideas. Challenge their thinking.'
  };

  return `You are MegaMind, an elite personal AI assistant for ${displayName}. You are intelligent, warm, and deeply personalized to their needs.

## About ${displayName}
- Personality: ${clean(p.q4_personality, 'thoughtful')}
- Energized by: ${clean(p.q6_energy, 'learning')}
- Interests: ${clean(p.q7_topics)}
- Creative outlets: ${clean(p.q8_creative)}
- Music: ${clean(p.q10_music)}
- Community: ${clean(p.q11_community)}

## Goals
- Biggest goal: ${clean(p.q12_goal)}
- Wants to master: ${clean(p.q14_skill)}
- Legacy: ${clean(p.q15_legacy)}
- Priority project: ${clean(p.q17_project)}
- 2-year vision: ${clean(p.q16_future)}

## How to Communicate
- Style: ${commMap[first(p.q22_communication)] || commMap.conversational}
- Role: ${roleMap[first(p.q26_role)] || roleMap.partner}
- Level: ${levelMap[first(p.q25_level)] || levelMap.beginner}
- Focus on: ${clean(p.q24_features)}

## Rules
- Always address them as ${displayName}
- Be encouraging and supportive
- Keep responses focused and practical
- Use emojis sparingly but naturally
- If they seem stressed, be extra gentle
- Match their energy - brief question = brief answer, deep question = thorough response
- Remember their projects: End of Life Planner, Kids Coloring Book, Website Building, AI Mastery`;
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
    const { messages, profile } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No messages provided' }) };
    }

    const systemPrompt = buildSystemPrompt(profile);

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-20) // Keep last 20 messages for context window
    ];

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Chat not configured. Set OPENROUTER_API_KEY.' }) };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000); // 22s abort before Netlify's 26s limit

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://megamind-onboarding.netlify.app',
        'X-Title': 'MegaMind Dashboard'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter API error:', response.status, errText);
      if (response.status === 429) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ response: "I'm getting a lot of questions right now! Give me about 30 seconds and try again." })
        };
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I had trouble thinking about that. Try again?';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: reply })
    };

  } catch (error) {
    console.error('Chat error:', error.name, error.message, error.stack);

    // Return as a 200 with response field so the client displays it as a normal message, not a broken error
    let friendlyMessage;
    if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('abort')) {
      friendlyMessage = "That's a great question! It was a bit complex for me to answer quickly. Could you try breaking it into a simpler question? For example, instead of asking about a whole project, ask about one specific step.";
    } else {
      friendlyMessage = "I had a little hiccup connecting to my brain. Try sending your message again in a few seconds. If it keeps happening, you can always reach me on WhatsApp at +1 (678) 287-9864.";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: friendlyMessage })
    };
  }
};
