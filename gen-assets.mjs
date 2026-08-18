import fs from 'fs';
import * as topojson from 'topojson-client';
import { geoMercator, geoPath, geoEquirectangular } from 'd3-geo';

const langs = JSON.parse(fs.readFileSync('data/languages.json', 'utf8'));
const world = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const fcAll = topojson.feature(world, world.objects.countries);
const fc = { type: 'FeatureCollection', features: fcAll.features.filter(f => +f.id !== 10) };
const byNum = new Map(fcAll.features.map(f => [String(f.id).padStart(3, '0'), f]));
const r1 = s => s.replace(/\d+\.\d+/g, m => (+m).toFixed(1));

/* ---- per-cell country silhouettes (grid slide) ---- */
const CW = 200, CH = 150, PAD = 14;
// Countries whose overseas or antimeridian-crossing parts blow up the bounding box.
// Keep only the largest polygon so the mainland fills the tile.
const MAINLAND_ONLY = new Set(['840', '250', '643']);
// Russia's mainland ring crosses the antimeridian, so its raw bbox spans the whole globe.
// Rotate the projection to centre it, then fit equirectangular (Mercator would stretch it vertically).
const TILE_ROTATE = { '643': -100 }; // USA (drop Alaska/Hawaii), France (drop Guiana), Russia (drop Chukotka)
function mainland(f) {
  if (f.geometry.type !== 'MultiPolygon') return f;
  const ringArea = r => Math.abs(r.reduce((a, p, i, arr) => {
    const q = arr[(i + 1) % arr.length]; return a + (p[0] * q[1] - q[0] * p[1]);
  }, 0) / 2);
  let best = null, bestA = -1;
  for (const poly of f.geometry.coordinates) {
    const a = ringArea(poly[0]);
    if (a > bestA) { bestA = a; best = poly; }
  }
  return { ...f, geometry: { type: 'Polygon', coordinates: best } };
}
const cell = {};
for (const l of langs) if (!cell[l.num]) {
  const f = MAINLAND_ONLY.has(l.num) ? mainland(byNum.get(l.num)) : byNum.get(l.num);
  const rot = TILE_ROTATE[l.num];
  const tp = rot !== undefined ? geoEquirectangular().rotate([rot, 0]) : geoMercator();
  cell[l.num] = r1(geoPath(tp.fitExtent([[PAD, PAD], [CW - PAD, CH - PAD]], f))(f));
}
fs.writeFileSync('data/a-cellpaths.json', JSON.stringify(cell));

/* ---- world map, equirectangular ---- */
const WW = 1600, WH = 700;
const proj = geoEquirectangular().fitExtent([[0, 6], [WW, WH - 6]], fc);
const path = geoPath(proj);
const out = {
  w: WW, h: WH,
  world: r1(path(fc)),
  pts: Object.fromEntries(langs.map(l => [l.iso, proj([l.lon, l.lat]).map(v => +v.toFixed(1))])),
  rings: {
    fraW: proj([-6, 15.5]).map(v => +v.toFixed(1)),
    fraC: proj([19, 1]).map(v => +v.toFixed(1)),
    fraLab: proj([0, -4]).map(v => +v.toFixed(1)),
    nkorea: proj([127, 40.4]).map(v => +v.toFixed(1)),
  },
};

/* ---- top-10 countries by illiterate adult population (UNESCO 2015-2024 decade) ---- */
const TOP10 = [
  ['India', '356', 191], ['Pakistan', '586', 59], ['Nigeria', '566', 43], ['China', '156', 38],
  ['Ethiopia', '231', 30], ['Bangladesh', '050', 25], ['Egypt', '818', 19], ['Afghanistan', '004', 14],
  ['Brazil', '076', 11], ['DR Congo', '180', 11],
];
out.top10 = TOP10.map(([name, num, m]) => {
  const f = byNum.get(num);
  const c = path.centroid(f);
  return { name, m, d: r1(path(f)), cx: +c[0].toFixed(1), cy: +c[1].toFixed(1) };
});
// Tight crop around the ten countries (roughly Brazil to China) for narrow screens.
{
  const bs = TOP10.map(([, num]) => path.bounds(byNum.get(num)));
  const x0 = Math.min(...bs.map(b => b[0][0])), x1 = Math.max(...bs.map(b => b[1][0]));
  const y0 = Math.min(...bs.map(b => b[0][1])), y1 = Math.max(...bs.map(b => b[1][1]));
  const px = 14, py = 12;
  out.crop10 = [x0 - px, y0 - py, (x1 - x0) + px * 2, (y1 - y0) + py * 2].map(v => +v.toFixed(1));
  console.log('crop10 viewBox:', out.crop10.join(' '), '· aspect', ((x1 - x0) / (y1 - y0)).toFixed(2));
}
const missing = out.top10.filter(t => !t.d);
if (missing.length) console.log('MISSING top10 shapes:', missing.map(t => t.name));
console.log('top10 total illiterate adults (M):', TOP10.reduce((a, b) => a + b[2], 0));
fs.writeFileSync('data/a-world.json', JSON.stringify(out));
console.log('assets written · langs', langs.length, '· cellpaths', Object.keys(cell).length);
