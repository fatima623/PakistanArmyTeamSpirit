/**
 * Medal-only display crops (removes baked-in score labels at bottom).
 * Run: node scripts/crop-award-display.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "awards");

const JOBS = [
  {
    name: "gold-display",
    input: path.join(ROOT, "MEDIA PATS", "Gold medal.png"),
    bottomTrim: 0.19,
  },
  {
    name: "silver-display",
    input: path.join(ROOT, "MEDIA PATS", "Silver medal.png"),
    bottomTrim: 0.19,
  },
  {
    name: "bronze-display",
    input: path.join(ROOT, "public", "awards", "bronze.png"),
    bottomTrim: 0.21,
  },
  {
    name: "certificate-display",
    input: path.join(ROOT, "public", "awards", "certificate.png"),
    bottomTrim: 0.21,
  },
];

async function cropDisplayImages() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const job of JOBS) {
    if (!fs.existsSync(job.input)) {
      throw new Error(`Missing source image: ${job.input}`);
    }

    const meta = await sharp(job.input).metadata();
    const cropHeight = Math.floor(meta.height * (1 - job.bottomTrim));
    const outPath = path.join(OUT_DIR, `${job.name}.png`);

    await sharp(job.input)
      .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
      .png()
      .toFile(outPath);

    console.log(`${job.name}: ${meta.width}x${meta.height} → ${meta.width}x${cropHeight}`);
  }

  console.log("Display crops saved to public/awards/*-display.png");
}

cropDisplayImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
