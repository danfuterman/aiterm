#!/usr/bin/env python3
"""
qa_check.py - static analysis of the webinar app's HTML, CSS and JS.
Run from the repo root: python3 tools/qa_check.py
Exits non-zero if any FAIL checks are found.
"""
import re, sys, pathlib

ROOT   = pathlib.Path(__file__).parent.parent
HTML   = (ROOT / 'webinar_app/public/index.html').read_text()
JS     = (ROOT / 'webinar_app/public/app.js').read_text()
TERMS  = (ROOT / 'webinar_app/public/terms.js').read_text()

failures = []
passes   = []

def check(name, condition, detail=''):
    if condition:
        passes.append(name)
        print(f'  OK  {name}')
    else:
        failures.append(name)
        print(f'  FAIL  {name}' + (f'\n        {detail}' if detail else ''))

def strip_css_comments(s):
    """Remove /* ... */ blocks so comment text does not confuse content checks."""
    return re.sub(r'/\*.*?\*/', '', s, flags=re.DOTALL)

CSS = strip_css_comments(HTML)

print('\n-- HTML structure -----------------------------------------------')

check('No qr-canvas element anywhere in app.js',
      'id="qr-canvas"' not in JS,
      'id="qr-canvas" still in app.js — would produce a second QR on welcome slide')

check('fac-sidebar in HTML exactly once',
      HTML.count('id="fac-sidebar"') == 1)

check('sidebar-qr in HTML exactly once',
      HTML.count('id="sidebar-qr"') == 1)

# No duplicate IDs
ids = re.findall(r'\bid="([^"]+)"', HTML)
dupes = sorted(set(i for i in ids if ids.count(i) > 1))
check('No duplicate element IDs', not dupes,
      f'Duplicates: {dupes}')

check('No Participant-view role button in HTML',
      'id="role-participant"' not in HTML)

print('\n-- Security / integrity -----------------------------------------')

check('Firebase app-compat SRI hash present',  'sha384-ajMUFBUFMCyjh8ux' in HTML)
check('Firebase database-compat SRI hash present', 'sha384-f6/UpzjTjIXASlp2' in HTML)
check('qrcodejs SRI hash present', 'sha384-3zSEDfvllQohrq0P' in HTML)
check('No # in Firebase colorDark (causes black box)',
      "colorDark: '#" in JS,
      "colorDark must use '#xxxxxx' format for qrcodejs")
check('No # in Firebase colorLight',
      "colorLight: '#" in JS)

print('\n-- CSS correctness ----------------------------------------------')

# Extract CSS rule bodies (comments already stripped)
slide_bodies = re.findall(r'\.slide\s*\{([^}]+)\}', CSS)
hero_bodies  = re.findall(r'\.slide-hero\s*\{([^}]+)\}', CSS)
fac_bodies   = re.findall(r'\.container\.fac-layout\s*\{([^}]+)\}', CSS)

# .slide must have flex + centering
slide_base = ' '.join(slide_bodies)
check('.slide has display:flex',           'display: flex' in slide_base)
check('.slide has flex-direction:column',  'flex-direction: column' in slide_base)
check('.slide has justify-content:center', 'justify-content: center' in slide_base)
check('.slide has viewport-based min-height',
      'min-height: calc(100dvh' in slide_base or 'min-height:calc(100dvh' in slide_base)

# .slide-hero must NOT override min-height (it comes after .slide)
hero_str = ' '.join(hero_bodies)
check('.slide-hero has no min-height override',
      'min-height' not in hero_str,
      '.slide-hero has min-height which overrides .slide — vertical centering breaks')

# Facilitator layout uses grid
check('fac-layout uses display:grid',
      any('display: grid' in b or 'display:grid' in b for b in fac_bodies))

