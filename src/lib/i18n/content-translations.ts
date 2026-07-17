import "server-only";

import { createHash } from "node:crypto";

import type { Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";

/**
 * Read/write core for admin-entered content translations.
 *
 * WHY THIS EXISTS
 * ---------------
 * `Event`, `NewsPost`, `GalleryImage` and `KeyDate` are authored at RUNTIME
 * through the admin panel, so their free-text fields can never be translated at
 * build time, and the static lookup tables (key-date-i18n.ts,
 * event-content-i18n.ts) can only ever cover a fixed vocabulary known in
 * advance — a brand-new event's title would fall straight through to English.
 * The server makes no external API calls, so machine translation is out. The
 * answer is manual: an admin types the ru/tr/ar/zh text, this module stores and
 * serves it, and anything untranslated falls back to English.
 *
 * THE FALLBACK CHAIN (per field, in order)
 *   1. DB Translation  — an admin typed it deliberately, so it wins.
 *   2. Static lookup   — key-date-i18n / event-content-i18n, still authoritative
 *                        for fixed-vocabulary fields (category, difficulty,
 *                        duration, breakdown labels, known KeyDate labels).
 *   3. English source  — the value on the model itself.
 *
 * English is the SOURCE OF TRUTH and is never stored here; the table holds only
 * ru/tr/ar/zh. There is no FK to the source models, so rows must be cleaned up
 * explicitly — see `deleteTranslationsFor`.
 */

/* ------------------------------------------------------------------ *
 * Model / field catalogue
 * ------------------------------------------------------------------ */

/**
 * The translatable (free-text, admin-entered) fields per model. Fixed-vocabulary
 * fields are deliberately absent: `Event.category`/`difficulty`/`duration` and
 * the breakdown labels are covered by event-content-i18n.ts, and they double as
 * FILTER KEYS on the public events page — translating them in the DB would
 * silently break filtering in every non-English locale.
 *
 * `GalleryImage.category` is likewise absent: GalleryGrid groups albums by the
 * raw category string and gallery-category-i18n.ts localizes it for display.
 */
export const TRANSLATABLE_FIELDS = {
  Event: ["title", "summary", "details", "participants"],
  NewsPost: ["title", "content"],
  GalleryImage: ["title", "caption"],
  KeyDate: ["label", "value"],
} as const satisfies Record<string, readonly string[]>;

/** "Event" | "NewsPost" | "GalleryImage" | "KeyDate" — matches Translation.model. */
export type TranslatableModel = keyof typeof TRANSLATABLE_FIELDS;

/** The translatable field names of a given model, as a union of literals. */
export type TranslatableField<M extends TranslatableModel> =
  (typeof TRANSLATABLE_FIELDS)[M][number];

/** Translated values for one record: field → text. Absent field = no translation. */
export type TranslationFieldMap<M extends TranslatableModel> = Partial<
  Record<TranslatableField<M>, string>
>;

/** recordId → its translated fields, for one locale. */
export type TranslationMap<M extends TranslatableModel> = Map<
  string,
  TranslationFieldMap<M>
>;

/** Every locale except the source language. Translations are never stored for "en". */
export type TranslationLocale = Exclude<Locale, "en">;

export const TRANSLATABLE_MODELS = Object.keys(
  TRANSLATABLE_FIELDS
) as TranslatableModel[];

export function isTranslatableModel(value: unknown): value is TranslatableModel {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(TRANSLATABLE_FIELDS, value)
  );
}

export function isTranslatableField<M extends TranslatableModel>(
  model: M,
  field: unknown
): field is TranslatableField<M> {
  return (
    typeof field === "string" &&
    (TRANSLATABLE_FIELDS[model] as readonly string[]).includes(field)
  );
}

/** A value only counts as a translation when it has non-whitespace content. */
function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/* ------------------------------------------------------------------ *
 * Read path
 * ------------------------------------------------------------------ */

/**
 * Translated fields for many records of one model, in one locale.
 *
 * SINGLE batched query — one `recordId: { in: [...] }` for the whole page. A
 * per-row lookup would be an N+1 across the events/announcements/gallery lists.
 *
 * Returns an empty Map for "en" WITHOUT touching the database: English is the
 * source and nothing is ever stored for it.
 *
 * A failure here must NEVER take a public page down — a missing translation is a
 * cosmetic fallback to English, but a thrown error is a 500 on a public route.
 * So a DB error is logged and swallowed, matching the try/catch fallbacks in
 * site-data.ts and api/public/registered-countries.
 */
export async function getTranslations<M extends TranslatableModel>(
  model: M,
  recordIds: string[],
  locale: Locale
): Promise<TranslationMap<M>> {
  const out: TranslationMap<M> = new Map();
  if (locale === "en") return out;

  const ids = [...new Set(recordIds.filter(hasText))];
  if (ids.length === 0) return out;

  try {
    const rows = await prisma.translation.findMany({
      where: { model, recordId: { in: ids }, locale },
      select: { recordId: true, field: true, value: true },
    });

    for (const row of rows) {
      // Defensive: ignore rows for fields that are no longer translatable, and
      // blank values (which should have been deleted rather than stored).
      if (!isTranslatableField(model, row.field)) continue;
      if (!hasText(row.value)) continue;
      const fields: TranslationFieldMap<M> = out.get(row.recordId) ?? {};
      fields[row.field] = row.value;
      out.set(row.recordId, fields);
    }
  } catch (error) {
    console.error("[content-translations] getTranslations failed:", error);
    return new Map();
  }

  return out;
}

