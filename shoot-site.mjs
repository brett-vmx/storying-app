import { chromium } from 'playwright';
import fs from 'fs';


const URL = 'file://' + process.cwd() + '/dist/index.html';
const WIDTHS = [[1440, 'desktop'], [834, 'tablet'], [390, 'phone']];

fs.mkdirSync('site-shots', { recursive: true });
const b = await chromium.launch();

for (const [w, name] of WIDTHS) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForTimeout(300);
  // Images now load lazily as the page scrolls. A real visitor scrolling down triggers
  // them fine, but Playwright's fullPage screenshot does not reliably do the same, so
  // scroll through by hand first or the capture below shows blank boxes that aren't real.
  const fullH = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < fullH; y += 700) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(120);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const overflow = await p.evaluate(() => {
    const de = document.documentElement;
    const bad = [];
    document.querySelectorAll('section, .wrap, .lgrid, .pgrid, .teamgrid, .stack, .pris, .bignums, .threecard, .feats, .webgrid, .fsgrid, .plgrid, .sbgrid, .venngrid, .vennrow, .proof, .unlist').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 1 || r.left < -1) bad.push((el.tagName + '.' + el.className).slice(0, 60) + ' L' + Math.round(r.left) + ' R' + Math.round(r.right));
    });
    return { docW: de.scrollWidth, clientW: de.clientWidth, h: de.scrollHeight, bad: bad.slice(0, 12) };
  });
  console.log(name, w, '· scrollW', overflow.docW, '/ clientW', overflow.clientW, '· height', overflow.h);
  if (overflow.bad.length) console.log('   OVERFLOW:', overflow.bad.join(' | '));
  await p.screenshot({ path: `site-shots/${name}.png`, fullPage: true });
  await p.close();
}

// The OG/Twitter card is now the hand-designed assets/og_image.png, not an auto-cropped
// hero screenshot, so it is no longer regenerated here.

await b.close();
