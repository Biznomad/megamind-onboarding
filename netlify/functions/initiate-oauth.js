// Netlify Function: Initiate OAuth Flow for App Integrations
// Supports: Google Drive, Gmail, Notion, Gumroad

const APPS = {
  google_drive: {
    name: 'Google Drive',
    auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/drive.file',
    client_id_env: 'GOOGLE_CLIENT_ID'
  },
  gmail: {
    name: 'Gmail',
    auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/gmail.modify',
    client_id_env: 'GOOGLE_CLIENT_ID'
  },
  notion: {
    name: 'Notion',
    auth_url: 'https://api.notion.com/v1/oauth/authorize',
    client_id_env: 'NOTION_CLIENT_ID'
  },
  gumroad: {
    name: 'Gumroad',
    auth_url: 'https://gumroad.com/oauth/authorize',
    scope: 'view_sales',
    client_id_env: 'GUMROAD_CLIENT_ID'
  }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const appName = params.app;

  if (!appName || !APPS[appName]) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid app. Use: google_drive, gmail, notion, gumroad',
        available: Object.keys(APPS)
      })
    };
  }

  const app = APPS[appName];
  const clientId = process.env[app.client_id_env];

  if (!clientId) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: `${app.name} not configured yet`,
        message: `Set ${app.client_id_env} environment variable in Netlify`,
        setup_needed: true
      })
    };
  }

  // Build the site URL from the request
  const siteUrl = `https://${event.headers.host}`;
  const redirectUri = `${siteUrl}/oauth/callback`;

  // Generate state token for security
  const state = Buffer.from(JSON.stringify({
    app: appName,
    ts: Date.now()
  })).toString('base64url');

  let authUrl;

  if (appName === 'google_drive' || appName === 'gmail') {
    const urlParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: app.scope,
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });
    authUrl = `${app.auth_url}?${urlParams.toString()}`;
  } else if (appName === 'notion') {
    const urlParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: state,
      owner: 'user'
    });
    authUrl = `${app.auth_url}?${urlParams.toString()}`;
  } else if (appName === 'gumroad') {
    const urlParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: app.scope,
      state: state
    });
    authUrl = `${app.auth_url}?${urlParams.toString()}`;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      app: appName,
      auth_url: authUrl,
      redirect_uri: redirectUri
    })
  };
};
