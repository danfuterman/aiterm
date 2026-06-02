# AI Terminology Webinar — voting app

A small, self-contained interactive web app for running the **AI Terminology for Public Health** webinar. Built to support live voting, scenario discussion, and free-text comments from a webinar audience that's mostly on mute.

The app pairs with two documents:

- `AI_Terminology_Webinar_RunSheet.docx` — facilitator run-sheet
- `AI_Terminology_Webinar_ExercisePack.docx` — full exercise pack with all six terms

This README covers what the app is, how to run it, and how to extend it.

---

## What it is

A single-page web app with two views:

- **Facilitator view** — drives the session. Pick which "stage" everyone sees (welcome → shortlist vote → term 1 Format A → term 1 Format B → … → close). See live tallies, top-3 starred, sources revealed for facilitator notes, discussion prompts, and live chat for Format B.
- **Participant view** — what the audience sees. Tap-to-vote, drag-style multi-select for the shortlist, free-text input for Format B and the close.

Everything updates live across all participants within ~2 seconds. Default polling interval is 2.5s; the localStorage backend also pushes via `storage` events for instant cross-tab updates on the same device.

The session walks through six terms (any of which can be deep-dived):

- Human in the Loop
- Performance Metrics
- Clinical Evaluation
- Bias / Fairness
- Real World Evidence
- Governance

Each term has three exercise formats: How Do You Define It? (4 stakeholder-tagged definitions), Scenario Test (a real-world scenario + multi-choice + chat), and Lightning Vote (binary).

---

## Project layout

```
webinar_app/
├── public/                          ← deployable static site
│   ├── index.html                   ← UI shell
│   ├── config.js                    ← backend config (jsonbin/firebase keys)
│   ├── terms.js                     ← all content: terms, definitions, scenarios
│   ├── storage.js                   ← pluggable storage backend selector
│   └── app.js                       ← rendering, voting, polling logic
├── build_standalone.js              ← script to inline everything into one HTML file
├── AI_Terminology_Webinar_App.html  ← single-file standalone build (after running build_standalone.js)
└── README.md                        ← this file
```

---

## Running it

### Easiest: open the standalone HTML directly

The file `AI_Terminology_Webinar_App.html` (built from the `public/` folder) is a single self-contained file with all JS inlined. Open it in any modern browser. Works offline. Uses localStorage by default — meaning votes only sync within tabs of the same browser on the same device.

This is fine for **facilitator-only mode** (you run the app for your own pacing reference and use Zoom polls for the audience).

### To run a real shared session

You need a backend so votes sync across participants' devices. Three options are built in. Pick one by adding `?backend=...` to the URL.

#### Option 1: localStorage (default, no setup)
- URL: just open the file.
- Works only across tabs of the same browser on the same device.
- Use case: you (facilitator) running the app on your machine while using Zoom/Teams native polls for the audience.

#### Option 2: jsonbin.io (simplest shared backend)
- URL: `?backend=bin`
- Setup: sign up at https://jsonbin.io (free tier is fine), create a bin with content `{}`, copy the Bin ID and your X-Master-Key into `public/config.js`.
- Use case: small-to-medium webinars (up to ~100 voters). Latency ~1s. Free tier rate limits exist but are generous enough for a single 60-min session.

#### Option 3: Firebase Realtime Database (best latency, scales)
- URL: `?backend=firebase`
- Setup: create a Firebase project, enable Realtime Database, paste config into `public/config.js`, uncomment the import block.
- Use case: large webinars (>50 concurrent voters), or if you care about <500ms updates.

### Hosting

Any static host will do. Three free options:

- **GitHub Pages** — push the `public/` folder to a `gh-pages` branch.
- **Netlify drop** — drag the `public/` folder onto https://app.netlify.com/drop. You get a URL within seconds.
- **Vercel** — `vercel deploy public/`.

