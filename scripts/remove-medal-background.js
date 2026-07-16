/**
 * Removes the studio background (and its contact shadow) from the three PATS medal
 * photographs, producing transparent, trimmed, square PNGs.
 *
 *   public/awards/pats-medal-{gold,silver,bronze}.jpeg  ->  .../pats-medal-{...}.png
 *
 * Idempotent: reads the .jpeg sources, writes the .png outputs. Re-runnable.
 * Run: node scripts/remove-medal-background.js
 *
 * METHOD — border-seeded flood fill (a global luminance threshold does NOT work here):
 *   The silver medal is metallic grey on a light-grey background, and all three medals
 *   carry bright specular highlights whose colour is nearly identical to the backdrop
 *   (measured: silver highlights sit 4-6 units from the background colour). Any global
 *   threshold therefore punches holes through the medal. Instead we seed a queue with
 *   every border pixel and flood-fill inwards; interior highlights are unreachable
 *   because the fill cannot cross the medal's rim.
 *
 *   A candidate pixel joins the background iff ALL THREE gates pass:
 *     1. LOCAL step  - within LOCAL_TOL of the already-accepted neighbour it came from.
 *        This walks the smooth backdrop gradient (~1 unit/px) without a global
 *        assumption, and stops dead at the medal's edge (a 25-40 unit/px cliff).
 *     2. CHROMA      - at or below CHROMA_MAX. The backdrop and its shadow are neutral
 *        grey (chroma 0-13); the gold/bronze rims are strongly coloured (chroma 24-81)
 *        *while being brighter and closer to the backdrop colour than the shadow is*.
 *        Distance alone cannot separate those; chroma can. (Silver is neutral, so this
 *        gate never fires for it and gate 1 does the work.)
 *     3. GLOBAL clamp - within GLOBAL_CLAMP of the border-median backdrop colour. A pure
 *        sanity bound so a chain of small local steps can never creep into the medal.
 *
 *   The resulting binary mask is then eroded (to strip the JPEG-blended halo pixels) and
 *   blurred into a soft alpha ramp, so the edge does not read as a hard cut-out.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const AWARDS_DIR = path.join(ROOT, "public", "awards");
const MEDALS = ["gold", "silver", "bronze"];

// ---- Tunables -------------------------------------------------------------
// Max RGB step (euclidean) from an accepted neighbour to its candidate.
// This is the gate that protects the SILVER ribbon tab, and it is the tightest constraint
// in the script. Measured: the backdrop (incl. its gradient and shadow) steps 0-4/px; the
// tab's thin dark outline steps 16-21/px. The tab's *interior* is only 6-10 units from the
// backdrop colour and is neutral grey, so no colour gate can distinguish it — that outline
// is the only thing holding the fill out, and at 16 the fill broke through it and ate the
// whole tab. 8 sits clear of backdrop noise while staying well under the outline step.
const LOCAL_TOL = 8;
// Max chroma (max(r,g,b) - min(r,g,b)) for a pixel to count as neutral backdrop.
// Backdrop/shadow measured <= 13; gold rim >= 24; bronze rim >= 38.
const CHROMA_MAX = 18;
// Sanity bound: max RGB distance from the border-median backdrop colour. The backdrop
// gradient alone spans up to ~77, and the contact shadow reaches ~85, so this must sit
// above both while staying far below the medal body (>= 130).
const GLOBAL_CLAMP = 100;
// Pixels of mask erosion, to bite past the JPEG-blended edge pixels (halo removal).
const ERODE_PX = 2;
// Gaussian sigma used to feather the eroded mask into an alpha ramp.
const FEATHER_SIGMA = 0.8;
// Transparent margin around the trimmed medal, as a fraction of its longest side.
const MARGIN_RATIO = 0.04;
// Longest edge of the written PNG.
const MAX_DIM = 900;
// Fill coverage above this almost certainly means the fill leaked into the medal.
const LEAK_WARN_COVERAGE = 0.9;
// ---------------------------------------------------------------------------

const chromaOf = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b);

/** Median colour of the 1px image border — our reference backdrop colour. */
function borderMedian(data, w, h, ch) {
  const cols = [[], [], []];
  const push = (x, y) => {
    const i = (y * w + x) * ch;
    cols[0].push(data[i]);
    cols[1].push(data[i + 1]);
    cols[2].push(data[i + 2]);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  return cols.map((c) => c.sort((a, b) => a - b)[Math.floor(c.length / 2)]);
}

/**
 * Border-seeded flood fill. Returns a Uint8Array where 1 = background.
 * 4-connectivity: less prone to leaking through a single weak diagonal than 8.
 */
function floodFillBackground(data, w, h, ch, bg) {
  const isBg = new Uint8Array(w * h);
  const stack = [];

  const colourAt = (p) => {
    const i = p * ch;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // Gate 2 + 3: absolute admissibility, independent of where we arrived from.
  const admissible = (p) => {
    const [r, g, b] = colourAt(p);
    if (chromaOf(r, g, b) > CHROMA_MAX) return false;
    const d = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    return d <= GLOBAL_CLAMP;
  };

  const seed = (x, y) => {
    const p = y * w + x;
    if (!isBg[p] && admissible(p)) {
      isBg[p] = 1;
      stack.push(p);
    }
  };

  for (let x = 0; x < w; x++) {
    seed(x, 0);
    seed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    seed(0, y);
    seed(w - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    const [pr, pg, pb] = colourAt(p);
    const x = p % w;
    const y = (p - x) / w;

    const visit = (nx, ny) => {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
      const q = ny * w + nx;
      if (isBg[q]) return;
      const [qr, qg, qb] = colourAt(q);
      // Gate 1: local step against the accepted neighbour we came from.
      if (Math.hypot(qr - pr, qg - pg, qb - pb) > LOCAL_TOL) return;
      if (!admissible(q)) return;
      isBg[q] = 1;
      stack.push(q);
    };

    visit(x - 1, y);
    visit(x + 1, y);
    visit(x, y - 1);
    visit(x, y + 1);
  }

  return isBg;
}

/**
 * Keeps only the largest 8-connected island of the mask, zeroing the rest.
 * The medal is a single connected object; the specks this removes are dust/sensor spots
 * on the backdrop that survive the colour gates (the bronze plate has several). Left in,
 * they render as floating dots and drag the trim bbox far outside the medal.
 * Returns { mask, islands, removed }.
 */
function largestIsland(mask, w, h) {
  const label = new Int32Array(w * h).fill(-1);
  let best = -1;
  let bestSize = 0;
  let islands = 0;
  let removed = 0;

  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || label[start] !== -1) continue;
    const id = islands++;
    let size = 0;
    const stack = [start];
    label[start] = id;
    while (stack.length) {
      const p = stack.pop();
      size++;
      const x = p % w;
      const y = (p - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (mask[q] && label[q] === -1) {
            label[q] = id;
            stack.push(q);
          }
        }
      }
    }
    if (size > bestSize) {
      bestSize = size;
      best = id;
    }
  }

  const out = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    if (mask[p] && label[p] === best) out[p] = 255;
    else if (mask[p]) removed++;
  }
  return { mask: out, islands, removed };
}

