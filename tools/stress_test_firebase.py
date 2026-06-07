#!/usr/bin/env python3
"""
stress_test_firebase.py — simulates N participants interacting with the
Firebase Realtime Database backend over a realistic webinar session.

Uses the Firebase REST API (conservative — real clients use WebSockets
which are more efficient, so this is a worst-case estimate).

Usage: python3 stress_test_firebase.py <databaseURL> <participants> <duration_seconds>
"""
import sys, threading, time, json, random, math
from urllib.request import urlopen, Request
from urllib.error import HTTPError

DB_URL       = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else None
PARTICIPANTS = int(sys.argv[2]) if len(sys.argv) > 2 else 50
DURATION     = int(sys.argv[3]) if len(sys.argv) > 3 else 60
POLL_MS      = 5.0   # seconds between polls (matches app.js)
ROOM         = 'stress-test'

if not DB_URL:
    print("Usage: python3 stress_test_firebase.py <databaseURL> <participants> <duration_seconds>")
    sys.exit(1)

# ── Stats ─────────────────────────────────────────────────────────────────────
lock  = threading.Lock()
stats = {
    'reads':  {'ok': 0, 'err': 0, 'ms': 0, 'n': 0},
    'writes': {'ok': 0, 'err': 0, 'ms': 0, 'n': 0},
}

def do_read(path):
    url = f"{DB_URL}/{path}.json"
    t0  = time.time()
    try:
        with urlopen(Request(url), timeout=10) as r:
            r.read()
            ms = (time.time() - t0) * 1000
            with lock:
                s = stats['reads']; s['ok'] += 1; s['ms'] += ms; s['n'] += 1
            return True
    except Exception:
        with lock:
            s = stats['reads']; s['err'] += 1; s['n'] += 1
        return False

def do_write(path, data):
    url  = f"{DB_URL}/{path}.json"
    body = json.dumps(data).encode()
    t0   = time.time()
    try:
        req = Request(url, data=body, method='PUT',
                      headers={'Content-Type': 'application/json'})
        with urlopen(req, timeout=10) as r:
            r.read()
            ms = (time.time() - t0) * 1000
            with lock:
                s = stats['writes']; s['ok'] += 1; s['ms'] += ms; s['n'] += 1
            return True
    except Exception:
        with lock:
            s = stats['writes']; s['err'] += 1; s['n'] += 1
        return False

# ── Simulate one participant ──────────────────────────────────────────────────
# Webinar has ~9 votes per participant across all stages.
# Votes are spread realistically across the session with burst behaviour.
VOTE_SCHEDULE = [
    (0.10, 'hitl_A'),       # burst at 10% of session
    (0.20, 'hitl_B'),
    (0.28, 'hitl_C'),
    (0.42, 'shortlist'),    # shortlist multi-vote
    (0.55, 'top1_A'),
    (0.63, 'top1_B'),
    (0.70, 'top1_C'),
    (0.82, 'top2_A'),
    (0.88, 'top2_B'),
    (0.93, 'top2_C'),
]

def participant(pid, stop_at):
    session_start = time.time()
    session_len   = stop_at - session_start

    # Stagger join time (participants arrive over first 30s)
    time.sleep(random.uniform(0, min(30, session_len * 0.1)))

    votes_cast = set()
    next_poll  = time.time()

    while time.time() < stop_at:
        now     = time.time()
        elapsed = (now - session_start) / session_len

        # ── Polling (background reads, like setInterval in app.js) ──
        if now >= next_poll:
            do_read(f"{ROOM}/stage")
            next_poll = now + POLL_MS

        # ── Voting bursts ──
        for (t_frac, poll_id) in VOTE_SCHEDULE:
            if poll_id not in votes_cast and elapsed >= t_frac:
                # Spread votes within a burst window (±5% of session)
                jitter = random.uniform(0, session_len * 0.05)
                time.sleep(jitter)
                if time.time() < stop_at:
                    if poll_id == 'shortlist':
                        # Multi-vote: write array of 2 indices
                        path = f"{ROOM}/mvotes/shortlist/{pid}"
                        do_write(path, [random.randint(0, 4), random.randint(0, 4)])
                    else:
                        path = f"{ROOM}/votes/{poll_id}/{pid}"
                        do_write(path, random.randint(0, 3))
                    votes_cast.add(poll_id)

        time.sleep(0.5)

