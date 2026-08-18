import fs from 'fs';

const langs = JSON.parse(fs.readFileSync('data/languages.json', 'utf8'));
const cellp = JSON.parse(fs.readFileSync('data/a-cellpaths.json', 'utf8'));
const W = JSON.parse(fs.readFileSync('data/a-world.json', 'utf8'));

const b64 = f => 'data:image/' + (f.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(f).toString('base64');
const LOGO = b64('assets/logo-tr.png'), LOGOSQ = b64('assets/logo.png'), SRLOGO = b64('assets/sr-orange.png');
const SBOARD = b64('assets/storyboard.jpg'), DESK = b64('assets/c2c-desktop.jpg'), HERO = b64('assets/hero.jpg');
const L = n => b64(`assets/logos/${n}.png`);
const AV = n => b64(`assets/adv/${n}.png`);
const SI = n => b64(`assets/stories/${n}.jpg`);
const IMG = {
  creation: SI('1-Creation-of-the-Physical-World'), sin: SI('2-The-Man-And-Woman-Sin'),
  storm: SI('5-Jesus-Calms-The-Storm'), well: SI('9-The-Woman-at-the-Well'),
  res: SI('13-Resurrection'), zac: SI('11-Zaccheaus'), feed: SI('8-Jesus-Feeds-5000'),
  blind: SI('10-The-Blind-Man'),
};
const ic = (n, size = 20, color = 'currentColor', sw = 1.9) => {
  const body = fs.readFileSync(`assets/icons/${n}.svg`, 'utf8')
    .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
};

const fmt = n => n >= 1e9 ? (n / 1e9).toFixed(2).replace(/0$/, '') + 'B'
  : n >= 1e7 ? Math.round(n / 1e6) + 'M' : (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
const arrow = () => '<svg width="22" height="30" viewBox="0 0 22 30" fill="none" stroke="#5E86A2" '
  + 'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2 V22"/><path d="M4 16 l7 7 l7 -7"/></svg>';
const fmtWord = n => n >= 1e9 ? (n / 1e9).toFixed(2).replace(/0$/, '') + ' billion'
  : Math.round(n / 1e6) + ' million';
const totalNative = langs.reduce((a, b) => a + b.native, 0);
const w40 = langs.filter(l => l.w1040).length;
const uncov = langs.filter(l => l.sr === false);
const uncovNative = uncov.reduce((a, b) => a + b.native, 0);

/* ---------- Venn geometry ---------- */
const SR_ONLY = 397e6, SHARED = 2.5973e9, SR_TOTAL = SHARED + SR_ONLY;
const US_TOTAL = totalNative;
const R_US = 128, R_SR = R_US * Math.sqrt(SR_TOTAL / US_TOTAL);
const lensArea = (d, r1, r2) => {
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  if (d >= r1 + r2) return 0;
  return r1 ** 2 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1))
    + r2 ** 2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
    - 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
};
const targetLens = (SHARED / US_TOTAL) * Math.PI * R_US ** 2;
let lo = Math.abs(R_US - R_SR), hi = R_US + R_SR, D = 0;
for (let i = 0; i < 90; i++) { D = (lo + hi) / 2; lensArea(D, R_US, R_SR) > targetLens ? lo = D : hi = D; }
// D is the distance that makes the purple lens exactly proportional to 2.6B of 4.75B.
// At that exact distance 87% of the StoryRunners circle sits inside ours, so the pink-only
// crescent is too thin to carry a label. NUDGE opens it just enough to read. Small on
// purpose: the radii stay exactly population-scaled and only the overlap is approximate.
const NUDGE = 16;
const V = { cx: 444, cy: 150 };
V.srx = V.cx - D - NUDGE;
V.srLeft = V.srx - R_SR;
V.lens = ((V.cx - R_US) + (V.srx + R_SR)) / 2;
V.ours = ((V.srx + R_SR) + (V.cx + R_US)) / 2 + 6;
// The StoryRunners-only label sits outside its circle, to the left. The viewBox is sized
// from the widest caption ("83 languages", about 76 units) so nothing gets clipped.
const SRX = V.srLeft - 54;
const CAP = 44;
const PAD = 26;
const VB = [Math.round(SRX - CAP - PAD), 8,
  Math.round(Math.max(V.cx + R_US + 14, V.ours + CAP + PAD) - (SRX - CAP - PAD)), 284].join(' ');

/* ---------- language grid ---------- */
const gridCells = langs.map((l, i) => `<div class="cell${l.w1040 ? ' is40' : ''}">
  <svg class="silh" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="${cellp[l.num]}"/></svg>
  <div class="cnum">${String(i + 1).padStart(2, '0')}</div>${l.w1040 ? '<i class="w40"></i>' : ''}
  <div class="cname">${l.name}</div><div class="cpop">${fmt(l.native)}</div>
  <div class="ciso${l.note ? ' hasnote' : ''}">${l.note ? l.note : l.iso + ' &middot; ' + l.country}</div>
</div>`).join('\n');

/* ---------- map dots ---------- */
const rad = n => Math.max(5, Math.min(30, Math.sqrt(n / 1e6) * 1.62));
const dots = langs.map(l => {
  const [x, y] = W.pts[l.iso], r = rad(l.native);
  if (l.note) return `<g><path d="M${x} ${y - r} A${r} ${r} 0 0 0 ${x} ${y + r} Z" class="half40"/>`
    + `<path d="M${x} ${y - r} A${r} ${r} 0 0 1 ${x} ${y + r} Z" class="halfreach"/>`
    + `<circle cx="${x}" cy="${y}" r="${r}" class="ringline"/></g>`;
  return `<circle cx="${x}" cy="${y}" r="${r}" class="${l.w1040 ? 'd40' : 'dtrade'}"/>`;
}).join('');
const [wx, wy] = W.rings.fraW, [cx2, cy2] = W.rings.fraC, [lx, ly] = W.rings.fraLab;
const [kx, ky] = W.rings.nkorea, [frcx, frcy] = W.pts.FRA;
const reach = `
<path d="M${frcx} ${frcy + 8} Q ${frcx - 34} ${(frcy + wy) / 2} ${wx - 4} ${wy - 36}" class="leader"/>
<path d="M${wx + 14} ${wy + 32} Q ${(wx + cx2) / 2 - 6} ${cy2 + 34} ${cx2 - 18} ${cy2 + 22}" class="leader"/>
<circle cx="${wx}" cy="${wy}" r="34" class="reachring"/><circle cx="${cx2}" cy="${cy2}" r="34" class="reachring"/>
<text x="${lx}" y="${ly + 30}" class="reachlab">Francophone</text><text x="${lx}" y="${ly + 46}" class="reachlab">Africa</text>
<circle cx="${kx}" cy="${ky}" r="25" class="reachring"/><text x="${kx}" y="${ky - 32}" class="reachlab">North Korea</text>`;

const t10shapes = W.top10.map(t => `<path d="${t.d}" class="hot"/>`).join('');
const LBL = { India: [22, 54], Pakistan: [-64, -16], Nigeria: [-44, 34], China: [40, -30], Ethiopia: [50, 10],
  Bangladesh: [58, 4], Egypt: [16, -46], Afghanistan: [-48, -54], Brazil: [34, 22], 'DR Congo': [34, 42] };
const t10labels = W.top10.map(t => {
  const [dx, dy] = LBL[t.name] || [24, 0], anchor = dx < 0 ? 'end' : 'start';
  return `<g><line x1="${t.cx}" y1="${t.cy}" x2="${t.cx + dx}" y2="${t.cy + dy}" class="lbline"/>
  <text x="${t.cx + dx + (dx < 0 ? -4 : 4)}" y="${t.cy + dy}" class="t10n" style="text-anchor:${anchor}">${t.name} <tspan class="t10m">${t.m}M</tspan></text></g>`;
}).join('');

/* ---------- story sets ---------- */
const PRI = [
  ['Priority 1', 23, 0, ['Creation to Christ', '7 Commands'], 'p1'],
  ['Priority 2', 49, 23, ['Stories of Hope', 'Acts', 'Old Testament Stories', 'Sacrifice Stories', 'Prophet Stories', "Paul's Journeys", 'Baptism Hammer'], 'p2'],
  ['Priority 3', 111, 72, ['Teachings of Jesus', 'Parables of Jesus', 'Miracles of Jesus'], 'p3'],
];
const priCols = PRI.map(([tag, n, start, list, cls]) => `<div class="pri ${cls}">
  <div class="prihead"><span class="prin">${tag}</span><span class="pric">${n} stories</span></div>
  <div class="pbar"><i style="margin-left:${(start / 183 * 100).toFixed(2)}%;width:${(n / 183 * 100).toFixed(2)}%"></i></div>
  ${list.map(x => `<div class="prirow">${x}</div>`).join('')}
</div>`).join('\n');

const DOMS = ['7commands.app', 'storiesofhope.app', 'sacrificestories.app', 'prophetstories.app',
  'paulsjourneys.app', 'baptismhammer.app', 'miraclesofjesus.app', 'jesusheals.app'];

