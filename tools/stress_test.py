#!/usr/bin/env python3
"""
stress_test.py — simulates N participants polling the npoint backend
and measures success rate, latency, and 429 rate.

Usage: python3 stress_test.py <binId> <participants> <durationSeconds>
"""
import sys, asyncio, time, json, random
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
import threading

BIN_ID      = sys.argv[1] if len(sys.argv) > 1 else None
PARTICIPANTS = int(sys.argv[2]) if len(sys.argv) > 2 else 10
DURATION    = int(sys.argv[3]) if len(sys.argv) > 3 else 30
POLL_INTERVAL = 5.0  # seconds — matches app.js

if not BIN_ID:
    print("Usage: python3 stress_test.py <binId> <participants> <durationSeconds>")
    sys.exit(1)

URL = f"https://api.npoint.io/{BIN_ID}"

# Thread-safe stats
import threading
lock = threading.Lock()
stats = {
    "reads":  {"ok": 0, "r429": 0, "err": 0, "ms": 0, "n": 0},
    "writes": {"ok": 0, "r429": 0, "err": 0, "ms": 0, "n": 0},
}

def do_read():
    t0 = time.time()
    try:
        req = Request(URL, headers={"User-Agent": "stress-test"})
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            ms = int((time.time() - t0) * 1000)
            with lock:
                s = stats["reads"]
                s["ok"] += 1; s["ms"] += ms; s["n"] += 1
            return data
    except HTTPError as e:
        ms = int((time.time() - t0) * 1000)
        with lock:
            s = stats["reads"]
            s["n"] += 1; s["ms"] += ms
            if e.code == 429: s["r429"] += 1
            else:             s["err"] += 1
        return None
    except Exception:
        with lock:
            s = stats["reads"]
            s["err"] += 1; s["n"] += 1
        return None

def do_write(data):
    t0 = time.time()
    try:
        body = json.dumps(data).encode()
        req = Request(URL, data=body, method="POST",
                      headers={"Content-Type": "application/json",
                               "User-Agent": "stress-test"})
        with urlopen(req, timeout=10) as resp:
            resp.read()
            ms = int((time.time() - t0) * 1000)
            with lock:
                s = stats["writes"]
                s["ok"] += 1; s["ms"] += ms; s["n"] += 1
            return True
    except HTTPError as e:
        ms = int((time.time() - t0) * 1000)
        with lock:
            s = stats["writes"]
            s["n"] += 1; s["ms"] += ms
            if e.code == 429: s["r429"] += 1
            else:             s["err"] += 1
        return False
    except Exception:
        with lock:
            s = stats["writes"]
            s["err"] += 1; s["n"] += 1
        return False

def participant(pid, stop_at):
    # Stagger starts
    time.sleep(random.random() * POLL_INTERVAL)
    while time.time() < stop_at:
        do_read()
        time.sleep(POLL_INTERVAL)

def voting_burst(stop_at):
    """Everyone votes within ~10s of the 8s mark."""
    time.sleep(8)
    if time.time() >= stop_at:
        return
    print(f"\n[{ts()}] Simulating voting burst ({PARTICIPANTS} votes)…")

    def one_vote(vid):
        time.sleep(random.random() * 10)
        if time.time() >= stop_at:
            return
        current = do_read()
        if current is not None:
            current[f"vote_p{vid}"] = random.randint(0, 3)
            do_write(current)

    threads = [threading.Thread(target=one_vote, args=(i,), daemon=True)
               for i in range(PARTICIPANTS)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f"[{ts()}] Voting burst complete.")

def ts():
    return time.strftime("%H:%M:%S")

def print_stats():
    r, w = stats["reads"], stats["writes"]
    total = r["n"] + w["n"]
    rate_s  = total / DURATION
    rate_m  = rate_s * 60

    def pct(n, d):
        return f"{n/d*100:.0f}%" if d else "—"

    fail_n = r["r429"] + w["r429"] + r["err"] + w["err"]

    print("\n══════════════════════════════════════════")
    print(f"  Stress test: {PARTICIPANTS} participants × {DURATION}s")
    print(f"  (extrapolated to full 60-min webinar)")
    print("══════════════════════════════════════════")
    print(f"  Total requests : {total}  ({rate_s:.1f}/s, {rate_m:.0f}/min)")
    print(f"  Extrapolated   : ~{rate_m*60:.0f} requests over a 60-min session")
    print()
    print(f"  READS  ({r['n']} total)")
    print(f"    ✓ OK      : {r['ok']}  ({pct(r['ok'], r['n'])})")
    print(f"    ✗ 429     : {r['r429']}  ({pct(r['r429'], r['n'])})")
    print(f"    ✗ other   : {r['err']}")
    print(f"    avg latency: {r['ms']//r['n'] if r['n'] else '—'}ms")
    print()
    print(f"  WRITES ({w['n']} total)")
    print(f"    ✓ OK      : {w['ok']}  ({pct(w['ok'], w['n'])})")
    print(f"    ✗ 429     : {w['r429']}  ({pct(w['r429'], w['n'])})")
    print(f"    ✗ other   : {w['err']}")
    print(f"    avg latency: {w['ms']//w['n'] if w['n'] else '—'}ms")
    print()
    fail_rate = fail_n / total if total else 0
    if fail_rate == 0:
        verdict = "✅  No failures at this scale."
    elif fail_rate < 0.05:
        verdict = f"⚠️   {pct(fail_n, total)} failure rate — borderline, risky for live webinar."
    else:
        verdict = f"❌  {pct(fail_n, total)} failure rate — WILL NOT hold up for 100 participants."
    print(f"  VERDICT: {verdict}")
    print("══════════════════════════════════════════\n")

# ── main ─────────────────────────────────────────────────────────────────────

stop_at = time.time() + DURATION

print(f"\n[{ts()}] Starting stress test")
print(f"  Participants : {PARTICIPANTS}")
print(f"  Duration     : {DURATION}s")
print(f"  Poll interval: {POLL_INTERVAL}s")
print(f"  URL          : {URL}\n")

# Live ticker
def ticker_fn():
    while time.time() < stop_at:
        time.sleep(5)
        r, w = stats["reads"], stats["writes"]
        print(f"[{ts()}]  reads: {r['ok']}ok/{r['r429']}×429  "
              f"writes: {w['ok']}ok/{w['r429']}×429")

ticker = threading.Thread(target=ticker_fn, daemon=True)
ticker.start()

threads = [threading.Thread(target=participant, args=(i, stop_at), daemon=True)
           for i in range(PARTICIPANTS)]
burst = threading.Thread(target=voting_burst, args=(stop_at,), daemon=True)

for t in threads: t.start()
burst.start()
for t in threads: t.join()
burst.join()

print_stats()
