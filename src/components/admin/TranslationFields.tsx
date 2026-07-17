"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ChevronRight, Languages } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LOCALE_LABELS, localeDir } from "@/lib/i18n/config";
// Type-only imports: both modules are `server-only`, and `import type` is erased
// before bundling, so nothing server-side reaches the client here. The types are
// what keep this UI honest — the field catalogue below is checked against the
// real one at compile time.
import type { TranslationSeed } from "@/lib/admin-translations";
import type {
  TranslatableField,
  TranslatableModel,
  TranslationLocale,
} from "@/lib/i18n/content-translations";

/**
 * The per-locale translation editor shared by all four admin managers
 * (events, gallery, key dates, news).
 *
 * Admin-entered content is written at runtime, so it can never be translated at
 * build time and the server makes no external API calls — the admin types the
 * ru/tr/ar/zh text by hand and the public site falls back to English wherever a
 * field is left blank. Nothing here is required: blank is a valid answer.
 *
 * NOTE: the admin layout mounts no I18nProvider, so this component must never
 * call useI18n() — it would throw. Admin chrome is English, like the rest of the
 * console.
 */

/* ------------------------------------------------------------------ *
 * Field catalogue
 * ------------------------------------------------------------------ */

type FieldSpec = {
  label: string;
  /** Mirrors the English field sitting next to it in the form. */
  kind: "input" | "textarea";
  rows?: number;
};

/**
 * Which control each translatable field gets.
 *
 * Typed as a mapped type over `TranslatableField<M>`, so this is not a loose
 * parallel list: adding a field to TRANSLATABLE_FIELDS without adding it here is
 * a COMPILE ERROR, and a field that no longer exists is one too. That is the
 * only link that keeps the admin UI from drifting away from what the read path
 * actually serves.
 */
const FIELD_SPECS: {
  [M in TranslatableModel]: { [F in TranslatableField<M>]: FieldSpec };
} = {
  Event: {
    title: { label: "Title", kind: "input" },
    summary: { label: "Summary", kind: "textarea", rows: 2 },
    details: { label: "Details", kind: "textarea", rows: 4 },
    participants: { label: "Participants", kind: "input" },
  },
  NewsPost: {
    title: { label: "Title", kind: "input" },
    content: { label: "Article body", kind: "textarea", rows: 8 },
  },
  GalleryImage: {
    title: { label: "Title", kind: "input" },
    caption: { label: "Caption", kind: "textarea", rows: 2 },
  },
  KeyDate: {
    label: { label: "Label", kind: "input" },
    value: { label: "Value", kind: "textarea", rows: 3 },
  },
};

/** English names for the admin console; the native label comes from config. */
const LOCALE_NAMES: Record<TranslationLocale, string> = {
  ru: "Russian",
  tr: "Turkish",
  ar: "Arabic",
  zh: "Chinese",
};

const TRANSLATION_LOCALES = Object.keys(LOCALE_NAMES) as TranslationLocale[];

/* ------------------------------------------------------------------ *
 * Draft state
 * ------------------------------------------------------------------ */

type DraftValues = Record<TranslationLocale, Record<string, string>>;
type StaleFlags = Record<TranslationLocale, Record<string, boolean>>;

/** locale → (field → text). What the admin routes accept. */
export type TranslationPayload = Partial<
  Record<TranslationLocale, Record<string, string>>
>;

export type TranslationDraft = {
  values: DraftValues;
  stale: StaleFlags;
  loading: boolean;
  setValue: (locale: TranslationLocale, field: string, value: string) => void;
  /**
   * The blob to send with the record, or `undefined` when there is nothing to
   * say — an absent `translations` key means "leave them untouched", which is
   * what keeps a metadata-only PATCH from wiping a record's translations.
   */
  payload: () => TranslationPayload | undefined;
  /** Clear the draft — for add forms that stay mounted after a save. */
  reset: () => void;
};