# Sidebar positioned in grid (rule is .container.fac-layout #fac-sidebar { ... })
sidebar_css = re.search(r'#fac-sidebar\s*\{([^}]+)\}', CSS)
sidebar_body = sidebar_css.group(1) if sidebar_css else ''
# Allow either standalone or descendant-selector rule
all_sidebar = ' '.join(re.findall(r'#fac-sidebar[^{]*\{([^}]+)\}', CSS))
check('sidebar has grid-column:1',
      'grid-column: 1' in all_sidebar or 'grid-column:1' in all_sidebar)
check('sidebar has grid-row:2',
      'grid-row: 2' in all_sidebar or 'grid-row:2' in all_sidebar)
check('sidebar has position:sticky',
      'position: sticky' in all_sidebar or 'position:sticky' in all_sidebar)

print('\n-- JavaScript correctness ---------------------------------------')

# Race condition guard: 'pending' placeholder set synchronously before URL build
check("window._joinUrl = 'pending' race guard present",
      "window._joinUrl = 'pending'" in JS,
      "Add window._joinUrl = 'pending' before the URL build to prevent concurrent render() calls both generating a QR")

# Final assignment uses clean.toString()
check('window._joinUrl set to computed URL',
      'window._joinUrl = clean.toString()' in JS)

# Only one QRCode() call
qr_calls = len(re.findall(r'new QRCode\(', JS))
check(f'QRCode instantiated exactly once (found {qr_calls})',
      qr_calls == 1)

# hasChildNodes guard prevents re-render
check('hasChildNodes() guard on sidebar QR generation',
      'hasChildNodes()' in JS)

# Join URL uses lastIndexOf not fragile regex chain
check('Join URL path built with lastIndexOf',
      'lastIndexOf' in JS)

# No backend param in the join URL built by JS (join.html adds it)
# Check the clean URL building block doesn't add backend=
build_section = JS.split("window._joinUrl = 'pending'")[-1].split('window._joinUrl = clean')[0]
check("No backend= added to join URL (join.html handles it)",
      "searchParams.set('backend'" not in build_section)

# join.html exists
check('join.html exists in public/',
      (ROOT / 'webinar_app/public/join.html').exists())

# join.html adds firebase backend
join_html = (ROOT / 'webinar_app/public/join.html').read_text()
check('join.html redirects with backend=firebase',
      'backend=firebase' in join_html or "backend','firebase'" in join_html)

print('\n-- Content correctness ------------------------------------------')

# No em dashes in displayed content (comments OK)
# Strip JS line comments and block comments from terms.js first
terms_no_comments = re.sub(r'//.*', '', TERMS)
terms_no_comments = re.sub(r'/\*.*?\*/', '', terms_no_comments, flags=re.DOTALL)
emdash_count = terms_no_comments.count('—')
check(f'No em dashes in terms.js content (found {emdash_count})',
      emdash_count == 0)

# All 6 terms have intro with required fields
for key in ('hitl', 'perf', 'hallu', 'bias', 'rwe', 'gov'):
    # JS object keys can be unquoted: hitl: { or quoted: 'hitl': {
    has_key   = bool(re.search(rf"['\"]?{key}['\"]?\s*:", TERMS))
    has_intro = bool(re.search(rf'{key}[\s\S]{{0,200}}intro\s*:', TERMS))
    check(f'Term {key} has intro block',
          has_key and has_intro,
          f"Missing key or intro in terms.js for '{key}'")

# Stage sequence includes _intro stages
check('getFullSequence includes hitl_intro',      "'hitl_intro'" in JS)
check('getFullSequence includes _intro for top1', '"${top1}_intro"' in JS or "`${top1}_intro`" in JS)

# Optional choice stage present
check('optional_choice in stage sequence', "'optional_choice'" in JS)

print('\n-- Summary ------------------------------------------------------')
print(f'  {len(passes)} passed   {len(failures)} failed\n')
if failures:
    for f in failures:
        print(f'  FAIL: {f}')
    sys.exit(1)
else:
    print('All checks passed.')
