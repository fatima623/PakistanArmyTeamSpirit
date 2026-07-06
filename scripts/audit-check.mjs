import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const patterns = [
  "pakistan",
  "army",
  "military",
  "pats",
  "jla",
  "ispr",
  "ghq",
  "coas",
];

const scanPaths = [
  "src/app/api",
  "src/lib/compliance",
  "src/lib/auth.ts",
  "src/lib/constants.ts",
  "src/middleware.ts",
  "prisma/schema.prisma",
];

const excludePatterns = [
  "army-content",
  "army-design",
  "pats-content",
  "pats-public",
  "branding",
  "contingents",
  "compliance/display",
];

function shouldExclude(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/").toLowerCase();
  return excludePatterns.some((pattern) => normalized.includes(pattern.toLowerCase()));
}

function walkFiles(targetPath) {
  const absolutePath = path.join(ROOT, targetPath);
  if (!fs.existsSync(absolutePath)) return [];

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [absolutePath];

  const files = [];
  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    const childPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      files.push(...walkFiles(path.relative(ROOT, childPath)));
      continue;
    }
    if (entry.isFile()) files.push(childPath);
  }
  return files;
}

function collectHits(filePath) {
  const relativePath = path.relative(ROOT, filePath);
  if (shouldExclude(relativePath)) return [];

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const hits = [];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        hits.push({ pattern, file: relativePath, lineNumber: index + 1 });
      }
    }
  });

  return hits;
}

console.log("Audit scan (logic layers)...");

const allHits = [];
for (const scanPath of scanPaths) {
  const files = walkFiles(scanPath);
  for (const file of files) {
    allHits.push(...collectHits(file));
  }
}

if (allHits.length > 0) {
  const grouped = new Map();
  for (const hit of allHits) {
    if (!grouped.has(hit.pattern)) grouped.set(hit.pattern, []);
    grouped.get(hit.pattern).push(hit);
  }

  for (const [pattern, hits] of grouped.entries()) {
    console.log(`Pattern '${pattern}' found:`);
    for (const hit of hits.slice(0, 5)) {
      console.log(`  ${hit.file}:${hit.lineNumber}`);
    }
  }
  console.log("\nReview hits - public marketing folders may be excluded by policy.");
  process.exit(1);
}

console.log("\nNo forbidden terms in core logic paths.");
