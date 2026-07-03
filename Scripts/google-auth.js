'use strict';
// ─── Google OAuth 2.0 (user login) ──────────────────────────────────────────
// Credentials resolution (one of):
//   1. env GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET
//   2. <BASE>/oauth-credentials.json   (the file you download from Google Cloud,
//      either {"web":{...}} or {"installed":{...}})
//
// Token (refresh + access) is stored at <BASE>/google-token.json after login.
// Both credential & token files are gitignored.

const path = require('path');
const fs   = require('fs');

const API_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive',
];

const SCOPES = [
  ...API_SCOPES,
  'openid',
  'email',
];

const PORT = process.env.PORT || 3001;

function tokenPath(BASE) { return process.env.GOOGLE_TOKEN_PATH || path.join(BASE, 'google-token.json'); }
function credPath(BASE)  { return process.env.GOOGLE_OAUTH_CRED  || path.join(BASE, 'oauth-credentials.json'); }

function defaultRedirect() {
  return process.env.GOOGLE_OAUTH_REDIRECT || `http://localhost:${PORT}/oauth2callback`;
}

// → { client_id, client_secret, redirect_uri } or null
function loadCreds(BASE) {
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    return {
      client_id:     process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri:  defaultRedirect(),
    };
  }
  const p = credPath(BASE);
  if (fs.existsSync(p)) {
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      const c = j.web || j.installed || j;
      return {
        client_id:     c.client_id,
        client_secret: c.client_secret,
        redirect_uri:  (c.redirect_uris && c.redirect_uris[0]) || defaultRedirect(),
      };
    } catch { /* fallthrough */ }
  }
  return null;
}

function oauthClient(BASE) {
  let google;
  try { ({ google } = require('googleapis')); }
  catch { const e = new Error('googleapis not installed — run: npm install googleapis'); e.status = 503; throw e; }
  const c = loadCreds(BASE);
  if (!c) { const e = new Error('OAuth client not configured — add oauth-credentials.json (see GDOCS-SETUP.md)'); e.status = 503; throw e; }
  return new google.auth.OAuth2(c.client_id, c.client_secret, c.redirect_uri);
}

function readStoredToken(BASE) {
  const tp = tokenPath(BASE);
  if (!fs.existsSync(tp)) return null;
  try { return JSON.parse(fs.readFileSync(tp, 'utf8')); }
  catch { return null; }
}

function parseScopeSet(scope) {
  return new Set(String(scope || '').split(/\s+/).map(s => s.trim()).filter(Boolean));
}

function analyzeStoredToken(BASE) {
  const token = readStoredToken(BASE);
  const connectedRaw = !!(token && (token.refresh_token || token.access_token));
  const email = token && token.email || null;
  const scope = token && token.scope || '';
  const grantedScopes = Array.from(parseScopeSet(scope));
  const missingScopes = API_SCOPES.filter(s => !grantedScopes.includes(s));
  const scopeOk = connectedRaw && missingScopes.length === 0;
  const needsReconnect = connectedRaw && !scopeOk;
  const error = needsReconnect
    ? 'Token Google lama belum punya izin Google Docs + Google Drive. Klik reconnect/login ulang dari Settings.'
    : null;
  return { token, connectedRaw, email, scope, grantedScopes, missingScopes, scopeOk, needsReconnect, error };
}

function assertRequiredScopes(BASE) {
  const info = analyzeStoredToken(BASE);
  if (!info.connectedRaw) {
    const e = new Error('Not connected to Google — open Settings and Login');
    e.status = 401;
    throw e;
  }
  if (!info.scopeOk) {
    const e = new Error('Google token belum punya izin Docs/Drive. Reconnect dari Settings lalu approve akses Google Docs + Google Drive.');
    e.status = 401;
    e.missingScopes = info.missingScopes;
    throw e;
  }
  return info;
}

// Authorized client (with stored token). Throws 401 if not logged in or token lacks scopes.
function getAuthClient(BASE) {
  const client = oauthClient(BASE);
  const info = assertRequiredScopes(BASE);
  const tok = info.token;
  client.setCredentials(tok);
  // Persist refreshed access tokens (keep refresh_token + email)
  client.on('tokens', t => {
    try {
      const merged = { ...tok, ...t };
      fs.writeFileSync(tokenPath(BASE), JSON.stringify(merged, null, 2));
    } catch {}
  });
  return client;
}

function getAuthUrl(BASE) {
  const client = oauthClient(BASE);
  return client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES });
}

async function handleCallback(BASE, code) {
  const { google } = require('googleapis');
  const client = oauthClient(BASE);
  const { tokens } = await client.getToken(code);
  if (!tokens.scope) tokens.scope = SCOPES.join(' ');
  client.setCredentials(tokens);
  let email = null;
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const me = await oauth2.userinfo.get();
    email = me.data.email || null;
  } catch {}
  // Preserve refresh_token across re-logins (Google omits it if already granted)
  const tp = tokenPath(BASE);
  let prev = {};
  try { if (fs.existsSync(tp)) prev = JSON.parse(fs.readFileSync(tp, 'utf8')); } catch {}
  const toSave = { ...prev, ...tokens, email };
  if (!toSave.refresh_token && prev.refresh_token) toSave.refresh_token = prev.refresh_token;
  fs.writeFileSync(tp, JSON.stringify(toSave, null, 2));
  return { email };
}

function status(BASE) {
  let oauthConfigured = false, redirectUri = null;
  try { const c = loadCreds(BASE); oauthConfigured = !!c; redirectUri = c && c.redirect_uri; } catch {}
  const info = analyzeStoredToken(BASE);
  return {
    oauthConfigured,
    redirectUri,
    connected: info.connectedRaw && info.scopeOk,
    connectedRaw: info.connectedRaw,
    email: info.email,
    scopeOk: info.scopeOk,
    needsReconnect: info.needsReconnect,
    missingScopes: info.missingScopes,
    grantedScopes: info.grantedScopes,
    scope: info.scope,
    error: info.error,
  };
}

function logout(BASE) {
  const tp = tokenPath(BASE);
  try { if (fs.existsSync(tp)) fs.unlinkSync(tp); } catch {}
  return { ok: true };
}

module.exports = {
  getAuthClient,
  getAuthUrl,
  handleCallback,
  status,
  logout,
  SCOPES,
  API_SCOPES,
  analyzeStoredToken,
  assertRequiredScopes,
};
