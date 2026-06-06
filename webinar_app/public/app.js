// app.js — main UI and rendering logic for the AI Terminology webinar voting app

const TERMS = window.WEBINAR_TERMS;
const TERM_KEYS = window.WEBINAR_TERM_KEYS;
const STORAGE = window.WEBINAR_STORAGE;
const ROOM = (new URLSearchParams(window.location.search).get('room')) || 'ai-terms-webinar';

// ---- state ----
let role = sessionStorage.getItem('webinar_role') || 'facilitator';
let stage = 'welcome';

const PARTICIPANT_ID = (() => {
  let pid = sessionStorage.getItem('webinar_pid');
  if (!pid) { pid = 'p_' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('webinar_pid', pid); }
  return pid;
})();

// ---- storage helpers ----
async function getStage() { return (await STORAGE.getKey('stage:' + ROOM)) || 'welcome'; }
async function setStage(s) { await STORAGE.setKey('stage:' + ROOM, s); stage = s; }
async function recordVote(pollId, idx) {
  const key = 'votes:' + ROOM + ':' + pollId;
  const data = (await STORAGE.getKey(key)) || {};
  data[PARTICIPANT_ID] = idx;
  await STORAGE.setKey(key, data);
}
async function recordMultiVote(pollId, indices) {
  const key = 'mvotes:' + ROOM + ':' + pollId;
  const data = (await STORAGE.getKey(key)) || {};
  data[PARTICIPANT_ID] = indices;
  await STORAGE.setKey(key, data);
}
async function getVotes(pollId) { return (await STORAGE.getKey('votes:' + ROOM + ':' + pollId)) || {}; }
async function getMultiVotes(pollId) { return (await STORAGE.getKey('mvotes:' + ROOM + ':' + pollId)) || {}; }
async function postChat(text) {
  const key = 'chat:' + ROOM;
  const data = (await STORAGE.getKey(key)) || [];
  const name = (document.getElementById('pid-input')?.value || '').trim() || 'Anonymous';
  data.push({ pid: PARTICIPANT_ID, name, text, ts: Date.now() });
  await STORAGE.setKey(key, data.slice(-200));
}
async function getChat() { return (await STORAGE.getKey('chat:' + ROOM)) || []; }

async function resetSession() {
  if (role !== 'facilitator') { alert('Only facilitator can reset.'); return; }
  if (!confirm('Wipe ALL votes and chat for this room? This cannot be undone.')) return;
  await STORAGE.setKey('stage:' + ROOM, 'welcome');
  await STORAGE.setKey('mvotes:' + ROOM + ':shortlist', {});
  for (const t of TERM_KEYS) {
    for (const f of ['A', 'B', 'C']) {
      await STORAGE.setKey('votes:' + ROOM + ':' + t + '_' + f, {});
    }
  }
  await STORAGE.setKey('chat:' + ROOM, []);
  stage = 'welcome';
  render();
}

// ---- role ----
function setRole(r) {
  role = r;
  sessionStorage.setItem('webinar_role', r);
  render();
}

function updateRoleBar() {
  document.getElementById('role-facilitator').className = role === 'facilitator' ? 'active' : '';
  document.getElementById('role-participant').className = role === 'participant' ? 'active' : '';
  document.getElementById('participant-id-wrap').style.display = role === 'participant' ? 'inline-block' : 'none';
  document.getElementById('room-code').textContent = 'Room: ' + ROOM;
  document.getElementById('backend-tag').textContent = window.WEBINAR_BACKEND_NAME || '';
}

// ---- helpers ----
function tally(votes, n) {
  const c = new Array(n).fill(0);
  for (const k in votes) { if (votes[k] != null && votes[k] >= 0 && votes[k] < n) c[votes[k]]++; }
  return c;
}
function tallyMulti(votes, n) {
  const c = new Array(n).fill(0);
  for (const k in votes) { for (const idx of (votes[k] || [])) { if (idx >= 0 && idx < n) c[idx]++; } }
  return c;
}
function totalVoters(votes) { return Object.keys(votes).length; }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---- render ----
async function render() {
  updateRoleBar();
  const root = document.getElementById('main-content');

  // Save any in-progress textarea content before wiping the DOM
  const savedText = {};
  root.querySelectorAll('textarea[id]').forEach(el => {
    if (el.value.trim()) savedText[el.id] = el.value;
  });

  try {
    stage = await getStage();
    root.innerHTML = role === 'facilitator' ? await renderFacilitator() : await renderParticipant();

    // Restore textarea content so polling doesn't erase what the user is typing
    Object.entries(savedText).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  } catch (err) {
    root.innerHTML = `<div class="panel error-panel">
      <h2>Backend error</h2>
      <p>Could not connect to the storage backend. Check the browser console for details.</p>
      <pre>${escapeHtml(String(err))}</pre>
      <p class="muted">You can still run the session using <strong>?backend=localStorage</strong> (facilitator-only mode).</p>
    </div>`;
    console.error('[webinar] render error:', err);
  }
}