/* ---------- process ---------- */
const STEPS = [
  [1, 'Craft story', 'Spoken English from Scripture', 'tech', true, 'feather'],
  [2, 'Review story', 'The English locks here', 'eng', false, 'clipboard-check'],
  [3, 'Create storyboard', 'Drawn once for all 40', 'des', false, 'palette'],
  [4, 'Add English audio', 'Story and questions', 'tech', true, 'mic'],
  [5, 'Translate', 'Draft into each language', 'tech', true, 'languages'],
  [6, 'Back-translate', 'Blind return to English', 'tech', true, 'pencil-line'],
  [7, 'Check back-translation', 'Catches fluent but wrong', 'eng', false, 'clipboard-check'],
  [8, 'Native review', 'Story, questions, key terms', 'loc', false, 'user-check'],
  [9, 'Add local audio', 'Pronunciation per language', 'tech', true, 'audio-lines'],
  [10, 'Check audio', 'Names, pacing, truncation', 'loc', false, 'headphones'],
  [11, 'Publish', 'Sites and bundles update', 'tech', false, 'send'],
];
const stepTiles = STEPS.map(([n, t, d, own, ai, icon], i) => {
  const row = Math.floor(i / 4), col = i % 4;
  const c = row % 2 === 1 ? 3 - col : col;
  return `<div class="pstep o-${own}" style="grid-row:${row + 1};grid-column:${c + 1}">
    <span class="pn">${n}</span><span class="pic">${ic(icon, 17)}</span>${ai ? '<span class="ai">AI</span>' : ''}
    <span class="ptxt"><span class="pt">${t}</span><span class="pd">${d}</span></span></div>`;
}).join('');

/* ---------- tech stack ---------- */
const STACK = [
  ['Authoring and translation', [
    ['anthropic-com-logo', 'Anthropic', 'Story drafts and draft translations'],
    ['chatgpt-com-logo', 'OpenAI', 'Second model for back-translation'],
    ['claude-ai-logo', 'Claude Code', 'Builds the site in Astro'],
  ]],
  ['Media', [
    ['elevenlabs-io-logo', 'ElevenLabs', 'Generated audio in every language'],
    ['Adobe_Illustrator_icon', 'Illustrator', 'Storyboards as vector art'],
    ['canva-com-logo', 'Canva', 'Story images'],
  ]],
  ['Platform', [
    ['cloudflare-com-logo', 'Cloudflare', 'Pages for hosting, R2 for storage'],
    ['supabase-com-logo', 'Supabase', 'Accounts, saved story sets, auth'],
  ]],
  ['Project management', [
    ['notion-so-logo', 'Notion', 'Tracks progress across 40 languages'],
  ]],
];

/* ---------- footnotes ----------
   Sources move out of the flow into one Notes and sources block at the foot of
   the page. Each marker is a link both ways, and carries the note as a title
   attribute so a desktop hover shows it without leaving the section. */
const NOTES = [
  ['need', "739 million from UNESCO, International Literacy Day 2025 factsheet, 2024 data. 5.7 billion is the International Orality Network's estimate of the world's oral preference learners."],
  ['ten', 'UNESCO, International Literacy Day 2025 factsheet. Illiterate adults aged 15 and over, latest available year in the 2015 to 2024 census decade. 10/40 Window membership per Joshua Project: Brazil and DR Congo fall outside it.'],
  ['venn', 'Circle sizes are scaled to the population each library reaches. The overlap is drawn slightly smaller than exact proportion so the labels stay clear of one another. StoryRunners catalogue read at storyrunners.org, August 2026: 101 entries, 98 distinct languages, work deeply concentrated in West African and South Asian minority languages; their 400M is an estimate. Arabic and Persian are counted as shared, though StoryRunners publishes Chadian Arabic, Tunisian Arabic and Dari rather than Modern Standard Arabic and Iranian Persian. * marks a trade language outside the 10/40 Window.'],
];
const nIndex = Object.fromEntries(NOTES.map(([k], i) => [k, i + 1]));
const ref = k => `<a class="fnref" id="ref-${k}" href="#fn-${k}" title="${NOTES[nIndex[k] - 1][1].replace(/"/g, '&quot;')}"><sup>${nIndex[k]}</sup></a>`;
const notesBlock = `<section class="sec paper" id="notes">
  <div class="wrap">
    <div class="secthead">Notes and sources</div>
    <ol class="fnlist">
      ${NOTES.map(([k, t]) => `<li id="fn-${k}">${t} <a class="fnback" href="#ref-${k}" aria-label="Back to text">&#8617;</a></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const NAV = [
  ['need', 'Need'], ['sets', 'Story Sets'], ['languages', 'Languages'],
  ['product', 'Websites'], ['process', 'Process'], ['team', 'Team'],
];

