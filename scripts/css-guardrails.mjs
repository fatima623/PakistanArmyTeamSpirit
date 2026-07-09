// CSS guardrails — enforces the styling freeze from REMEDIATION-PLAN.md.
//
// Rules (checked against scripts/css-guardrails-baseline.json):
//   1. No NEW .css files anywhere under src/ (baseline list may only shrink).
//   2. Total `!important` count may not increase (ratchet: only down).
//   3. No NEW `import "*.css"` statements in .ts/.tsx (baseline pairs only).
//   4. Raw hex-color literal count in .tsx may not increase (ratchet).
//
// Usage:
//   node scripts/css-guardrails.mjs                    # check (exit 1 on violation)
//   node scripts/css-guardrails.mjs --update-baseline  # re-snapshot after a cleanup
//
// The baseline is committed. After deleting CSS or removing !important, run
// --update-baseline and commit the shrunken baseline so the ratchet locks in.

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts", "css-guardrails-baseline.json");
const UPDATE = process.argv.includes("--update-baseline");

function walk(dir, exts, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, exts, out);
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(rel.replace(/\\/g, "/"));
  }
  return out;
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// ---- snapshot current state -------------------------------------------------

const cssFiles = walk("src", [".css"]).sort();

let importantCount = 0;
const importantByFile = {};
for (const f of cssFiles) {
  const n = (read(f).match(/!important/g) ?? []).length;
  importantByFile[f] = n;
  importantCount += n;
}

const tsFiles = walk("src", [".ts", ".tsx"]);
const cssImports = [];
const importRe = /(?:import\s+|from\s+)["']([^"']+\.css)["']/g;
for (const f of tsFiles) {
  const content = read(f);
  let m;
  while ((m = importRe.exec(content)) !== null) {
    cssImports.push(`${f} -> ${m[1]}`);
  }
}
cssImports.sort();

let hexInTsx = 0;
const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
for (const f of tsFiles.filter((f) => f.endsWith(".tsx"))) {
  hexInTsx += (read(f).match(hexRe) ?? []).length;
}

// legacy color namespaces were removed in Phase 1 — any utility usage is a regression
const legacyRe =
  /(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|shadow|placeholder|decoration)-(?:army|tactical|portal|cp)-[a-z-]+/g;
const legacyHits = [];
for (const f of tsFiles) {
  const m = read(f).match(legacyRe);
  if (m) legacyHits.push(`${f}: ${[...new Set(m)].join(", ")}`);
}

// tailwind.config.ts must not re-accumulate raw hex colors (tokens live in globals.css)
const hexInTailwindConfig = (read("tailwind.config.ts").match(hexRe) ?? []).length;

const snapshot = {
  cssFiles,
  importantCount,
  importantByFile,
  cssImports,
  hexInTsx,
  hexInTailwindConfig,
};

// ---- update mode ------------------------------------------------------------

if (UPDATE) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(snapshot, null, 2) + "\n");
  console.log("Baseline updated:");
  console.log(`  css files      : ${cssFiles.length}`);
  console.log(`  !important     : ${importantCount}`);
  console.log(`  css imports    : ${cssImports.length}`);
  console.log(`  hex in tsx     : ${hexInTsx}`);
  process.exit(0);
}

// ---- check mode -------------------------------------------------------------

if (!fs.existsSync(BASELINE_PATH)) {
  console.error("No baseline found. Run: node scripts/css-guardrails.mjs --update-baseline");
  process.exit(1);
}
const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
const failures = [];

// 1. no new css files
const knownCss = new Set(baseline.cssFiles);
const newCss = cssFiles.filter((f) => !knownCss.has(f));
if (newCss.length > 0) {
  failures.push(
    `NEW CSS FILE(S) — the styling freeze bans new stylesheets. Use Tailwind utilities + tokens instead:\n` +
      newCss.map((f) => `    ${f}`).join("\n")
  );
}

// 2. !important ratchet
if (importantCount > baseline.importantCount) {
  const grew = Object.entries(importantByFile)
    .filter(([f, n]) => n > (baseline.importantByFile[f] ?? 0))
    .map(([f, n]) => `    ${f}: ${baseline.importantByFile[f] ?? 0} -> ${n}`);
  failures.push(
    `!important COUNT INCREASED (${baseline.importantCount} -> ${importantCount}). ` +
      `Fix the cascade instead of overriding it:\n` + grew.join("\n")
  );
}

// 3. no new css imports in ts/tsx
const knownImports = new Set(baseline.cssImports);
const newImports = cssImports.filter((i) => !knownImports.has(i));
if (newImports.length > 0) {
  failures.push(
    `NEW CSS IMPORT(S) in ts/tsx — only globals.css should ever be imported. Use Tailwind classes:\n` +
      newImports.map((i) => `    ${i}`).join("\n")
  );
}

// 4. hex-in-tsx ratchet
if (hexInTsx > baseline.hexInTsx) {
  failures.push(
    `RAW HEX COLORS IN TSX INCREASED (${baseline.hexInTsx} -> ${hexInTsx}). ` +
      `Colors must come from design tokens (tailwind.config.ts / CSS vars).`
  );
}

// 5. dead namespaces stay dead (removed in Phase 1)
if (legacyHits.length > 0) {
  failures.push(
    `LEGACY COLOR NAMESPACE USED (army-/tactical-/portal-/cp-) — these were ` +
      `deleted in Phase 1. Use brand-* or the semantic tokens instead:\n` +
      legacyHits.map((h) => `    ${h}`).join("\n")
  );
}

// 6. tailwind.config.ts hex ratchet
if (hexInTailwindConfig > (baseline.hexInTailwindConfig ?? Infinity)) {
  failures.push(
    `RAW HEX IN tailwind.config.ts INCREASED (${baseline.hexInTailwindConfig} -> ` +
      `${hexInTailwindConfig}). Add tokens to the --brand-* scale in globals.css instead.`
  );
}

if (failures.length > 0) {
  console.error("CSS guardrails FAILED (see REMEDIATION-PLAN.md):\n");
  for (const f of failures) console.error("  " + f + "\n");
  console.error(
    "If you intentionally REDUCED css/!important/hex, lock in the win with:\n" +
      "  node scripts/css-guardrails.mjs --update-baseline\n"
  );
  process.exit(1);
}

console.log(
  `CSS guardrails OK (css files: ${cssFiles.length}/${baseline.cssFiles.length}, ` +
    `!important: ${importantCount}/${baseline.importantCount}, ` +
    `css imports: ${cssImports.length}/${baseline.cssImports.length}, ` +
    `hex in tsx: ${hexInTsx}/${baseline.hexInTsx})`
);

// Nudge to ratchet down when things improved.
if (
  importantCount < baseline.importantCount ||
  cssFiles.length < baseline.cssFiles.length ||
  hexInTsx < baseline.hexInTsx
) {
  console.log(
    "Improvement detected — run `node scripts/css-guardrails.mjs --update-baseline` to lock it in."
  );
}
