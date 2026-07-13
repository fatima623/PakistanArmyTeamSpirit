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

const ALL = "All";

function EventMeta({ event }: { event: PublicEvent }) {
  return (
    <>
      <span className={`ec-diff ec-diff--${event.difficulty}`}>
        {event.difficulty}
      </span>
      <span className="ec-tag ec-tag--cat">{event.category}</span>
      <span className="ec-tag ec-tag--duration">{event.duration}</span>
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
                    <EventMeta event={event} />
                  </div>
                </div>
              </div>
            </DialogHeader>

            {event.thumbnailUrl ? (
              <div className="ec-modal__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.thumbnailUrl} alt={event.title} />
              </div>
            ) : null}

            <div className="ec-modal__body">{event.details}</div>

            {event.participants ? (
              <>
                <div className="ec-modal__section-label">Participants</div>
                <div className="ec-modal__body" style={{ marginTop: 0 }}>
                  {event.participants}
                </div>
              </>
            ) : null}

            {event.breakdown ? (
              <>
                <div className="ec-modal__section-label">Marks breakdown</div>
                <div className="ec-breakdown">
                  {event.breakdown.map((b) => (
                    <div className="ec-breakdown__row" key={b.label}>
                      <div className="ec-breakdown__label">{b.label}</div>
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
              <span>Total marks for this event</span>
              <b>{event.marks}</b>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function EventsDetailView({ events }: { events: PublicEvent[] }) {
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
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (category !== ALL && e.category !== category) return false;
      if (difficulty !== ALL && e.difficulty !== difficulty) return false;
      if (q && !`${e.title} ${e.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, category, difficulty, query]);

  return (
    <div className="exercise-contour">
      <div className="ec-shell">
        <section className="ec-hero">
          <div className="ec-hero__badge">
            <span className="ec-hero__badge-dot" aria-hidden />
            Competition catalogue
          </div>
          <h1 className="ec-hero__title">
            Events <span>Detail</span>
          </h1>
          <div className="ec-hero__lede">
            Every scored serial of the exercise — navigation, reconnaissance,
            combat, medical and command tasks — with marks, difficulty and the
            full brief behind each card.
          </div>
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
                placeholder="Search events…"
                aria-label="Search competition events"
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
                All
              </button>
              {EVENT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="ec-chip"
                  data-active={category === c ? "true" : undefined}
                  onClick={() => setCategory((prev) => (prev === c ? ALL : c))}
                >
                  {c}
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
                {d}
              </button>
            ))}
          </div>

          <div className="ec-section-sub" style={{ marginBottom: "1.5rem" }}>
            {events.length} scored serials · {totalMarks} total marks
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
                      <img src={event.thumbnailUrl} alt={event.title} loading="lazy" />
                      <span className="ec-marks ec-marks--onthumb">
                        <span className="ec-marks__val">{event.marks}</span>
                        <span className="ec-marks__unit">Marks</span>
                      </span>
                    </div>
                  ) : (
                    <div className="ec-card__top">
                      <span className="ec-card__icon">
                        <Icon size={22} aria-hidden />
                      </span>
                      <span className="ec-marks">
                        <span className="ec-marks__val">{event.marks}</span>
                        <span className="ec-marks__unit">Marks</span>
                      </span>
                    </div>
                  )}
                  <div className="ec-card__title">{event.title}</div>
                  <div className="ec-card__summary">{event.summary}</div>
                  <div className="ec-card__meta">
                    <EventMeta event={event} />
                  </div>
                  <button
                    type="button"
                    className="ec-card__btn"
                    onClick={() => setSelected(event)}
                  >
                    View Details
                    <ArrowRight size={15} aria-hidden />
                  </button>
                </motion.div>
              );
            })}
            {filtered.length === 0 ? (
              <div className="ec-empty">
                No events match the current filters.
              </div>
            ) : null}
          </div>

          <EventModal event={selected} onClose={() => setSelected(null)} />
        </section>
      </div>
    </div>
  );
}
