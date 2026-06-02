// config.js — backend configuration.
// You only need to fill this in if you're using a shared backend (jsonbin or firebase).
// For localStorage (default), leave this file as-is.

// ---- jsonbin.io (simplest shared backend) ----
// 1. Sign up at https://jsonbin.io
// 2. Create a new bin with initial content: {}
// 3. Copy the Bin ID and your X-Master-Key, paste below.
window.JSONBIN_BIN_ID = '';   // e.g. '6543abc...'
window.JSONBIN_API_KEY = '';  // e.g. '$2a$10$...'

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
