/* Pulls the 13 live creationtochrist.app English texts into data/story-text.json so the
   /stories page can search story bodies, not just titles and references.

   Run locally, commit the JSON. The source markdown lives in `C2C Stories - Original/`,
   two levels up and OUTSIDE this repo, so the built site must never read it directly:
   Cloudflare only ever checks out this repo. Same arrangement as data/stories.json.

     npm run story-text

   These 13 are the only stories with any English text written. Everything else in the
   library is still `status: not-started`, so the search-context row simply will not fire
   for them until there is text to match. */
import fs from 'fs';

const SRC = '../../C2C Stories - Original/Content';

/* "Book|Title" in data/stories.json -> the markdown file holding that story's text.
   Keyed the same way as STORY_IMG in build-stories.mjs, and for the same reason: the
   spreadsheet's row ids move, the book and title do not. */
const MAP = {
  'Genesis|Creation': 'creation-of-the-physical-world.md',
  'Genesis|The First Sin': 'the-man-and-woman-sin.md',
  'Matthew|Birth of Jesus': 'the-birth-of-jesus.md',
  'Luke|The Paralyzed Man': 'the-paralytic-man.md',
  'Mark|Jesus Calms the Storm': 'jesus-calms-the-storm.md',
  'Mark|The Demoniac': 'the-man-with-many-demons.md',
  "Mark|Jairus' Daughter and the Bleeding Woman": 'jairus-daughter-and-the-bleeding-woman.md',
  'Mark|Feeding the 5,000': 'jesus-feeds-5000.md',
  'John|The Samaritan Woman': 'the-woman-at-the-well.md',
  'John|Man Born Blind': 'the-blind-man.md',
  'Luke|Zacchaeus': 'zacchaeus.md',
  'Matthew|The Death of Jesus': 'the-death-of-jesus.md',
  'Matthew|The Resurrection': 'the-resurrection.md',
};

const known = new Set(JSON.parse(fs.readFileSync('data/stories.json', 'utf8'))
  .stories.map(s => s.b + '|' + s.t));

const out = {};
for (const [key, file] of Object.entries(MAP)) {
  if (!known.has(key)) throw new Error('story text key matches no story: ' + key);
  const raw = fs.readFileSync(`${SRC}/${file}`, 'utf8');
  /* Drop the YAML frontmatter; keep the body as one whitespace-normalised string. */
  const body = raw.replace(/^---[\s\S]*?\n---\n/, '').replace(/\s+/g, ' ').trim();
  if (!body) throw new Error('empty story text: ' + file);
  out[key] = body;
}

fs.writeFileSync('data/story-text.json', JSON.stringify(out, null, 1) + '\n');
const chars = Object.values(out).reduce((a, b) => a + b.length, 0);
console.log(`story text: ${Object.keys(out).length} stories · ${Math.round(chars / 1024)}KB`);