function emptyValues(): DraftValues {
  return { ru: {}, tr: {}, ar: {}, zh: {} };
}

function emptyStale(): StaleFlags {
  return { ru: {}, tr: {}, ar: {}, zh: {} };
}

function valuesFromSeed(seed: TranslationSeed | null | undefined): DraftValues {
  const out = emptyValues();
  if (!seed) return out;
  for (const locale of TRANSLATION_LOCALES) {
    for (const [field, row] of Object.entries(seed[locale] ?? {})) {
      out[locale][field] = row.value;
    }
  }
  return out;
}

function staleFromSeed(seed: TranslationSeed | null | undefined): StaleFlags {
  const out = emptyStale();
  if (!seed) return out;
  for (const locale of TRANSLATION_LOCALES) {
    for (const [field, row] of Object.entries(seed[locale] ?? {})) {
      out[locale][field] = row.stale;
    }
  }
  return out;
}

/**
 * Holds the translation draft for one record.
 *
 * Pass `seed` when the server already loaded the translations (the news edit
 * page does), or `url` to fetch them when an editor opens — the events, gallery
 * and key-date managers are client components whose list payload deliberately
 * does not carry every record's translations.
 */
export function useTranslationDraft({
  seed,
  url,
}: {
  seed?: TranslationSeed | null;
  url?: string | null;
} = {}): TranslationDraft {
  const [values, setValues] = useState<DraftValues>(() => valuesFromSeed(seed));
  // The values as loaded — used to tell "cleared by the admin" (send "" so the
  // row is deleted) from "never had one" (send nothing at all).
  const [initial, setInitial] = useState<DraftValues>(() => valuesFromSeed(seed));
  const [stale, setStale] = useState<StaleFlags>(() => staleFromSeed(seed));
  const [loading, setLoading] = useState(Boolean(url));

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    // Clear first: these editors are reused across records, and showing the
    // previously edited record's translations while the new ones load would
    // invite an admin to save one record's text onto another.
    setValues(emptyValues());
    setInitial(emptyValues());
    setStale(emptyStale());
    setLoading(true);
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const loaded = (data?.translations ?? null) as TranslationSeed | null;
        setValues(valuesFromSeed(loaded));
        setInitial(valuesFromSeed(loaded));
        setStale(staleFromSeed(loaded));
      })
      // A failed load must not block the save: the admin still gets empty
      // fields and English keeps showing on the public site.
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const setValue = useCallback(
    (locale: TranslationLocale, field: string, value: string) => {
      setValues((prev) => ({
        ...prev,
        [locale]: { ...prev[locale], [field]: value },
      }));
    },
    []
  );

  const payload = useCallback((): TranslationPayload | undefined => {
    const out: TranslationPayload = {};
    let touched = false;

    for (const locale of TRANSLATION_LOCALES) {
      const fields: Record<string, string> = {};
      let localeTouched = false;
      for (const [field, value] of Object.entries(values[locale])) {
        const trimmed = value.trim();
        const had = Boolean(initial[locale]?.[field]);
        // Blank and never stored — nothing to write and nothing to delete.
        if (!trimmed && !had) continue;
        fields[field] = trimmed;
        localeTouched = true;
      }
      if (localeTouched) {
        out[locale] = fields;
        touched = true;
      }
    }

    return touched ? out : undefined;
  }, [values, initial]);

  const reset = useCallback(() => {
    setValues(emptyValues());
    setInitial(emptyValues());
    setStale(emptyStale());
  }, []);

  return { values, stale, loading, setValue, payload, reset };
}

/* ------------------------------------------------------------------ *
 * UI
 * ------------------------------------------------------------------ */

const labelCls = "mb-1 block text-[0.78rem] font-semibold text-brand-ink";

