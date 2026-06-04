// config.js — backend configuration.
// You only need to fill this in if you're using a shared backend (npoint or firebase).
// For localStorage (default), leave this file as-is.

// ---- npoint.io (simplest shared backend) ----
// 1. Go to https://www.npoint.io
// 2. Click "Create JSON Bin", paste {} as the content, save.
// 3. Copy the bin ID from the URL (e.g. the part after npoint.io/bins/).
// 4. Optionally lock the bin with a token (recommended for live sessions).
window.NPOINT_BIN_ID  = '';   // e.g. 'abc123def456'
window.NPOINT_TOKEN   = '';   // optional — set if you locked the bin with a token

// ---- Firebase Realtime Database (lower latency, better for >50 voters) ----
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Add a web app, copy the config below.
// 3. Enable Realtime Database in test mode (or with proper rules).
// 4. Uncomment the script imports and the init block.

/*
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, get, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT',
};

const app = initializeApp(firebaseConfig);
window.firebaseDb = getDatabase(app);
window.firebaseDbFns = { ref, get, set, onValue };
*/
