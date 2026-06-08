// app.js — AI Terminology Webinar

const TERMS     = window.WEBINAR_TERMS;
const TERM_KEYS = window.WEBINAR_TERM_KEYS;
const STORAGE   = window.WEBINAR_STORAGE;
const ROOM      = new URLSearchParams(location.search).get('room') || 'ai-terms-webinar';

// Human in the Loop is always term 1; shortlist is from the remaining 5
const SHORTLIST_KEYS = TERM_KEYS.filter(k => k !== 'hitl');

// Colour palette for results bars (A, B, C, D)
const OPT_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706'];

// ── Participant identity ───────────────────────────────────────────────────────
const PARTICIPANT_ID = (() => {
  let pid = sessionStorage.getItem('webinar_pid');
  if (!pid) { pid = 'p_' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('webinar_pid', pid); }
  return pid;
})();

// ── App state ─────────────────────────────────────────────────────────────────
// Facilitator role is granted via ?role=facilitator in the URL only.
// Participants never see a role-switcher; the URL is their only control.
const URL_ROLE = new URLSearchParams(location.search).get('role');
if (URL_ROLE === 'facilitator') sessionStorage.setItem('webinar_role', 'facilitator');
let role  = sessionStorage.getItem('webinar_role') || 'participant';
let stage = 'welcome';

// ── Stage sequence ────────────────────────────────────────────────────────────
// Determined dynamically after shortlist: top 2 voted terms follow hitl.
async function getFullSequence() {
  const votes  = await getMultiVotes('shortlist');
  const counts = tallyMulti(votes, SHORTLIST_KEYS.length);
  const ranked = SHORTLIST_KEYS
    .map((k, i) => ({ k, c: counts[i] }))
    .sort((a, b) => b.c - a.c || SHORTLIST_KEYS.indexOf(a.k) - SHORTLIST_KEYS.indexOf(b.k));
  const top1 = ranked[0]?.k || SHORTLIST_KEYS[0];
  const top2 = ranked[1]?.k || SHORTLIST_KEYS[1];
  const top3 = ranked[2]?.k || SHORTLIST_KEYS[2];
  return [
    'welcome',
    'hitl_intro', 'hitl_A', 'hitl_B', 'hitl_C', 'hitl_panel',
    'shortlist',
    `${top1}_intro`, `${top1}_A`, `${top1}_B`, `${top1}_C`, `${top1}_panel`,
    `${top2}_intro`, `${top2}_A`, `${top2}_B`, `${top2}_C`, `${top2}_panel`,
    'optional_choice',
    `${top3}_intro`, `${top3}_A`, `${top3}_B`, `${top3}_C`, `${top3}_panel`,
    'close'
  ];
}

// ── Storage helpers ───────────────────────────────────────────────────────────
async function getStage()  { return (await STORAGE.getKey('stage:' + ROOM)) || 'welcome'; }
async function setStage(s) { stage = s; await STORAGE.setKey('stage:' + ROOM, s); }

async function recordVote(pollId, idx) {
  const key  = 'votes:' + ROOM + ':' + pollId;
  const data = (await STORAGE.getKey(key)) || {};
  data[PARTICIPANT_ID] = idx;
  await STORAGE.setKey(key, data);
}
async function recordMultiVote(pollId, indices) {
  const key  = 'mvotes:' + ROOM + ':' + pollId;
  const data = (await STORAGE.getKey(key)) || {};
  data[PARTICIPANT_ID] = indices;
  await STORAGE.setKey(key, data);
}
async function getVotes(pollId)      { return (await STORAGE.getKey('votes:'  + ROOM + ':' + pollId)) || {}; }
async function getMultiVotes(pollId) { return (await STORAGE.getKey('mvotes:' + ROOM + ':' + pollId)) || {}; }

