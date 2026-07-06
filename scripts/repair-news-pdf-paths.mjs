/**
 * One-time repair: normalize news pdfPath values and copy a local PDF if present.
 * Run: node scripts/repair-news-pdf-paths.mjs
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const prisma = new PrismaClient();
const storageRoot = path.join(ROOT, "storage", "news-pdfs");

fs.mkdirSync(storageRoot, { recursive: true });

const posts = await prisma.newsPost.findMany({
  select: { id: true, title: true, pdfPath: true },
});

for (const post of posts) {
  if (!post.pdfPath) continue;

  const targetRelative = `${post.id}.pdf`;
  const targetAbsolute = path.join(storageRoot, targetRelative);
  let repaired = false;

  if (!fs.existsSync(targetAbsolute) || fs.statSync(targetAbsolute).size < 1024) {
    const legacyAbsolute = path.isAbsolute(post.pdfPath)
      ? post.pdfPath
      : path.join(storageRoot, path.basename(post.pdfPath));
    if (fs.existsSync(legacyAbsolute) && fs.statSync(legacyAbsolute).size >= 1024) {
      fs.copyFileSync(legacyAbsolute, targetAbsolute);
      repaired = true;
    } else {
      const publicDir = path.join(ROOT, "public");
      if (fs.existsSync(publicDir)) {
        const publicCandidates = fs
          .readdirSync(publicDir)
          .filter((name) => name.toLowerCase().endsWith(".pdf"))
          .map((name) => ({
            name,
            size: fs.statSync(path.join(publicDir, name)).size,
          }))
          .filter((entry) => entry.size >= 1024)
          .sort((a, b) => b.size - a.size);
        const titleSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, " ");
        const match =
          publicCandidates.find((entry) =>
            entry.name.toLowerCase().includes("cambrian")
          ) ??
          publicCandidates.find((entry) =>
            titleSlug
              .split(" ")
              .filter(Boolean)
              .some((word) => entry.name.toLowerCase().includes(word))
          ) ??
          publicCandidates[0];
        if (match) {
          fs.copyFileSync(
            path.join(publicDir, match.name),
            targetAbsolute
          );
          console.log(
            `Copied public/${match.name} -> storage/news-pdfs/${targetRelative}`
          );
          repaired = true;
        }
      }
    }
  } else {
    repaired = true;
  }

  if (post.pdfPath !== targetRelative) {
    await prisma.newsPost.update({
      where: { id: post.id },
      data: { pdfPath: targetRelative },
    });
    console.log(`Updated pdfPath for "${post.title}" -> ${targetRelative}`);
  } else if (repaired) {
    console.log(`Verified pdfPath for "${post.title}"`);
  } else {
    console.warn(`No PDF file found for "${post.title}" — upload via Edit post`);
  }
}

await prisma.$disconnect();
