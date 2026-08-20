# storying.app pitch page

A single-page pitch site for **storying.app**, a planned library of oral Bible stories in
40 major languages. Audience: potential contributors (graphic designers, language
coordinators, native-speaker reviewers) and advisors.

## How this builds

`node build-site.mjs` reads the data and assets and writes **one self-contained file**,
`dist/index.html`, with every image base64-inlined. There is no bundler, no framework and
no external request at runtime. It also copies `assets/og_image.png` (the Open Graph /
Twitter card, a hand-designed asset, not a screenshot) to `dist/`.

```
npm install
npm run build      # -> dist/index.html + dist/og_image.png
npm run serve      # preview at localhost:3000
```

`dist/` is the Cloudflare Pages output directory. It is gitignored; Pages builds it.

## Where things live

| Path | What it is |
|---|---|
| `build-site.mjs` | The whole page. Content, CSS and markup all live here. **Edit this, never `dist/index.html`.** |
| `data/languages.json` | The 40 languages: name, native speakers, country, ISO code, `w1040` (10/40 Window), `sr` (StoryRunners covers it) |
| `data/a-world.json` | Pre-projected world map paths, per-language map points, top-10 country shapes, `crop10` viewBox. Generated. |
| `data/a-cellpaths.json` | Per-country silhouette paths fitted to a 200x150 tile, for the language grid. Generated. |
| `gen-assets.mjs` | Regenerates the two generated files above from `world-atlas`. Only needed if the language list or map framing changes. |
| `shoot-site.mjs` | Screenshots the page at 1440 / 834 / 390 px into `site-shots/` and reports any horizontal overflow. |
| `assets/` | Logos, story images, storyboard, hero shot, Lucide icons, the OG card |

## Editing rules

**Never hand-edit `dist/index.html`.** It is generated and 4 MB of base64. Every change
goes in `build-site.mjs` and is rebuilt.

Inside `build-site.mjs` the structure is:

1. Asset loaders and helpers (`b64`, `ic` for icons, `fmt` / `fmtWord` for populations)
2. Derived data: Venn geometry, language grid cells, map dots, story sets, process steps
3. `NOTES` and the footnote helpers
4. `CSS` — one template string, commented by section
5. `S` — an object of section HTML strings, one key per page section
6. The final `html` template that assembles head, nav, sections, footer

To change a section's copy, find its key in `S`. To change its styling, find the matching
`/* ---- name ---- */` block in `CSS`.

## House rules, which the owner cares about

- **No em dashes or en dashes anywhere.** Use commas, colons or full stops.
- **No mention of MobilizeGO or e3 Partners.** This is deliberately an unbranded project.
- **No personal names** except the contact address, brett@vmx.media.
- Palette: navy `#1C3144`, teal `#1A9DB8`, lavender `#8681B7`, pink `#B23F72`, sand
  `#D7CEB2`. Lightened tints (`#63CBE0`, `#B0ACD9`, `#E8799F`, `#E6E0CB`) are for **text on
  navy only** — pink on navy is about 1.7:1 and fails contrast. StoryRunners orange is
  `#F04420`; small orange text uses `#C4350F` for contrast.

## Numbers that must stay consistent

Changing one of these usually means changing several. They are cross-checked:

- 15 shared + 25 ours-only = **40** languages; 83 theirs-only + 15 shared = **98** StoryRunners languages
- 2.6B shared + 2.15B ours-only = **4.75B**, which is also the sum of `native` across `languages.json`
- 32 languages with `w1040: true` + 8 trade languages = 40
- Priorities 23 + 49 + 111 = **183** stories; 183 x 40 = **7,320** translations
- The ten-country list sums to **441M**
- Sources for all figures are in the `NOTES` array, rendered as the "Notes and sources"
  section. If you change a figure, check its note.

## Responsive behaviour worth knowing before you touch it

The page has to work on a phone; that was the whole reason it exists rather than a slide
deck. Nothing may scroll horizontally.

- The ten-country map swaps its `viewBox` to `crop10` below 900px and hides its leader
  labels in favour of `.t10list`. That swap is done by a small script at the end of the page.
- The forty-languages map hides its three ring labels below 900px and explains them in the
  legend instead.
- The process snake (an SVG path behind a 4x3 grid) is replaced below 1000px by a stack
  with step numbers in the left gutter.
- After any layout change run `npm run shots` and check it reports `OVERFLOW: none` at all
  three widths.

## Deploying

Cloudflare Pages, connected to this repo. Build command `npm run build`, output directory
`dist`. Pushing to the default branch deploys. See `DEPLOY.md`.
