// config.js — backend configuration.
// You only need to fill this in if you're using a shared backend (npoint or firebase).
// For localStorage (default), leave this file as-is.

// ---- Facilitator passcode gate (optional) ----
// Set FACILITATOR_SECURE_MODE to 'true' and FACILITATOR_PASSCODE to a short phrase
// via GitHub Secrets to require a passcode before the facilitator view loads.
// Participants are never shown this gate — it only applies to ?role=facilitator.
window.FACILITATOR_PASSCODE    = 'FACILITATOR_PASSCODE';
window.FACILITATOR_SECURE_MODE = 'FACILITATOR_SECURE_MODE';

// ---- npoint.io (simplest shared backend) ----
// 1. Go to https://www.npoint.io
// 2. Click "Create JSON Bin", paste {} as the content, save.
// 3. Copy the bin ID from the URL and paste it below.
//    Leave the bin unlocked — the random ID acts as your secret URL.
window.NPOINT_BIN_ID = '';   // e.g. 'abc123def456'

// ---- Firebase Realtime Database (recommended for live webinars) ----
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Click "Add app" → Web, register it, copy the config values below.
// 3. In the Firebase console go to Build → Realtime Database → Create database.
//    Start in TEST MODE (open rules) — fine for a single webinar session.
// 4. Paste your values below (or store them as GitHub Actions secrets —
//    see deploy.yml which injects them automatically on deploy).
(function () {
  if (new URLSearchParams(location.search).get('backend') !== 'firebase') return;
  if (typeof firebase === 'undefined') {
    console.error('[webinar] Firebase SDK not loaded. Check index.html script tags.');
    return;
  }
  var firebaseConfig = {
    apiKey:      'FIREBASE_API_KEY',
    authDomain:  'FIREBASE_AUTH_DOMAIN',
    databaseURL: 'FIREBASE_DATABASE_URL',
    projectId:   'FIREBASE_PROJECT_ID',
  };
  var app = firebase.initializeApp(firebaseConfig);
  window._firebaseDb = firebase.database(app);
})();
