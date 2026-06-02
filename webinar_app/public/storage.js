// storage.js — pluggable storage backends for the voting app.
//
// Three backends, picked at runtime via ?backend=...:
//   - localStorage  (default, single-device, good for facilitator-only mode)
//   - bin           (jsonbin.io REST, simple shared backend for live sessions)
//   - firebase      (Firebase Realtime DB, lowest latency for many concurrent voters)
//
// All backends expose the same async API:
//   getKey(key) -> any|null
//   setKey(key, value) -> void
//
// Keys used by the app:
//   stage:<room>                -> string  ("welcome" | "shortlist" | "<term>_A|B|C" | "close")
//   votes:<room>:<pollId>       -> { [participantId]: optionIndex }
//   mvotes:<room>:<pollId>      -> { [participantId]: [optionIndex, ...] }
//   chat:<room>                 -> [{ pid, name, text, ts }]

(function () {
  const params = new URLSearchParams(window.location.search);
  const backendName = params.get('backend') || 'localStorage';

  // --------- localStorage backend ---------
  // Cross-tab on the same device. Uses 'storage' event for live updates.
  const localStorageBackend = {
    name: 'localStorage',
    async getKey(key) {
      const raw = localStorage.getItem('webinar:' + key);
      return raw == null ? null : JSON.parse(raw);
    },
    async setKey(key, value) {
      localStorage.setItem('webinar:' + key, JSON.stringify(value));
    },
    onChange(cb) {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('webinar:')) cb();
      });
    }
  };

  // --------- jsonbin.io backend ---------
  // Simple REST shared store. Set window.JSONBIN_BIN_ID and window.JSONBIN_API_KEY in config.js.
  // Trade-off: rate limits on free tier, ~1s sync latency. Fine for ~100 voters.
  const binBackend = {
    name: 'jsonbin',
    cache: {},
    async _read() {
      const id = window.JSONBIN_BIN_ID;
      const key = window.JSONBIN_API_KEY;
      if (!id) throw new Error('JSONBIN_BIN_ID not configured');
      const r = await fetch(`https://api.jsonbin.io/v3/b/${id}/latest`, {
        headers: key ? { 'X-Master-Key': key } : {}
      });
      const j = await r.json();
      return j.record || {};
    },
    async _write(obj) {
      const id = window.JSONBIN_BIN_ID;
      const key = window.JSONBIN_API_KEY;
      await fetch(`https://api.jsonbin.io/v3/b/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Master-Key': key } : {}) },
        body: JSON.stringify(obj)
      });
    },
    async getKey(key) {
      const all = await this._read();
      return all[key] !== undefined ? all[key] : null;
    },
    async setKey(key, value) {
      const all = await this._read();
      all[key] = value;
      await this._write(all);
    }
  };

  // --------- Firebase backend ---------
  // Lowest latency, real WebSocket subscriptions. Requires Firebase init in config.js.
  const firebaseBackend = {
    name: 'firebase',
    async getKey(key) {
      if (!window.firebaseDb) throw new Error('Firebase not initialised');
      const { ref, get } = window.firebaseDbFns;
      const snap = await get(ref(window.firebaseDb, key.replace(/:/g, '/')));
      return snap.exists() ? snap.val() : null;
    },
    async setKey(key, value) {
      const { ref, set } = window.firebaseDbFns;
      await set(ref(window.firebaseDb, key.replace(/:/g, '/')), value);
    },
    onChange(cb) {
      const { ref, onValue } = window.firebaseDbFns;
      onValue(ref(window.firebaseDb, '/'), () => cb());
    }
  };

  const backends = {
    localStorage: localStorageBackend,
    bin: binBackend,
    firebase: firebaseBackend
  };

  window.WEBINAR_STORAGE = backends[backendName] || localStorageBackend;
  window.WEBINAR_BACKEND_NAME = window.WEBINAR_STORAGE.name;
})();
