/* storying.app/stories -- the library browse page.
   Reads data/stories.json (generated from Misc/Story-Sets.xlsx) and renders three views of
   the same list: books (horizontal scroll, one column per book of the Bible), list, and a
   four-column grid. Filtering, search and tag/set editing all happen client side; edits are
   kept in localStorage and exported as JSON, so the page stays static and account-free.

   This file only builds the page. It is handed the shared CSS and asset paths by
   build-site.mjs so the two pages cannot drift apart on palette or typography. */

const OT = [
  ['Pentateuch', ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']],
  ['Historical', ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther']],
  ['Wisdom', ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs']],
  ['Prophets', ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
    'Zechariah', 'Malachi']],
];
const NT = [
  ['Gospels', ['Matthew', 'Mark', 'Luke', 'John']],
  ['Acts', ['Acts']],
  ['Epistles', ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John',
    '2 John', '3 John', 'Jude']],
  ['Revelation', ['Revelation']],
];
export const TESTAMENTS = [['Old Testament', OT], ['New Testament', NT]];

/* Short forms for the tiles. Anything not listed keeps its full name. */
const ABBR = {
  Genesis: 'Gen', Exodus: 'Ex', Leviticus: 'Lev', Numbers: 'Num', Deuteronomy: 'Deut',
  Joshua: 'Josh', Judges: 'Judg', '1 Samuel': '1 Sam', '2 Samuel': '2 Sam',
  '1 Kings': '1 Kgs', '2 Kings': '2 Kgs', '1 Chronicles': '1 Chr', '2 Chronicles': '2 Chr',
  Nehemiah: 'Neh', Esther: 'Est', Ecclesiastes: 'Eccl', 'Song of Songs': 'Song',
  Isaiah: 'Isa', Jeremiah: 'Jer', Lamentations: 'Lam', Ezekiel: 'Ezek', Daniel: 'Dan',
  Obadiah: 'Obad', Habakkuk: 'Hab', Zephaniah: 'Zeph', Zechariah: 'Zech', Malachi: 'Mal',
  Matthew: 'Matt', Romans: 'Rom', '1 Corinthians': '1 Cor', '2 Corinthians': '2 Cor',
  Galatians: 'Gal', Ephesians: 'Eph', Philippians: 'Phil', Colossians: 'Col',
  '1 Thessalonians': '1 Thess', '2 Thessalonians': '2 Thess', '1 Timothy': '1 Tim',
  '2 Timothy': '2 Tim', Philemon: 'Phlm', Hebrews: 'Heb', Revelation: 'Rev',
};

/* Each set's tile art, so a set reads the same here as it does on the home page. */
const SET_ICON = {
  'Creation to Christ': 'c2c-app-logo-icon.webp',
  '7 Commands': 'story-set-icons/7-commands.webp',
  'Stories of Hope': 'story-set-icons/stories-of-hope.webp',
  'Acts': 'story-set-icons/acts.webp',
  'OT Stories': 'story-set-icons/old-testament.webp',
  'Sacrifice Stories': 'story-set-icons/sacrifice-stories-2.webp',
  "Paul's Journeys": 'story-set-icons/pauls-journeys.webp',
  'Baptism Hammer': 'story-set-icons/baptism-hammer.webp',
};

export const STORIES_CSS = `
/* ---- stories library ---- */
.lib{background:var(--paper);color:var(--ink);min-height:100vh}
.libhead{padding:clamp(26px,4vw,44px) 0 0}
.libhead h1{font-size:clamp(30px,5vw,46px);font-weight:680;letter-spacing:-.02em;line-height:1.1;margin:0}
.libcount{font-size:15px;color:var(--ink-s);margin-top:8px}
.libcount b{color:var(--teal);font-weight:700}

/* controls */
.ctrls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:22px 0 0}
.srch{position:relative;flex:1;min-width:220px}
.srch input{width:100%;font:inherit;font-size:15px;padding:11px 14px 11px 38px;border-radius:10px;
  border:1px solid #d5dee2;background:#fff;color:var(--ink)}
.srch input:focus{outline:2px solid var(--teal);outline-offset:-1px;border-color:transparent}
.srch svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8fa4b0}
.fbtn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:14px;font-weight:600;
  padding:10px 14px;border-radius:10px;border:1px solid #d5dee2;background:#fff;color:var(--ink);cursor:pointer}
.fbtn:hover{border-color:#9fb3bd}
.fbtn.on{background:var(--navy);border-color:var(--navy);color:#fff}
.fbtn .n{background:var(--teal);color:#fff;border-radius:20px;font-size:11.5px;padding:1px 7px}
.views{display:inline-flex;border:1px solid #d5dee2;border-radius:10px;overflow:hidden;background:#fff}
.views button{font:inherit;font-size:13.5px;font-weight:600;padding:10px 13px;border:0;background:none;
  color:var(--ink-s);cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.views button+button{border-left:1px solid #e3eaed}
.views button.on{background:var(--navy);color:#fff}

/* filter drawers */
.drawer{display:none;background:#fff;border:1px solid #e0e7ea;border-radius:12px;padding:16px 18px;margin-top:12px}
.drawer.open{display:block}
.dgrp+.dgrp{margin-top:14px;padding-top:14px;border-top:1px solid #eef2f4}
.dgrp h4{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7E8F99;margin:0 0 9px}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;padding:6px 11px;
  border-radius:20px;border:1px solid #d9e1e5;background:#fff;color:var(--ink);cursor:pointer;line-height:1.3}
.chip:hover{border-color:#9fb3bd}
.chip img{width:18px;height:18px;border-radius:5px;object-fit:cover}
.chip.on{background:var(--teal);border-color:var(--teal);color:#fff}
.chip .c{opacity:.6;font-weight:500;font-size:11.5px}
.clearall{font:inherit;font-size:13px;font-weight:600;color:var(--teal);background:none;border:0;cursor:pointer;padding:6px 2px}

/* tiles */
.tile{background:#fff;border:1px solid #e2e8ea;border-radius:12px;padding:11px;display:block;position:relative;
  text-align:left;width:100%;font:inherit;color:inherit;cursor:pointer}
.tile:hover{border-color:#9fb3bd;box-shadow:0 2px 10px rgba(28,49,68,.07)}
.tph{aspect-ratio:16/10;border-radius:8px;background:linear-gradient(135deg,#e8eef1,#dbe5ea);
  display:flex;align-items:center;justify-content:center;color:#a8bcc7;margin-bottom:9px}
/* Compact variant for the book columns, where a full-width image would make a 13-story
   column about 1800px tall. The grid view keeps the large card. */
.tile.cmp{display:grid;grid-template-columns:42px 1fr;gap:10px;padding:9px}
.tile.cmp .tph{aspect-ratio:1;width:42px;height:42px;margin:0;grid-row:1/span 3}
.tile.cmp .tph svg{width:17px;height:17px}
.tile.cmp .tt,.tile.cmp .tr,.tile.cmp .tsets,.tile.cmp .ttags{grid-column:2}
.tile.cmp .tsets{margin-top:6px}.tile.cmp .ttags{margin-top:5px}
.tt{font-size:14px;font-weight:700;letter-spacing:-.01em;line-height:1.25}
.tr{font-size:12px;color:var(--ink-s);margin-top:3px;font-variant-numeric:tabular-nums}
.tr .alsoref{color:#93a7b2}
.tsets{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.tsets img{width:20px;height:20px;border-radius:5px;object-fit:cover}
/* Two rows of tags, then clip. 19px row + 4px gap, so the cut never lands mid-row. */
.ttags{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px;max-height:42px;overflow:hidden}
.ttag{font-size:10.5px;font-weight:600;background:#eef3f5;color:#5E727C;border-radius:5px;padding:2px 6px;white-space:nowrap}
.tile .som{position:absolute;top:9px;right:9px;background:var(--sandL);color:#6b5f3c;font-size:9.5px;
  font-weight:700;letter-spacing:.04em;border-radius:4px;padding:2px 5px}

/* books view */
.books{margin-top:20px;overflow-x:auto;padding-bottom:22px}
.tgroup{margin-bottom:10px}
.thead{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:#7E8F99;padding:9px 0;cursor:pointer;background:none;border:0;font-family:inherit}
.thead:hover{color:var(--teal)}
.thead .car{transition:transform .18s}
.tgroup.shut .car{transform:rotate(-90deg)}
.tgroup.shut .brow{display:none}
.brow{display:flex;gap:12px;align-items:flex-start}
.bcol{flex:0 0 210px;min-width:210px}
.bcol.empty{flex:0 0 96px;min-width:96px;opacity:.42}
.bname{font-size:13px;font-weight:700;letter-spacing:-.01em;padding:7px 9px;border-radius:8px 8px 0 0;
  background:var(--navy);color:#fff;display:flex;justify-content:space-between;gap:6px;align-items:baseline}
.bcol.empty .bname{background:#dfe7ea;color:#7E8F99}
.bname .bn{font-size:11px;font-weight:600;opacity:.62}
.bstack{display:flex;flex-direction:column;gap:8px;padding:8px;background:#eaeff2;border-radius:0 0 8px 8px;min-height:34px}
.bcol.empty .bstack{background:#f0f4f6}
.dup{background:#f4f7f8;border-style:dashed;cursor:default}
.dup:hover{box-shadow:none;border-color:#d7e0e4}
.dup .tt{font-weight:600;color:#7E8F99}
.dupof{font-size:10.5px;color:#93a7b2;margin-top:3px}

/* list view */
.listv{margin-top:18px;background:#fff;border:1px solid #e2e8ea;border-radius:12px;overflow:hidden}
.lrow{display:grid;grid-template-columns:34px 1.6fr 1fr 1.1fr 1.4fr;gap:14px;align-items:center;
  padding:10px 14px;border-bottom:1px solid #eef2f4;width:100%;background:none;border-left:0;border-right:0;
  border-top:0;font:inherit;text-align:left;color:inherit;cursor:pointer}
.lrow:last-child{border-bottom:0}
.lrow:hover{background:#f7fafb}
.lrow.h{background:#f4f8f9;font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:#7E8F99;cursor:default;position:sticky;top:0;z-index:2}
.lrow.h:hover{background:#f4f8f9}
.lnum{font-size:11.5px;color:#a8bcc7;font-variant-numeric:tabular-nums}
.lt2{font-size:14px;font-weight:700;letter-spacing:-.01em}
.lref{font-size:12.5px;color:var(--ink-s);font-variant-numeric:tabular-nums}
@media (max-width:860px){.lrow{grid-template-columns:28px 1fr;row-gap:5px}
  .lrow>:nth-child(n+3){grid-column:2}.lrow.h{display:none}}

/* grid view */
.gridv{margin-top:18px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
@media (max-width:1100px){.gridv{grid-template-columns:repeat(3,1fr)}}
@media (max-width:820px){.gridv{grid-template-columns:repeat(2,1fr)}}
@media (max-width:520px){.gridv{grid-template-columns:1fr}}

.none{padding:44px 0;text-align:center;color:var(--ink-s);font-size:15px}

/* editor */
.ed{position:fixed;inset:0;background:rgba(21,40,56,.55);display:none;align-items:flex-end;justify-content:center;z-index:80}
.ed.open{display:flex}
.edp{background:#fff;width:min(680px,100%);max-height:86vh;overflow-y:auto;border-radius:16px 16px 0 0;padding:22px}
@media (min-width:700px){.ed{align-items:center}.edp{border-radius:16px}}
.edh{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
.edh h3{margin:0;font-size:19px;font-weight:700;letter-spacing:-.01em}
.edh .r{font-size:13px;color:var(--ink-s);margin-top:3px}
.edx{font:inherit;font-size:22px;line-height:1;background:none;border:0;cursor:pointer;color:#8fa4b0;padding:2px 6px}
.edsave{margin-top:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.edsave .note{font-size:12.5px;color:#7E8F99}
.btn.sm{font-size:14px;padding:9px 16px}
.expbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid #e6edef}
.expbar .note{font-size:12.5px;color:var(--ink-s);flex:1;min-width:200px}
`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function storiesPage({ CSS, LOGO, LOGOSQ, OG_URL, NAV, data, ic }) {
  const counted = data.stories.filter(s => !s.som).length;
  const withSom = data.stories.length;
  const payload = JSON.stringify({ ...data, groups: TESTAMENTS, abbr: ABBR, seticon: SET_ICON })
    .replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stories &middot; storying.app</title>
<meta name="description" content="Every story in the storying.app library, by book of the Bible, story set and theme.">
<meta name="theme-color" content="#1C3144">
<link rel="canonical" href="${OG_URL}stories">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../${LOGOSQ}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="storying.app">
<meta property="og:url" content="${OG_URL}stories">
<meta property="og:title" content="Stories &middot; storying.app">
<meta property="og:description" content="Every story in the storying.app library, by book of the Bible, story set and theme.">
<meta property="og:image" content="${OG_URL}og_image.png">
<meta name="twitter:card" content="summary_large_image">
<style>${CSS}${STORIES_CSS}</style>
</head>
<body>
<header id="top">
  <div class="wrap bar">
    <a class="mk" href="../">
      <img src="../${LOGO}" alt="">
      <span class="mktext"><b>storying<span>.app</span></b><em>A library of oral Bible stories in 40 major languages</em></span>
    </a>
    <nav>${NAV.map(([id, label]) => `<a href="../#${id}">${label}</a>`).join('')}<a href="./" class="cur">Stories</a></nav>
    <a class="navcta" href="../#contact">Get involved</a>
    <button class="navburger" id="navBurger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navMobile">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="navmobile" id="navMobile">
    <div class="wrap">
      <nav>${NAV.map(([id, label]) => `<a href="../#${id}">${label}</a>`).join('')}<a href="./">Stories</a>
        <a class="navcta" href="../#contact">Get involved</a></nav>
    </div>
  </div>
</header>
<main class="lib">
  <div class="wrap">
    <div class="libhead">
      <h1>Stories</h1>
      <p class="libcount"><b id="cShown">${counted}</b> stories<span id="cFilt"></span> &middot; <b>${withSom}</b> including the Sermon on the Mount</p>
    </div>

    <div class="ctrls">
      <div class="srch">
        ${ic('search', 17, '#8fa4b0')}
        <input id="q" type="search" placeholder="Search stories, references, books" autocomplete="off" aria-label="Search stories">
      </div>
      <button class="fbtn" id="bSets" aria-expanded="false">${ic('globe', 15)} Story Sets <span class="n" id="nSets" hidden>0</span></button>
      <button class="fbtn" id="bTags" aria-expanded="false">${ic('list-filter', 15)} Tags <span class="n" id="nTags" hidden>0</span></button>
      <div class="views" role="group" aria-label="View">
        <button data-v="books" class="on">${ic('book-open', 15)} Books</button>
        <button data-v="list">${ic('list-filter', 15)} List</button>
        <button data-v="grid">${ic('globe', 15)} Grid</button>
      </div>
    </div>
    <div class="drawer" id="dSets"></div>
    <div class="drawer" id="dTags"></div>

    <div id="view"></div>

    <div class="expbar">
      <span class="note" id="editnote">Tap any story to edit its sets and tags. Changes are saved in this browser only.</span>
      <button class="fbtn" id="export">${ic('download', 15)} Export changes</button>
      <button class="fbtn" id="reset">Reset edits</button>
    </div>
  </div>
</main>
<div class="ed" id="ed" role="dialog" aria-modal="true" aria-labelledby="edTitle"><div class="edp" id="edp"></div></div>
<footer>
  <div class="wrap fbar">
    <div class="fm"><img src="../${LOGOSQ}" alt="" loading="lazy"><b>storying<span>.app</span></b></div>
    <div>An audio-based, mobile-first library of oral Bible stories in 40+ languages.</div>
    <div><a href="mailto:brett@vmx.media">brett@vmx.media</a></div>
  </div>
</footer>
<script>
const D = ${payload};
const LS = 'storying-story-edits-v1';
let edits = {};
try { edits = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { edits = {}; }

/* A story's live sets/tags = what the build shipped, unless this browser has edited it. */
function sets(s){ return (edits[s.id] && edits[s.id].s) || s.s; }
function tags(s){ return (edits[s.id] && edits[s.id].g) || s.g; }
function edited(s){ return !!edits[s.id]; }

const state = { v:'books', q:'', sets:new Set(), tags:new Set(), shut:new Set() };
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const abbr = b => D.abbr[b] || b;
const seticon = n => D.seticon[n] ? '../assets/' + D.seticon[n] : '';

function match(s){
  if (state.sets.size) { const has = sets(s); if (![...state.sets].every(x => has.includes(x))) return false; }
  if (state.tags.size) { const has = tags(s); if (![...state.tags].every(x => has.includes(x))) return false; }
  if (state.q) {
    const hay = (s.t + ' ' + s.b + ' ' + s.r + ' ' + s.par.join(' ') + ' ' + sets(s).join(' ') + ' ' + tags(s).join(' ')).toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}
const shown = () => D.stories.filter(match);

function setPills(s){
  const v = sets(s); if (!v.length) return '';
  return '<div class="tsets">' + v.map(n => seticon(n)
    ? '<img src="' + seticon(n) + '" alt="' + esc(n) + '" title="' + esc(n) + '" loading="lazy">'
    : '<span class="ttag">' + esc(n) + '</span>').join('') + '</div>';
}
function tagPills(s){
  const v = tags(s); if (!v.length) return '';
  return '<div class="ttags">' + v.map(t => '<span class="ttag">' + esc(t) + '</span>').join('') + '</div>';
}
function tile(s, showPar, compact){
  const par = (showPar && s.par.length) ? ' <span class="alsoref">(' + s.par.map(p => esc(p)).join('; ') + ')</span>' : '';
  return '<button class="tile' + (compact ? ' cmp' : '') + '" data-id="' + s.id + '">' +
    (s.som ? '<span class="som">SERMON</span>' : '') +
    '<div class="tph">' + ${JSON.stringify(ic('book-open', 22, 'currentColor'))} + '</div>' +
    '<div class="tt">' + esc(s.t) + '</div>' +
    '<div class="tr">' + esc(abbr(s.b) + ' ' + s.r) + par + '</div>' +
    setPills(s) + tagPills(s) + '</button>';
}

/* ---- books view: every book of the Bible, duplicates shown but dimmed ---- */
function renderBooks(){
  const keep = new Set(shown().map(s => s.id));
  const byBook = {}; const dupsBy = {};
  D.stories.forEach(s => { if (keep.has(s.id)) (byBook[s.b] = byBook[s.b] || []).push(s); });
  D.dups.forEach(d => { if (!d.of || keep.has(d.of)) (dupsBy[d.b] = dupsBy[d.b] || []).push(d); });
  const mainOf = {}; D.stories.forEach(s => mainOf[s.id] = s);
  let h = '';
  D.groups.forEach(([test, groups]) => {
    groups.forEach(([gname, books]) => {
      const key = test + '/' + gname;
      const n = books.reduce((a, b) => a + (byBook[b] || []).length, 0);
      h += '<div class="tgroup' + (state.shut.has(key) ? ' shut' : '') + '" data-g="' + esc(key) + '">' +
        '<button class="thead"><span class="car">▾</span>' + esc(test) + ' &middot; ' + esc(gname) +
        ' <span style="opacity:.6;letter-spacing:0;text-transform:none;font-weight:600">' + n + '</span></button><div class="brow">';
      books.forEach(b => {
        const items = byBook[b] || []; const dp = dupsBy[b] || [];
        const empty = !items.length && !dp.length;
        h += '<div class="bcol' + (empty ? ' empty' : '') + '"><div class="bname"><span>' + esc(empty ? abbr(b) : b) + '</span>' +
          (items.length ? '<span class="bn">' + items.length + '</span>' : '') + '</div><div class="bstack">';
        items.forEach(s => h += tile(s, false, true));
        dp.forEach(d => {
          const m = d.of ? mainOf[d.of] : null;
          h += '<div class="tile dup"><div class="tt">' + esc(d.t) + '</div><div class="tr">' + esc(abbr(d.b) + ' ' + d.r) + '</div>' +
            '<div class="dupof">' + (m ? 'told from ' + esc(abbr(m.b) + ' ' + m.r) : 'parallel passage') + '</div></div>';
        });
        h += '</div></div>';
      });
      h += '</div></div>';
    });
  });
  return '<div class="books">' + h + '</div>';
}

function renderList(){
  const rows = shown();
  if (!rows.length) return '<p class="none">No stories match those filters.</p>';
  let h = '<div class="listv"><div class="lrow h"><span>#</span><span>Story</span><span>Reference</span><span>Story Sets</span><span>Tags</span></div>';
  rows.forEach((s, i) => {
    const par = s.par.length ? ' <span class="alsoref">(' + s.par.map(esc).join('; ') + ')</span>' : '';
    h += '<button class="lrow" data-id="' + s.id + '"><span class="lnum">' + (i + 1) + '</span>' +
      '<span class="lt2">' + esc(s.t) + (s.som ? ' <span class="som" style="position:static">SERMON</span>' : '') + '</span>' +
      '<span class="lref">' + esc(abbr(s.b) + ' ' + s.r) + par + '</span>' +
      '<span>' + (setPills(s) || '<span class="lref">&mdash;</span>') + '</span>' +
      '<span>' + (tagPills(s) || '') + '</span></button>';
  });
  return h + '</div>';
}
function renderGrid(){
  const rows = shown();
  if (!rows.length) return '<p class="none">No stories match those filters.</p>';
  return '<div class="gridv">' + rows.map(s => tile(s, true)).join('') + '</div>';
}

function drawers(){
  const setCount = {}, tagCount = {};
  D.stories.forEach(s => { sets(s).forEach(x => setCount[x] = (setCount[x] || 0) + 1);
                           tags(s).forEach(x => tagCount[x] = (tagCount[x] || 0) + 1); });
  $('dSets').innerHTML = '<div class="dgrp"><h4>Story Sets</h4><div class="chips">' +
    D.sets.map(n => '<button class="chip' + (state.sets.has(n) ? ' on' : '') + '" data-set="' + esc(n) + '">' +
      (seticon(n) ? '<img src="' + seticon(n) + '" alt="" loading="lazy">' : '') + esc(n) +
      ' <span class="c">' + (setCount[n] || 0) + '</span></button>').join('') +
    '</div></div><div style="margin-top:12px"><button class="clearall" data-clear="sets">Clear story sets</button></div>';
  $('dTags').innerHTML = Object.entries(D.vocab).map(([g, list]) =>
    '<div class="dgrp"><h4>' + esc(g) + '</h4><div class="chips">' + list.map(t =>
      '<button class="chip' + (state.tags.has(t) ? ' on' : '') + '" data-tag="' + esc(t) + '">' + esc(t) +
      ' <span class="c">' + (tagCount[t] || 0) + '</span></button>').join('') + '</div></div>').join('') +
    '<div style="margin-top:12px"><button class="clearall" data-clear="tags">Clear tags</button></div>';
}

function render(){
  $('view').innerHTML = state.v === 'books' ? renderBooks() : state.v === 'list' ? renderList() : renderGrid();
  const n = shown().filter(s => !s.som).length;
  const filtered = state.q || state.sets.size || state.tags.size;
  $('cShown').textContent = filtered ? shown().length : ${counted};
  $('cFilt').textContent = filtered ? ' shown' : '';
  $('nSets').hidden = !state.sets.size; $('nSets').textContent = state.sets.size;
  $('nTags').hidden = !state.tags.size; $('nTags').textContent = state.tags.size;
  $('bSets').classList.toggle('on', !!state.sets.size);
  $('bTags').classList.toggle('on', !!state.tags.size);
  const ne = Object.keys(edits).length;
  $('editnote').textContent = ne
    ? ne + (ne === 1 ? ' story edited' : ' stories edited') + ' in this browser. Export to send the changes on.'
    : 'Tap any story to edit its sets and tags. Changes are saved in this browser only.';
  drawers();
}

/* ---- editor ---- */
let cur = null;
function openEd(id){
  cur = D.stories.find(s => s.id === id); if (!cur) return;
  const mySets = sets(cur), myTags = tags(cur);
  $('edp').innerHTML = '<div class="edh"><div><h3 id="edTitle">' + esc(cur.t) + '</h3>' +
    '<div class="r">' + esc(cur.b + ' ' + cur.r) + (cur.par.length ? ' &middot; also ' + cur.par.map(esc).join('; ') : '') + '</div></div>' +
    '<button class="edx" id="edClose" aria-label="Close">&times;</button></div>' +
    '<div class="dgrp"><h4>Story Sets</h4><div class="chips">' + D.sets.map(n =>
      '<button class="chip' + (mySets.includes(n) ? ' on' : '') + '" data-eset="' + esc(n) + '">' +
      (seticon(n) ? '<img src="' + seticon(n) + '" alt="" loading="lazy">' : '') + esc(n) + '</button>').join('') + '</div></div>' +
    Object.entries(D.vocab).map(([g, list]) => '<div class="dgrp"><h4>' + esc(g) + '</h4><div class="chips">' +
      list.map(t => '<button class="chip' + (myTags.includes(t) ? ' on' : '') + '" data-etag="' + esc(t) + '">' + esc(t) + '</button>').join('') +
      '</div></div>').join('') +
    '<div class="edsave"><button class="btn primary sm" id="edDone">Done</button>' +
    (edited(cur) ? '<button class="fbtn" id="edRevert">Revert this story</button>' : '') +
    '<span class="note">Saved in this browser as you click.</span></div>';
  $('ed').classList.add('open');
}
function closeEd(){ $('ed').classList.remove('open'); cur = null; render(); }
function saveCur(s, g){
  edits[cur.id] = { t: cur.t, s: s, g: g };
  const o = D.stories.find(x => x.id === cur.id);
  if (JSON.stringify(o.s) === JSON.stringify(s) && JSON.stringify(o.g) === JSON.stringify(g)) delete edits[cur.id];
  try { localStorage.setItem(LS, JSON.stringify(edits)); } catch (e) {}
}

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.v) { state.v = t.dataset.v; document.querySelectorAll('.views button').forEach(b => b.classList.toggle('on', b === t)); render(); return; }
  if (t.id === 'bSets' || t.id === 'bTags') { const d = $(t.id === 'bSets' ? 'dSets' : 'dTags');
    const open = d.classList.toggle('open'); t.setAttribute('aria-expanded', open); return; }
  if (t.dataset.set) { state.sets.has(t.dataset.set) ? state.sets.delete(t.dataset.set) : state.sets.add(t.dataset.set); render(); return; }
  if (t.dataset.tag) { state.tags.has(t.dataset.tag) ? state.tags.delete(t.dataset.tag) : state.tags.add(t.dataset.tag); render(); return; }
  if (t.dataset.clear) { state[t.dataset.clear].clear(); render(); return; }
  if (t.classList.contains('thead')) { const g = t.closest('.tgroup').dataset.g;
    state.shut.has(g) ? state.shut.delete(g) : state.shut.add(g); render(); return; }
  if (t.classList.contains('tile') && !t.classList.contains('dup')) { openEd(t.dataset.id); return; }
  if (t.classList.contains('lrow') && t.dataset.id) { openEd(t.dataset.id); return; }
  if (t.id === 'edClose' || t.id === 'edDone') { closeEd(); return; }
  if (t.id === 'edRevert') { delete edits[cur.id]; try { localStorage.setItem(LS, JSON.stringify(edits)); } catch (e) {} openEd(cur.id); return; }
  if (t.dataset.eset || t.dataset.etag) {
    const s = sets(cur).slice(), g = tags(cur).slice();
    if (t.dataset.eset) { const i = s.indexOf(t.dataset.eset); i < 0 ? s.push(t.dataset.eset) : s.splice(i, 1); }
    else { const i = g.indexOf(t.dataset.etag); i < 0 ? g.push(t.dataset.etag) : g.splice(i, 1); }
    saveCur(s, g); t.classList.toggle('on'); return;
  }
  if (t.id === 'export') {
    const out = D.stories.map(s => ({ id: s.id, story: s.t, book: s.b, reference: s.r,
      sets: sets(s), tags: tags(s), changed: edited(s) }));
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), changed: Object.keys(edits).length, stories: out }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'storying-stories-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click(); URL.revokeObjectURL(a.href); return;
  }
  if (t.id === 'reset') { if (confirm('Discard all edits made in this browser?')) {
    edits = {}; try { localStorage.removeItem(LS); } catch (e) {} render(); } return; }
});
$('ed').addEventListener('click', e => { if (e.target.id === 'ed') closeEd(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && cur) closeEd(); });
let qt; $('q').addEventListener('input', e => { clearTimeout(qt);
  qt = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); render(); }, 140); });
render();
</script>
<script>
(function(){
  var top=document.getElementById('top'),bar=top.querySelector('.bar');
  var burger=document.getElementById('navBurger'),mobile=document.getElementById('navMobile');
  function close(){top.classList.remove('open');burger.setAttribute('aria-expanded','false')}
  function fit(){top.classList.remove('collapsed');
    var o=bar.scrollWidth>bar.clientWidth+1;top.classList.toggle('collapsed',o);if(!o)close()}
  fit();
  var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fit,120)},{passive:true});
  burger.addEventListener('click',function(){var o=top.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false')});
  mobile.addEventListener('click',function(e){if(e.target.tagName==='A')close()});
})();
</script>
</body></html>`;
}
