/**
 * One-time split of MEDIA PATS/Awards.png into four public/awards/*.png files.
 * Run: node scripts/split-awards.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function splitAwards() {
  const root = process.cwd();
  const inputPath = path.join(root, "MEDIA PATS", "Awards.png");
  const outDir = path.join(root, "public", "awards");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Awards.png not found at: ${inputPath}`);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const metadata = await sharp(inputPath).metadata();
  const halfW = Math.floor(metadata.width / 2);
  const halfH = Math.floor(metadata.height / 2);

  console.log(`Source: ${metadata.width}x${metadata.height} → quadrants ${halfW}x${halfH}`);

  const crops = [
    { name: "gold", left: 0, top: 0 },
    { name: "silver", left: halfW, top: 0 },
    { name: "bronze", left: 0, top: halfH },
    { name: "certificate", left: halfW, top: halfH },
  ];

  for (const crop of crops) {
    const outPath = path.join(outDir, `${crop.name}.png`);
    await sharp(inputPath)
      .extract({ left: crop.left, top: crop.top, width: halfW, height: halfH })
      .png()
      .toFile(outPath);
    console.log(`Wrote ${outPath}`);
  }

  console.log("Done! 4 images saved to public/awards/");
}

splitAwards().catch((err) => {
  console.error(err);
  process.exit(1);
});
