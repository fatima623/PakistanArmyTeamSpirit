"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import { cn } from "@/lib/utils";

const ALL = "all";

export type GalleryItem = {
  id: string;
  title: string;
  year: number | null;
  image: string;
  caption?: string | null;
  category?: string | null;
};

function metaLine(item: GalleryItem): string {
  return [item.category, item.year].filter(Boolean).join(" · ");
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState(ALL);
  const reduce = useReducedMotion();

  const years = useMemo(
    () =>
      [
        ...new Set(
          items
            .map((a) => a.year)
            .filter((y): y is number => typeof y === "number")
        ),
      ].sort((a, b) => b - a),
    [items]
  );

  const filtered = useMemo(
    () =>
      filter === ALL
        ? items
        : items.filter((a) => String(a.year) === filter),
    [items, filter]
  );

  const active = activeIndex != null ? filtered[activeIndex] : null;

  const step = (dir: 1 | -1) => {
    setActiveIndex((i) => {
      if (i == null || filtered.length === 0) return i;
      return (i + dir + filtered.length) % filtered.length;
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ImageOff className="h-8 w-8 text-tactical-brass" aria-hidden />
        <p className="font-condensed text-sm uppercase tracking-wider text-white/60">
          The gallery is being updated. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      {years.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip active={filter === ALL} onClick={() => setFilter(ALL)}>
            All archives
          </FilterChip>
          {years.map((y) => (
            <FilterChip
              key={y}
              active={filter === String(y)}
              onClick={() => setFilter(String(y))}
            >
              {y}
            </FilterChip>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...mechanicalTransition, duration: 0.45, delay: Math.min(i, 8) * 0.04 }}
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden border border-white/10 bg-tactical-carbon-raised/50 text-left transition-all duration-300 ease-mechanical hover:-translate-y-1 hover:border-tactical-brass/60 hover:shadow-[0_14px_34px_rgba(0,0,0,0.5)]"
            style={{ borderRadius: "10px" }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 ease-mechanical group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={i < 3 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tactical-carbon via-tactical-carbon/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {metaLine(item) ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-tactical-brass">
                  {metaLine(item)}
                </p>
              ) : null}
              <h3 className="mt-1 font-display text-sm font-bold uppercase tracking-wide text-white group-hover:text-tactical-brass">
                {item.title}
              </h3>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-tactical-carbon/95 p-4"
            role="dialog"
            aria-modal
            aria-label={active.title}
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 p-2 text-white hover:text-tactical-brass"
              onClick={() => setActiveIndex(null)}
              aria-label="Close"
            >
              <X size={28} />
            </button>

            {filtered.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-tactical-brass"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={34} />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-tactical-brass"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next"
                >
                  <ChevronRight size={34} />
                </button>
              </>
            ) : null}

            <motion.div
              key={active.id}
              initial={reduce ? false : { scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[92vh] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="overflow-hidden border border-tactical-brass/25"
                style={{ borderRadius: "2px" }}
              >
                <Image
                  src={active.image}
                  alt={active.title}
                  width={1600}
                  height={1200}
                  className="max-h-[80vh] w-auto object-contain"
                />
              </div>
              {metaLine(active) ? (
                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-tactical-khaki">
                  {metaLine(active)}
                </p>
              ) : null}
              <p className="mt-2 text-center font-display text-lg font-bold uppercase text-white">
                {active.title}
              </p>
              {active.caption ? (
                <p className="mx-auto mt-1 max-w-2xl text-center font-condensed text-sm text-tactical-sand">
                  {active.caption}
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider transition-all duration-200",
        active
          ? "border-tactical-brass/70 bg-tactical-brass/15 text-tactical-brass"
          : "border-white/15 text-white/60 hover:border-tactical-brass/40 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