const CSS = `
:root{
  --navy:#1C3144; --teal:#1A9DB8; --lav:#8681B7; --pink:#B23F72; --sand:#D7CEB2;
  --navy-c:#26415A; --navy-d:#152838;
  --tealL:#63CBE0; --lavL:#B0ACD9; --pinkL:#E8799F; --sandL:#E6E0CB;
  --paper:#F3F5F6; --white:#fff; --ink:#1C3144; --ink-s:#4E677A; --mut:#96AEBD;
  --sans:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --gut:clamp(20px,4vw,40px);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--navy-d);color:var(--paper);-webkit-font-smoothing:antialiased;
  overflow-x:hidden;line-height:1.5}
img{max-width:100%}
a{color:inherit}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important;animation:none!important}}

/* ---- footnotes ---- */
.fnref{text-decoration:none;color:var(--tealL);font-weight:700;padding:0 2px}
.fnref sup{font-size:.62em}
.paper .fnref,.white .fnref{color:#137F97}
.fnlist{margin:0;padding-left:20px;max-width:96ch}
.fnlist li{font-size:13px;line-height:1.65;color:#5B7080;margin-bottom:12px}
.fnlist li:target{color:var(--ink)}
.fnback{text-decoration:none;color:#137F97;margin-left:4px}

/* ---- shell ---- */
.wrap{width:min(1180px,100% - var(--gut) * 2);margin:0 auto}
.sec{padding:clamp(54px,7.5vw,108px) 0;position:relative;scroll-margin-top:64px;background:var(--navy)}
.sec.paper{background:var(--paper);color:var(--ink)}
.sec.white{background:var(--white);color:var(--ink)}
.sec.deep{background:var(--navy-d)}
.kicker{font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--tealL);margin-bottom:12px}
.paper .kicker,.white .kicker{color:#137F97}
h2{font-size:clamp(25px,3.3vw,38px);line-height:1.14;letter-spacing:-.02em;font-weight:680;max-width:44ch}
h2.wide{max-width:60ch}
h2 span.cl-pink,h2 span.cl-teal{display:block;font-weight:700}
.sub{font-size:clamp(15px,1.35vw,17.5px);line-height:1.6;color:#c2d4de;max-width:68ch;margin-top:14px}
.paper .sub,.white .sub{color:var(--ink-s)}
.src{font-size:12px;line-height:1.6;color:#8CA5B4;margin-top:22px;max-width:100ch}
.paper .src,.white .src{color:#7E8F99}
.secthead{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--mut);margin-bottom:12px}
.paper .secthead,.white .secthead{color:#7E8F99}
.secthead.teal{color:#137F97}
.legend{display:flex;gap:20px;align-items:center;font-size:12.5px;color:var(--mut);margin-top:18px;flex-wrap:wrap;line-height:1.5}
.legend i{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:7px;vertical-align:-1px;flex-shrink:0}
.legend b{color:var(--paper);font-weight:660}
.paper .legend,.white .legend{color:#7E8F99}.paper .legend b,.white .legend b{color:var(--ink)}
.head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap;margin-bottom:26px}
.bigstat{text-align:right;flex-shrink:0}
.bigstat .v{font-size:clamp(32px,4vw,44px);font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--tealL)}
.bigstat .v.pinkv{color:#F2A7C2}
.bigstat .k{font-size:11px;color:var(--mut);letter-spacing:.08em;text-transform:uppercase;margin-top:5px}
.bigstat.left{text-align:left;margin:22px 0 24px}


/* ---- sticky nav ---- */
#top{position:sticky;top:0;z-index:60;background:rgba(21,40,56,.9);backdrop-filter:saturate(150%) blur(14px);
  -webkit-backdrop-filter:saturate(150%) blur(14px);border-bottom:1px solid rgba(255,255,255,.1)}
#top .bar{display:flex;align-items:center;gap:20px;min-height:66px;padding:9px 0}
#top .mk{display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;flex-shrink:0}
#top .mk img{width:42px;height:42px;flex-shrink:0}
#top .mktext{display:block;line-height:1.2}
#top .mk b{display:block;font-size:19px;font-weight:700;letter-spacing:-.01em}
#top .mk b span{color:var(--tealL)}
#top .mk em{display:block;font-style:normal;font-size:11.5px;color:var(--mut);margin-top:2px;font-weight:500}
#top nav{display:flex;gap:4px;margin-left:auto;overflow-x:auto;scrollbar-width:none}
#top nav::-webkit-scrollbar{display:none}
#top nav a{font-size:13.5px;color:#bcd0dc;text-decoration:none;padding:7px 11px;border-radius:8px;white-space:nowrap}
#top nav a:hover{background:rgba(255,255,255,.09);color:#fff}
#top nav a.cur{color:#fff;background:rgba(99,203,224,.18)}
#top .navcta{flex-shrink:0;background:var(--teal);color:#fff;font-size:13.5px;font-weight:700;text-decoration:none;
  padding:9px 16px;border-radius:9px;white-space:nowrap}
#top .navcta:hover{background:#1789A1}
/* Narrow screens: the mark and its tagline take the first row on their own, then the
   section links and the CTA share the second. Keeps the tagline readable at phone width. */
/* Narrow screens: mark and CTA share the top row, section links get the full row below. */
@media (max-width:900px){#top .bar{padding:10px 0;flex-wrap:wrap;gap:9px 12px}
  #top .mk{order:1;flex:1;min-width:0}
  #top .navcta{order:2;padding:8px 14px;font-size:13px}
  #top nav{order:3;width:100%;margin-left:0}}
@media (max-width:520px){#top .mk img{width:38px;height:38px}
  #top .mk b{font-size:17.5px}#top .mk em{font-size:10.5px;line-height:1.35}}

/* ---- hero ---- */
#need{background:var(--navy)}
#hero{padding:clamp(48px,6vw,86px) 0 clamp(52px,6.5vw,92px);position:relative;overflow:hidden}
.tmap{position:absolute;inset:0;opacity:.085;display:flex;align-items:center;justify-content:center;pointer-events:none}
.tmap svg{width:150%;min-width:1100px;height:auto}.tmap path{fill:#7fd4d0}
.herogrid{display:grid;grid-template-columns:1fr minmax(260px,338px);gap:clamp(32px,4.4vw,60px);
  align-items:center;position:relative;z-index:2}
.bigclaim{font-size:clamp(26px,3.2vw,36px);line-height:1.2;font-weight:660;letter-spacing:-.02em}
.bigclaim span{display:block;font-weight:700}
.cl-pink{color:var(--pinkL)}
.cl-teal{color:var(--tealL)}
.herosub{font-size:clamp(15px,1.5vw,17.5px);line-height:1.6;color:#c2d4de;margin-top:24px}
.heroshot{position:relative}
.heroshot img{width:100%;height:auto;display:block;border-radius:16px;
  border:1px solid rgba(255,255,255,.22);box-shadow:0 22px 60px rgba(0,0,0,.42)}
.herobtns{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:700;text-decoration:none;
  padding:13px 22px;border-radius:11px;border:1px solid transparent}
.btn.primary{background:var(--teal);color:#fff}.btn.primary:hover{background:#1789A1}
.btn.ghost{border-color:rgba(255,255,255,.32);color:#dbe7ec}.btn.ghost:hover{background:rgba(255,255,255,.09)}
@media (max-width:860px){.herogrid{grid-template-columns:1fr;gap:30px}
  .bigclaim{max-width:none}
  .heroshot{order:-1;max-width:330px;margin:0 auto}}

/* ---- maps ----
   Both maps sit at full width on desktop. On narrow screens the ten-country map
   crops to the region that holds all ten and drops its leader labels for a list,
   and the forty map keeps only its three ring labels, scaled up in user units.
   Neither needs horizontal scrolling. */
.mapsvg{width:100%;height:auto;display:block;margin-top:26px}
.t10list{display:none}
.ringnote{display:none}
.land{fill:rgba(255,255,255,.075);stroke:rgba(255,255,255,.15);stroke-width:.5}
.hot{fill:rgba(178,63,114,.68);stroke:#E8799F;stroke-width:.7}
.lbline{stroke:rgba(255,255,255,.4);stroke-width:.8}
.t10n{font:600 13.5px var(--sans);fill:#eaf1f4;paint-order:stroke fill;stroke:#1C3144;stroke-width:3.5;stroke-linejoin:round}
.t10m{font:700 13.5px var(--sans);fill:#F2A7C2}
.deep .t10n{stroke:#152838}
.d40{fill:rgba(26,157,184,.62);stroke:#63CBE0;stroke-width:1.1}
.dtrade{fill:rgba(134,129,183,.55);stroke:#B0ACD9;stroke-width:1.1}
.half40{fill:rgba(26,157,184,.72)}.halfreach{fill:rgba(178,63,114,.72)}
.ringline{fill:none;stroke:#d6e6ee;stroke-width:1.1}
.reachring{fill:none;stroke:#E8799F;stroke-width:1.4;stroke-dasharray:5 4}
.reachlab{font:600 12px var(--sans);fill:#F2A7C2;text-anchor:middle}
.leader{fill:none;stroke:#E8799F;stroke-width:1.2;stroke-dasharray:4 4}

@media (max-width:900px){
  .t10map .t10labels{display:none}
  .t10list{display:grid;grid-template-columns:repeat(2,1fr);gap:2px 26px;margin:20px 0 0;padding:0;list-style:none;counter-reset:t}
  .t10list li{counter-increment:t;display:grid;grid-template-columns:20px 1fr auto;gap:8px;align-items:baseline;
    font-size:14px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.1)}
  .t10list li:before{content:counter(t);font-size:10.5px;font-weight:700;color:#5F7D91}
  .t10list .tn{color:#e3ecf0}
  .t10list .tv{font-weight:700;color:#F2A7C2}
  .t10list .ttot{grid-column:1 / -1;border-bottom:0;background:var(--pink);border-radius:9px;
    margin-top:14px;padding:13px 16px;font-size:15.5px;font-weight:700;grid-template-columns:1fr auto}
  .t10list .ttot:before{content:none}
  .t10list .ttot .tn,.t10list .ttot .tv{color:#fff}
  .fortymap .reachlab{display:none}
  .ringnote{display:list-item}
  .fortymap .reachring{stroke-width:3;stroke-dasharray:10 8}
  .fortymap .leader{stroke-width:2.6;stroke-dasharray:8 8}
  .fortymap .ringline{stroke-width:2.2}
  .fortymap .d40,.fortymap .dtrade{stroke-width:2.2}
}
@media (max-width:520px){.t10list{grid-template-columns:1fr}}

/* ---- venn ---- */
.vennrow{display:grid;grid-template-columns:150px 1fr 150px;gap:clamp(12px,2vw,26px);align-items:center;
  margin:30px auto 0;max-width:940px}
.s3blk{text-align:center}
.s3blk img{width:52px;height:52px;display:block;margin:0 auto 13px}
.s3n{font-size:16.5px;font-weight:700;letter-spacing:-.01em;margin-bottom:7px}
.s3d{font-size:12.5px;color:#5E727C;line-height:1.5}
.vennsvg{width:100%;height:auto;display:block}
.vbig{font:700 27px var(--sans);text-anchor:middle;letter-spacing:-.02em}
.vunit{font:600 12.5px var(--sans);text-anchor:middle}
.vsub{font:600 11.5px var(--sans);text-anchor:middle}
@media (max-width:780px){.vennrow{grid-template-columns:1fr 1fr;gap:20px}
  .vennrow .vennwrap{order:-1;grid-column:1 / -1}
  .vsub{font-size:14px}.vunit{font-size:15px}.vbig{font-size:31px}}
.unlist{background:#F7F9FA;border:1px solid #e2e8ea;border-radius:14px;padding:22px 18px;margin-top:34px;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:0 26px;align-items:start}
.unlist .uh{grid-column:1 / -1;font-size:clamp(19px,2.1vw,23px);font-weight:700;color:#137F97;letter-spacing:-.02em;
  line-height:1.15;margin-bottom:14px;padding:0 8px}
.unrow{display:grid;grid-template-columns:1fr auto;font-size:13.5px;padding:5px 8px;color:var(--ink);
  line-height:1.5;border-bottom:1px solid #e6ecee}
.unrow span{color:#7E8F99;font-size:12px;text-align:right}
.untot{grid-column:1 / -1;display:grid;grid-template-columns:1fr auto;font-size:16.5px;font-weight:700;color:#fff;
  background:var(--teal);border-radius:9px;padding:13px 16px;margin-top:16px}
.untot span{text-align:right;color:#fff}

/* ---- priorities ---- */
.pris{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:30px;align-items:start}
@media (max-width:900px){.pris{grid-template-columns:1fr}}
.pri{border-radius:13px;padding:20px 22px;background:#fff;border:1px solid #dde3e6}
.prihead{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:11px;margin-bottom:11px;border-bottom:1px solid #e6eaec}
.prin{font-size:14px;font-weight:700}.pric{font-size:13px;font-weight:700}
.pbar{height:8px;border-radius:99px;background:#e6eaec;overflow:hidden;margin:0 0 14px;display:block}
.pbar i{display:block;height:100%;border-radius:99px}
.prirow{font-size:15px;line-height:1.55;padding:4px 0}
.p1{background:#E8F5F8;border-color:var(--teal)}.p1 .prin,.p1 .pric{color:#137F97}.p1 .pbar i{background:var(--teal)}
.p2{background:#F0EFF7;border-color:var(--lav)}.p2 .prin,.p2 .pric{color:#655FA0}.p2 .pbar i{background:var(--lav)}
.p3{background:#F7F6F1;border-color:#BDB393}.p3 .prin,.p3 .pric{color:#8A7C56}.p3 .pbar i{background:#BDB393}
.bignums{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:26px}
@media (max-width:820px){.bignums{grid-template-columns:1fr}}
.bignum{display:flex;align-items:center;gap:18px;border-radius:13px;padding:18px 22px;color:#fff}
.bnico{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;flex-shrink:0}
.bignum .bn{font-size:clamp(30px,3.2vw,35px);font-weight:700;letter-spacing:-.03em;line-height:1}
.bignum .bl{font-size:13px;line-height:1.3;color:rgba(255,255,255,.92);margin-top:3px}
.b-teal{background:var(--teal)}.b-lav{background:var(--lav)}.b-pink{background:var(--pink)}

/* ---- language grid ---- */
.lgrid{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}
@media (max-width:1080px){.lgrid{grid-template-columns:repeat(5,1fr)}}
@media (max-width:820px){.lgrid{grid-template-columns:repeat(3,1fr)}}
@media (max-width:520px){.lgrid{grid-template-columns:repeat(2,1fr)}}
.cell{position:relative;border:1px solid rgba(255,255,255,.13);border-radius:8px;padding:9px;overflow:hidden;
  background:rgba(255,255,255,.03);display:flex;flex-direction:column;justify-content:flex-end;min-height:104px}
.cell.is40{background:rgba(26,157,184,.14);border-color:rgba(99,203,224,.42)}
.silh{position:absolute;inset:0;width:100%;height:100%;opacity:.2}
.silh path{fill:#9fb6c4;stroke:#9fb6c4;stroke-width:.3}
.cell.is40 .silh path{fill:#63CBE0;stroke:#63CBE0}
.cnum{position:absolute;top:7px;left:9px;font-size:9px;font-weight:700;color:rgba(255,255,255,.32)}
.w40{position:absolute;top:8px;right:9px;width:6px;height:6px;border-radius:50%;background:#63CBE0}
.cname{position:relative;font-size:13.5px;font-weight:660;line-height:1.18}
.cpop{position:relative;font-size:18px;font-weight:700;color:#75D4E6;letter-spacing:-.02em;line-height:1.1;margin-top:2px}
.ciso{position:relative;font-size:9px;color:var(--mut);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ciso.hasnote{color:#F2A7C2;font-weight:700}

/* ---- second benefit: vertical flow ----
   Was a wide SVG that had to be scrolled sideways on a phone. Now a centred
   vertical flow: three narrow steps joined by arrows, then a fan of rays opening
   into the full-width panel of minority languages. */
.flow{margin:32px auto 0;display:flex;flex-direction:column;align-items:center;max-width:900px}
.fnode{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.22);border-radius:12px;
  padding:15px 26px;text-align:center;width:min(100%,420px)}
.fnode .sk{font:700 9.5px var(--sans);letter-spacing:.15em;text-transform:uppercase;color:var(--mut);margin-bottom:5px}
.fnode .st{font-size:19px;font-weight:700;letter-spacing:-.01em;line-height:1.25}
.fnode .st em{font-style:normal;font-size:13px;font-weight:600;color:#adc2ce;white-space:nowrap}
.fnode.hi{background:rgba(26,157,184,.18);border-color:#63CBE0}
.fnode.hi .sk{color:#9fe3f0}
.fnode.hi .st em{color:#9fe3f0}
.farrow{display:flex;padding:9px 0}
.ffan{width:100%;height:74px;display:block;margin-top:2px}
.ffan line{stroke:#E8799F;stroke-width:1.1;opacity:.55}
.ffan .fhead{fill:#5E86A2;stroke:none}
.fnode.fan{width:100%;background:rgba(178,63,114,.16);border-color:#E8799F;padding:20px 24px}
.fnode.fan .sk{color:#F2A7C2}
.fnode.fan .st b{font-size:30px;color:#fff;margin-right:6px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;justify-content:center}
.chips span{font-size:12px;font-weight:600;color:#ffd9e6;background:rgba(178,63,114,.3);
  border:1px solid #E8799F;border-radius:6px;padding:5px 11px}
.chips span.more{background:none;border-style:dashed;color:#f0b8cb}
.fannote{font-size:13.5px;color:#e6eef2;font-weight:600;margin-top:18px;padding-top:15px;
  border-top:1px solid rgba(232,121,159,.4)}
@media (max-width:520px){.fnode{padding:13px 18px}.fnode .st{font-size:17px}
  .fnode .st em{display:block;white-space:normal;margin-top:2px}
  .ffan{height:52px}.fnode.fan{padding:18px 16px}}
.proof{margin-top:26px;background:rgba(178,63,114,.15);border:1px solid rgba(232,121,159,.5);
  border-radius:14px;padding:24px 28px;display:grid;grid-template-columns:1fr 220px;gap:28px;align-items:center}
@media (max-width:760px){.proof{grid-template-columns:1fr;gap:20px}}
.proof .pk{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#F2A7C2;margin-bottom:8px}
.proof p{font-size:15px;line-height:1.6;color:#e6eef2}
.proof .pnum{font-size:15px;font-weight:660;color:#fff;line-height:1.4;text-align:center}
.proof .pnum b{display:block;font-size:46px;color:#F2A7C2;letter-spacing:-.02em;margin-bottom:2px;line-height:1}

/* ---- websites ---- */
.webgrid{display:grid;grid-template-columns:1.12fr 1fr;gap:clamp(28px,4vw,46px);align-items:center;margin-top:30px}
@media (max-width:860px){.webgrid{grid-template-columns:1fr}}
.browser{display:block;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.2);
  background:#0f2231;text-decoration:none;position:relative;transition:transform .25s,box-shadow .25s,border-color .25s}
.browser:hover{transform:translateY(-3px);border-color:#63CBE0;box-shadow:0 16px 40px rgba(0,0,0,.35)}
.bbar{height:30px;background:#16293a;display:flex;align-items:center;padding:0 12px;gap:6px}
.bbar i{width:8px;height:8px;border-radius:50%;background:#43607a;display:block}
.bbar span{font-size:11px;color:#9fb6c4;margin-left:10px;font-family:ui-monospace,monospace}
.browser img{width:100%;display:block}
.domlist{display:grid;gap:8px}
.dom{display:flex;align-items:center;gap:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:14px;color:#dbe7ec;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);
  border-radius:8px;padding:10px 14px}
.dom i{width:7px;height:7px;border-radius:50%;background:var(--lav);flex-shrink:0}
.dom{text-decoration:none;transition:background .25s,border-color .25s}
.dom.live{background:rgba(26,157,184,.18);border-color:var(--teal);color:#fff;font-weight:700}
.dom.live:hover{background:rgba(26,157,184,.32);border-color:#63CBE0}
/* The one live site gets a slow pulse on its dot, plus a ring that breathes outward.
   Small and slow on purpose: enough to catch the eye, not enough to nag. */
.dom.live i{background:#63CBE0;position:relative;animation:livedot 2.6s ease-in-out infinite}
.dom.live i:after{content:"";position:absolute;inset:-3px;border-radius:50%;
  border:1.5px solid #63CBE0;animation:livering 2.6s ease-out infinite}
@keyframes livedot{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes livering{0%{transform:scale(.6);opacity:.9}70%,100%{transform:scale(2.1);opacity:0}}
@media (prefers-reduced-motion:reduce){.dom.live i,.dom.live i:after{animation:none}
  .dom.live i:after{opacity:.5;transform:scale(1)}}
.dom em{font-family:var(--sans);font-style:normal;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  color:#75D4E6;margin-left:auto;font-weight:700}
.dom em.sec-tag{color:#B0ACD9}

/* ---- filter and search ---- */
.fsgrid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,4vw,44px);margin-top:30px;align-items:start}
@media (max-width:860px){.fsgrid{grid-template-columns:1fr}}
.fbtn{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #cfd8dc;border-radius:9px;
  padding:9px 13px;font-size:14px;font-weight:660;color:var(--ink);margin-bottom:10px}
.fbtn b{background:var(--teal);color:#fff;font-size:10.5px;width:18px;height:18px;border-radius:50%;
  display:flex;align-items:center;justify-content:center}
.fcard{background:#fff;border:1px solid #dde3e6;border-radius:13px;padding:6px 18px 18px;box-shadow:0 3px 14px rgba(28,49,68,.08)}
.uirow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 2px;font-size:15px;font-weight:660;border-bottom:1px solid #e6ebee}
.uirow:last-child{border-bottom:0}
.uirow small{font-weight:400;color:#8A99A2;font-size:12px;margin-left:7px}
.sbar{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid #cfd8dc;border-radius:11px;padding:13px 16px}
.sbar span{font-size:16px;color:#7B8B94;font-weight:500}
.srule{height:1px;background:#dde3e6;margin:16px 0 14px}
.tog{width:36px;height:20px;border-radius:99px;background:#d3dade;position:relative;flex-shrink:0}
.tog:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff}
.tog.on{background:var(--teal)}.tog.on:after{left:18px}
.chev{color:#9AA8AE;font-size:15px}
.uifoot{display:flex;gap:10px;margin-top:16px}
.uifoot span{flex:1;text-align:center;font-size:13px;font-weight:700;padding:10px;border-radius:9px;border:1px solid #cfd8dc;color:var(--ink)}
.uifoot span.pri{background:var(--teal);border-color:var(--teal);color:#fff}
.reslist{display:grid;gap:8px}
.res{display:flex;align-items:center;gap:12px;font-size:13.5px;background:#fff;border:1px solid #e2e7ea;border-radius:10px;padding:11px 14px}
.res .rs{font-size:11.5px;color:#7E8F99;margin-top:2px}
.res img{width:34px;height:34px;border-radius:6px;object-fit:cover;flex-shrink:0}
.res b{font-weight:660}.res .rm{margin-left:auto;font-size:11px;color:#8A99A2;text-align:right;line-height:1.35;flex-shrink:0}
.res mark{background:#FDE7A9;color:var(--ink);border-radius:2px;padding:0 2px}

/* ---- playlist ---- */
.plgrid{display:grid;grid-template-columns:1fr 1.02fr;gap:clamp(28px,4vw,44px);margin-top:30px;align-items:start}
@media (max-width:860px){.plgrid{grid-template-columns:1fr}}
@media (max-width:860px){.plgrid .secthead{margin-top:34px}.plgrid > div:first-child > .secthead:first-child{margin-top:6px}}
.uc{display:flex;gap:13px;align-items:flex-start;margin-bottom:14px}
.uc .ucn{width:27px;height:27px;border-radius:50%;background:rgba(26,157,184,.22);border:1px solid #63CBE0;
  color:#75D4E6;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.uc .uct{font-size:16px;line-height:1.45;font-weight:600}
.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:6px}
@media (max-width:480px){.feats{grid-template-columns:1fr}}
.feat{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.18);border-radius:11px;padding:16px 12px;text-align:center}
.feat .fi{width:36px;height:36px;border-radius:9px;background:rgba(134,129,183,.28);color:#C3BFE6;
  display:flex;align-items:center;justify-content:center;margin:0 auto 10px}
.feat .fn{font-size:13.5px;font-weight:700}
.feat .ff{font-size:11px;color:#adc2ce;margin-top:4px;line-height:1.4}
.pl{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.17);border-radius:14px;padding:18px}
.plhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.plhead .pln{font-size:16.5px;font-weight:700}
.plhead .plm{font-size:11px;color:var(--mut);letter-spacing:.06em;text-transform:uppercase;font-weight:700}
.plrow{display:grid;grid-template-columns:16px 34px 1fr 42px;gap:12px;align-items:center;
  background:rgba(255,255,255,.05);border-radius:8px;padding:8px 11px;margin-bottom:7px}
.plrow .h{color:#7B95A6;font-size:13px}
.plrow img{width:34px;height:34px;border-radius:6px;object-fit:cover;display:block}
.plrow .t{font-size:13.5px;font-weight:600}
.plrow .m{font-size:11px;color:var(--mut);text-align:right}
.plrow.add{background:rgba(26,157,184,.16);border:1px dashed #63CBE0}.plrow.add .t{color:#75D4E6}

/* ---- storyboards ---- */
.sbgrid{display:grid;grid-template-columns:1fr 330px;gap:clamp(28px,4vw,44px);margin-top:30px;align-items:center}
@media (max-width:900px){.sbgrid{grid-template-columns:1fr}}
.sbimg{border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.2);background:#fff}
.sbimg img{width:100%;display:block}
.why{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px}
.why .ico{width:36px;height:36px;border-radius:9px;background:rgba(26,157,184,.2);border:1px solid #63CBE0;
  display:flex;align-items:center;justify-content:center;flex-shrink:0}
.why .wt{font-size:15.5px;font-weight:660;line-height:1.3}
.why .wd{font-size:12.5px;color:#b3c8d3;margin-top:4px;line-height:1.5}

/* ---- process ---- */
.pwrap{position:relative;height:480px;margin-top:34px}
.pgrid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,160px);
  gap:0 40px;height:480px;align-items:center;position:relative;z-index:2;
  width:calc(100% - 132px);margin:0 auto}
.pstep{position:relative;border-radius:11px;padding:11px 13px;background:#26415A;
  border:1px solid rgba(255,255,255,.18);align-self:center;
  display:grid;grid-template-columns:auto auto 1fr;grid-template-areas:"n i a" "t t t";
  align-items:center;column-gap:7px}
.pn{grid-area:n;width:20px;height:20px;border-radius:50%;font-size:10.5px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff}
.pic{grid-area:i;display:flex;align-items:center;opacity:.95}
.ai{grid-area:a;justify-self:end;font-size:8.5px;font-weight:700;letter-spacing:.1em;padding:1px 5px;border-radius:4px;
  background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);color:#eaf1f4}
.ptxt{grid-area:t;margin-top:6px}
.pt{display:block;font-size:14px;font-weight:660;line-height:1.25}
.pd{display:block;font-size:11px;color:#adc2ce;margin-top:3px;line-height:1.35}
.o-tech{background:#194957;border-color:#63CBE0}.o-tech .pn{background:#194957}.o-tech .pic{color:#75D4E6}
.o-eng{background:#38375B;border-color:#B0ACD9}.o-eng .pn{background:#38375B}.o-eng .pic{color:#C3BFE6}
.o-loc{background:#4A2440;border-color:#E8799F}.o-loc .pn{background:#4A2440}.o-loc .pic{color:#F2A7C2}
.o-des{background:#4A452F;border-color:#D7CEB2}.o-des .pn{background:#4A452F}.o-des .pic{color:#E6E0CB}
.snake{position:absolute;inset:0;z-index:1;pointer-events:none}
.snake path{fill:none;stroke:#284B5F;stroke-width:26;stroke-linecap:round;stroke-linejoin:round}
.snake circle{fill:#284B5F;stroke:none}
/* Narrow screens: the snake becomes a plain stack. The step number moves out of
   the tile into the left gutter, where the rail used to be, and each tile
   collapses to one line of icon, title, then subtitle. */
@media (max-width:1000px){
  .pwrap{height:auto;padding-left:34px}
  .snake{display:none}
  .pgrid{grid-template-columns:1fr;grid-template-rows:none;height:auto;width:100%;gap:9px}
  .pgrid .pstep{grid-row:auto!important;grid-column:auto!important;
    grid-template-columns:auto 1fr auto;grid-template-areas:"i t a";column-gap:10px;padding:12px 13px}
  .pgrid .pn{position:absolute;left:-34px;top:50%;transform:translateY(-50%);width:24px;height:24px;font-size:11.5px}
  .pgrid .ptxt{margin-top:0;display:block}
  .pgrid .pt{display:inline;font-size:13.5px}
  .pgrid .pd{display:inline;margin-top:0;font-size:11.5px}
  .pgrid .pd:before{content:"·";margin:0 6px;color:#6C8698}}

/* ---- shared freely ---- */
.threecard{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:34px}
@media (max-width:900px){.threecard{grid-template-columns:1fr}}
.fc{background:#fff;border:1px solid #dde3e6;border-radius:15px;padding:30px 28px;text-align:center}
.fc .fcico{width:56px;height:56px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin:0 auto 17px}
.fc h3{font-size:22px;font-weight:680;letter-spacing:-.01em;line-height:1.2}
.fc p{font-size:14px;line-height:1.6;color:var(--ink-s);margin-top:10px}
.i-teal{background:var(--teal)}.i-lav{background:var(--lav)}.i-pink{background:var(--pink)}

/* ---- stack ---- */
.stack{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(20px,3vw,30px);margin-top:34px}
@media (max-width:900px){.stack{grid-template-columns:1fr;gap:30px}}
.scol{display:flex;flex-direction:column;gap:14px}
.scolh{font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:700;color:var(--tealL);
  padding-bottom:9px;border-bottom:1px solid rgba(99,203,224,.4);margin-bottom:2px}
.scolh.later{margin-top:16px}
.stile{background:#26415A;border:1px solid rgba(255,255,255,.16);border-radius:11px;
  padding:15px;display:flex;gap:14px;align-items:center}
.stile img{width:38px;height:38px;object-fit:contain;flex-shrink:0;background:#fff;border-radius:8px;padding:4px}
.stile .sn{font-size:15.5px;font-weight:700;letter-spacing:-.01em}
.stile .sd{font-size:11.5px;color:#adc2ce;margin-top:3px;line-height:1.4}
.stacknote{margin-top:26px;font-size:13px;color:#a8bfcc;line-height:1.6;max-width:90ch}
.stacknote b{color:#e8eef1;font-weight:660}

/* ---- team ---- */
/* minmax(0,1fr) not 1fr: plain 1fr has a min-content floor, so the wide reviewers tile
   would inflate the tracks it spans and leave the four role tiles unequal. */
.teamgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:34px}
.tcard{background:#26415A;border:1px solid rgba(255,255,255,.16);border-radius:13px;padding:20px 18px;display:flex;flex-direction:column}
.tcard.needed{background:#194957;border-color:#63CBE0}
.tcard .tico{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;
  background:rgba(255,255,255,.1);color:#cfe0e8}
.tcard.needed .tico{background:rgba(99,203,224,.22);color:#75D4E6}
.tcard .tr{font-size:15.5px;font-weight:700;line-height:1.25}
.tcard .tw{font-size:12px;color:#b3c8d3;margin-top:7px;line-height:1.5;flex:1}
.tcard .tag{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;
  border-radius:99px;margin-top:14px;align-self:flex-start;flex-shrink:0}
/* The reviewers tile sits inside the grid so its edges line up with the Graphic designer
   and Language coordinator tiles: the last two columns at four across, the full row at two,
   and a normal single card at one. These media queries must come after this base rule or
   the 3 / -1 span leaks into the narrower layouts and invents a third column. */
.tcard.wide{grid-column:3 / -1;flex-direction:row;align-items:flex-start;gap:16px}
.tcard.wide .tico{margin-bottom:0}
.tcard.wide .tw{margin-top:6px;flex:none}
.t-have{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28);color:#c7d8e2}
.t-need{background:rgba(26,157,184,.3);border:1px solid #63CBE0;color:#9fe3f0}
@media (max-width:1000px){
  .teamgrid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:1fr 1fr auto}
  .tcard.wide{grid-column:1 / -1}}
@media (max-width:560px){
  .teamgrid{grid-template-columns:minmax(0,1fr);grid-template-rows:none}
  .tcard.wide{grid-column:1 / -1;flex-direction:column}
  .tcard.wide .tico{margin-bottom:14px}.tcard.wide .tw{flex:1}}
.wanted{font-size:clamp(19px,2.2vw,25px);font-weight:680;letter-spacing:-.01em;margin-top:clamp(38px,4.5vw,58px);
  text-align:center;color:#fff}
.advgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:22px}
@media (max-width:900px){.advgrid{grid-template-columns:repeat(2,1fr)}}
.acard{background:#26415A;border:1px solid rgba(255,255,255,.16);border-radius:13px;padding:22px 16px;text-align:center}
.acard img{width:52px;height:52px;object-fit:contain;display:block;margin:0 auto 14px;opacity:.95}
.acard .an{font-size:14.5px;font-weight:660;line-height:1.3}

/* ---- CTA ---- */
#contact{background:linear-gradient(135deg,#1DA7C3 0%,#15788E 58%,#116579 100%);text-align:center}
#contact h2{max-width:none;font-size:clamp(28px,4.4vw,46px);margin:0 auto}
#contact p{font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:rgba(255,255,255,.9);max-width:56ch;margin:16px auto 0}
.ctabtns{display:flex;gap:14px;justify-content:center;margin-top:32px;flex-wrap:wrap}
.btn.solid{background:#fff;color:#12657A}
.btn.solid:hover{background:#eaf7fa}
.btn.line{border-color:rgba(255,255,255,.55);color:#fff}
.btn.line:hover{background:rgba(255,255,255,.14)}
footer{background:var(--navy-d);padding:34px 0;font-size:13px;color:#8CA5B4}
footer .fbar{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}
footer a{color:#bcd0dc}
footer .fm{display:flex;align-items:center;gap:10px;font-weight:700;color:#fff;font-size:15px}
footer .fm img{width:24px;height:24px;border-radius:5px}
footer .fm b{font-weight:700}
footer .fm span{color:var(--tealL)}
`;