export function TranslationFields({
  model,
  draft,
  idPrefix,
  description,
}: {
  model: TranslatableModel;
  draft: TranslationDraft;
  /** Keeps input ids unique when two editors are mounted at once. */
  idPrefix: string;
  description?: string;
}) {
  const specs = Object.entries(FIELD_SPECS[model]) as [string, FieldSpec][];

  return (
    <section className="rounded-xl border border-brand-line bg-brand-parchment/30 px-3 pb-3 pt-2.5">
      <header className="mb-2.5">
        <h4 className="flex items-center gap-1.5 text-[0.82rem] font-bold text-brand-ink">
          <Languages className="h-4 w-4 text-brand-olive" aria-hidden />
          Translations
          <span className="font-normal text-brand-ink-muted">(optional)</span>
        </h4>
        <p className="mt-0.5 text-[0.72rem] leading-[1.45] text-brand-ink-muted">
          {description ??
            "Type the text for each language. Anything left blank falls back to English on the public site."}
        </p>
      </header>

      {draft.loading ? (
        <p className="px-1 py-2 text-[0.75rem] text-brand-ink-muted">
          Loading existing translations…
        </p>
      ) : null}

      <div className="grid gap-2">
        {TRANSLATION_LOCALES.map((locale) => {
          const filled = specs.filter(([field]) =>
            (draft.values[locale][field] ?? "").trim()
          ).length;
          const staleCount = specs.filter(
            ([field]) =>
              draft.stale[locale]?.[field] &&
              (draft.values[locale][field] ?? "").trim()
          ).length;
          const rtl = localeDir(locale) === "rtl";

          return (
            <details
              key={locale}
              className="overflow-hidden rounded-lg border border-brand-line bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 hover:bg-brand-parchment-2/60 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-brand-ink-muted transition-transform [details[open]>&]:rotate-90"
                  aria-hidden
                />
                <span className="text-[0.8rem] font-semibold text-brand-ink">
                  {LOCALE_NAMES[locale]}
                </span>
                <span className="text-[0.75rem] text-brand-ink-muted" aria-hidden>
                  {LOCALE_LABELS[locale]}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  {staleCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.04em] text-amber-700">
                      <AlertTriangle className="h-3 w-3" aria-hidden />
                      {staleCount} to review
                    </span>
                  ) : null}
                  {filled > 0 ? (
                    <span className="rounded-full bg-brand-olive/10 px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.04em] text-brand-olive-dark">
                      {filled} of {specs.length} translated
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand-parchment-2 px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.04em] text-brand-ink-muted">
                      Not translated
                    </span>
                  )}
                </span>
              </summary>

              <div className="grid gap-3 border-t border-brand-line/70 px-3 pb-3 pt-2.5">
                {specs.map(([field, spec]) => {
                  const id = `${idPrefix}-${locale}-${field}`;
                  const value = draft.values[locale][field] ?? "";
                  const isStale =
                    Boolean(draft.stale[locale]?.[field]) && Boolean(value.trim());

                  return (
                    <div key={field}>
                      <label className={labelCls} htmlFor={id}>
                        {spec.label}
                      </label>
                      {spec.kind === "textarea" ? (
                        <Textarea
                          id={id}
                          value={value}
                          rows={spec.rows ?? 3}
                          dir={rtl ? "rtl" : undefined}
                          className="admin-input"
                          onChange={(e) =>
                            draft.setValue(locale, field, e.target.value)
                          }
                        />
                      ) : (
                        <Input
                          id={id}
                          value={value}
                          dir={rtl ? "rtl" : undefined}
                          className="admin-input"
                          onChange={(e) =>
                            draft.setValue(locale, field, e.target.value)
                          }
                        />
                      )}
                      {isStale ? (
                        <p className="mt-1 flex items-start gap-1.5 text-[0.72rem] font-semibold leading-[1.4] text-amber-700">
                          <AlertTriangle
                            className="mt-[0.15rem] h-3 w-3 shrink-0"
                            aria-hidden
                          />
                          English changed since this was translated — review and
                          update it.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