def ts(): return time.strftime('%H:%M:%S')

def print_stats():
    r, w    = stats['reads'], stats['writes']
    total   = r['n'] + w['n']
    rate_s  = total / DURATION if DURATION else 1
    rate_m  = rate_s * 60
    fail_n  = r['err'] + w['err']
    fail_r  = fail_n / total if total else 0

    def pct(n, d): return f"{n/d*100:.0f}%" if d else "—"
    def avg(s):    return f"{s['ms']/s['n']:.0f}ms" if s['n'] else "—"

    # Firebase Spark free-tier limits (for reference)
    est_transfer_kb = (r['ok'] * 2 + w['ok'] * 1)  # rough ~2KB read, ~1KB write
    monthly_at_scale = est_transfer_kb / 1024 * (60 / DURATION) * 60 * 24 * 30

    print("\n══════════════════════════════════════════════════════")
    print(f"  Firebase stress test: {PARTICIPANTS} participants × {DURATION}s")
    print("══════════════════════════════════════════════════════")
    print(f"  Total requests : {total}  ({rate_s:.1f}/s · {rate_m:.0f}/min)")
    print(f"  Extrapolated   : ~{int(rate_m * 60):,} requests over a 60-min session")
    print()
    print(f"  READS  ({r['n']} total)")
    print(f"    ✓ OK    : {r['ok']}  ({pct(r['ok'], r['n'])})")
    print(f"    ✗ err   : {r['err']}")
    print(f"    avg     : {avg(r)}")
    print()
    print(f"  WRITES ({w['n']} total)")
    print(f"    ✓ OK    : {w['ok']}  ({pct(w['ok'], w['n'])})")
    print(f"    ✗ err   : {w['err']}")
    print(f"    avg     : {avg(w)}")
    print()
    print("  Firebase Spark free-tier limits (for reference)")
    print(f"    Simultaneous connections : {PARTICIPANTS} / 100  {'✅' if PARTICIPANTS <= 100 else '❌'}")
    print(f"    Est. data transfer       : ~{est_transfer_kb/1024:.1f} MB this test")
    print(f"    Est. monthly (if daily)  : ~{monthly_at_scale:.0f} MB / 10,240 MB limit")
    print()
    if fail_r == 0:
        verdict = f"✅  0 failures — Firebase holds up at {PARTICIPANTS} participants."
    elif fail_r < 0.02:
        verdict = f"⚠️   {pct(fail_n,total)} failure rate — marginal."
    else:
        verdict = f"❌  {pct(fail_n,total)} failure rate — will NOT hold up."
    print(f"  VERDICT: {verdict}")
    print("══════════════════════════════════════════════════════\n")

# ── Cleanup test data ─────────────────────────────────────────────────────────
def cleanup():
    url  = f"{DB_URL}/{ROOM}.json"
    req  = Request(url, method='DELETE')
    try:
        urlopen(req, timeout=10).read()
        print(f"[{ts()}] Test data cleaned up ({ROOM}/ deleted).")
    except Exception as ex:
        print(f"[{ts()}] Cleanup note: {ex}")

# ── Main ──────────────────────────────────────────────────────────────────────
stop_at = time.time() + DURATION

print(f"\n[{ts()}] Firebase stress test starting")
print(f"  Participants  : {PARTICIPANTS}")
print(f"  Duration      : {DURATION}s (simulating {DURATION/60*60:.0f}-min session at {DURATION}s scale)")
print(f"  Poll interval : {POLL_MS}s")
print(f"  Database      : {DB_URL}")
print(f"  Room          : {ROOM}\n")

def ticker():
    while time.time() < stop_at:
        time.sleep(10)
        r, w = stats['reads'], stats['writes']
        print(f"[{ts()}]  reads {r['ok']}ok/{r['err']}err  writes {w['ok']}ok/{w['err']}err")

threads = [threading.Thread(target=participant, args=(f"p{i}", stop_at), daemon=True)
           for i in range(PARTICIPANTS)]
tick    = threading.Thread(target=ticker, daemon=True)

tick.start()
for t in threads: t.start()
for t in threads: t.join()

print_stats()
cleanup()
