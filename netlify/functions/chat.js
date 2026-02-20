// Netlify Function: Chat with MegaMind via NVIDIA NIM API
// Direct API call for fast responses (no SSH overhead)

const NVIDIA_API = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'nvidia/meta/llama-3.3-70b-instruct';

function buildSystemPrompt(profile) {
  if (!profile) {
    return `You are MegaMind, an elite personal AI assistant. You are warm, helpful, and proactive. Keep responses concise but thorough. Use simple language. Be encouraging.`;
  }

  const p = profile;
  const name = p.q1_name || 'friend';
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

  const topics = Array.isArray(p.q7_topics) ? p.q7_topics.join(', ') : (p.q7_topics || '');
  const music = Array.isArray(p.q10_music) ? p.q10_music.join(', ') : (p.q10_music || '');
  const creative = Array.isArray(p.q8_creative) ? p.q8_creative.join(', ') : (p.q8_creative || '');
  const features = Array.isArray(p.q24_features) ? p.q24_features.join(', ') : (p.q24_features || '');

  return `You are MegaMind, an elite personal AI assistant for ${displayName}. You are intelligent, warm, and deeply personalized to their needs.

## About ${displayName}
- Personality: ${p.q4_personality || 'thoughtful'}
- Energized by: ${p.q6_energy || 'learning'}
- Interests: ${topics.replace(/_/g, ' ')}
- Creative outlets: ${creative.replace(/_/g, ' ')}
- Music: ${music.replace(/_/g, ' ')}
- Community: ${(Array.isArray(p.q11_community) ? p.q11_community.join(', ') : p.q11_community || '').replace(/_/g, ' ')}

## Goals
- Biggest goal: ${(p.q12_goal || '').replace(/_/g, ' ')}
- Wants to master: ${(p.q14_skill || '').replace(/_/g, ' ')}
- Legacy: ${(p.q15_legacy || '').replace(/_/g, ' ')}
- Priority project: ${(p.q17_project || '').replace(/_/g, ' ')}
- 2-year vision: ${(p.q16_future || '').replace(/_/g, ' ')}

## How to Communicate
- Style: ${commMap[p.q22_communication] || commMap.conversational}
- Role: ${roleMap[p.q26_role] || roleMap.partner}
- Level: ${levelMap[p.q25_level] || levelMap.beginner}
- Focus on: ${features.replace(/_/g, ' ')}

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

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Chat not configured. Set NVIDIA_API_KEY.' }) };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000); // 22s abort before Netlify's 26s limit

    const response = await fetch(NVIDIA_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
      console.error('NVIDIA API error:', response.status, errText);
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
    console.error('Chat error:', error.message);

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
