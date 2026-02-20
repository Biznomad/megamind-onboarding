// Netlify Function: Save chat conversation to MegaMind server
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
          code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || `Exit ${code}`));
        });
        stream.on('data', (d) => { stdout += d; });
        stream.stderr.on('data', (d) => { stderr += d; });
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

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"Method not allowed"}' };

  try {
    const { chatId, conversation } = JSON.parse(event.body);

    if (!chatId || !conversation) {
      return { statusCode: 400, headers, body: '{"error":"Missing chatId or conversation"}' };
    }

    const safeData = JSON.stringify(conversation);

    await sshExec(`mkdir -p /root/.openclaw/workspace/chats && cat > /root/.openclaw/workspace/chats/${chatId}.json << 'CHATEOF'
${safeData}
CHATEOF`);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, chatId }) };
  } catch (error) {
    console.error('save-chat error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
