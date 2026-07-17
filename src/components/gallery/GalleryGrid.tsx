"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageIcon, ImageOff, X } from "lucide-react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import { compareCategories, UNCATEGORISED_LABEL } from "@/lib/gallery-categories";
import { translateGalleryCategory } from "@/lib/i18n/gallery-category-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
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

function metaLine(item: GalleryItem, locale: Locale): string {
  const category = item.category
    ? translateGalleryCategory(item.category, locale)
    : null;
  return [category, item.year].filter(Boolean).join(" · ");
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  // Read the dictionary here rather than accept strings as props: the photo
  // count is a function, which cannot cross the server/client boundary.
  const { t, locale } = useI18n();
  const strings = t.publicSite.gallery;
  const [filter, setFilter] = useState(ALL);
  const [openAlbum, setOpenAlbum] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

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

  const isOpen = activeIndex != null;

  // The overlay declares `aria-modal`, which tells assistive tech the rest of
  // the page does not exist — so focus must actually be moved in, trapped, and
  // handed back, and the background must not scroll. Keyed on `isOpen` rather
  // than `activeIndex` so paging through the album does not steal focus back to
  // the close button on every arrow press.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [isOpen]);

  // Keyboard control for the lightbox: Escape closes, arrows page through the
  // album, Tab cycles within the overlay. Arrow direction stays physical (and
  // so matches the chevron icons) rather than flipping under RTL.
  useEffect(() => {
    if (activeIndex == null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "Tab") {
        const root = overlayRef.current;
        if (!root) return;
        const focusable = [
          ...root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ),
        ];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;
        const inside = current instanceof Node && root.contains(current);
        if (e.shiftKey) {
          if (!inside || current === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (!inside || current === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (lightboxItems.length < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, lightboxItems.length]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ImageOff className="h-8 w-8 text-brand-brass" aria-hidden />
        <p className="font-condensed text-sm uppercase tracking-wider text-brand-sand">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {albums.map((a, i) => (
          // The reveal lives on a wrapper, not on the button: framer-motion
          // writes an inline `transform` (and settles on `transform: none`),
          // which would outrank the button's CSS hover lift.
          <motion.div
            key={a.category}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              ...mechanicalTransition,
              duration: 0.45,
              delay: Math.min(i, 8) * 0.04,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpenAlbum(a.category);
                setActiveIndex(0);
              }}
              className="group relative flex aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-brand-night/40 text-left shadow-[0_2px_10px_rgba(20,26,20,0.10)] transition-[transform,box-shadow,border-color] duration-300 ease-mechanical focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-brass motion-safe:hover:-translate-y-1 hover:border-brand-brass/50 hover:shadow-[0_16px_36px_rgba(0,0,0,0.38)]"
            >
              <Image
                src={a.cover.image}
                alt={translateGalleryCategory(a.category, locale)}
                fill
                className="transform-gpu object-cover transition-transform duration-300 ease-mechanical motion-safe:group-hover:scale-[1.05]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading={i < 4 ? "eager" : "lazy"}
              />
              {/* Footer-style caption band, pinned to the bottom of the tile: the
                  scrim only covers the caption instead of washing the whole photo.
                  `pats-gallery-tile` opts this band out of the day-theme text
                  overrides that `.pats-section--navy` would otherwise apply — the
                  caption sits on a near-black scrim and must stay white in both
                  themes (see globals.css). */}
              <div className="pats-gallery-tile absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent pt-10 transition-[padding] duration-300 ease-mechanical group-hover:pt-14">
                <div className="p-4">
                  <h3 className="font-display text-base font-bold uppercase leading-tight tracking-wide text-white transition-colors duration-300 group-hover:text-brand-brass">
                    {translateGalleryCategory(a.category, locale)}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1.5 font-condensed text-xs text-white/85">
                    <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {strings.photos(a.items.length)}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="pats-gallery-tile fixed inset-0 z-[100] flex items-center justify-center bg-brand-night/95 p-4"
            role="dialog"
            aria-modal
            aria-label={active.title}
            onClick={closeLightbox}
            ref={overlayRef}
          >
            <button
              type="button"
              ref={closeButtonRef}
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
              {metaLine(active, locale) ? (
                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-brand-khaki">
                  {metaLine(active, locale)}
                </p>
              ) : null}
              <p className="mt-2 text-center font-display text-lg font-bold uppercase text-white">
                {active.title}
              </p>
              {active.caption ? (
                <p className="mx-auto mt-1.5 max-w-2xl text-center font-condensed text-sm leading-relaxed text-white/85">
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
        "rounded-md border px-4 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider transition-[background-color,border-color,color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-brass",
        active
          ? "border-brand-olive-dark bg-brand-olive-dark text-white shadow-sm"
          : variant === "latest"
            ? "border-brand-brass/45 bg-transparent text-brand-brass hover:border-brand-brass hover:bg-brand-brass/10"
            : "border-white/15 bg-transparent text-brand-sand hover:border-brand-brass/45 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
