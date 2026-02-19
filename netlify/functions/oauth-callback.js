// Netlify Function: OAuth Callback Handler
// Exchanges auth code for tokens, stores on MegaMind server

const { Client } = require('ssh2');

const MEGAMIND = {
  host: '187.77.205.132',
  port: 22,
  username: 'root',
  password: process.env.MEGAMIND_PASSWORD
};

const TOKEN_ENDPOINTS = {
  google_drive: 'https://oauth2.googleapis.com/token',
  gmail: 'https://oauth2.googleapis.com/token',
  notion: 'https://api.notion.com/v1/oauth/token',
  gumroad: 'https://api.gumroad.com/oauth/token'
};

function sshExec(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) { conn.end(); return reject(err); }
        let stdout = '', stderr = '';
        stream.on('close', (code) => {
          conn.end();
          code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr));
        });
        stream.on('data', (d) => { stdout += d; });
        stream.stderr.on('data', (d) => { stderr += d; });
      });
    });
    conn.on('error', reject);
    conn.connect(MEGAMIND);
  });
}

async function exchangeToken(app, code, redirectUri) {
  const endpoint = TOKEN_ENDPOINTS[app];
  let clientId, clientSecret;

  if (app === 'google_drive' || app === 'gmail') {
    clientId = process.env.GOOGLE_CLIENT_ID;
    clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  } else if (app === 'notion') {
    clientId = process.env.NOTION_CLIENT_ID;
    clientSecret = process.env.NOTION_CLIENT_SECRET;
  } else if (app === 'gumroad') {
    clientId = process.env.GUMROAD_CLIENT_ID;
    clientSecret = process.env.GUMROAD_CLIENT_SECRET;
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  // Notion uses Basic auth
  if (app === 'notion') {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${basic}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const { code, state, error } = params;

  // Handle OAuth errors
  if (error) {
    return {
      statusCode: 302,
      headers: { Location: `/oauth.html?error=${encodeURIComponent(error)}` },
      body: ''
    };
  }

  if (!code || !state) {
    return {
      statusCode: 302,
      headers: { Location: '/oauth.html?error=missing_params' },
      body: ''
    };
  }

  try {
    // Decode state
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    const app = stateData.app;

    if (!app || !TOKEN_ENDPOINTS[app]) {
      throw new Error('Invalid app in state');
    }

    // Check if token exchange is possible
    const hasCredentials = (app === 'google_drive' || app === 'gmail')
      ? process.env.GOOGLE_CLIENT_SECRET
      : app === 'notion'
        ? process.env.NOTION_CLIENT_SECRET
        : process.env.GUMROAD_CLIENT_SECRET;

    if (!hasCredentials) {
      return {
        statusCode: 302,
        headers: { Location: `/oauth.html?error=not_configured&app=${app}` },
        body: ''
      };
    }

    // Exchange code for tokens
    const siteUrl = `https://${event.headers.host}`;
    const redirectUri = `${siteUrl}/oauth/callback`;
    const tokens = await exchangeToken(app, code, redirectUri);

    const timestamp = new Date().toISOString();

    // Store tokens on MegaMind server
    const tokenData = JSON.stringify({
      connected: true,
      authorized_at: timestamp,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_in: tokens.expires_in || null,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope || null
    });

    // Update status.json on server
    const updateCmd = `
cd /root/.openclaw/workspace/integrations
python3 -c "
import json
with open('status.json','r') as f: data=json.load(f)
data['${app}'] = json.loads('${tokenData.replace(/'/g, "\\'")}')
data['last_updated'] = '${timestamp}'
with open('status.json','w') as f: json.dump(data,f,indent=2)
print('OK')
"`;

    await sshExec(updateCmd);

    // Send WhatsApp confirmation
    const appNames = {
      google_drive: 'Google Drive',
      gmail: 'Gmail',
      notion: 'Notion',
      gumroad: 'Gumroad'
    };

    const whatsappMsg = `${appNames[app]} connected! ✅ New capabilities unlocked. Try asking me to help with your files and projects!`;

    await sshExec(`openclaw message send --channel whatsapp --account bot2 --target '+16782879864' --message '${whatsappMsg}'`);

    // Redirect to success
    return {
      statusCode: 302,
      headers: { Location: `/oauth.html?connected=${app}` },
      body: ''
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 302,
      headers: { Location: `/oauth.html?error=${encodeURIComponent(error.message)}` },
      body: ''
    };
  }
};
