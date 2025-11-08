// generator/generate_pages.js
// Usage: node generator/generate_pages.js
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data', 'lyrics.json');
const TEMPLATE = path.join(__dirname, '..', 'template', 'lyric-template.html');
const OUTDIR = path.join(__dirname, '..', 'lyrics');

function slugify(s){
  return String(s||'').toLowerCase().trim()
    .replace(/[^\w\s-]+/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/(^-|-$)/g,'');
}

if(!fs.existsSync(DATA)) { console.error('data/lyrics.json not found'); process.exit(1); }
if(!fs.existsSync(TEMPLATE)) { console.error('template/lyric-template.html not found'); process.exit(1); }

const raw = JSON.parse(fs.readFileSync(DATA,'utf8'));
const tpl = fs.readFileSync(TEMPLATE,'utf8');

if(!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

raw.forEach(item => {
  const title = item.title || 'untitled';
  const reciter = item.reciter || '';
  const year = item.year || '';
  const tags = item.tags || [];
  const slug = item.slug || slugify(title + '-' + (reciter||''));
  const roman = item.lyrics || '';
  // support optional urdu field
  const urdu = item.lyrics_urdu || '';

  // build tags html
  const tags_html = (tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ');

  // build roman block (split paragraphs) into <p>
  const roman_block = roman.split(/\r?\n\r?\n/).map(p => `<div class="verse-card">${p.split(/\r?\n/).map(l=>`<p class="verse-line">${l}</p>`).join('')}</div>`).join('\n');

  const urdu_block = urdu ? urdu.split(/\r?\n\r?\n/).map(p => `<div class="verse-card" dir="rtl">${p.split(/\r?\n/).map(l=>`<p class="verse-line">${l}</p>`).join('')}</div>`).join('\n') : '';

  let out = tpl.replace('{{TITLE}}', escapeHtml(title))
    .replace('{{RECITER}}', escapeHtml(reciter))
    .replace('{{YEAR}}', escapeHtml(year))
    .replace('{{TAGS_HTML}}', tags_html)
    .replace('{{ROMAN_BLOCK}}', roman_block)
    .replace('{{URDU_BLOCK}}', urdu_block)
    .replace('{{DESCRIPTION}}', escapeHtml((roman||'').slice(0,160)))
    .replace(/{{CANONICAL}}/g, `https://shias.in/lyrics/${slug}.html`);

  const outPath = path.join(OUTDIR, slug + '.html');
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Wrote', outPath);
});

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