/** Convenience wrapper for a single record (still one query). */
export async function getTranslationsFor<M extends TranslatableModel>(
  model: M,
  recordId: string,
  locale: Locale
): Promise<TranslationFieldMap<M>> {
  const map = await getTranslations(model, [recordId], locale);
  return map.get(recordId) ?? {};
}

/**
 * Shallow copy of `record` with translated fields substituted in.
 *
 * A field is left untouched when its translation is absent or blank, so English
 * always shows through rather than a hole in the page. Only keys ALREADY PRESENT
 * on the record are considered — this never invents a field, so a stale row for
 * a field that no longer exists cannot leak onto the object.
 *
 * The field map is typed loosely on purpose: it is produced by `getTranslations`,
 * which is already keyed to the model, and widening here keeps M inferrable at
 * every call site.
 */
export function applyTranslations<T extends object>(
  record: T,
  fields: Readonly<Partial<Record<string, string>>> | undefined
): T {
  if (!fields) return { ...record };
  const out: T = { ...record };
  for (const [field, value] of Object.entries(fields)) {
    if (!hasText(value)) continue;
    if (!(field in out)) continue;
    (out as Record<string, unknown>)[field] = value;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Staleness
 * ------------------------------------------------------------------ */

/**
 * SHA-256 (hex) of an English source value.
 *
 * Lives here rather than in the admin code so the write path and the staleness
 * check can never drift apart on the algorithm or the normalization. The value
 * is trimmed first: re-saving English with only trailing whitespace changed must
 * not flag every translation stale.
 */
export function sourceHashOf(value: string): string {
  return createHash("sha256").update(value.trim(), "utf8").digest("hex");
}

/**
 * True when the English source has changed since the translation was saved.
 * A null/absent `sourceHash` (row written before hashing, or by hand) is treated
 * as NOT stale — flagging every legacy row would be noise, not signal.
 */
export function isTranslationStale(
  sourceHash: string | null | undefined,
  currentSource: string
): boolean {
  if (!sourceHash) return false;
  return sourceHash !== sourceHashOf(currentSource);
}

/* ------------------------------------------------------------------ *
 * Write path (admin API)
 * ------------------------------------------------------------------ */

export type SetTranslationsInput<M extends TranslatableModel> = {
  model: M;
  recordId: string;
  locale: TranslationLocale;
  /**
   * field → translated text. An EMPTY / whitespace-only value is how an admin
   * clears a field: the row is deleted so the read path falls back to English.
   * Fields not present in this object are left exactly as they are.
   */
  values: TranslationFieldMap<M>;
  /**
   * field → the CURRENT English source text, hashed into `sourceHash` so the
   * admin UI can flag the translation stale once the English changes. Optional:
   * a field with no source entry is stored with a null hash (= never stale).
   */
  source?: Partial<Record<TranslatableField<M>, string>>;
};

/**
 * Upsert (or clear) the translations of one record in one locale.
 *
 * Unlike the read path this does NOT swallow errors: a silently dropped write
 * would tell the admin "saved" while nothing was stored. Let it throw and let
 * the admin API surface the failure.
 */
export async function setTranslations<M extends TranslatableModel>(
  input: SetTranslationsInput<M>
): Promise<void> {
  const { model, recordId, locale, values, source } = input;
  if (!hasText(recordId)) return;

  for (const [rawField, rawValue] of Object.entries(values)) {
    if (!isTranslatableField(model, rawField)) continue;
    const field: string = rawField;
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    // Clearing a field = deleting the row, so English shows through again.
    if (!value) {
      await prisma.translation.deleteMany({
        where: { model, recordId, locale, field },
      });
      continue;
    }

    const englishSource = source?.[rawField as TranslatableField<M>];
    const sourceHash = hasText(englishSource) ? sourceHashOf(englishSource) : null;

    await prisma.translation.upsert({
      where: {
        model_recordId_locale_field: { model, recordId, locale, field },
      },
      create: { model, recordId, locale, field, value, sourceHash },
      update: { value, sourceHash },
    });
  }
}

/**
 * Remove every translation of a record, in every locale.
 *
 * The table has no FK to the source models, so the admin delete path MUST call
 * this or the rows are orphaned — and a later record reusing the id would
 * inherit a previous record's translations.
 */
export async function deleteTranslationsFor(
  model: TranslatableModel,
  recordId: string
): Promise<void> {
  if (!hasText(recordId)) return;
  await prisma.translation.deleteMany({ where: { model, recordId } });
}

/**
 * Every stored translation of one record, grouped by locale — for the admin
 * editor, which needs all locales at once plus each row's staleness hash.
 * Read-side helper, so it degrades to an empty map rather than throwing.
 */
export async function getAllTranslationsFor<M extends TranslatableModel>(
  model: M,
  recordId: string
): Promise<
  Map<TranslationLocale, Partial<Record<TranslatableField<M>, { value: string; sourceHash: string | null }>>>
> {
  const out = new Map<
    TranslationLocale,
    Partial<Record<TranslatableField<M>, { value: string; sourceHash: string | null }>>
  >();
  if (!hasText(recordId)) return out;

  try {
    const rows = await prisma.translation.findMany({
      where: { model, recordId },
      select: { locale: true, field: true, value: true, sourceHash: true },
    });
    for (const row of rows) {
      if (!isTranslatableField(model, row.field)) continue;
      const locale = row.locale as TranslationLocale;
      const fields: Partial<
        Record<TranslatableField<M>, { value: string; sourceHash: string | null }>
      > = out.get(locale) ?? {};
      fields[row.field] = { value: row.value, sourceHash: row.sourceHash };
      out.set(locale, fields);
    }
  } catch (error) {
    console.error("[content-translations] getAllTranslationsFor failed:", error);
    return new Map();
  }

  return out;
}
