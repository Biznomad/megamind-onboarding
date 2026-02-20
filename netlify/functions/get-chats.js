// Netlify Function: Load all chat conversations from MegaMind server
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
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    // List chat files
    const listResult = await sshExec('ls /root/.openclaw/workspace/chats/*.json 2>/dev/null || echo ""');
    const files = listResult.stdout.trim().split('\n').filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ chats: {} }) };
    }

    // Read all chat files (batch with a single command for speed)
    const readCmd = files.map(f => `echo "===FILE:${f}===" && cat "${f}"`).join(' && ');
    const readResult = await sshExec(readCmd);

    const chats = {};
    const parts = readResult.stdout.split(/===FILE:(.+?)===/);

    for (let i = 1; i < parts.length; i += 2) {
      const filePath = parts[i];
      const content = parts[i + 1]?.trim();
      if (!content) continue;

      // Extract chat ID from filename
      const match = filePath.match(/\/([^/]+)\.json$/);
      if (!match) continue;
      const chatId = match[1];

      try {
        chats[chatId] = JSON.parse(content);
      } catch (e) {
        // Skip malformed files
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ chats }) };
  } catch (error) {
    console.error('get-chats error:', error);
    return { statusCode: 200, headers, body: JSON.stringify({ chats: {} }) };
  }
};