// ---- facilitator ----
async function renderFacilitator() {
  const stages = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'shortlist', label: 'Shortlist vote' }
  ];
  for (const t of TERM_KEYS) {
    stages.push({ id: t + '_A', label: TERMS[t].name + ' — A' });
    stages.push({ id: t + '_B', label: TERMS[t].name + ' — B' });
    stages.push({ id: t + '_C', label: TERMS[t].name + ' — C' });
  }
  stages.push({ id: 'close', label: 'Close' });

  let html = `<div class="panel">
    <h2>Facilitator console</h2>
    <p class="muted">Pick the stage participants should see. Their screens update within ~2 seconds.</p>
    <div class="stage-grid">
      ${stages.map(s => `<div class="stage-btn ${s.id===stage?'active':''}" onclick="goToStage('${s.id}')">${s.label}</div>`).join('')}
    </div>
  </div>`;

  if (stage === 'welcome') {
    html += `<div class="panel"><h2>Welcome stage</h2><p>Participants see a holding screen. When ready, click "Shortlist vote" above.</p></div>`;
  } else if (stage === 'shortlist') {
    const votes = await getMultiVotes('shortlist');
    const counts = tallyMulti(votes, TERM_KEYS.length);
    const voters = totalVoters(votes);
    html += `<div class="panel"><h2>Shortlist — live results</h2>
      <p class="muted">Voters so far: <strong>${voters}</strong>. Top 3 by votes are starred.</p>`;
    const ranked = TERM_KEYS.map((k, i) => ({ k, i, c: counts[i] })).sort((a, b) => b.c - a.c);
    ranked.forEach((r, idx) => {
      const pct = voters ? Math.round(r.c / voters * 100) : 0;
      const isTop3 = idx < 3 && r.c > 0;
      html += `<div class="vote-row">
        <div class="vote-bar-wrap" style="${isTop3 ? 'border:1px solid var(--accent);' : ''}">
          <div class="vote-bar" style="width:${pct}%;"></div>
          <span class="vote-bar-label">${isTop3 ? '★ ' : ''}${escapeHtml(TERMS[r.k].name)}</span>
          <span class="vote-bar-count">${r.c} (${pct}%)</span>
        </div>
      </div>`;
    });
    html += `</div>`;
  } else if (stage === 'close') {
    const chat = await getChat();
    html += `<div class="panel"><h2>Closing — chat thread</h2>
      <p class="muted">Final reflections from participants:</p>
      <div class="chat-list">${chat.length ? chat.slice().reverse().map(c => `<div class="chat-item"><div class="who">${escapeHtml(c.name)}</div>${escapeHtml(c.text)}</div>`).join('') : '<div class="empty">No chat messages yet.</div>'}</div>
    </div>`;
  } else {
    const [tk, fmt] = stage.split('_');
    const term = TERMS[tk];
    if (!term) { html += `<div class="panel"><p>Unknown stage.</p></div>`; return html; }

    if (fmt === 'A') {
      const votes = await getVotes(tk + '_A');
      const counts = tally(votes, term.formatA.options.length);
      const voters = totalVoters(votes);
      html += `<div class="panel"><h2><span class="stage-pill">Format A</span>${escapeHtml(term.name)} — How Do You Define It?</h2>
        <p>${escapeHtml(term.formatA.prompt)}</p>
        <p class="muted">Voters: <strong>${voters}</strong></p>`;
      term.formatA.options.forEach((opt, i) => {
        const pct = voters ? Math.round(counts[i] / voters * 100) : 0;
        html += `<div class="vote-row"><div class="vote-bar-wrap"><div class="vote-bar" style="width:${pct}%;"></div>
          <span class="vote-bar-label">${String.fromCharCode(65+i)}. ${escapeHtml(opt.text.slice(0, 90))}${opt.text.length>90?'…':''}</span>
          <span class="vote-bar-count">${counts[i]} (${pct}%)</span></div></div>`;
      });
      html += `<h3>Sources (use to drive discussion AFTER vote)</h3>`;
      term.formatA.options.forEach((opt, i) => {
        html += `<p style="font-size:13px;margin:4px 0;"><strong>${String.fromCharCode(65+i)}:</strong> <em>${escapeHtml(opt.source)}</em></p>`;
      });
      html += `</div>`;
    } else if (fmt === 'B') {
      const votes = await getVotes(tk + '_B');
      const counts = tally(votes, term.formatB.options.length);
      const voters = totalVoters(votes);
      const chat = await getChat();
      const recent = chat.filter(c => c.text.length > 0).slice(-15).reverse();
      html += `<div class="panel"><h2><span class="stage-pill">Format B</span>${escapeHtml(term.name)} — Scenario Test</h2>
        <div class="scenario-box"><div class="label">Scenario</div>${escapeHtml(term.formatB.scenario)}</div>
        <p><strong>${escapeHtml(term.formatB.prompt)}</strong></p>
        <p class="muted">Voters: <strong>${voters}</strong></p>`;
      term.formatB.options.forEach((opt, i) => {
        const pct = voters ? Math.round(counts[i] / voters * 100) : 0;
        html += `<div class="vote-row"><div class="vote-bar-wrap"><div class="vote-bar" style="width:${pct}%;"></div>
          <span class="vote-bar-label">${String.fromCharCode(65+i)}. ${escapeHtml(opt.text.slice(0, 100))}${opt.text.length>100?'…':''}</span>
          <span class="vote-bar-count">${counts[i]} (${pct}%)</span></div></div>`;
      });
      html += `<h3>Discussion prompts</h3>`;
      term.formatB.discussion.forEach(d => { html += `<p style="font-size:13px;margin:6px 0;">• ${escapeHtml(d)}</p>`; });
      html += `<h3>Live chat</h3><div class="chat-list">${recent.length ? recent.map(c => `<div class="chat-item"><div class="who">${escapeHtml(c.name)}</div>${escapeHtml(c.text)}</div>`).join('') : '<div class="empty">No chat yet — prompt participants.</div>'}</div>`;
      html += `</div>`;
    } else if (fmt === 'C') {
      const votes = await getVotes(tk + '_C');
      const counts = tally(votes, term.formatC.options.length);
      const voters = totalVoters(votes);
      html += `<div class="panel"><h2><span class="stage-pill">Format C</span>${escapeHtml(term.name)} — Lightning Vote</h2>
        <p><strong>${escapeHtml(term.formatC.prompt)}</strong></p>
        <p class="muted">Voters: <strong>${voters}</strong></p>`;
      term.formatC.options.forEach((opt, i) => {
        const pct = voters ? Math.round(counts[i] / voters * 100) : 0;
        html += `<div class="vote-row"><div class="vote-bar-wrap"><div class="vote-bar" style="width:${pct}%;"></div>
          <span class="vote-bar-label">${String.fromCharCode(65+i)}. ${escapeHtml(opt.text)}</span>
          <span class="vote-bar-count">${counts[i]} (${pct}%)</span></div></div>`;
      });
      html += `<h3>Punchline (use as discussion close)</h3><p style="font-size:13px;">${escapeHtml(term.formatC.punchline)}</p></div>`;
    }
  }
  return html;
}

