#!/usr/bin/env node
// build_standalone.js — inline all JS into a single self-contained HTML file
const fs = require('fs');
const path = require('path');

const pubDir = path.join(__dirname, 'public');
const html = fs.readFileSync(path.join(pubDir, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(pubDir, 'config.js'), 'utf8');
const terms = fs.readFileSync(path.join(pubDir, 'terms.js'), 'utf8');
const storage = fs.readFileSync(path.join(pubDir, 'storage.js'), 'utf8');
const app = fs.readFileSync(path.join(pubDir, 'app.js'), 'utf8');

// Replace the four <script src="..."></script> tags with inlined content
const out = html
  .replace(/<script src="config\.js"><\/script>\s*/, `<script>\n${config}\n</script>\n`)
  .replace(/<script src="terms\.js"><\/script>\s*/, `<script>\n${terms}\n</script>\n`)
  .replace(/<script src="storage\.js"><\/script>\s*/, `<script>\n${storage}\n</script>\n`)
  .replace(/<script src="app\.js"><\/script>\s*/, `<script>\n${app}\n</script>\n`);

const outPath = path.join(__dirname, 'AI_Terminology_Webinar_App.html');
fs.writeFileSync(outPath, out);
console.log('Wrote', outPath, '(' + out.length + ' bytes)');
