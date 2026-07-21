/**
 * One-time back-fill: machine-translate every EXISTING ticker message and
 * announcement (title + body) into the languages that have no translation yet.
 * Mirrors the live save path (autoTranslateMissing) but is self-contained so it
 * can run outside Next (the app modules use `server-only`).
 *
 * Requires AUTO_TRANSLATE_URL (a running LibreTranslate). Never overwrites an
 * existing translation. Safe to re-run — it only fills blanks.
 *
 *   node_modules/.bin/tsx scripts/backfill-translations.mts
 */
import "dotenv/config";
import { createHash } from "node:crypto";

const { PrismaClient } = await import("@prisma/client");
const prisma = new (PrismaClient as any)();

const ENDPOINT = process.env.AUTO_TRANSLATE_URL?.replace(/\/+$/, "");
const LOCALES = ["ru", "tr", "ar", "zh"] as const;

if (!ENDPOINT) {
  console.error("AUTO_TRANSLATE_URL is not set (point it at a running LibreTranslate).");
  process.exit(1);
}

const sourceHash = (s: string) =>
  createHash("sha256").update(s.trim(), "utf8").digest("hex");

async function machineTranslate(
  text: string,
  target: string,
  html = false
): Promise<string | null> {
  const q = text.trim();
  if (!q) return null;
  try {
    const res = await fetch(`${ENDPOINT}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, source: "en", target, format: html ? "html" : "text" }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { translatedText?: string };
    return data.translatedText?.trim() || null;
  } catch {
    return null;
  }
}

async function fill(
  model: string,
  recordId: string,
  fields: Record<string, { text: string; html?: boolean }>
) {
  for (const locale of LOCALES) {
    for (const [field, spec] of Object.entries(fields)) {
      if (!spec.text?.trim()) continue;
      const key = { model, recordId, locale, field };
      const existing = await prisma.translation.findUnique({
        where: { model_recordId_locale_field: key },
      });
      if (existing?.value?.trim()) continue; // never overwrite
      const value = await machineTranslate(spec.text, locale, spec.html);
      if (!value) continue;
      await prisma.translation.upsert({
        where: { model_recordId_locale_field: key },
        create: { ...key, value, sourceHash: sourceHash(spec.text) },
        update: { value, sourceHash: sourceHash(spec.text) },
      });
    }
  }
}

const tickers = await prisma.tickerAnnouncement.findMany({
  select: { id: true, message: true },
});
console.log(`Ticker messages: ${tickers.length}`);
for (const t of tickers) {
  await fill("TickerAnnouncement", t.id, { message: { text: t.message } });
  console.log(`  done ticker ${t.id}`);
}

const posts = await prisma.newsPost.findMany({
  select: { id: true, title: true, content: true },
});
console.log(`Announcements: ${posts.length}`);
for (const p of posts) {
  await fill("NewsPost", p.id, {
    title: { text: p.title },
    content: { text: p.content, html: true },
  });
  console.log(`  done news ${p.id}`);
}

await prisma.$disconnect();
console.log("Backfill complete.");