window.goToStage = async function(s) { await setStage(s); render(); };

// ---- participant ----
async function renderParticipant() {
  if (stage === 'welcome') {
    return `<div class="panel"><h2>Welcome</h2>
      <p>This is a 60-minute interactive webinar on AI terminology for public health.</p>
      <p>Your votes and chat messages appear live for the facilitator. Set a name above if you'd like your messages attributed; otherwise you'll show as Anonymous.</p>
      <p class="muted">Waiting for the facilitator to start the shortlist vote…</p>
    </div>`;
  }
  if (stage === 'shortlist') {
    const myVote = (await getMultiVotes('shortlist'))[PARTICIPANT_ID] || [];
    let html = `<div class="panel"><h2>Pick your three terms</h2>
      <p>Below are six AI terms. Tap up to <strong>three</strong> you most want to unpack today. Your selection updates in real time.</p>
      ${myVote.length === 3 ? '<p class="muted">You\'ve picked three. Tap one to deselect if you want to swap.</p>' : `<p class="muted">${myVote.length}/3 selected.</p>`}
      <div class="term-grid">`;
    TERM_KEYS.forEach((k, i) => {
      const sel = myVote.includes(i);
      html += `<div class="term-card ${sel?'selected':''}" onclick="toggleShortlist(${i})">
        <div class="t-name">${escapeHtml(TERMS[k].name)}</div>
        <div class="t-desc">${escapeHtml(TERMS[k].short)}</div>
      </div>`;
    });
    html += `</div></div>`;
    return html;
  }
  if (stage === 'close') {
    return `<div class="panel"><h2>Closing reflections</h2>
      <p>If you had 30 seconds to redefine one of today's terms for an audience of implementing partners, which one and how?</p>
      <textarea class="chat-input" id="close-chat" placeholder="Your reflection…"></textarea>
      <div class="ctrl-row"><button class="primary" onclick="submitChat('close-chat')">Submit</button></div>
      <p class="help">Your reflection will be visible to the facilitator and may be read out at the close.</p>
    </div>`;
  }

  const [tk, fmt] = stage.split('_');
  const term = TERMS[tk];
  if (!term) return `<div class="panel"><p>Waiting for next prompt…</p></div>`;

  if (fmt === 'A') {
    const myVote = (await getVotes(tk + '_A'))[PARTICIPANT_ID];
    let html = `<div class="panel"><h2><span class="stage-pill">How Do You Define It?</span>${escapeHtml(term.name)}</h2>
      <p>${escapeHtml(term.formatA.prompt)}</p>`;
    term.formatA.options.forEach((opt, i) => {
      const sel = myVote === i;
      html += `<div class="def-option ${sel?'selected':''}" onclick="castVote('${tk}_A', ${i})">
        <div class="def-letter">${String.fromCharCode(65+i)}</div>
        <div class="def-text">${escapeHtml(opt.text)}</div>
      </div>`;
    });
    html += `<p class="help">Tap one. You can change your vote at any time.</p></div>`;
    return html;
  }
  if (fmt === 'B') {
    const myVote = (await getVotes(tk + '_B'))[PARTICIPANT_ID];
    let html = `<div class="panel"><h2><span class="stage-pill">Scenario Test</span>${escapeHtml(term.name)}</h2>
      <div class="scenario-box"><div class="label">Scenario</div>${escapeHtml(term.formatB.scenario)}</div>
      <p><strong>${escapeHtml(term.formatB.prompt)}</strong></p>`;
    term.formatB.options.forEach((opt, i) => {
      const sel = myVote === i;
      html += `<div class="def-option ${sel?'selected':''}" onclick="castVote('${tk}_B', ${i})">
        <div class="def-letter">${String.fromCharCode(65+i)}</div>
        <div class="def-text">${escapeHtml(opt.text)}</div>
      </div>`;
    });
    html += `<h3>Add a comment</h3>
      <textarea class="chat-input" id="b-chat-${tk}" placeholder="What's missing? What would you add?"></textarea>
      <div class="ctrl-row"><button class="primary" onclick="submitChat('b-chat-${tk}')">Submit</button></div>
    </div>`;
    return html;
  }
  if (fmt === 'C') {
    const myVote = (await getVotes(tk + '_C'))[PARTICIPANT_ID];
    let html = `<div class="panel"><h2><span class="stage-pill">Lightning Vote</span>${escapeHtml(term.name)}</h2>
      <p><strong>${escapeHtml(term.formatC.prompt)}</strong></p>`;
    term.formatC.options.forEach((opt, i) => {
      const sel = myVote === i;
      html += `<div class="def-option ${sel?'selected':''}" onclick="castVote('${tk}_C', ${i})">
        <div class="def-letter">${String.fromCharCode(65+i)}</div>
        <div class="def-text">${escapeHtml(opt.text)}</div>
      </div>`;
    });
    html += `<p class="help">One tap.</p></div>`;
    return html;
  }
  return `<div class="panel"><p>Waiting for next prompt…</p></div>`;
}

window.castVote = async function(pollId, idx) { await recordVote(pollId, idx); render(); };
window.toggleShortlist = async function(idx) {
  const cur = (await getMultiVotes('shortlist'))[PARTICIPANT_ID] || [];
  let next;
  if (cur.includes(idx)) next = cur.filter(x => x !== idx);
  else if (cur.length < 3) next = [...cur, idx];
  else next = cur;
  await recordMultiVote('shortlist', next);
  render();
};
window.submitChat = async function(elId) {
  const el = document.getElementById(elId);
  if (!el || !el.value.trim()) return;
  await postChat(el.value.trim());
  el.value = '';
  render();
};
window.setRole = setRole;
window.resetSession = resetSession;

// ---- polling ----
let pollTimer = null;
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => render(), 5000);
}

// ---- init ----
(async function init() {
  // For localStorage backend, listen to storage events for instant cross-tab updates
  if (STORAGE.onChange) STORAGE.onChange(() => render());
  render();
  startPolling();
})();