const S = {
  hero: `
<section id="need">
  <div id="hero">
    <div class="tmap" aria-hidden="true"><svg viewBox="0 0 ${W.w} ${W.h}"><path d="${W.world}"/></svg></div>
    <div class="wrap herogrid">
      <div class="herotext">
        <h1 class="bigclaim">The Bible is in every major language in the world.
          <span class="cl-pink">739 million people still cannot read it.</span>
          <span class="cl-teal">5.7 billion people would prefer not to.${ref('need')}</span></h1>
        <p class="herosub">Storying.app will be an audio-based, mobile-first library of oral Bible stories and story sets in 40 major languages.</p>
        <div class="herobtns">
          <a class="btn primary" href="#contact">Get involved</a>
          <a class="btn ghost" href="#languages">See the 40 languages</a>
        </div>
      </div>
      <div class="heroshot"><img src="${HERO}" alt="A story from the storying.app library, with audio to listen to" width="1204" height="1594"></div>
    </div>
  </div>
</section>`,

  where: `
<section class="sec deep">
  <div class="wrap">
    <div class="kicker">The need</div>
    <h2 class="wide">More than half of the world's illiterate adults live in ten countries.
      <span class="cl-pink">Nine will be covered by storying.app.</span>
      <span class="cl-teal">Eight are in the 10/40 Window.${ref('ten')}</span></h2>
    <svg class="mapsvg t10map" viewBox="0 0 ${W.w} ${W.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map highlighting the ten countries with the most illiterate adults">
      <path class="land" d="${W.world}"/>${t10shapes}<g class="t10labels">${t10labels}</g></svg>
    <ol class="t10list">${W.top10.map(t => `<li><span class="tn">${t.name}</span><span class="tv">${t.m}M</span></li>`).join('')}
      <li class="ttot"><span class="tn">Total</span><span class="tv">${W.top10.reduce((a, b) => a + b.m, 0)}M</span></li></ol>
    <div class="legend"><span>Ethiopia is the one gap. Neither Amharic nor Oromo is among the forty languages.</span></div>
  </div>
</section>`,

  venn: `
<section class="sec white">
  <div class="wrap">
    <div class="kicker">What exists today</div>
    <h2 class="wide">StoryRunners reaches dozens of minority languages. We focus on the languages those communities trade in.${ref('venn')}</h2>
    <div style="margin-top:22px">
      <div>
        <div class="vennrow">
          <div class="s3blk">
            <img src="${SRLOGO}" alt="StoryRunners">
            <div class="s3n" style="color:#D93A16">StoryRunners</div>
            <div class="s3d">~3.0B people</div>
            <div class="s3d">98 total languages</div>
          </div>
          <div class="vennwrap">
            <svg class="vennsvg" viewBox="${VB}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Venn diagram: 83 languages only StoryRunners covers, 15 shared, 25 unique to storying.app">
              <defs><clipPath id="clipSr"><circle cx="${V.srx.toFixed(1)}" cy="${V.cy}" r="${R_SR.toFixed(1)}"/></clipPath></defs>
              <circle cx="${V.cx}" cy="${V.cy}" r="${R_US}" fill="rgba(26,157,184,.17)"/>
              <circle cx="${V.srx.toFixed(1)}" cy="${V.cy}" r="${R_SR.toFixed(1)}" fill="rgba(240,68,32,.15)"/>
              <circle cx="${V.cx}" cy="${V.cy}" r="${R_US}" fill="rgba(134,129,183,.5)" clip-path="url(#clipSr)"/>
              <circle cx="${V.cx}" cy="${V.cy}" r="${R_US}" fill="none" stroke="#1A9DB8" stroke-width="1.8"/>
              <circle cx="${V.srx.toFixed(1)}" cy="${V.cy}" r="${R_SR.toFixed(1)}" fill="none" stroke="#F04420" stroke-width="1.8"/>
              <text class="vbig" x="${SRX.toFixed(0)}" y="${V.cy - 9}" fill="#F04420">0.4B</text>
              <text class="vunit" x="${SRX.toFixed(0)}" y="${V.cy + 9}" fill="#F04420">people</text>
              <text class="vsub" x="${SRX.toFixed(0)}" y="${V.cy + 31}" fill="#C4350F">83 languages</text>
              <text class="vbig" x="${V.lens.toFixed(0)}" y="${V.cy - 9}" fill="#584C86">2.6B</text>
              <text class="vunit" x="${V.lens.toFixed(0)}" y="${V.cy + 9}" fill="#584C86">people</text>
              <text class="vsub" x="${V.lens.toFixed(0)}" y="${V.cy + 31}" fill="#584C86">15 shared languages</text>
              <text class="vbig" x="${V.ours.toFixed(0)}" y="${V.cy - 9}" fill="#1A9DB8">2.15B</text>
              <text class="vunit" x="${V.ours.toFixed(0)}" y="${V.cy + 9}" fill="#137F97">people</text>
              <text class="vsub" x="${V.ours.toFixed(0)}" y="${V.cy + 31}" fill="#137F97">25 languages</text>
            </svg>
          </div>
          <div class="s3blk">
            <img src="${LOGOSQ}" alt="storying.app" style="border-radius:9px">
            <div class="s3n" style="color:#137F97">storying.app</div>
            <div class="s3d">4.75B people</div>
            <div class="s3d">40 total languages</div>
          </div>
        </div>
      </div>
      <div class="unlist">
        <div class="uh">25 languages unique to storying.app</div>
        ${uncov.map((l, i) => `<div class="unrow${i % 2 ? ' alt' : ''}"><strong>${l.name}${l.w1040 ? '' : ' *'}</strong><span>${fmtWord(l.native)}</span></div>`).join('')}
        <div class="untot"><strong>Total</strong><span>${fmtWord(uncovNative)}</span></div>
      </div>
    </div>
  </div>
</section>`,

  sets: `
<section class="sec paper" id="sets">
  <div class="wrap">
    <div class="kicker">The buildout</div>
    <h2>Twelve story sets, in priority order.</h2>
    <div class="pris">${priCols}</div>
    <div class="bignums">
      <div class="bignum b-teal"><div class="bnico">${ic('book-open', 23, '#fff')}</div><div><div class="bn">183</div><div class="bl">stories in English</div></div></div>
      <div class="bignum b-lav"><div class="bnico">${ic('globe', 23, '#fff')}</div><div><div class="bn">40</div><div class="bl">languages total</div></div></div>
      <div class="bignum b-pink"><div class="bnico">${ic('languages', 23, '#fff')}</div><div><div class="bn">7,320</div><div class="bl">translated stories total</div></div></div>
    </div>
  </div>
</section>`,

  langs: `
<section class="sec" id="languages">
  <div class="wrap">
    <div class="kicker">The 40 languages</div>
    <h2 class="wide">${w40} major 10/40 Window languages.<br>8 massive trade languages.</h2>
    <div class="bigstat left"><div class="v">${fmt(totalNative)}</div><div class="k">native speakers</div></div>
    <div class="lgrid">${gridCells}</div>
    <div class="legend">
      <span><i style="background:#63CBE0"></i><b>${w40} of 40</b> are 10/40 Window languages</span>
      <span style="color:#F2A7C2"><b style="color:#F2A7C2">French</b> reaches Francophone Africa. <b style="color:#F2A7C2">Korean</b> is spoken in North Korea.</span>
      <span>Silhouette shows the country with the most native speakers</span>
    </div>
  </div>
</section>`,

  map40: `
<section class="sec deep">
  <div class="wrap">
    <div class="kicker">The forty, on a map</div>
    <h2 class="wide">Concentrated where literacy is lowest and unreached population is highest.</h2>
    <svg class="mapsvg fortymap" viewBox="0 0 ${W.w} ${W.h}" preserveAspectRatio="xMidYMid meet" style="margin-top:22px" role="img" aria-label="World map showing the 40 languages sized by native speakers">
      <path class="land" d="${W.world}"/>${reach}${dots}</svg>
    <div class="legend">
      <span><i style="background:rgba(26,157,184,.7);border:1px solid #63CBE0"></i>10/40 Window language</span>
      <span><i style="background:rgba(134,129,183,.6);border:1px solid #B0ACD9"></i>Trade language</span>
      <span><i style="background:linear-gradient(90deg,#1A9DB8 50%,#B23F72 50%)"></i>Split circle: reaches far beyond its home country</span>
      <span>Circle area scaled to native speakers</span>
      <span class="ringnote" style="list-style:none">Dashed rings: <b style="color:#F2A7C2">French</b> reaches Francophone Africa, <b style="color:#F2A7C2">Korean</b> is spoken in North Korea</span>
    </div>
  </div>
</section>`,

  every: `
<section class="sec">
  <div class="wrap">
    <div class="kicker">The second benefit</div>
    <h2>Not forty languages. Every language.</h2>
    <p class="sub">A bilingual speaker of one of our 40 languages can easily take our pre-crafted stories and translate them into their minority language. This is far easier than crafting a new story directly from the Bible in that minority language.</p>
    <div class="flow">
      <div class="fnode"><div class="sk">Source</div><div class="st">Scripture</div></div>
      <div class="farrow" aria-hidden="true">${arrow()}</div>
      <div class="fnode"><div class="sk">We craft</div><div class="st">English</div></div>
      <div class="farrow" aria-hidden="true">${arrow()}</div>
      <div class="fnode hi"><div class="sk">We translate</div><div class="st">Nepali <em>(trade language)</em></div></div>
      <svg class="ffan" viewBox="0 0 600 74" preserveAspectRatio="none" aria-hidden="true">
        ${Array.from({ length: 15 }, (_, i) => `<line x1="300" y1="0" x2="${(20 + i * (560 / 14)).toFixed(1)}" y2="66"/>`).join('')}
        <path class="fhead" d="M292 0 h16 l-8 9 Z"/>
      </svg>
      <div class="fnode fan">
        <div class="sk">They translate</div>
        <div class="st"><b>120+</b> minority languages</div>
        <div class="chips">${['Nubri', 'Gurung', 'Tamang', 'Sherpa', 'Magar', 'Newar', 'Limbu', 'Rai', 'Thakali', 'Chepang', 'Rajbanshi', '+109 more']
          .map(n => `<span${n[0] === '+' ? ' class="more"' : ''}>${n}</span>`).join('')}</div>
        <p class="fannote">This same expansion happens behind all 40 languages.</p>
      </div>
    </div>
    <div class="proof">
      <div>
        <div class="pk">This has already happened &nbsp;&middot;&nbsp; The Nubri story</div>
        <p>The Creation to Christ stories were translated into Nepali. From Nepali, local speakers translated them into Nubri and Gurung. The stories are now the only known gospel resource in Nubri! And the first known Nubri believer came to faith after hearing the Creation to Christ composite story!</p>
      </div>
      <div class="pnum"><b>1</b>Nubri believer</div>
    </div>
  </div>
</section>`,

  sites: `
<section class="sec deep" id="product">
  <div class="wrap">
    <div class="kicker">One library, many front doors</div>
    <h2 class="wide">Each story set becomes its own simple, curated website.</h2>
    <div class="webgrid">
      <a class="browser" href="https://www.creationtochrist.app/" target="_blank" rel="noopener"
         aria-label="Open creationtochrist.app, the one story set that is already live">
        <div class="bbar"><i></i><i></i><i></i><span>creationtochrist.app</span></div>
        <img src="${DESK}" alt="The Creation to Christ website, already live">
      </a>
      <div>
        <div class="domlist">
          <a class="dom live" href="https://www.creationtochrist.app/" target="_blank" rel="noopener"><i></i>creationtochrist.app<em>live now</em></a>
          ${DOMS.map(d => `<div class="dom"><i></i>${d}<em class="sec-tag">secured</em></div>`).join('')}
        </div>
        <p style="font-size:13.5px;color:#b3c8d3;margin-top:16px;line-height:1.6">The benefit of these domains is that trainers don't have to navigate a complex library, they can just tell someone to go to <span style="color:#75D4E6">7commands.app</span>.</p>
      </div>
    </div>
  </div>
</section>`,

  find: `
<section class="sec paper">
  <div class="wrap">
    <div class="kicker">Find anything quickly</div>
    <h2 class="wide">Filter and search for any word in any story in any language, quickly.</h2>
    <div class="fsgrid">
      <div>
        <div class="secthead teal">Filter</div>
        <div class="fbtn">${ic('list-filter', 15, '#1C3144', 2.2)} Filter <b>2</b></div>
        <div class="fcard">
          <div class="uirow">Language <span class="chev">&#8250;</span></div>
          <div class="uirow">Story set <span class="chev">&#8250;</span></div>
          <div class="uirow">Book of the Bible <span class="chev">&#8250;</span></div>
          <div class="uirow"><span>Theme <small>sacrifice, money, healing</small></span> <span class="chev">&#8250;</span></div>
          <div class="uirow">Has a storyboard <span class="tog on"></span></div>
          <div class="uirow">Has audio in Nepali <span class="tog on"></span></div>
          <div class="uifoot"><span>Clear all</span><span class="pri">Done</span></div>
        </div>
      </div>
      <div>
        <div class="secthead teal">Search</div>
        <div class="sbar">${ic('search', 17, '#2E8FA8', 2.2)}<span>money</span></div>
        <div class="srule"></div>
        <div class="reslist">
          <div class="res"><img src="${IMG.zac}" alt=""><div><b>Zacchaeus</b><div class="rs">&ldquo;I will give half my <mark>money</mark> to the poor&rdquo;</div></div><div class="rm">Luke 19<br>1:30</div></div>
          <div class="res"><img src="${IMG.blind}" alt=""><div><b>The Rich Young Ruler</b><div class="rs">&ldquo;Sell everything and give the <mark>money</mark> away&rdquo;</div></div><div class="rm">Mark 10<br>1:45</div></div>
          <div class="res"><img src="${IMG.feed}" alt=""><div><b>The Widow's Offering</b><div class="rs">&ldquo;She gave all the <mark>money</mark> she had&rdquo;</div></div><div class="rm">Mark 12<br>1:12</div></div>
          <div class="res"><img src="${IMG.res}" alt=""><div><b>The Rich Fool</b><div class="rs">Theme: <mark>money</mark> and greed</div></div><div class="rm">Luke 12<br>1:38</div></div>
          <div class="res"><img src="${IMG.creation}" alt=""><div><b>Treasure in Heaven</b><div class="rs">&ldquo;Do not store up <mark>money</mark> for yourselves on earth&rdquo;</div></div><div class="rm">Matthew 6<br>1:20</div></div>
        </div>
        <p style="font-size:12.5px;color:#7E8F99;margin-top:13px">Search covers the story text and metadata in every language.</p>
      </div>
    </div>
  </div>
</section>`,

  playlist: `
<section class="sec">
  <div class="wrap">
    <div class="kicker">Build your own story set</div>
    <h2>Every user can make a playlist.</h2>
    <div class="plgrid">
      <div>
        <div class="secthead">Potential use cases</div>
        <div class="uc"><div class="ucn">1</div><div class="uct">Add an Old Testament story into the Creation to Christ set.</div></div>
        <div class="uc"><div class="ucn">2</div><div class="uct">Swap out one of the 7 Commands stories in your language.</div></div>
        <div class="uc"><div class="ucn">3</div><div class="uct">Build a brand new set about money.</div></div>
        <div class="secthead" style="margin-top:30px">Features</div>
        <div class="feats">
          <div class="feat"><div class="fi">${ic('share-2', 18)}</div><div class="fn">Share</div><div class="ff">One link, no account needed</div></div>
          <div class="feat"><div class="fi">${ic('download', 18)}</div><div class="fn">Download</div><div class="ff">Offline bundle of just your set</div></div>
          <div class="feat"><div class="fi">${ic('fork', 18)}</div><div class="fn">Fork</div><div class="ff">Copy a set and change it</div></div>
        </div>
      </div>
      <div>
        <div class="secthead">Custom story set</div>
        <div class="pl">
        <div class="plhead"><div class="pln">Money and the Kingdom</div><div class="plm">Nepali &middot; 5 stories</div></div>
        <div class="plrow"><span class="h">&#8801;</span><img src="${IMG.blind}" alt=""><span class="t">The Rich Young Ruler</span><span class="m">1:45</span></div>
        <div class="plrow"><span class="h">&#8801;</span><img src="${IMG.zac}" alt=""><span class="t">Zacchaeus</span><span class="m">1:30</span></div>
        <div class="plrow"><span class="h">&#8801;</span><img src="${IMG.feed}" alt=""><span class="t">The Widow's Offering</span><span class="m">1:12</span></div>
        <div class="plrow"><span class="h">&#8801;</span><img src="${IMG.res}" alt=""><span class="t">The Rich Fool</span><span class="m">1:38</span></div>
        <div class="plrow"><span class="h">&#8801;</span><img src="${IMG.creation}" alt=""><span class="t">Treasure in Heaven</span><span class="m">1:20</span></div>
        <div class="plrow add"><span class="h">+</span><span></span><span class="t">Add another story</span><span class="m"></span></div>
        </div>
      </div>
    </div>
  </div>
</section>`,

  boards: `
<section class="sec deep">
  <div class="wrap">
    <div class="kicker">Storyboards</div>
    <h2>Drawn once. Used by all forty languages.</h2>
    <div class="sbgrid">
      <div class="sbimg"><img src="${SBOARD}" alt="Jesus Calms the Storm storyboard"></div>
      <div>
        <div class="secthead">Benefits of storyboards</div>
        <div class="why"><div class="ico">${ic('zap', 17, '#75D4E6')}</div>
          <div><div class="wt">Storytellers internalize faster</div><div class="wd">Pictures hold the sequence so the teller does not have to memorize words</div></div></div>
        <div class="why"><div class="ico">${ic('user-check', 17, '#75D4E6')}</div>
          <div><div class="wt">Listeners stay on track</div><div class="wd">Everyone can see where the story is, and where it is going</div></div></div>
        <div class="why"><div class="ico">${ic('globe', 17, '#75D4E6')}</div>
          <div><div class="wt">No words, so no language</div><div class="wd">One drawing serves every language in the library, in print and on screen</div></div></div>
        <div class="why" style="margin-bottom:0"><div class="ico">${ic('palette', 17, '#75D4E6')}</div>
          <div><div class="wt">They are interesting</div><div class="wd">People stop and look. That is the whole job of a first impression</div></div></div>
      </div>
    </div>
  </div>
</section>`,

  process: `
<section class="sec" id="process">
  <div class="wrap">
    <div class="kicker">The process</div>
    <h2>From start to finish.</h2>
    <div class="pwrap">
      <svg class="snake" viewBox="0 0 1128 480" preserveAspectRatio="none" aria-hidden="true">
        <path d="M25 80 H1061 Q1113 80 1113 136 V184 Q1113 240 1061 240 H67 Q15 240 15 296 V344 Q15 400 67 400 H846"/>
        <circle cx="25" cy="80" r="23"/><circle cx="846" cy="400" r="23"/>
      </svg>
      <div class="pgrid">${stepTiles}</div>
    </div>
    <div class="secthead" style="margin-top:30px;margin-bottom:9px">Done by</div>
    <div class="legend" style="gap:22px;margin-top:0">
      <span><i style="background:#63CBE0"></i>Technology coordinator</span>
      <span><i style="background:#D7CEB2"></i>Designer</span>
      <span><i style="background:#B0ACD9"></i>English review team</span>
      <span><i style="background:#E8799F"></i>Local language review team</span>
      <span><b style="border:1px solid rgba(255,255,255,.45);border-radius:4px;padding:1px 6px;font-size:9.5px">AI</b>&nbsp; assisted by AI</span>
    </div>
  </div>
</section>`,

  free: `
<section class="sec paper">
  <div class="wrap">
    <div class="kicker">Built to be shared freely</div>
    <h2 class="wide">A measure of success is how far this travels without us knowing about it.</h2>
    <div class="threecard">
      <div class="fc"><div class="fcico i-teal">${ic('lock', 26, '#fff')}</div><h3>Open license</h3>
        <p>Anyone may copy it, host it, translate it onward, or build it into their own app. No permission needed, no waiting on us.</p></div>
      <div class="fc"><div class="fcico i-lav">${ic('wifi-off', 26, '#fff')}</div><h3>Works offline</h3>
        <p>Install a story set to a phone home screen and it keeps working with no signal, in a village, in a country that throttles the internet.</p></div>
      <div class="fc"><div class="fcico i-pink">${ic('hard-drive', 26, '#fff')}</div><h3>Travels on a memory card</h3>
        <p>Every set in every language is also a downloadable bundle. Hand it over on a card, copy it phone to phone, put it on a village hard drive.</p></div>
    </div>
  </div>
</section>`,

  stack: `
<section class="sec deep">
  <div class="wrap">
    <div class="kicker">The tech stack</div>
    <h2>World-class tools for a world-changing project.</h2>
    <div class="stack">
      <div class="scol"><div class="scolh">${STACK[0][0]}</div>
        ${STACK[0][1].map(([f, n, d]) => `<div class="stile"><img src="${L(f)}" alt=""><div><div class="sn">${n}</div><div class="sd">${d}</div></div></div>`).join('')}
      </div>
      <div class="scol"><div class="scolh">${STACK[1][0]}</div>
        ${STACK[1][1].map(([f, n, d]) => `<div class="stile"><img src="${L(f)}" alt=""><div><div class="sn">${n}</div><div class="sd">${d}</div></div></div>`).join('')}
      </div>
      <div class="scol"><div class="scolh">${STACK[2][0]}</div>
        ${STACK[2][1].map(([f, n, d]) => `<div class="stile"><img src="${L(f)}" alt=""><div><div class="sn">${n}</div><div class="sd">${d}</div></div></div>`).join('')}
        <div class="scolh later">${STACK[3][0]}</div>
        ${STACK[3][1].map(([f, n, d]) => `<div class="stile"><img src="${L(f)}" alt=""><div><div class="sn">${n}</div><div class="sd">${d}</div></div></div>`).join('')}
      </div>
    </div>
    <p class="stacknote"><b>Version tracking:</b> every story text and audio file carries a content hash, so the system always knows which translations and recordings have gone stale and need redoing. Nothing is tracked by hand.</p>
  </div>
</section>`,

  team: `
<section class="sec" id="team">
  <div class="wrap">
    <div class="kicker">The team</div>
    <h2>Two roles are filled. <span style="color:#63CBE0">Three are needed.</span></h2>
    <div class="teamgrid">
      <div class="tcard"><div class="tico">${ic('search', 20)}</div><div class="tr">Technology coordinator</div>
        <div class="tw">Content pipeline, build, hosting and version tracking.</div><span class="tag t-have">filled</span></div>
      <div class="tcard"><div class="tico">${ic('clipboard-check', 20)}</div><div class="tr">Storying Specialist</div>
        <div class="tw">Crafting, review, and theology.</div><span class="tag t-have">filled</span></div>
      <div class="tcard needed"><div class="tico">${ic('palette', 20)}</div><div class="tr">Graphic designer</div>
        <div class="tw">Vector storyboards and a reusable symbol library. Drawn once, used by all forty languages.</div><span class="tag t-need">needed</span></div>
      <div class="tcard needed"><div class="tico">${ic('users', 20)}</div><div class="tr">Language coordinator</div>
        <div class="tw">Keeps forty parallel review tracks moving. The role that decides whether this works.</div><span class="tag t-need">needed</span></div>
      <div class="tcard needed wide"><div class="tico">${ic('headphones', 20)}</div>
        <div><div class="tr">40+ local language reviewers</div>
        <div class="tw">Native speakers who read the story and the questions in their own language and say where they are wrong, wooden, or say something the Bible does not.</div>
        <span class="tag t-need">needed</span></div></div>
    </div>
    <h3 class="wanted">Wanted as advisors or team members</h3>
    <div class="advgrid">
      ${[['storytelling', 'Storying practitioners'], ['movement', 'Movement practitioners'],
         ['ai', 'Technology professionals'], ['translation', 'Translation experts']]
        .map(([f, n]) => `<div class="acard"><img src="${AV(f)}" alt=""><div class="an">${n}</div></div>`).join('')}
    </div>
  </div>
</section>`,

  contact: `
<section class="sec" id="contact">
  <div class="wrap">
    <h2>Interested? Let's talk.</h2>
    <p>Whether you want to draw, coordinate a language, review stories in your own tongue, advise the plan, or reuse the content in your own work, there is a place for you here.</p>
    <div class="ctabtns">
      <a class="btn solid" href="mailto:brett@vmx.media?subject=storying.app">${ic('mail', 18, '#12657A')} brett@vmx.media</a>
      <a class="btn line" href="https://creationtochrist.app" target="_blank" rel="noopener">${ic('globe', 18, '#fff')} See it working</a>
    </div>
  </div>
</section>
${notesBlock}
<footer>
  <div class="wrap fbar">
    <div class="fm"><img src="${LOGOSQ}" alt=""><b>storying<span>.app</span></b></div>
    <div>An audio-based, mobile-first library of oral Bible stories in 40+ languages.</div>
    <div><a href="mailto:brett@vmx.media">brett@vmx.media</a></div>
  </div>
</footer>`,
};

