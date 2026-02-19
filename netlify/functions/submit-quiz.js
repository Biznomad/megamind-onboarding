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
