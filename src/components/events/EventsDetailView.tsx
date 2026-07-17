"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

import { contourIcon } from "@/components/exercise-contour/icon-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicEvent } from "@/lib/events-data";
import {
  DIFFICULTIES,
  EVENT_CATEGORIES,
  type Difficulty,
  type EventCategory,
} from "@/lib/exercise-contour";
import type { Locale } from "@/lib/i18n/config";
import {
  translateBreakdownLabel,
  translateEventCategory,
  translateEventDifficulty,
  translateEventDuration,
} from "@/lib/i18n/event-content-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Sentinel for "no filter applied". Never rendered — the visible chip label
 * comes from `t.events.filters.all`. Deliberately not a real category or
 * difficulty value so it can never collide with one.
 */
const ALL = "__all__";

/**
 * Case/diacritic-insensitive folding for search. Both the query and the
 * haystack go through this, so Turkish "İstihbarat" matches a typed
 * "istihbarat" (JS lowercases "İ" to "i" + U+0307, which NFD strips) and
 * Russian "ё" matches "е".
 */
function fold(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function EventMeta({ event, locale }: { event: PublicEvent; locale: Locale }) {
  return (
    <>
      {/* The modifier class keys off the RAW difficulty — never the translated
          label, which would break the per-difficulty colours. */}
      <span className={`ec-diff ec-diff--${event.difficulty}`}>
        {translateEventDifficulty(event.difficulty, locale)}
      </span>
      <span className="ec-tag ec-tag--cat">
        {translateEventCategory(event.category, locale)}
      </span>
      <span className="ec-tag ec-tag--duration">
        {translateEventDuration(event.duration, locale)}
      </span>
    </>
  );
}

function EventModal({
  event,
  onClose,
}: {
  event: PublicEvent | null;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const Icon = event ? contourIcon(event.icon) : null;
  const maxBreak = event?.breakdown
    ? Math.max(...event.breakdown.map((b) => b.marks))
    : 0;

  return (
    <Dialog open={Boolean(event)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="ec-modal">
        {event ? (
          <>
            <DialogHeader>
              <div className="ec-modal__head">
                {Icon ? (
                  <span className="ec-modal__icon">
                    <Icon size={26} aria-hidden />
                  </span>
                ) : null}
                <div>
                  <DialogTitle className="ec-modal__title">
                    {event.title}
                  </DialogTitle>
                  <div className="ec-modal__meta">
                    <EventMeta event={event} locale={locale} />
                  </div>
                </div>
              </div>
            </DialogHeader>

            {event.thumbnailUrl ? (
              <div className="ec-modal__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.thumbnailUrl}
                  alt={t.events.card.thumbAlt(event.title)}
                />
              </div>
            ) : null}

            <div className="ec-modal__body">{event.details}</div>

            {event.participants ? (
              <>
                <div className="ec-modal__section-label">
                  {t.events.modal.participants}
                </div>
                <div className="ec-modal__body" style={{ marginTop: 0 }}>
                  {event.participants}
                </div>
              </>
            ) : null}

            {event.breakdown ? (
              <>
                <div className="ec-modal__section-label">
                  {t.events.modal.breakdown}
                </div>
                <div className="ec-breakdown">
                  {event.breakdown.map((b) => (
                    // Key stays the raw label — stable across locale changes.
                    <div className="ec-breakdown__row" key={b.label}>
                      <div className="ec-breakdown__label">
                        {translateBreakdownLabel(b.label, locale)}
                      </div>
                      <div className="ec-breakdown__bar">
                        <div
                          className="ec-breakdown__fill"
                          style={{
                            width: `${maxBreak ? (b.marks / maxBreak) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="ec-breakdown__val">{b.marks}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div className="ec-modal__total">
              <span>{t.events.modal.total}</span>
              <b>{event.marks}</b>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function EventsDetailView({ events }: { events: PublicEvent[] }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<EventCategory | typeof ALL>(ALL);
  const [difficulty, setDifficulty] = useState<Difficulty | typeof ALL>(ALL);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PublicEvent | null>(null);

  const totalMarks = useMemo(
    () => events.reduce((sum, e) => sum + e.marks, 0),
    [events]
  );

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return events.filter((e) => {
      // Filters compare the RAW stored values, never the translated labels.
      if (category !== ALL && e.category !== category) return false;
      if (difficulty !== ALL && e.difficulty !== difficulty) return false;
      if (!q) return true;
      // Title/summary stay as authored (English today); the translated meta is
      // added so a reader can also search in their own language.
      const haystack = fold(
        [
          e.title,
          e.summary,
          translateEventCategory(e.category, locale),
          translateEventDifficulty(e.difficulty, locale),
          translateEventDuration(e.duration, locale),
        ].join(" ")
      );
      return haystack.includes(q);
    });
  }, [events, category, difficulty, query, locale]);

  return (
    <div className="exercise-contour">
      <div className="ec-shell">
        <section className="ec-hero">
          <div className="ec-hero__badge">
            <span className="ec-hero__badge-dot" aria-hidden />
            {t.events.hero.badge}
          </div>
          <h1 className="ec-hero__title">
            {t.events.hero.titleLead} <span>{t.events.hero.titleAccent}</span>
          </h1>
          <div className="ec-hero__lede">{t.events.hero.lede}</div>
          <div className="ec-hero__rule" aria-hidden />
        </section>

        <section className="ec-section">
          <div className="ec-controls">
            <div className="ec-search">
              <Search className="ec-search__icon" size={16} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.events.filters.searchPlaceholder}
                aria-label={t.events.filters.searchAria}
              />
            </div>
            <div className="ec-chips">
              <button
                type="button"
                className="ec-chip"
                data-active={
                  difficulty === ALL && category === ALL ? "true" : undefined
                }
                onClick={() => {
                  setCategory(ALL);
                  setDifficulty(ALL);
                }}
              >
                {t.events.filters.all}
              </button>
              {EVENT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="ec-chip"
                  data-active={category === c ? "true" : undefined}
                  onClick={() => setCategory((prev) => (prev === c ? ALL : c))}
                >
                  {translateEventCategory(c, locale)}
                </button>
              ))}
            </div>
          </div>

          <div className="ec-chips" style={{ marginBottom: "1.25rem" }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className="ec-chip"
                data-active={difficulty === d ? "true" : undefined}
                onClick={() => setDifficulty((prev) => (prev === d ? ALL : d))}
              >
                {translateEventDifficulty(d, locale)}
              </button>
            ))}
          </div>

          <div className="ec-section-sub" style={{ marginBottom: "1.5rem" }}>
            {t.events.summary(events.length, totalMarks)}
          </div>

          <div className="ec-events">
            {filtered.map((event, i) => {
              const Icon = contourIcon(event.icon);
              return (
                <motion.div
                  key={event.id}
                  className="ec-card"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
                >
                  {event.thumbnailUrl ? (
                    <div className="ec-card__thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.thumbnailUrl}
                        alt={t.events.card.thumbAlt(event.title)}
                        loading="lazy"
                      />
                      <span className="ec-marks ec-marks--onthumb">
                        <span className="ec-marks__val">{event.marks}</span>
                        <span className="ec-marks__unit">
                          {t.events.card.marksUnit(event.marks)}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="ec-card__top">
                      <span className="ec-card__icon">
                        <Icon size={22} aria-hidden />
                      </span>
                      <span className="ec-marks">
                        <span className="ec-marks__val">{event.marks}</span>
                        <span className="ec-marks__unit">
                          {t.events.card.marksUnit(event.marks)}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="ec-card__title">{event.title}</div>
                  <div className="ec-card__summary">{event.summary}</div>
                  <div className="ec-card__meta">
                    <EventMeta event={event} locale={locale} />
                  </div>
                  <button
                    type="button"
                    className="ec-card__btn"
                    onClick={() => setSelected(event)}
                  >
                    {t.events.card.viewDetails}
                    <ArrowRight size={15} aria-hidden />
                  </button>
                </motion.div>
              );
            })}
            {filtered.length === 0 ? (
              <div className="ec-empty">{t.events.empty}</div>
            ) : null}
          </div>

          <EventModal event={selected} onClose={() => setSelected(null)} />
        </section>
      </div>
    </div>
  );
}