async function resetSession() {
  if (role !== 'facilitator') return;
  if (!confirm('Wipe ALL votes for this room? This cannot be undone.')) return;
  await STORAGE.setKey('stage:' + ROOM, 'welcome');
  await STORAGE.setKey('mvotes:' + ROOM + ':shortlist', {});
  for (const k of TERM_KEYS) {
    for (const f of ['A', 'B', 'C']) {
      await STORAGE.setKey('votes:' + ROOM + ':' + k + '_' + f, {});
    }
  }
  stage = 'welcome';
  render();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function tally(votes, n) {
  const c = new Array(n).fill(0);
  for (const k in votes) if (votes[k] != null && votes[k] >= 0 && votes[k] < n) c[votes[k]]++;
  return c;
}
function tallyMulti(votes, n) {
  const c = new Array(n).fill(0);
  for (const k in votes) for (const i of (votes[k] || [])) if (i >= 0 && i < n) c[i]++;
  return c;
}
function totalVoters(votes) { return Object.keys(votes).length; }
function e(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Eyebrow with term name as a highlighted pill, plus optional format label
function eyebrow(termName, formatLabel) {
  return `<div class="slide-eyebrow"><span class="term-tag">${e(termName)}</span>${formatLabel ? `<span class="eyebrow-sep">·</span><span class="eyebrow-format">${e(formatLabel)}</span>` : ''}</div>`;
}
function short(s, n = 72) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ── Shared panel summary ──────────────────────────────────────────────────────
// Ranked horizontal bars (winner-first, sorted) for multi-option polls;
// large split cards for the binary lightning vote.
// Used by both facilitator and participant views during the panel stage.
async function renderPanelSummary(tk, term) {
  const [votesA, votesB, votesC] = await Promise.all([
    getVotes(tk + '_A'), getVotes(tk + '_B'), getVotes(tk + '_C')
  ]);
  const countsA = tally(votesA, term.formatA.options.length);
  const countsB = tally(votesB, term.formatB.options.length);
  const countsC = tally(votesC, term.formatC.options.length);
  const votersA = totalVoters(votesA);
  const votersB = totalVoters(votesB);
  const votersC = totalVoters(votesC);

  // Ranked bar list — sorted by votes descending, winner highlighted.
  // "Top pick" badge only shown when there is a single clear winner.
  function rankedBars(options, counts, total) {
    if (!total) return `<p class="summary-empty">No responses yet</p>`;
    const max      = Math.max(...counts, 1);
    const items    = options.map((opt, i) => ({ opt, i, c: counts[i] })).sort((a, b) => b.c - a.c);
    const topCount = items[0].c;
    const singleWinner = topCount > 0 && items.filter(x => x.c === topCount).length === 1;

    return items.map(({ opt, i, c }) => {
      const pct   = Math.round(c / total * 100);
      const w     = Math.round(c / max * 100);
      const col   = OPT_COLORS[i % OPT_COLORS.length];
      const isTop = c === topCount && c > 0;
      return `<div class="rank-row${isTop ? ' rank-top' : ''}" style="--col:${col}">
        <span class="rank-letter" style="color:${col}">${String.fromCharCode(65+i)}</span>
        <div class="rank-body">
          <div class="rank-text">${e(opt.text)}</div>
          <div class="rank-bar-track">
            <div class="rank-bar-fill" style="width:${w}%;background:${col}"></div>
          </div>
          ${isTop && singleWinner ? `<span class="rank-badge" style="background:${col}">Top pick</span>` : ''}
        </div>
        <div class="rank-pct" style="color:${col}">${pct}%</div>
      </div>`;
    }).join('') + `<p class="res-total">${total} response${total!==1?'s':''}</p>`;
  }

  // Binary split — winner gets coloured background, loser gets muted styling
  function binarySplit(options, counts, total) {
    const denom = (counts[0] + counts[1]) || 1;
    return `<div class="binary-split">
      ${options.map((opt, i) => {
        const pct   = total ? Math.round(counts[i] / denom * 100) : 0;
        const col   = OPT_COLORS[i];
        const isTop = counts[i] > counts[1 - i];
        return `<div class="binary-card${isTop ? ' binary-top' : ' binary-low'}" style="--col:${col}">
          <div class="binary-letter" style="color:${isTop ? col : 'var(--text-muted)'}">${String.fromCharCode(65+i)}</div>
          <div class="binary-pct" style="color:${isTop ? col : 'var(--text-muted)'}">${pct}%</div>
          <div class="binary-text">${e(opt.text)}</div>
          <div class="binary-count">${counts[i]} vote${counts[i]!==1?'s':''}</div>
        </div>`;
      }).join('')}
    </div>
    ${total ? `<p class="res-total">${total} response${total!==1?'s':''}</p>` : ''}`;
  }

  // Layout: definition takes left column (4 options = more text);
  // scenario + lightning stacked in right column (fewer options each).
  // Mobile-compact summary: just the top pick + % for each section
  function mobileSummary() {
    function topPick(options, counts, total, label) {
      if (!total) return `<div class="mob-row"><span class="mob-label">${label}</span><span class="mob-empty">No votes yet</span></div>`;
      const max = Math.max(...counts);
      const winner = options.findIndex((_, i) => counts[i] === max);
      const pct = Math.round(max / total * 100);
      const col = OPT_COLORS[winner % OPT_COLORS.length];
      return `<div class="mob-row">
        <span class="mob-label">${label}</span>
        <span class="mob-winner">
          <span class="mob-letter" style="color:${col}">${String.fromCharCode(65+winner)}</span>
          <span class="mob-text">${e(short(options[winner].text, 55))}</span>
          <span class="mob-pct" style="color:${col}">${pct}%</span>
        </span>
      </div>`;
    }
    const denom = (countsC[0] + countsC[1]) || 1;
    const lwinner = countsC[0] >= countsC[1] ? 0 : 1;
    const lpct = votersC ? Math.round(countsC[lwinner] / denom * 100) : 0;
    const lcol = OPT_COLORS[lwinner];
    return `<div class="mob-summary">
      ${topPick(term.formatA.options, countsA, votersA, 'Definition')}
      ${topPick(term.formatB.options, countsB, votersB, 'Scenario')}
      <div class="mob-row">
        <span class="mob-label">Lightning</span>
        <span class="mob-winner">
          <span class="mob-letter" style="color:${lcol}">${String.fromCharCode(65+lwinner)}</span>
          <span class="mob-text">${e(term.formatC.options[lwinner].text)}</span>
          <span class="mob-pct" style="color:${lcol}">${lpct}%</span>
        </span>
      </div>
      ${votersA ? `<p class="res-total">${votersA} definition responses &middot; ${votersB} scenario &middot; ${votersC} lightning</p>` : ''}
    </div>`;
  }

  return `
    <div class="panel-summary-grid">
      <div class="panel-summary-col">
        <div class="panel-col-heading">How did you define it?</div>
        ${rankedBars(term.formatA.options, countsA, votersA)}
      </div>
      <div class="panel-right-stack">
        <div class="panel-summary-col">
          <div class="panel-col-heading">Scenario — ${e(term.formatB.prompt)}</div>
          ${rankedBars(term.formatB.options, countsB, votersB)}
        </div>
        <div class="panel-summary-col">
          <div class="panel-col-heading">Lightning vote — ${e(term.formatC.prompt)}</div>
          ${binarySplit(term.formatC.options, countsC, votersC)}
        </div>
      </div>
    </div>
    ${mobileSummary()}`;
}

// ── Results rendering — Mentimeter-style ──────────────────────────────────────
// mode: 'full' = full text stacked (participant results on personal device)
//       'short' = truncated inline (facilitator shared screen)
function renderBars(options, counts, voters, { labelFn, mode = 'short' } = {}) {
  const max = Math.max(...counts, 1);
  const stacked = mode === 'full';
  let html = `<div class="results-wrap${stacked ? ' results-stacked' : ''}">`;
  options.forEach((opt, i) => {
    const pct   = voters ? Math.round(counts[i] / voters * 100) : 0;
    const w     = Math.round(counts[i] / max * 100);
    const col   = OPT_COLORS[i % OPT_COLORS.length];
    const label = labelFn
      ? labelFn(opt, i)
      : `<strong>${String.fromCharCode(65 + i)}</strong> · ${e(stacked ? opt.text : short(opt.text))}`;

    if (stacked) {
      html += `
        <div class="res-row-stacked">
          <div class="res-label-stacked">${label}</div>
          <div class="res-bar-row">
            <div class="res-track">
              <div class="res-fill" style="width:${w}%;background:${col}"></div>
              <span class="res-count" style="color:${col}">${counts[i]}</span>
            </div>
            <div class="res-pct" style="color:${col}">${pct}%</div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="res-row">
          <div class="res-label">${label}</div>
          <div class="res-track">
            <div class="res-fill" style="width:${w}%;background:${col}"></div>
            <span class="res-count" style="color:${col}">${counts[i]}</span>
          </div>
          <div class="res-pct" style="color:${col}">${pct}%</div>
        </div>`;
    }
  });
  if (voters) html += `<p class="res-total">${voters} response${voters !== 1 ? 's' : ''}</p>`;
  html += `</div>`;
  return html;
}

function renderLightningBars(options, counts, voters) {
  let html = `<div class="lightning-wrap">`;
  options.forEach((opt, i) => {
    const total = counts[0] + counts[1] || 1;
    const pct   = voters ? Math.round(counts[i] / total * 100) : 0;
    const col   = OPT_COLORS[i];
    html += `<div class="lightning-col" style="border-top:4px solid ${col}">
      <div class="lightning-letter" style="color:${col}">${String.fromCharCode(65 + i)}</div>
      <div class="lightning-text">${e(opt.text)}</div>
      <div class="lightning-pct" style="color:${col}">${pct}%</div>
      <div class="lightning-n">${counts[i]} vote${counts[i] !== 1 ? 's' : ''}</div>
    </div>`;
  });
  html += `</div>`;
  if (voters) html += `<p class="res-total">${voters} total response${voters !== 1 ? 's' : ''}</p>`;
  return html;
}

// ── Facilitator view — shared presentation screen ─────────────────────────────
async function renderFacilitatorStage() {
  // ---- Welcome ----
  if (stage === 'welcome') {
    return `<div class="slide slide-hero">
      <div class="slide-eyebrow">Virtual Webinar &middot; 60 minutes</div>
      <h1 class="slide-title" style="margin-bottom:.75rem">AI Terminology<br>for Public Health</h1>
      <div class="join-block">
        <div class="qr-wrap"><div id="qr-canvas"></div></div>
        <div class="join-url-block">
          <div class="join-url-label">Participant link</div>
          <div class="join-url" id="join-url-text">Loading…</div>
          <div class="join-hint">Scan the QR code or paste this link in the webinar chat.<br>No login needed &mdash; opens straight to the voting screen.</div>
        </div>
      </div>
    </div>`;
  }

  // ---- Optional choice (facilitator-only decision, not advertised to participants) ----
  if (stage === 'optional_choice') {
    const seq       = await getFullSequence();
    const top3stage = seq[seq.indexOf('optional_choice') + 1] || 'close';
    const top3key   = top3stage.split('_')[0];
    const top3term  = TERMS[top3key];
    // Show a neutral close slide to everyone; the facilitator's control bar
    // offers the choice between closing and continuing via the ctrl-extra div.
    const ctrlHtml = top3term
      ? `<div id="ctrl-extra" style="display:flex;gap:10px;justify-content:center;margin-top:8px">
          <button class="ctrl-extra-btn" onclick="goToStage('${top3stage}')">+ One more: ${e(top3term.name)}</button>
          <button class="ctrl-extra-btn ctrl-extra-primary" onclick="goToStage('close')">Close session</button>
        </div>`
      : '';
    // Inject the extra buttons into the ctrl-bar after render
    setTimeout(() => {
      const bar = document.getElementById('ctrl-bar');
      if (bar && role === 'facilitator') {
        const existing = document.getElementById('ctrl-extra');
        if (!existing) bar.insertAdjacentHTML('beforeend', ctrlHtml);
      }
    }, 50);
    return `<div class="slide slide-hero">
      <div class="slide-eyebrow">Wrapping up</div>
      <h1 class="slide-title">Thank you</h1>
      <p class="slide-body" style="max-width:520px;margin:1rem auto 0;text-align:center;color:var(--text-muted);font-size:16px">
        Thank you for your participation today. The facilitator will continue shortly.
      </p>
    </div>`;
  }

  // ---- Close ----
  if (stage === 'close') {
    return `<div class="slide slide-hero">
      <div class="slide-eyebrow">Thank you</div>
      <h1 class="slide-title">Summary &amp; Close</h1>
      <p class="slide-body" style="max-width:560px;margin:1.5rem auto 0;text-align:center;color:var(--text-muted);font-size:16px">
        The terms we explored reflect real tensions in implementation — between clinical and public health framings, between model performance and programme outcomes, between governance as risk management and governance as sovereignty.
      </p>
    </div>`;
  }

  // ---- Shortlist ----
  if (stage === 'shortlist') {
    const votes  = await getMultiVotes('shortlist');
    const counts = tallyMulti(votes, SHORTLIST_KEYS.length);
    const voters = totalVoters(votes);
    const max    = Math.max(...counts, 1);
    const ranked = SHORTLIST_KEYS.map((k, i) => ({ k, c: counts[i] })).sort((a, b) => b.c - a.c);

    let bars = `<div class="results-wrap" style="margin-top:1.5rem">`;
    ranked.forEach((r, ri) => {
      const pct = voters ? Math.round(r.c / voters * 100) : 0;
      const w   = Math.round(r.c / max * 100);
      const col = ri < 2 && r.c > 0 ? OPT_COLORS[ri] : '#CBD5E1';
      bars += `<div class="res-row">
        <div class="res-label">${e(TERMS[r.k].name)}</div>
        <div class="res-track">
          <div class="res-fill" style="width:${w}%;background:${col}"></div>
          <span class="res-count" style="color:${col}">${r.c}</span>
        </div>
        <div class="res-pct" style="color:${col}">${pct}%</div>
      </div>`;
    });
    bars += `</div>`;
    if (voters) bars += `<p class="res-total">${voters} response${voters !== 1 ? 's' : ''}</p>`;

    return `<div class="slide">
      <div class="slide-eyebrow">Participant vote</div>
      <h1 class="slide-title" style="font-size:clamp(24px,4vw,40px)">Which two topics next?</h1>
      ${bars}
    </div>`;
  }

  // ---- Term stages ----
  const [tk, fmt] = stage.split('_');
  const term = TERMS[tk];
  if (!term) return `<div class="slide"><p class="slide-eyebrow">Loading…</p></div>`;

  // Intro — term overview before the definition vote
  if (fmt === 'intro') {
    const intro = term.intro || {};
    return `<div class="slide slide-intro">
      <div class="intro-icon">${intro.icon || ''}</div>
      ${eyebrow(term.name)}
      <h1 class="intro-term">${e(term.name)}</h1>
      <p class="intro-concept">${e(intro.concept || '')}</p>
      <div class="intro-cards">
        <div class="intro-card intro-card-neutral">
          <div class="intro-card-label">The generic definition</div>
          <p>${e(intro.concept || '')}</p>
        </div>
        <div class="intro-card intro-card-tension">
          <div class="intro-card-label">In public health practice</div>
          <p>${e(intro.ambiguity || '')}</p>
        </div>
      </div>
      <p class="intro-question">${e(intro.question || '')}</p>
    </div>`;
  }

  // Panel — facilitator shared screen: results summary
  if (fmt === 'panel') {
    const summary = await renderPanelSummary(tk, term);
    return `<div class="slide panel-summary-slide">
      ${eyebrow(term.name)}
      <h1 class="slide-title" style="font-size:clamp(22px,3.5vw,36px);margin-bottom:1.25rem">Discussion &amp; Reflections</h1>
      ${summary}
    </div>`;
  }

  // Format A — definition vote
  if (fmt === 'A') {
    const votes  = await getVotes(tk + '_A');
    const counts = tally(votes, term.formatA.options.length);
    const voters = totalVoters(votes);
    return `<div class="slide">
      ${eyebrow(term.name, 'How Do You Define It?')}
      <h2 class="slide-question">${e(term.formatA.prompt)}</h2>
      ${renderBars(term.formatA.options, counts, voters, { mode: 'full' })}
    </div>`;
  }

  // Format B — scenario
  if (fmt === 'B') {
    const votes  = await getVotes(tk + '_B');
    const counts = tally(votes, term.formatB.options.length);
    const voters = totalVoters(votes);
    return `<div class="slide">
      ${eyebrow(term.name, 'Scenario')}
      <div class="scenario-box"><div class="label">Scenario</div>${e(term.formatB.scenario)}</div>
      <h2 class="slide-question">${e(term.formatB.prompt)}</h2>
      ${renderBars(term.formatB.options, counts, voters, { mode: 'full' })}
    </div>`;
  }

  // Format C — lightning vote
  if (fmt === 'C') {
    const votes  = await getVotes(tk + '_C');
    const counts = tally(votes, term.formatC.options.length);
    const voters = totalVoters(votes);
    return `<div class="slide">
      ${eyebrow(term.name, 'Lightning Vote')}
      <h2 class="slide-question" style="font-size:clamp(18px,2vw,26px);max-width:760px;margin:0 auto 2rem;text-align:center">${e(term.formatC.prompt)}</h2>
      ${renderLightningBars(term.formatC.options, counts, voters)}
    </div>`;
  }

  return `<div class="slide"><p class="slide-eyebrow">Loading…</p></div>`;
}

// ── Participant view — personal device ────────────────────────────────────────
async function renderParticipantStage() {
  // ---- Welcome ----
  if (stage === 'welcome') {
    return `<div class="panel">
      <span class="stage-pill">Welcome</span>
      <h2 style="margin-top:.75rem">AI Terminology for Public Health</h2>
      <p>You'll vote on definitions, scenarios, and priority topics. Results appear live on the shared screen.</p>
      <p class="muted">Waiting for the session to begin…</p>
    </div>`;
  }

  // ---- Optional choice — participants just see a neutral holding screen ----
  if (stage === 'optional_choice') {
    return `<div class="panel">
      <h2>Thank you for your participation</h2>
      <p class="muted">The facilitator will continue shortly.</p>
    </div>`;
  }

  // ---- Close ----
  if (stage === 'close') {
    return `<div class="panel">
      <span class="stage-pill">Close</span>
      <h2 style="margin-top:.75rem">Thank you for joining</h2>
      <p class="muted">Session recording and resources to follow.</p>
    </div>`;
  }

  // ---- Shortlist ----
  if (stage === 'shortlist') {
    const allVotes = await getMultiVotes('shortlist');
    const myVotes  = allVotes[PARTICIPANT_ID] || [];
    const counts   = tallyMulti(allVotes, SHORTLIST_KEYS.length);
    const voters   = totalVoters(allVotes);

    if (myVotes.length > 0) {
      const picked = myVotes.map(i => e(TERMS[SHORTLIST_KEYS[i]].name)).join(' &amp; ');
      return `<div class="panel">
        <span class="stage-pill">Your vote is in</span>
        <h2 style="margin-top:.75rem">You chose: ${picked}</h2>
        <p class="muted">Live standings:</p>
        ${renderBars(SHORTLIST_KEYS.map(k => ({ text: TERMS[k].name })), counts, voters, {
          labelFn: (opt) => e(opt.text)
        })}
      </div>`;
    }

    return `<div class="panel">
      <span class="stage-pill">Vote</span>
      <h2 style="margin-top:.75rem">Choose two topics</h2>
      <p>Pick <strong>two</strong> terms you most want to explore today.</p>
      ${myVotes.length === 2 ? `<p class="muted">Two selected.</p>` : `<p class="muted">${myVotes.length} / 2 selected</p>`}
      <div class="term-grid">
        ${SHORTLIST_KEYS.map((k, i) => {
          const sel = myVotes.includes(i);
          return `<div class="term-card ${sel ? 'selected' : ''}" onclick="toggleShortlist(${i})">
            <div class="t-name">${e(TERMS[k].name)}</div>
            <div class="t-desc">${e(TERMS[k].short)}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // ---- Term stages ----
  const [tk, fmt] = stage.split('_');
  const term = TERMS[tk];
  if (!term) return `<div class="panel"><p class="muted">Waiting for next prompt…</p></div>`;

  if (fmt === 'intro') {
    const intro = term.intro || {};
    return `<div class="panel">
      <span class="stage-pill">${e(term.name)}</span>
      <h2 style="margin-top:.75rem">${e(term.name)}</h2>
      <p>${e(intro.concept || '')}</p>
      <div class="intro-ambiguity-box">
        <div class="intro-ambiguity-label">Why this term is contested</div>
        <p>${e(intro.ambiguity || '')}</p>
      </div>
      <p class="help" style="margin-top:1rem;font-style:italic">"${e(intro.question || '')}"</p>
    </div>`;
  }

  if (fmt === 'panel') {
    const summary = await renderPanelSummary(tk, term);
    return `<div class="panel">
      <span class="stage-pill">Discussion &amp; Reflections</span>
      <h2 style="margin-top:.75rem">${e(term.name)}</h2>
      ${summary}
      <div class="panel-engage">
        <p><strong>Want to contribute?</strong></p>
        <ul>
          <li>Type a question or comment in the <strong>webinar chat</strong></li>
          <li><strong>Raise your hand</strong> in the webinar platform if you'd like to speak</li>
        </ul>
      </div>
    </div>`;
  }

  if (fmt === 'A') {
    const allVotes = await getVotes(tk + '_A');
    const myVote   = allVotes[PARTICIPANT_ID];
    const hasVoted = myVote !== undefined;
    const counts   = tally(allVotes, term.formatA.options.length);
    const voters   = totalVoters(allVotes);

    if (hasVoted) {
      return `<div class="panel">
        <span class="stage-pill">How Do You Define It?</span>
        <h2 style="margin-top:.75rem">${e(term.name)}</h2>
        <p class="muted">You selected <strong>${String.fromCharCode(65 + myVote)}</strong> · Live results:</p>
        ${renderBars(term.formatA.options, counts, voters, { mode: 'full' })}
      </div>`;
    }

    let html = `<div class="panel">
      <span class="stage-pill">How Do You Define It?</span>
      <h2 style="margin-top:.75rem">${e(term.name)}</h2>
      <p>${e(term.formatA.prompt)}</p>`;
    term.formatA.options.forEach((opt, i) => {
      html += `<div class="def-option" onclick="castVote('${tk}_A', ${i})">
        <div class="def-letter">${String.fromCharCode(65 + i)}</div>
        <div class="def-text">${e(opt.text)}</div>
      </div>`;
    });
    html += `<p class="help">Select one option to cast your vote.</p></div>`;
    return html;
  }

  if (fmt === 'B') {
    const allVotes = await getVotes(tk + '_B');
    const myVote   = allVotes[PARTICIPANT_ID];
    const hasVoted = myVote !== undefined;
    const counts   = tally(allVotes, term.formatB.options.length);
    const voters   = totalVoters(allVotes);

    if (hasVoted) {
      return `<div class="panel">
        <span class="stage-pill">Scenario</span>
        <h2 style="margin-top:.75rem">${e(term.name)}</h2>
        <div class="scenario-box"><div class="label">Scenario</div>${e(term.formatB.scenario)}</div>
        <p class="muted">You selected <strong>${String.fromCharCode(65 + myVote)}</strong> · Live results:</p>
        ${renderBars(term.formatB.options, counts, voters, { mode: 'full' })}
      </div>`;
    }

    let html = `<div class="panel">
      <span class="stage-pill">Scenario</span>
      <h2 style="margin-top:.75rem">${e(term.name)}</h2>
      <div class="scenario-box"><div class="label">Scenario</div>${e(term.formatB.scenario)}</div>
      <p><strong>${e(term.formatB.prompt)}</strong></p>`;
    term.formatB.options.forEach((opt, i) => {
      html += `<div class="def-option" onclick="castVote('${tk}_B', ${i})">
        <div class="def-letter">${String.fromCharCode(65 + i)}</div>
        <div class="def-text">${e(opt.text)}</div>
      </div>`;
    });
    html += `<p class="help">Select one option to cast your vote.</p></div>`;
    return html;
  }

  if (fmt === 'C') {
    const allVotes = await getVotes(tk + '_C');
    const myVote   = allVotes[PARTICIPANT_ID];
    const hasVoted = myVote !== undefined;
    const counts   = tally(allVotes, term.formatC.options.length);
    const voters   = totalVoters(allVotes);

    if (hasVoted) {
      return `<div class="panel">
        <span class="stage-pill">Lightning Vote</span>
        <h2 style="margin-top:.75rem">${e(term.name)}</h2>
        <p>${e(term.formatC.prompt)}</p>
        ${renderLightningBars(term.formatC.options, counts, voters)}
      </div>`;
    }

    let html = `<div class="panel">
      <span class="stage-pill">Lightning Vote</span>
      <h2 style="margin-top:.75rem">${e(term.name)}</h2>
      <p><strong>${e(term.formatC.prompt)}</strong></p>`;
    term.formatC.options.forEach((opt, i) => {
      html += `<div class="def-option" onclick="castVote('${tk}_C', ${i})">
        <div class="def-letter">${String.fromCharCode(65 + i)}</div>
        <div class="def-text">${e(opt.text)}</div>
      </div>`;
    });
    html += `<p class="help">Select one option.</p></div>`;
    return html;
  }

  return `<div class="panel"><p class="muted">Waiting for next prompt…</p></div>`;
}

// ── Role bar ──────────────────────────────────────────────────────────────────
// Participants never see the role switcher or technical details.
// Facilitators get it because they arrived via ?role=facilitator.
function updateRoleBar() {
  // Role bar is hidden for everyone — role is set via ?role=facilitator URL param.
  // Session info (room, backend) is shown discreetly in the header for facilitators.
  document.getElementById('role-bar').style.display = 'none';
  const meta = document.getElementById('header-meta');
  if (!meta) return;
  if (role === 'facilitator') {
    meta.style.display = 'flex';
    document.getElementById('room-code').textContent = ROOM;
    document.getElementById('backend-tag').textContent = window.WEBINAR_BACKEND_NAME || '';
  } else {
    meta.style.display = 'none';
  }
}

function setRole(r) {
  role = r;
  sessionStorage.setItem('webinar_role', r);
  render();
}

// ── Floating facilitator control bar ─────────────────────────────────────────
function stageLabel(s) {
  if (s === 'welcome')         return 'Welcome';
  if (s === 'shortlist')       return 'Shortlist vote';
  if (s === 'optional_choice') return 'Optional — one more topic?';
  if (s === 'close')           return 'Close';
  const [tk, fmt] = s.split('_');
  const name   = TERMS[tk]?.name || tk;
  const labels = { intro: 'Introduction', A: 'Definition', B: 'Scenario', C: 'Lightning vote', panel: 'Discussion & Reflections' };
  return `${name} · ${labels[fmt] || fmt}`;
}

// Jump directly to a named stage (used by optional_choice buttons)
window.goToStage = async function(s) {
  if (role !== 'facilitator') return;
  await setStage(s); render();
};

function updateControlBar(seq) {
  const bar = document.getElementById('ctrl-bar');
  if (!bar) return;
  bar.style.display = role === 'facilitator' ? 'flex' : 'none';
  if (role !== 'facilitator') return;
  const idx  = seq.indexOf(stage);
  document.getElementById('ctrl-label').textContent = `${idx + 1} / ${seq.length}  ·  ${stageLabel(stage)}`;
  document.getElementById('ctrl-prev').disabled = idx <= 0;
  document.getElementById('ctrl-next').disabled = idx >= seq.length - 1;
}

let ctrlOpen = true;
window.toggleCtrl = function() {
  ctrlOpen = !ctrlOpen;
  document.getElementById('ctrl-body').style.display = ctrlOpen ? 'flex' : 'none';
  document.getElementById('ctrl-toggle').textContent = ctrlOpen ? '▼' : '▲';
};

// ── Navigation ────────────────────────────────────────────────────────────────
window.toggleQrPopover = function() {
  const pop = document.getElementById('qr-popover');
  if (!pop) return;
  const open = pop.classList.toggle('open');
  if (open && !pop.hasChildNodes() && window._joinUrl && typeof QRCode !== 'undefined') {
    const qrDiv = document.createElement('div');
    pop.appendChild(qrDiv);
    new QRCode(qrDiv, {
      text: window._joinUrl,
      width: 140, height: 140,
      colorDark: '1a2857', colorLight: 'ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
    const urlDiv = document.createElement('div');
    urlDiv.className = 'popover-url';
    urlDiv.textContent = document.getElementById('join-url-text')?.textContent || window._joinUrl;
    pop.appendChild(urlDiv);
  }
};

window.navigate = async function(delta) {
  if (role !== 'facilitator') return;
  const seq = await getFullSequence();
  const next = seq[seq.indexOf(stage) + delta];
  if (next !== undefined) { await setStage(next); render(); }
};

// ── Main render ───────────────────────────────────────────────────────────────
async function render() {
  updateRoleBar();
  const root = document.getElementById('main-content');
  try {
    stage = await getStage();
    const seq = await getFullSequence();
    root.innerHTML = role === 'facilitator'
      ? await renderFacilitatorStage()
      : await renderParticipantStage();
    updateControlBar(seq);

    // Build join URL once and use it everywhere
    if (role === 'facilitator') {
      const u = new URL(location.href);
      u.pathname = u.pathname.replace(/\/?$/, '/').replace(/\/[^/]*$/, '/join.html');
      u.searchParams.delete('role');
      u.searchParams.set('backend', 'firebase');
      const fullJoinUrl = u.toString();

      // Welcome slide: QR + short URL
      if (stage === 'welcome') {
        const qrEl = document.getElementById('qr-canvas');
        // Only generate once (polling would re-render)
        if (qrEl && typeof QRCode !== 'undefined' && !qrEl.hasChildNodes()) {
          new QRCode(qrEl, {
            text: fullJoinUrl,
            width: 160, height: 160,
            colorDark: '1a2857', colorLight: 'ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        }
        // Fetch a short URL from is.gd, fall back to full URL
        const urlEl = document.getElementById('join-url-text');
        if (urlEl && urlEl.textContent === 'Loading…') {
          urlEl.textContent = fullJoinUrl; // show immediately
          try {
            const resp = await fetch(
              `https://is.gd/create.php?format=simple&url=${encodeURIComponent(fullJoinUrl)}`
            );
            if (resp.ok) {
              const short = (await resp.text()).trim();
              if (short.startsWith('http')) urlEl.textContent = short;
            }
          } catch (_) { /* keep full URL */ }
        }
      }

      // Seed the persistent ctrl-bar QR button with the join URL
      if (!window._joinUrl) {
        window._joinUrl = fullJoinUrl;
        const btn = document.getElementById('ctrl-qr-btn');
        if (btn) btn.style.display = 'inline-flex';
      }
    }
  } catch (err) {
    root.innerHTML = `<div class="panel error-panel">
      <h2>Backend error</h2>
      <p>Could not connect to the storage backend.</p>
      <pre>${e(String(err))}</pre>
      <p class="muted">Try <strong>?backend=localStorage</strong> for offline facilitator mode.</p>
    </div>`;
    console.error('[webinar] render error:', err);
  }
}

// ── Event handlers ─────────────────────────────────────────────────────────────
window.castVote = async function(pollId, idx) {
  // Prevent changing a vote once cast
  const current = (await getVotes(pollId))[PARTICIPANT_ID];
  if (current !== undefined) return;
  await recordVote(pollId, idx);
  render();
};

window.toggleShortlist = async function(idx) {
  const cur = (await getMultiVotes('shortlist'))[PARTICIPANT_ID] || [];
  let next;
  if (cur.includes(idx))   next = cur.filter(x => x !== idx);
  else if (cur.length < 2) next = [...cur, idx];
  else                     next = cur;
  await recordMultiVote('shortlist', next);
  render();
};

window.setRole      = setRole;
window.resetSession = resetSession;

// ── Polling & init ─────────────────────────────────────────────────────────────
let pollTimer = null;
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(render, 5000);
}

(async function init() {
  if (STORAGE.onChange) STORAGE.onChange(render);
  render();
  startPolling();
})();
