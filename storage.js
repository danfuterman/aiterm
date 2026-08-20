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

  // --------- npoint.io backend ---------
  // Simple REST shared store. Set window.NPOINT_BIN_ID in config.js.
  // Trade-off: ~5s sync latency. No account required for public bins.
  //
  // Rate-limit mitigation: reads are cached for CACHE_TTL ms so that
  // multiple getKey() calls within one render share a single fetch.
  // Writes invalidate the cache immediately.
  const binBackend = {
    name: 'npoint',
    _cache: null,       // { data, ts }
    _inflight: null,    // in-progress fetch promise (deduplicates concurrent callers)
    CACHE_TTL: 4000,    // ms — slightly less than the 5s poll interval

    async _read() {
      const id = window.NPOINT_BIN_ID;
      if (!id) throw new Error('NPOINT_BIN_ID is not set. Check config.js or GitHub Actions secrets.');

      // Return cached data if still fresh
      if (this._cache && (Date.now() - this._cache.ts) < this.CACHE_TTL) {
        return this._cache.data;
      }

      // Deduplicate concurrent fetches (e.g. multiple getKey calls in one render)
      if (this._inflight) return this._inflight;

      this._inflight = fetch(`https://api.npoint.io/${id}`)
        .then(async r => {
          if (!r.ok) {
            const body = await r.text().catch(() => '');
            throw new Error(`npoint read failed (HTTP ${r.status}): ${body}`);
          }
          const data = await r.json();
          this._cache = { data, ts: Date.now() };
          return data;
        })
        .finally(() => { this._inflight = null; });

      return this._inflight;
    },

    async _write(obj) {
      const id = window.NPOINT_BIN_ID;
      if (!id) throw new Error('NPOINT_BIN_ID is not set. Check config.js or GitHub Actions secrets.');
      const r = await fetch(`https://api.npoint.io/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`npoint write failed (HTTP ${r.status}): ${body}`);
      }
      // Invalidate cache so the next read reflects the write
      this._cache = { data: obj, ts: Date.now() };
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

  // --------- Firebase Realtime Database backend ---------
  // Uses WebSocket subscriptions — no polling needed, instant updates,
  // no rate limits for a 100-person webinar on the free Spark tier.
  // Requires Firebase compat SDK loaded in index.html + init in config.js.
  const firebaseBackend = {
    name: 'firebase',
    _db() {
      if (!window._firebaseDb) throw new Error(
        'Firebase not initialised. Check FIREBASE_* values in config.js / GitHub secrets.'
      );
      return window._firebaseDb;
    },
    // Colon-separated keys → slash-separated Firebase paths
    _path(key) { return key.replace(/:/g, '/'); },

    async getKey(key) {
      const snap = await this._db().ref(this._path(key)).get();
      return snap.exists() ? snap.val() : null;
    },
    async setKey(key, value) {
      await this._db().ref(this._path(key)).set(value);
    },
    onChange(cb) {
      // Real-time listener on the root — fires instantly on any change
      this._db().ref('/').on('value', () => cb());
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
