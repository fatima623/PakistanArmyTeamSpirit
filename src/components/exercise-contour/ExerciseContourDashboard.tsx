"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Info,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONTOUR_EQUIPMENT,
  CONTOUR_EVENTS,
  CONTOUR_ORIENTATION,
  CONTOUR_OVERVIEW,
  CONTOUR_RULES,
  CONTOUR_STATS,
  CONTOUR_TIMELINE,
  DIFFICULTIES,
  EVENT_CATEGORIES,
  TOTAL_EVENT_MARKS,
  type ContourEvent,
  type Difficulty,
  type EventCategory,
} from "@/lib/exercise-contour";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import {
  translateContour,
  translateContourList,
} from "@/lib/i18n/exercise-contour-i18n";
import { contourIcon } from "./icon-map";

const ALL = "All";

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="ec-section-head">
      <span className="ec-eyebrow">{eyebrow}</span>
      <h2 className="ec-section-title">{title}</h2>
      {sub ? <div className="ec-section-sub">{sub}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- Hero + stats */

function HeroStats() {
  const { locale } = useI18n();
  return (
    <section className="ec-hero">
      <div className="ec-hero__badge">
        <span className="ec-hero__badge-dot" aria-hidden />
        {translateContour("Operational overview · Classified brief", locale)}
      </div>
      <h1 className="ec-hero__title">
        Exercise <span>Contour</span>
      </h1>
      <div className="ec-hero__lede">
        {translateContour(
          "The complete operational overview of the exercise — competition events, weapon and equipment requirements, rules, the evaluation system, international orientation and the full conduct of events, presented as a single command dashboard.",
          locale
        )}
      </div>
      <div className="ec-hero__rule" aria-hidden />

      <div className="ec-stats">
        {CONTOUR_STATS.map((stat, i) => {
          const Icon = contourIcon(stat.icon);
          return (
            <motion.div
              key={stat.label}
              className="ec-stat"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span className="ec-stat__icon">
                <Icon size={18} aria-hidden />
              </span>
              <div className="ec-stat__value">
                {translateContour(stat.value, locale)}
              </div>
              <div className="ec-stat__label">
                {translateContour(stat.label, locale)}
              </div>
              <div className="ec-stat__hint">
                {translateContour(stat.hint, locale)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Overview */

function OverviewSection() {
  const { locale } = useI18n();
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow={translateContour("Situation", locale)}
        title={translateContour("Exercise Overview", locale)}
        sub={translateContour(
          "How the exercise runs from the Assembly Area through 60 continuous hours of scenario-driven serials.",
          locale
        )}
      />
      <div className="ec-overview">
        {CONTOUR_OVERVIEW.map((card, i) => {
          const Icon = contourIcon(card.icon);
          return (
            <motion.div
              key={card.title}
              className="ec-ov-card"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span className="ec-ov-card__icon">
                <Icon size={20} aria-hidden />
              </span>
              <div className="ec-ov-card__title">
                {translateContour(card.title, locale)}
              </div>
              <div className="ec-ov-card__body">
                {translateContour(card.body, locale)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Timeline */

function TimelineSection() {
  const { locale } = useI18n();
  const [active, setActive] = useState(0);
  const step = CONTOUR_TIMELINE[active];

  return (
    <section className="ec-section">
      <SectionHead
        eyebrow={translateContour("Conduct of events", locale)}
        title={translateContour("Interactive Timeline", locale)}
        sub={translateContour(
          "The exercise flow from arrival to debriefing. Select any phase to read its intent.",
          locale
        )}
      />
      <div className="ec-timeline">
        <div className="ec-tl-track">
          {CONTOUR_TIMELINE.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className="ec-tl-item"
              data-active={i === active ? "true" : undefined}
              onClick={() => setActive(i)}
            >
              <span className="ec-tl-marker">
                <span className="ec-tl-dot" aria-hidden />
                {i < CONTOUR_TIMELINE.length - 1 ? (
                  <span className="ec-tl-line" aria-hidden />
                ) : null}
              </span>
              <span>
                <span className="ec-tl-num">
                  {String(i + 1).padStart(2, "0")} ·{" "}
                  {translateContour(item.phase, locale)}
                </span>
                <span className="ec-tl-label" style={{ display: "block" }}>
                  {translateContour(item.label, locale)}
                </span>
              </span>
            </button>
          ))}
        </div>

        <motion.div
          key={step.id}
          className="ec-tl-detail"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="ec-tl-detail__phase">
            {translateContour(step.phase, locale)}
          </span>
          <div className="ec-tl-detail__num">
            {String(active + 1).padStart(2, "0")}
            <span style={{ color: "rgba(197,168,128,0.5)" }}>
              /{CONTOUR_TIMELINE.length}
            </span>
          </div>
          <div className="ec-tl-detail__title">
            {translateContour(step.label, locale)}
          </div>
          <div className="ec-tl-detail__body">
            {translateContour(step.detail, locale)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Events */

function EventMeta({
  event,
  locale,
}: {
  event: ContourEvent;
  locale: Locale;
}) {
  return (
    <>
      <span className={`ec-diff ec-diff--${event.difficulty}`}>
        {translateContour(event.difficulty, locale)}
      </span>
      <span className="ec-tag ec-tag--cat">
        {translateContour(event.category, locale)}
      </span>
      <span className="ec-tag ec-tag--duration">
        {translateContour(event.duration, locale)}
      </span>
    </>
  );
}

function EventModal({
  event,
  onClose,
}: {
  event: ContourEvent | null;
  onClose: () => void;
}) {
  const { locale } = useI18n();
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
                    {translateContour(event.title, locale)}
                  </DialogTitle>
                  <div className="ec-modal__meta">
                    <EventMeta event={event} locale={locale} />
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="ec-modal__body">
              {translateContour(event.details, locale)}
            </div>

            {event.participants ? (
              <>
                <div className="ec-modal__section-label">
                  {translateContour("Participants", locale)}
                </div>
                <div className="ec-modal__body" style={{ marginTop: 0 }}>
                  {translateContour(event.participants, locale)}
                </div>
              </>
            ) : null}

            {event.breakdown ? (
              <>
                <div className="ec-modal__section-label">
                  {translateContour("Marks breakdown", locale)}
                </div>
                <div className="ec-breakdown">
                  {event.breakdown.map((b) => (
                    <div className="ec-breakdown__row" key={b.label}>
                      <div className="ec-breakdown__label">
                        {translateContour(b.label, locale)}
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
              <span>{translateContour("Total marks for this event", locale)}</span>
              <b>{event.marks}</b>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EventsSection() {
  const { locale } = useI18n();
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<EventCategory | typeof ALL>(ALL);
  const [difficulty, setDifficulty] = useState<Difficulty | typeof ALL>(ALL);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ContourEvent | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONTOUR_EVENTS.filter((e) => {
      if (category !== ALL && e.category !== category) return false;
      if (difficulty !== ALL && e.difficulty !== difficulty) return false;
      if (q && !`${e.title} ${e.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, difficulty, query]);

  return (
    <section className="ec-section">
      <SectionHead
        eyebrow={translateContour("Evaluation system", locale)}
        title={translateContour("Competition Events", locale)}
        sub={`${CONTOUR_EVENTS.length} ${translateContour("scored serials", locale)} · ${TOTAL_EVENT_MARKS} ${translateContour("total marks", locale)}. ${translateContour("Filter by category or difficulty, or open a card for the full brief.", locale)}`}
      />

      <div className="ec-controls">
        <div className="ec-search">
          <Search className="ec-search__icon" size={16} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translateContour("Search events…", locale)}
            aria-label={translateContour("Search competition events", locale)}
          />
        </div>
        <div className="ec-chips">
          <button
            type="button"
            className="ec-chip"
            data-active={difficulty === ALL && category === ALL ? "true" : undefined}
            onClick={() => {
              setCategory(ALL);
              setDifficulty(ALL);
            }}
          >
            {translateContour("All", locale)}
          </button>
          {EVENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className="ec-chip"
              data-active={category === c ? "true" : undefined}
              onClick={() => setCategory((prev) => (prev === c ? ALL : c))}
            >
              {translateContour(c, locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="ec-chips" style={{ marginBottom: "1.5rem" }}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            className="ec-chip"
            data-active={difficulty === d ? "true" : undefined}
            onClick={() => setDifficulty((prev) => (prev === d ? ALL : d))}
          >
            {translateContour(d, locale)}
          </button>
        ))}
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
              <div className="ec-card__top">
                <span className="ec-card__icon">
                  <Icon size={22} aria-hidden />
                </span>
                <span className="ec-marks">
                  <span className="ec-marks__val">{event.marks}</span>
                  <span className="ec-marks__unit">
                    {translateContour("Marks", locale)}
                  </span>
                </span>
              </div>
              <div className="ec-card__title">
                {translateContour(event.title, locale)}
              </div>
              <div className="ec-card__summary">
                {translateContour(event.summary, locale)}
              </div>
              <div className="ec-card__meta">
                <EventMeta event={event} locale={locale} />
              </div>
              <button
                type="button"
                className="ec-card__btn"
                onClick={() => setSelected(event)}
              >
                {translateContour("View Details", locale)}
                <ArrowRight size={15} aria-hidden />
              </button>
            </motion.div>
          );
        })}
        {filtered.length === 0 ? (
          <div className="ec-empty">
            {translateContour("No events match the current filters.", locale)}
          </div>
        ) : null}
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

/* --------------------------------------------------------------- Equipment */

function EquipmentSection() {
  const { locale } = useI18n();
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow={translateContour("Loadout", locale)}
        title={translateContour("Weapons & Equipment", locale)}
        sub={translateContour(
          "Everything a patrol carries — organised by category. Total team weight, fully loaded, must not exceed 200 KG.",
          locale
        )}
      />
      <div className="ec-equip">
        {CONTOUR_EQUIPMENT.map((cat, i) => {
          const Icon = contourIcon(cat.icon);
          const items = translateContourList(cat.items, locale);
          return (
            <motion.div
              key={cat.id}
              className="ec-equip-card"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div className="ec-equip-card__head">
                <span className="ec-equip-card__icon">
                  <Icon size={18} aria-hidden />
                </span>
                <span className="ec-equip-card__title">
                  {translateContour(cat.title, locale)}
                </span>
                <span className="ec-equip-card__count">{cat.items.length}</span>
              </div>
              <div className="ec-equip-list">
                {cat.items.map((item, idx) => (
                  <span className="ec-equip-item" key={item}>
                    {items[idx]}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Rules */

const RULE_ICON = {
  info: Info,
  warning: AlertTriangle,
  critical: Ban,
} as const;

function RulesSection() {
  const { locale } = useI18n();
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow={translateContour("Coordinating points", locale)}
        title={translateContour("Rules, Do's & Don'ts", locale)}
        sub={translateContour(
          "Operational rules, penalties and prohibitions. Critical items carry disqualification or heavy penalty points.",
          locale
        )}
      />
      <div className="ec-rules">
        {CONTOUR_RULES.map((rule, i) => {
          const Icon = RULE_ICON[rule.severity];
          return (
            <motion.div
              key={rule.text}
              className={`ec-rule ec-rule--${rule.severity}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
            >
              <span className="ec-rule__icon">
                <Icon size={18} aria-hidden />
              </span>
              <span className="ec-rule__text">
                {translateContour(rule.text, locale)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Orientation */

function OrientationSection() {
  const { locale } = useI18n();
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow={translateContour("Before the competition", locale)}
        title={translateContour("International Team Orientation", locale)}
        sub={translateContour(
          "Foreign teams receive pre-exercise familiarisation before the competition begins.",
          locale
        )}
      />
      <div className="ec-orient__banner">
        <ShieldCheck
          size={18}
          aria-hidden
          style={{
            display: "inline",
            verticalAlign: "-3px",
            marginRight: "0.5rem",
            color: "var(--ec-gold-bright)",
          }}
        />
        {translateContour(
          "Foreign teams are given hands-on orientation in Pakistan Army weapons and systems, navigation, communications and CBRN drills — levelling the field before the exercise clock starts.",
          locale
        )}
      </div>
      <div className="ec-orient">
        {CONTOUR_ORIENTATION.map((item, i) => {
          const Icon = contourIcon(item.icon);
          return (
            <motion.div
              key={item.title}
              className="ec-orient-card"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <span className="ec-orient-card__icon">
                <Icon size={20} aria-hidden />
              </span>
              <div className="ec-orient-card__title">
                {translateContour(item.title, locale)}
              </div>
              <div className="ec-orient-card__body">
                {translateContour(item.detail, locale)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Root */

export function ExerciseContourDashboard() {
  return (
    <div className="exercise-contour">
      <div className="ec-shell">
        <HeroStats />
        <OverviewSection />
        <TimelineSection />
        <EventsSection />
        <EquipmentSection />
        <RulesSection />
        <OrientationSection />
      </div>
    </div>
  );
}