For the single-file build, you can also just upload `AI_Terminology_Webinar_App.html` to anywhere that serves static files (Dropbox public link, S3, your organisation's intranet, etc.).

### Local development

```bash
cd webinar_app/public
npx serve   # or: python3 -m http.server 8000
```

Then open `http://localhost:3000` (or 8000) in two browser windows — set one to facilitator, the other to participant — and vote in one to confirm the other updates.

### Rebuilding the standalone HTML

After editing files in `public/`, regenerate the bundled HTML:

```bash
cd webinar_app
node build_standalone.js
```

---

## URL parameters

| Parameter | Values | Purpose |
|---|---|---|
| `?room=` | any string | Room code. Default: `ai-terms-webinar`. Use a different code per session to keep results separate. |
| `?backend=` | `localStorage`, `bin`, `firebase` | Which storage backend to use. |

Example: `https://yourhost.com/?room=may-2026-rehearsal&backend=bin`

The role (facilitator vs participant) is set with the toggle in the top-left bar and is remembered per-browser via `sessionStorage`.

---

## Extending it

### Adding a new term

Edit `public/terms.js`. Add a new entry to `window.WEBINAR_TERMS` following the same shape as the six existing terms. Each term needs:

- `name` — display name
- `short` — one-line description for the shortlist card
- `formatA` — `{ prompt, options: [{ text, source }] }` (4 options recommended)
- `formatB` — `{ scenario, prompt, options: [{ text }], discussion: [string] }`
- `formatC` — `{ prompt, options: [{ text }], punchline }` (2 options for binary)

The shortlist UI auto-updates from `WEBINAR_TERM_KEYS`, so the new term appears automatically.

### Adding a new exercise format

Edit `public/app.js`:
- Add a new branch in `renderFacilitator()` that handles the new format ID (e.g. `'D'`).
- Add a corresponding branch in `renderParticipant()`.
- The stage IDs are `<termKey>_<formatLetter>` — the facilitator console will show the new stage button automatically once you add it to the `stages` array.

### Adding a new backend

Edit `public/storage.js`. Implement the `getKey(key)` and `setKey(key, value)` async methods (and optionally `onChange(cb)` for instant updates). Register it in the `backends` map at the bottom.

### Customising look & feel

All styling is in `public/index.html` `<style>` block, using CSS variables at the top (`--bg`, `--accent`, etc.). Change the variables to rebrand.

---

## Security notes

This is a **lightweight, ephemeral webinar tool**, not a production system.

- No authentication. Anyone with the URL can vote, post chat, or (if facilitator role) reset the session.
- The reset button is gated behind a confirm dialog and only works in facilitator mode (which is just a sessionStorage flag — easily bypassed by anyone determined to do so). For a public webinar that's normally fine.
- jsonbin and Firebase configs in `config.js` ARE shipped to the browser. Use bins/projects you don't mind being public-readable. For Firebase, set Realtime DB rules to restrict writes to the specific paths your app uses.
- No data is sent anywhere except the backend you configure. localStorage stays on-device.
- If you're running this for sensitive audiences, change the room code per session and reset between sessions.

---

## Why this is built the way it is

Three design notes for anyone editing this later:

1. **Content lives in one file (`terms.js`), separate from rendering (`app.js`).** This is so a non-developer can update wording, add a term, or rephrase a scenario without touching the rendering logic.

2. **Storage is abstracted.** The same app code works against localStorage, jsonbin, or Firebase. This means you can develop offline, test with a friend on jsonbin, and run the live session on Firebase — without changing the app.

3. **The facilitator drives the stage; participants follow.** All participants see the same stage, set by the facilitator. There's no per-participant pacing. This matches how the webinar actually runs and avoids the failure mode where someone arrives late and is on a different question from everyone else.

---

## Pre-session checklist

- [ ] Test with two devices 24 hours before the live session.
- [ ] Decide on hosting — note the URL.
- [ ] Decide on a unique `room` code for the live session (not the rehearsal one).
- [ ] If using jsonbin or Firebase, confirm config is filled in.
- [ ] Reset the session via the reset button right before going live.
- [ ] Have Zoom/Teams polls ready as a fallback if the app misbehaves.

---

## Attribution

Definitions are paraphrased from public source families (WHO/PAHO, IMDRF/regulatory bodies, FDA, academic clinical literature, and public health implementation literature) so they're recognisable but not verbatim — intentional, both for copyright and to keep the vote about meaning rather than guessing the source.
