import "server-only";

import { ApiError } from "@/lib/api-helpers";
import { LOCALES } from "@/lib/i18n/config";
import {
  getAllTranslationsFor,
  isTranslatableField,
  isTranslationStale,
  setTranslations,
  type TranslatableField,
  type TranslatableModel,
  type TranslationFieldMap,
  type TranslationLocale,
} from "@/lib/i18n/content-translations";
import { sanitizeNewsContent } from "@/lib/sanitize-news";

/**
 * The admin WRITE path for content translations — the bridge between the four
 * admin routes (events / gallery / key-dates / news) and content-translations.ts.
 *
 * It exists so the validation lives in exactly ONE place. These routes are
 * admin-authenticated, but `model`/`field`/`locale` still arrive from the
 * client, and the Translation table has no FK and no enum columns: an
 * unvalidated write would let arbitrary rows in (a row for `Event.category`
 * would silently break the public events filters, a row for locale "en" would
 * shadow the source of truth). Every route funnels through
 * `parseTranslationsInput` before anything reaches the database.
 */

/** Every locale that can hold a translation. English is the source and is never stored. */
const TRANSLATION_LOCALES = LOCALES.filter(
  (locale): locale is TranslationLocale => locale !== "en"
);

function isTranslationLocale(value: string): value is TranslationLocale {
  return (TRANSLATION_LOCALES as readonly string[]).includes(value);
}

/**
 * Ceiling on one translated field. English `NewsPost.content` is uncapped, so
 * this is deliberately generous — it only exists to keep a single request from
 * filling the `Text` column (65 535 bytes) with one field.
 */
const MAX_TRANSLATION_CHARS = 20000;

/** locale → (field → translated text), already validated against the model. */
export type TranslationsInput<M extends TranslatableModel> = Partial<
  Record<TranslationLocale, TranslationFieldMap<M>>
>;

/**
 * What the admin editor needs to render one record's translations: the stored
 * text plus whether the English has moved on since it was written.
 */
export type TranslationSeed = Partial<
  Record<TranslationLocale, Record<string, { value: string; stale: boolean }>>
>;

/**
 * Validate the `translations` blob from an admin request.
 *
 * Returns `undefined` when the key is absent — meaning "leave translations
 * exactly as they are". That is what lets the publish toggle PATCH
 * `{ published }` on its own without wiping a record's translations.
 *
 * Throws ApiError(400) rather than silently dropping a bad locale/field: an
 * admin who mistypes should see the failure, not a save that reports success
 * and stores nothing.
 */
export function parseTranslationsInput<M extends TranslatableModel>(
  model: M,
  raw: unknown
): TranslationsInput<M> | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("translations must be an object keyed by locale", 400);
  }

  const out: TranslationsInput<M> = {};

  for (const [locale, rawFields] of Object.entries(raw as Record<string, unknown>)) {
    // "en" is rejected here too: it is the source of truth on the model itself,
    // and a Translation row for it would quietly override the real column.
    if (!isTranslationLocale(locale)) {
      throw new ApiError(
        `Unsupported translation locale "${locale}". Expected one of: ${TRANSLATION_LOCALES.join(", ")}.`,
        400
      );
    }
    if (
      typeof rawFields !== "object" ||
      rawFields === null ||
      Array.isArray(rawFields)
    ) {
      throw new ApiError(
        `translations.${locale} must be an object keyed by field name`,
        400
      );
    }

    const values: TranslationFieldMap<M> = {};
    for (const [field, value] of Object.entries(
      rawFields as Record<string, unknown>
    )) {
      if (!isTranslatableField(model, field)) {
        throw new ApiError(
          `"${field}" is not a translatable field of ${model}`,
          400
        );
      }
      if (typeof value !== "string") {
        throw new ApiError(
          `translations.${locale}.${field} must be a string`,
          400
        );
      }
      if (value.length > MAX_TRANSLATION_CHARS) {
        throw new ApiError(
          `translations.${locale}.${field} must be ${MAX_TRANSLATION_CHARS} characters or fewer`,
          400
        );
      }

      // NewsPost.content is stored HTML and rendered with
      // dangerouslySetInnerHTML on the public article. Sanitize it HERE, on the
      // way in, with the same sanitizer the English content uses — doing it at
      // the call sites would make it forgettable in exactly the one place that
      // matters.
      values[field] =
        model === "NewsPost" && field === "content"
          ? sanitizeNewsContent(value)
          : value;
    }

    out[locale] = values;
  }

  return out;
}

/** JSON-decode the `translations` field of a multipart admin form. */
export function parseTranslationsFormField(
  value: FormDataEntryValue | null
): unknown {
  const raw = value == null ? "" : String(value).trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError("translations must be valid JSON", 400);
  }
}

/**
 * Persist one record's translations across every locale in the payload.
 *
 * `source` must be the English text saved by the SAME request — its hash is
 * what later tells the admin "the English changed since you translated this".
 * Hashing a stale read would defeat the whole point.
 */
export async function saveTranslations<M extends TranslatableModel>(input: {
  model: M;
  recordId: string;
  translations: TranslationsInput<M> | undefined;
  source: Partial<Record<TranslatableField<M>, string | null>>;
}): Promise<void> {
  const { model, recordId, translations, source } = input;
  if (!translations) return;

  const normalized: Partial<Record<TranslatableField<M>, string>> = {};
  for (const [field, value] of Object.entries(source)) {
    if (typeof value === "string") {
      normalized[field as TranslatableField<M>] = value;
    }
  }

  for (const locale of TRANSLATION_LOCALES) {
    const values = translations[locale];
    if (!values) continue;
    await setTranslations({ model, recordId, locale, values, source: normalized });
  }
}

/**
 * Every stored translation of a record plus a per-field staleness flag, shaped
 * for the admin editor.
 *
 * `source` is the CURRENT English on the record; a field whose stored
 * `sourceHash` no longer matches it is flagged so the admin can see which
 * translations have drifted.
 */
export async function buildTranslationSeed<M extends TranslatableModel>(
  model: M,
  recordId: string,
  source: Partial<Record<TranslatableField<M>, string | null>>
): Promise<TranslationSeed> {
  const stored = await getAllTranslationsFor(model, recordId);
  const seed: TranslationSeed = {};

  for (const [locale, fields] of stored) {
    // getAllTranslationsFor trusts the column; a row written by hand could
    // carry any locale string, so re-check before it reaches the editor.
    if (!isTranslationLocale(locale)) continue;

    const out: Record<string, { value: string; stale: boolean }> = {};
    // Object.entries over a mapped type keyed by a type parameter loses the
    // value type, so state it — the shape is getAllTranslationsFor's contract.
    const entries = Object.entries(fields) as [
      string,
      { value: string; sourceHash: string | null } | undefined,
    ][];
    for (const [field, row] of entries) {
      if (!row) continue;
      const english = source[field as TranslatableField<M>];
      out[field] = {
        value: row.value,
        stale: isTranslationStale(row.sourceHash, english ?? ""),
      };
    }
    seed[locale] = out;
  }

  return seed;
}
