"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageIcon, ImageOff, X } from "lucide-react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import { compareCategories, UNCATEGORISED_LABEL } from "@/lib/gallery-categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
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

type Album = {
  category: string;
  items: GalleryItem[];
  cover: GalleryItem;
};

function metaLine(item: GalleryItem): string {
  return [item.category, item.year].filter(Boolean).join(" · ");
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  // Read the dictionary here rather than accept strings as props: the photo
  // count is a function, which cannot cross the server/client boundary.
  const { t } = useI18n();
  const strings = t.publicSite.gallery;
  const [filter, setFilter] = useState(ALL);
  const [openAlbum, setOpenAlbum] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
    () => (filter === ALL ? items : items.filter((a) => String(a.year) === filter)),
    [items, filter]
  );

  // One tile per category, covered by its first image and labelled with a count.
  const albums = useMemo<Album[]>(() => {
    const byCategory = new Map<string, GalleryItem[]>();
    for (const item of filtered) {
      const key = item.category?.trim() || UNCATEGORISED_LABEL;
      const bucket = byCategory.get(key);
      if (bucket) bucket.push(item);
      else byCategory.set(key, [item]);
    }
    return [...byCategory.entries()]
      .sort(([a], [b]) => compareCategories(a, b))
      .map(([category, list]) => ({ category, items: list, cover: list[0] }));
  }, [filtered]);

  const album = openAlbum
    ? (albums.find((a) => a.category === openAlbum) ?? null)
    : null;
  const lightboxItems = album?.items ?? [];
  const active = activeIndex != null ? (lightboxItems[activeIndex] ?? null) : null;

  const step = (dir: 1 | -1) => {
    setActiveIndex((i) => {
      if (i == null || lightboxItems.length === 0) return i;
      return (i + dir + lightboxItems.length) % lightboxItems.length;
    });
  };

  const closeLightbox = () => {
    setActiveIndex(null);
    setOpenAlbum(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ImageOff className="h-8 w-8 text-brand-brass-deep" aria-hidden />
        <p className="font-condensed text-sm uppercase tracking-wider text-brand-ink-muted">
          {strings.empty}
        </p>
      </div>
    );
  }

  return (
    <>
      {years.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip
            active={filter === ALL}
            variant="all"
            onClick={() => setFilter(ALL)}
          >
            {strings.allArchives}
          </FilterChip>
          {years.map((y, i) => (
            <FilterChip
              key={y}
              active={filter === String(y)}
              variant={i === 0 ? "latest" : "year"}
              onClick={() => setFilter(String(y))}
            >
              {y}
            </FilterChip>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((a, i) => (
          <motion.button
            key={a.category}
            type="button"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              ...mechanicalTransition,
              duration: 0.45,
              delay: Math.min(i, 8) * 0.04,
            }}
            onClick={() => {
              setOpenAlbum(a.category);
              setActiveIndex(0);
            }}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-black/5 bg-brand-parchment-2 text-left shadow-[0_2px_10px_rgba(20,26,20,0.10)] transition-all duration-300 ease-mechanical hover:-translate-y-1 hover:border-brand-brass-deep/50 hover:shadow-[0_16px_36px_rgba(20,26,20,0.22)]"
          >
            <Image
              src={a.cover.image}
              alt={a.category}
              fill
              className="object-cover transition-transform duration-500 ease-mechanical group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={i < 3 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-display text-base font-bold text-white drop-shadow-sm group-hover:text-brand-brass">
                {a.category}
              </h3>
              <p className="mt-1.5 flex items-center gap-1.5 font-condensed text-xs text-white/85">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                {strings.photos(a.items.length)}
              </p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-night/95 p-4"
            role="dialog"
            aria-modal
            aria-label={active.title}
            onClick={closeLightbox}
          >
            <button
              type="button"
              className="absolute right-4 top-4 p-2 text-white hover:text-brand-brass"
              onClick={closeLightbox}
              aria-label={strings.close}
            >
              <X size={28} />
            </button>

            {lightboxItems.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-brand-brass"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label={strings.previous}
                >
                  <ChevronLeft size={34} />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-brand-brass"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label={strings.next}
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
                className="overflow-hidden border border-brand-brass/25"
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
                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-brand-khaki">
                  {metaLine(active)}
                </p>
              ) : null}
              <p className="mt-2 text-center font-display text-lg font-bold uppercase text-white">
                {active.title}
              </p>
              {active.caption ? (
                <p className="mx-auto mt-1 max-w-2xl text-center font-condensed text-sm text-brand-sand">
                  {active.caption}
                </p>
              ) : null}
              {lightboxItems.length > 1 ? (
                <p className="mt-3 text-center font-mono text-[10px] tracking-[0.18em] text-white/45">
                  {activeIndex! + 1} / {lightboxItems.length}
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
  variant,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  variant: "all" | "latest" | "year";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-4 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider transition-all duration-200",
        active
          ? "border-brand-olive-dark bg-brand-olive-dark text-white shadow-sm"
          : variant === "latest"
            ? "border-brand-brass-deep/45 bg-transparent text-brand-brass-deep hover:border-brand-brass-deep hover:bg-brand-brass-deep/10"
            : "border-brand-line bg-transparent text-brand-ink-muted hover:border-brand-olive/45 hover:text-brand-ink"
      )}
    >
      {children}
    </button>
  );
}
