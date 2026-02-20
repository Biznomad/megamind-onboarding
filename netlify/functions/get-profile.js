// Netlify Function: Get profile + integration status from MegaMind server
const { Client } = require('ssh2');

const MEGAMIND = {
  host: '187.77.205.132',
  port: 22,
  username: 'root',
  password: process.env.MEGAMIND_PASSWORD
};

function sshExec(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => { conn.end(); reject(new Error('SSH timeout')); }, 15000);
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) { clearTimeout(timeout); conn.end(); return reject(err); }
        let stdout = '', stderr = '';
        stream.on('close', (code) => {
          clearTimeout(timeout);
          conn.end();
          resolve({ stdout, stderr, code });
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
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Read quiz state
    const quizResult = await sshExec('cat /root/.openclaw/workspace/onboarding/QUIZ_STATE.json 2>/dev/null || echo "{}"');
    let quizData = {};
    try {
      quizData = JSON.parse(quizResult.stdout.trim());
    } catch (e) {
      quizData = {};
    }

    // Read integration status
    const intResult = await sshExec('cat /root/.openclaw/workspace/integrations/status.json 2>/dev/null || echo "{}"');
    let intData = {};
    try {
      intData = JSON.parse(intResult.stdout.trim());
    } catch (e) {
      intData = {};
    }

    // Read installed skills
    const skillResult = await sshExec('ls /root/.openclaw/workspace/skills/ 2>/dev/null || echo ""');
    const installedSkills = skillResult.stdout.trim().split('\n').filter(s => s.length > 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: quizData.status || 'not_started',
        completed_at: quizData.completed_at || null,
        responses: quizData.responses || null,
        integrations: intData,
        installed_skills: installedSkills
      })
    };

  } catch (error) {
    console.error('get-profile error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'not_started', responses: null, integrations: {}, installed_skills: [] })
    };
  }
};