const OG_URL = 'https://storying.app/';
const DESC = 'The Bible has been translated into every major language. 739 million people still cannot read it. storying.app is a free library of oral Bible stories in 40 languages.';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>storying.app &middot; Oral Bible stories in 40 languages</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#1C3144">
<link rel="canonical" href="${OG_URL}">
<link rel="icon" href="${LOGOSQ}">
<link rel="apple-touch-icon" href="${LOGOSQ}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="storying.app">
<meta property="og:url" content="${OG_URL}">
<meta property="og:title" content="storying.app &middot; Oral Bible stories in 40 languages">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="${OG_URL}share.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="storying.app: oral Bible stories in 40 languages">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="storying.app &middot; Oral Bible stories in 40 languages">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${OG_URL}share.png">
<style>${CSS}</style>
</head>
<body>
<header id="top">
  <div class="wrap bar">
    <a class="mk" href="#need">
      <img src="${LOGO}" alt="">
      <span class="mktext"><b>storying<span>.app</span></b><em>A library of oral Bible stories in 40 major languages</em></span>
    </a>
    <nav>${NAV.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>
    <a class="navcta" href="#contact">Get involved</a>
  </div>
</header>
<main>
${S.hero}
${S.where}
${S.venn}
${S.sets}
${S.langs}
${S.map40}
${S.every}
${S.sites}
${S.find}
${S.playlist}
${S.boards}
${S.process}
${S.free}
${S.stack}
${S.team}
${S.contact}
</main>
<script>
/* On narrow screens the ten-country map crops to the band that holds all ten,
   roughly Brazil across to China, so it fits the width without scrolling. */
(function(){
  var m=document.querySelector('.t10map');if(!m)return;
  var full='0 0 ${W.w} ${W.h}',crop='${W.crop10.join(' ')}';
  function fit(){m.setAttribute('viewBox',innerWidth<=900?crop:full)}
  fit();
  var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fit,120)},{passive:true});
})();
(function(){
  var links=[].slice.call(document.querySelectorAll('#top nav a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))}).filter(Boolean);
  if(!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      links.forEach(function(a){a.classList.toggle('cur',a.getAttribute('href')==='#'+e.target.id)});
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(function(s){io.observe(s)});
})();
</script>
</body></html>`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
// share.png is the Open Graph card. It is a committed asset rather than a build step so
// that a normal build needs no browser; regenerate it with `npm run shots` after changing
// the hero, which rewrites assets/share.png from the rendered page.
fs.copyFileSync('assets/share.png', 'dist/share.png');
console.log('site:', (html.length / 1024 / 1024).toFixed(2) + 'MB · sections:', (html.match(/<section/g) || []).length);
