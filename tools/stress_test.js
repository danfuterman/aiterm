#!/usr/bin/env node
// stress_test.js — simulates N participants polling the npoint backend
// and measures success rate, latency, and 429 rate.
//
// Usage: node stress_test.js <binId> <participants> <durationSeconds>
// Example: node stress_test.js abc123 10 30

const [,, BIN_ID, PARTICIPANTS_STR, DURATION_STR] = process.argv;
const PARTICIPANTS  = parseInt(PARTICIPANTS_STR || '10', 10);
const DURATION_MS  = parseInt(DURATION_STR || '30', 10) * 1000;
const POLL_INTERVAL_MS = 5000;  // matches app.js

if (!BIN_ID) {
  console.error('Usage: node stress_test.js <binId> <participants> <durationSeconds>');
  process.exit(1);
}

const URL = `https://api.npoint.io/${BIN_ID}`;

let stats = {
  reads:    { ok: 0, rate429: 0, err: 0, totalMs: 0, count: 0 },
  writes:   { ok: 0, rate429: 0, err: 0, totalMs: 0, count: 0 },
};

async function read(label) {
  const t0 = Date.now();
  try {
    const r = await fetch(URL);
    const ms = Date.now() - t0;
    stats.reads.count++;
    stats.reads.totalMs += ms;
    if (r.status === 429) { stats.reads.rate429++; return null; }
    if (!r.ok)            { stats.reads.err++;     return null; }
    stats.reads.ok++;
    return await r.json();
  } catch(e) {
    stats.reads.err++;
    return null;
  }
}

async function write(data) {
  const t0 = Date.now();
  try {
    const r = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const ms = Date.now() - t0;
    stats.writes.count++;
    stats.writes.totalMs += ms;
    if (r.status === 429) { stats.writes.rate429++; return false; }
    if (!r.ok)            { stats.writes.err++;     return false; }
    stats.writes.ok++;
    return true;
  } catch(e) {
    stats.writes.err++;
    return false;
  }
}

// Simulate one participant: poll every POLL_INTERVAL_MS
async function participant(id, stopAt) {
  // Stagger start so they don't all fire simultaneously
  await new Promise(r => setTimeout(r, Math.random() * POLL_INTERVAL_MS));

  while (Date.now() < stopAt) {
    await read(`p${id}`);
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// Simulate a voting burst (everyone votes within ~10 seconds)
async function votingBurst(stopAt) {
  await new Promise(r => setTimeout(r, 8000)); // wait 8s then burst
  if (Date.now() >= stopAt) return;

  console.log(`\n[${ts()}] Simulating voting burst (${PARTICIPANTS} votes)…`);
  const voters = Array.from({ length: PARTICIPANTS }, (_, i) => i);
  // Votes arrive spread over 10s (realistic webinar behaviour)
  await Promise.all(voters.map(async (id) => {
    await new Promise(r => setTimeout(r, Math.random() * 10000));
    if (Date.now() >= stopAt) return;
    const current = await read(`voter${id}`);
    if (current !== null) {
      const updated = { ...current, [`vote_p${id}`]: Math.floor(Math.random() * 4) };
      await write(updated);
    }
  }));
  console.log(`[${ts()}] Voting burst complete.`);
}

function ts() {
  return new Date().toISOString().slice(11, 19);
}

function printStats() {
  const elapsed = DURATION_MS / 1000;
  const r = stats.reads, w = stats.writes;
  const totalReqs = r.count + w.count;

  console.log('\n══════════════════════════════════════════');
  console.log(`  Stress test: ${PARTICIPANTS} participants × ${elapsed}s`);
  console.log('══════════════════════════════════════════');
  console.log(`  Total requests:  ${totalReqs}  (${(totalReqs / elapsed).toFixed(1)}/s, ${(totalReqs / elapsed * 60).toFixed(0)}/min)`);
  console.log('');
  console.log(`  READS  (${r.count} total)`);
  console.log(`    ✓ OK:       ${r.ok}   (${pct(r.ok, r.count)})`);
  console.log(`    ✗ 429:      ${r.rate429}  (${pct(r.rate429, r.count)})`);
  console.log(`    ✗ other:    ${r.err}`);
  console.log(`    avg latency: ${r.count ? Math.round(r.totalMs / r.count) : '—'}ms`);
  console.log('');
  console.log(`  WRITES (${w.count} total)`);
  console.log(`    ✓ OK:       ${w.ok}   (${pct(w.ok, w.count)})`);
  console.log(`    ✗ 429:      ${w.rate429}  (${pct(w.rate429, w.count)})`);
  console.log(`    ✗ other:    ${w.err}`);
  console.log(`    avg latency: ${w.count ? Math.round(w.totalMs / w.count) : '—'}ms`);
  console.log('');

  const failRate = (r.rate429 + w.rate429 + r.err + w.err) / Math.max(totalReqs, 1);
  if (failRate === 0) {
    console.log('  VERDICT: ✅  No failures at this scale.');
  } else if (failRate < 0.05) {
    console.log(`  VERDICT: ⚠️   ${pct(failRate*totalReqs, totalReqs)} failure rate — borderline.`);
  } else {
    console.log(`  VERDICT: ❌  ${pct(failRate*totalReqs, totalReqs)} failure rate — WILL NOT hold up.`);
  }
  console.log('══════════════════════════════════════════\n');
}

function pct(n, d) {
  if (!d) return '—';
  return (n / d * 100).toFixed(0) + '%';
}

// ── main ──────────────────────────────────────────────────────────────────────

const stopAt = Date.now() + DURATION_MS;

console.log(`\n[${ts()}] Starting stress test`);
console.log(`  Participants: ${PARTICIPANTS}`);
console.log(`  Duration:     ${DURATION_MS / 1000}s`);
console.log(`  Poll interval: ${POLL_INTERVAL_MS}ms`);
console.log(`  Bin: ${URL}\n`);

// Print a live counter every 5s
const ticker = setInterval(() => {
  const r = stats.reads, w = stats.writes;
  console.log(`[${ts()}]  reads: ${r.ok}ok/${r.rate429}×429  writes: ${w.ok}ok/${w.rate429}×429`);
}, 5000);

Promise.all([
  ...Array.from({ length: PARTICIPANTS }, (_, i) => participant(i, stopAt)),
  votingBurst(stopAt),
]).then(() => {
  clearInterval(ticker);
  printStats();
});
