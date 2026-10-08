/* Builds everything the story pages need that lives outside this repo, and writes it inside it:

     data/story-text.json          crafted English text per story, for search (crafted stories only)
     assets/story-data/{slug}.json one small file per story: Bible text, crafted text, audio, storyboard
     assets/story-audio/{slug}.mp3 English audio, copied
     assets/story-boards/{slug}.webp storyboards, converted from the PNGs

   Run it locally and commit the output. The sources are two levels up and OUTSIDE this repo
   (`storying-content/` and `C2C Stories - Original/`), and Cloudflare only ever checks out this
   repo, so the built site must never read them directly. Same arrangement as data/stories.json.

     npm run story-data

   Where each piece comes from:
     Bible text   storying-content/stories/{slug}/source/bsb.md   fetched by that repo's
                  scripts/fetch-all-sources.mjs, so every story has it (Berean Standard Bible,
                  public domain)
     Crafted text storying-content/stories/{slug}/text/eng.md     used only when its status is
                  reviewed or locked; an unreviewed draft is never shown
     Audio, storyboard  the file names in that folder's meta.yml `legacy:` block, read from
                  `C2C Stories - Original/` until the content port moves the media

   A story is "crafted" when it has reviewed or locked English text. That drives the Crafted
   column in the list view, which is the checklist for the whole library.

   Every output folder is cleared and rewritten on each run, so a renamed slug never leaves a
   stale file behind. */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const LIB = '../..';
const CONTENT = `${LIB}/storying-content/stories`;
const C2C = `${LIB}/C2C Stories - Original`;
const SHOWN = new Set(['reviewed', 'locked']);

const stories = JSON.parse(fs.readFileSync('data/stories.json', 'utf8')).stories;
const seen = new Set();
for (const s of stories) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug || '')) throw new Error(`${s.id} has no usable slug`);
  if (seen.has(s.slug)) throw new Error(`slug used twice: ${s.slug}`);
  seen.add(s.slug);
}

for (const dir of ['assets/story-data', 'assets/story-audio', 'assets/story-boards']) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

/* bsb.md: frontmatter, then blank-line-separated blocks. "## Heading" starts a passage;
   "N. text" is a verse, "C:N. text" a verse in a passage that crosses chapters. */
function parseBsb(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
  const sections = [];
  for (const block of raw.trim().split(/\n\s*\n/)) {
    if (block.startsWith('## ')) { sections.push({ h: block.slice(3).trim(), v: [] }); continue; }
    const m = block.match(/^(?:(\d+):)?(\d+)\.\s([\s\S]*)$/);
    if (!m) throw new Error(`unreadable block in ${file}: ${block.slice(0, 50)}`);
    if (!sections.length) sections.push({ h: null, v: [] });
    sections.at(-1).v.push([m[1] ? +m[1] : null, +m[2], m[3].trim()]);
  }
  return sections;
}

const yamlValue = (meta, key) => (meta.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\n]+?)"?\\s*$`, 'm')) || [])[1] || null;

const search = {};
let bsbVerses = 0, crafted = 0, audio = 0, boards = 0;
for (const s of stories) {
  const dir = `${CONTENT}/${s.slug}`;
  const bsbFile = `${dir}/source/bsb.md`;
  if (!fs.existsSync(bsbFile)) throw new Error(`no Bible text for ${s.slug}; run storying-content/scripts/fetch-all-sources.mjs`);
  const sections = parseBsb(bsbFile);
  bsbVerses += sections.reduce((n, x) => n + x.v.length, 0);
  const out = { bsb: sections, text: null, audio: null, board: null };

  const textFile = `${dir}/text/eng.md`;
  if (fs.existsSync(textFile)) {
    const raw = fs.readFileSync(textFile, 'utf8');
    const fm = (raw.match(/^---\n([\s\S]*?)\n---\n/) || [])[1] || '';
    const status = (fm.match(/^status:\s*(\S+)/m) || [])[1];
    if (SHOWN.has(status)) {
      const paras = raw.replace(/^---[\s\S]*?\n---\n/, '').trim().split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
      if (!paras.length) throw new Error(`empty story text: ${textFile}`);
      out.text = { status, paras };
      search[s.slug] = paras.join(' ');
      crafted++;
      const meta = fs.readFileSync(`${dir}/meta.yml`, 'utf8');
      const mp3 = yamlValue(meta, 'audio_eng'), dur = yamlValue(meta, 'audio_eng_duration'), png = yamlValue(meta, 'storyboard_raster');
      if (mp3 && fs.existsSync(`${C2C}/Audio/${mp3}`)) {
        fs.copyFileSync(`${C2C}/Audio/${mp3}`, `assets/story-audio/${s.slug}.mp3`);
        out.audio = { src: `story-audio/${s.slug}.mp3`, dur };
        audio++;
      }
      if (png && fs.existsSync(`${C2C}/Storyboards/${png}`)) {
        execFileSync('cwebp', ['-quiet', '-q', '88', '-m', '6', `${C2C}/Storyboards/${png}`, '-o', `assets/story-boards/${s.slug}.webp`]);
        out.board = { src: `story-boards/${s.slug}.webp` };
        boards++;
      }
    }
  }
  fs.writeFileSync(`assets/story-data/${s.slug}.json`, JSON.stringify(out));
}

fs.writeFileSync('data/story-text.json', JSON.stringify(search, null, 1) + '\n');
const kb = d => Math.round(fs.readdirSync(d).reduce((n, f) => n + fs.statSync(path.join(d, f)).size, 0) / 1024);
console.log(`story data: ${stories.length} stories · ${bsbVerses} Bible verses · ${crafted} crafted · ${audio} audio · ${boards} storyboards`);
console.log(`  story-data ${kb('assets/story-data')}KB · story-audio ${kb('assets/story-audio')}KB · story-boards ${kb('assets/story-boards')}KB`);
