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
  return (
    <section className="ec-hero">
      <div className="ec-hero__badge">
        <span className="ec-hero__badge-dot" aria-hidden />
        Operational overview · Classified brief
      </div>
      <h1 className="ec-hero__title">
        Exercise <span>Contour</span>
      </h1>
      <div className="ec-hero__lede">
        The complete operational overview of the exercise — competition events,
        weapon and equipment requirements, rules, the evaluation system,
        international orientation and the full conduct of events, presented as a
        single command dashboard.
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
              <div className="ec-stat__value">{stat.value}</div>
              <div className="ec-stat__label">{stat.label}</div>
              <div className="ec-stat__hint">{stat.hint}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Overview */

function OverviewSection() {
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow="Situation"
        title="Exercise Overview"
        sub="How the exercise runs from the Assembly Area through 60 continuous hours of scenario-driven serials."
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
              <div className="ec-ov-card__title">{card.title}</div>
              <div className="ec-ov-card__body">{card.body}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Timeline */

function TimelineSection() {
  const [active, setActive] = useState(0);
  const step = CONTOUR_TIMELINE[active];

  return (
    <section className="ec-section">
      <SectionHead
        eyebrow="Conduct of events"
        title="Interactive Timeline"
        sub="The exercise flow from arrival to debriefing. Select any phase to read its intent."
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
                  {String(i + 1).padStart(2, "0")} · {item.phase}
                </span>
                <span className="ec-tl-label" style={{ display: "block" }}>
                  {item.label}
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
          <span className="ec-tl-detail__phase">{step.phase}</span>
          <div className="ec-tl-detail__num">
            {String(active + 1).padStart(2, "0")}
            <span style={{ color: "rgba(197,168,128,0.5)" }}>
              /{CONTOUR_TIMELINE.length}
            </span>
          </div>
          <div className="ec-tl-detail__title">{step.label}</div>
          <div className="ec-tl-detail__body">{step.detail}</div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Events */

function EventMeta({ event }: { event: ContourEvent }) {
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
  event: ContourEvent | null;
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

function EventsSection() {
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
        eyebrow="Evaluation system"
        title="Competition Events"
        sub={`${CONTOUR_EVENTS.length} scored serials · ${TOTAL_EVENT_MARKS} total marks. Filter by category or difficulty, or open a card for the full brief.`}
      />

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
            data-active={difficulty === ALL && category === ALL ? "true" : undefined}
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

      <div className="ec-chips" style={{ marginBottom: "1.5rem" }}>
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
                  <span className="ec-marks__unit">Marks</span>
                </span>
              </div>
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
  );
}

/* --------------------------------------------------------------- Equipment */

function EquipmentSection() {
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow="Loadout"
        title="Weapons & Equipment"
        sub="Everything a patrol carries — organised by category. Total team weight, fully loaded, must not exceed 200 KG."
      />
      <div className="ec-equip">
        {CONTOUR_EQUIPMENT.map((cat, i) => {
          const Icon = contourIcon(cat.icon);
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
                <span className="ec-equip-card__title">{cat.title}</span>
                <span className="ec-equip-card__count">{cat.items.length}</span>
              </div>
              <div className="ec-equip-list">
                {cat.items.map((item) => (
                  <span className="ec-equip-item" key={item}>
                    {item}
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
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow="Coordinating points"
        title="Rules, Do's & Don'ts"
        sub="Operational rules, penalties and prohibitions. Critical items carry disqualification or heavy penalty points."
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
              <span className="ec-rule__text">{rule.text}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Orientation */

function OrientationSection() {
  return (
    <section className="ec-section">
      <SectionHead
        eyebrow="Before the competition"
        title="International Team Orientation"
        sub="Foreign teams receive pre-exercise familiarisation before the competition begins."
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
        Foreign teams are given hands-on orientation in Pakistan Army weapons and
        systems, navigation, communications and CBRN drills — levelling the field
        before the exercise clock starts.
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
              <div className="ec-orient-card__title">{item.title}</div>
              <div className="ec-orient-card__body">{item.detail}</div>
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