/** Separable min-filter: shrinks the kept (medal) region by `radius` px. */
function erode(mask, w, h, radius) {
  if (radius <= 0) return mask;
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 255;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        m = Math.min(m, mask[y * w + nx]);
      }
      tmp[y * w + x] = m;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 255;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        m = Math.min(m, tmp[ny * w + x]);
      }
      out[y * w + x] = m;
    }
  }
  return out;
}

/** Bounding box of pixels whose alpha exceeds `threshold`. */
function alphaBBox(alpha, w, h, threshold) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("Mask is empty — every pixel was treated as background.");
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function processMedal(name) {
  const input = path.join(AWARDS_DIR, `pats-medal-${name}.jpeg`);
  const output = path.join(AWARDS_DIR, `pats-medal-${name}.png`);
  if (!fs.existsSync(input)) throw new Error(`Missing source image: ${input}`);

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  const bg = borderMedian(data, w, h, ch);
  const isBg = floodFillBackground(data, w, h, ch, bg);

  // Sanity: the medal must not touch the frame, or a border-seeded fill is invalid.
  let borderTotal = 0;
  let borderFilled = 0;
  const checkBorder = (x, y) => {
    borderTotal++;
    if (isBg[y * w + x]) borderFilled++;
  };
  for (let x = 0; x < w; x++) {
    checkBorder(x, 0);
    checkBorder(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    checkBorder(0, y);
    checkBorder(w - 1, y);
  }

  let filled = 0;
  for (let i = 0; i < isBg.length; i++) filled += isBg[i];
  const coverage = filled / (w * h);

  // Binary keep-mask (255 = medal), reduced to the single medal island...
  const rawKeep = new Uint8Array(w * h);
  for (let i = 0; i < isBg.length; i++) rawKeep[i] = isBg[i] ? 0 : 255;
  const { mask: keep, islands, removed } = largestIsland(rawKeep, w, h);

  // ...eroded to strip the JPEG-blended halo pixels...
  const eroded = erode(keep, w, h, ERODE_PX);

  // ...then blurred into a soft alpha ramp so the edge is not a hard 0/255 cut.
  // NOTE: sharp promotes a 1-channel raw input to 3 channels through .blur(), so read
  // the result back with an explicit stride rather than assuming it stayed single-channel.
  const { data: blurData, info: blurInfo } = await sharp(Buffer.from(eroded), {
    raw: { width: w, height: h, channels: 1 },
  })
    .blur(FEATHER_SIGMA)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stride = blurInfo.channels;

  const alpha = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) alpha[p] = blurData[p * stride];

  const rgba = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const s = p * ch;
    rgba[p * 4] = data[s];
    rgba[p * 4 + 1] = data[s + 1];
    rgba[p * 4 + 2] = data[s + 2];
    rgba[p * 4 + 3] = alpha[p];
  }

  // Trim transparent margins, then re-centre on a square canvas with a uniform margin
  // so all three medals render at a consistent size in a card.
  const box = alphaBBox(alpha, w, h, 8);
  const side = Math.max(box.width, box.height);
  const margin = Math.round(side * MARGIN_RATIO);
  const canvas = side + margin * 2;

  const left = Math.round((canvas - box.width) / 2);
  const top = Math.round((canvas - box.height) / 2);

  let pipeline = sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract(box)
    .extend({
      left,
      top,
      right: canvas - box.width - left,
      bottom: canvas - box.height - top,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

  if (canvas > MAX_DIM) {
    pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: "inside" });
  }

  await pipeline.png({ compressionLevel: 9 }).toFile(output);

  const meta = await sharp(output).metadata();
  const kb = (fs.statSync(output).size / 1024).toFixed(0);

  console.log(
    `${name.padEnd(6)} bg=${String(bg.join(",")).padEnd(11)} ` +
      `border filled ${borderFilled}/${borderTotal} ` +
      `fill ${(coverage * 100).toFixed(1)}%  ` +
      `islands ${islands} (${removed}px dropped)  ` +
      `trim ${box.width}x${box.height} -> ${meta.width}x${meta.height}  ${kb}KB`
  );

  if (borderFilled !== borderTotal) {
    console.warn(`  ! ${name}: ${borderTotal - borderFilled} border px were NOT background — medal may touch the frame.`);
  }
  if (coverage > LEAK_WARN_COVERAGE) {
    console.warn(`  ! ${name}: fill coverage ${(coverage * 100).toFixed(1)}% — the fill likely leaked into the medal.`);
  }
}

async function main() {
  console.log(
    `Tunables: LOCAL_TOL=${LOCAL_TOL} CHROMA_MAX=${CHROMA_MAX} GLOBAL_CLAMP=${GLOBAL_CLAMP} ` +
      `ERODE_PX=${ERODE_PX} FEATHER_SIGMA=${FEATHER_SIGMA}\n`
  );
  for (const name of MEDALS) await processMedal(name);
  console.log("\nDone — transparent PNGs written to public/awards/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
