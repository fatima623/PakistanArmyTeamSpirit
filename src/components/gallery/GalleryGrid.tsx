"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff, Play, X, ArrowLeft } from "lucide-react";

import { compareCategories, UNCATEGORISED_LABEL } from "@/lib/gallery-categories";
import { translateGalleryCategory } from "@/lib/i18n/gallery-category-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useSiteTheme } from "@/components/theme/SiteThemeProvider";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const ALL = "all";
const MEDIA_IMAGES = "images";
const MEDIA_VIDEOS = "videos";

type MediaFilter = typeof MEDIA_IMAGES | typeof MEDIA_VIDEOS;

export type GalleryItem = {
  id: string;
  title: string;
  year: number | null;
  /** The media URL — a still for "image" items, the video file for "video". */
  image: string;
  /** Absent on legacy/static rows, which are always stills. */
  mediaType?: "image" | "video" | null;
  /** Poster frame for video items; null means "let the browser show frame 0". */
  poster?: string | null;
  caption?: string | null;
  category?: string | null;
};

function isVideo(item: GalleryItem): boolean {
  return item.mediaType === "video";
}

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
  const { dayTheme } = useSiteTheme();
  const strings = t.publicSite.gallery;
  const [filter, setFilter] = useState(ALL);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>(MEDIA_IMAGES);
  const [openAlbum, setOpenAlbum] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const rightSecRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const mediaTabsRef = useRef<HTMLDivElement>(null);



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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Default to the first album if the selectedCategory is null or no longer exists
  const activeCategory = useMemo(() => {
    if (albums.length === 0) return null;
    const found = albums.find((a) => a.category === selectedCategory);
    return found || albums[0];
  }, [albums, selectedCategory]);

  const activeMediaItems = useMemo(
    () =>
      activeCategory?.items.filter((item) =>
        mediaFilter === MEDIA_VIDEOS ? isVideo(item) : !isVideo(item)
      ) ?? [],
    [activeCategory, mediaFilter]
  );

  // Reset selected image index when category changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [activeCategory?.category]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [mediaFilter, activeCategory?.category]);

  useEffect(() => {
    if (sidebarRef.current) sidebarRef.current.style.setProperty("border-radius", "8px", "important");
    if (rightSecRef.current) rightSecRef.current.style.setProperty("border-radius", "8px", "important");
    if (imageFrameRef.current) imageFrameRef.current.style.setProperty("border-radius", "8px", "important");

    // Force active sidebar category button, text, and badge count to be gold in both themes
    const activeBtn = sidebarRef.current?.querySelector(".bg-brand-olive-dark") as HTMLButtonElement | null;
    if (activeBtn) {
      activeBtn.style.setProperty("color", "var(--pats-gold)", "important");

      const activeSpan = activeBtn.querySelector("span:first-child") as HTMLSpanElement | null;
      if (activeSpan) {
        activeSpan.style.setProperty("color", "var(--pats-gold)", "important");
      }

      const activeBadge = activeBtn.querySelector("span:last-child") as HTMLSpanElement | null;
      if (activeBadge) {
        activeBadge.style.setProperty("color", "var(--pats-gold)", "important");
      }
    }

    // Same treatment for the Images/Videos media tabs: force the selected tab's
    // label + count gold (they sit on a dark background), and clear the forced
    // colour from the others so they revert to their default token when a
    // different tab is selected.
    const mediaButtons = mediaTabsRef.current?.querySelectorAll<HTMLButtonElement>("button");
    mediaButtons?.forEach((btn) => {
      const isActive = btn.getAttribute("aria-pressed") === "true";
      const label = btn.querySelector("span:first-child") as HTMLSpanElement | null;
      const badge = btn.querySelector("span:last-child") as HTMLSpanElement | null;
      for (const el of [btn, label, badge]) {
        if (!el) continue;
        if (isActive) {
          el.style.setProperty("color", "var(--pats-gold)", "important");
        } else {
          el.style.removeProperty("color");
        }
      }
    });
  }, [filter, openAlbum, activeIndex, activeCategory, mediaFilter]);

  const mediaTabs = [
    {
      key: MEDIA_IMAGES,
      label: strings.imagesTab,
      count: activeCategory?.items.filter((item) => !isVideo(item)).length ?? 0,
    },
    {
      key: MEDIA_VIDEOS,
      label: strings.videosTab,
      count: activeCategory?.items.filter((item) => isVideo(item)).length ?? 0,
    },
  ] as const;

  const cycleMainImage = (dir: 1 | -1) => {
    if (!activeCategory || activeMediaItems.length === 0) return;
    const len = activeMediaItems.length;
    setSelectedImageIndex((prev) => (prev + dir + len) % len);
  };

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
        <div className="mb-8 flex flex-wrap gap-2 -mt-4 sm:-mt-6">
          <FilterChip
            active={filter === ALL}
            onClick={() => setFilter(ALL)}
          >
            {strings.allArchives}
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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full">
        {/* Left Column: Sidebar */}
        <div
          ref={sidebarRef}
          className={cn(
            "w-full lg:w-72 shrink-0 border rounded-lg p-4 space-y-2",
            dayTheme
              ? "bg-white/80 border-brand-olive-dark/15 shadow-sm"
              : "bg-brand-night/40 border-white/10 shadow-[0_2px_10px_rgba(20,26,20,0.10)]"
          )}
        >
          <p className={cn(
            "font-condensed text-[10px] font-bold uppercase tracking-wider px-2 pb-2 border-b",
            dayTheme ? "text-brand-olive-dark/60 border-brand-olive-dark/10" : "text-brand-sand/55 border-white/5"
          )}>
            Categories
          </p>
          <div className="flex flex-col gap-1 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto pr-1">
            {albums.map((a) => {
              const isActiveCategory = activeCategory?.category === a.category;
              return (
                <button
                  key={a.category}
                  type="button"
                  onClick={() => setSelectedCategory(a.category)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-[2px] font-condensed text-xs font-bold uppercase tracking-wider text-left transition-all duration-300",
                    isActiveCategory
                      ? "bg-brand-olive-dark border border-brand-olive-dark"
                      : dayTheme
                        ? "bg-white border border-brand-olive-dark/15 text-brand-olive-dark hover:bg-brand-olive-dark/5 hover:border-brand-olive-dark/30"
                        : "bg-transparent border border-transparent text-brand-sand hover:bg-white/5 hover:border-white/10 hover:text-white"
                  )}
                  style={isActiveCategory ? { color: "var(--pats-gold)" } : undefined}
                >
                  <span
                    className={cn(
                      "truncate pr-2",
                      isActiveCategory
                        ? "text-[var(--pats-gold)]"
                        : dayTheme
                          ? "text-brand-olive-dark"
                          : "text-brand-sand"
                    )}
                    style={isActiveCategory ? { color: "var(--pats-gold)" } : undefined}
                  >
                    {translateGalleryCategory(a.category, locale)}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-mono rounded-full shrink-0",
                      isActiveCategory
                        ? "bg-brand-night/60"
                        : dayTheme
                          ? "bg-brand-olive-dark/10 text-brand-olive-dark/85"
                          : "bg-brand-night/40 text-brand-sand/75"
                    )}
                    style={isActiveCategory ? { color: "var(--pats-gold)" } : undefined}
                  >
                    {a.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Main View */}
        <div
          ref={rightSecRef}
          className={cn(
            "flex-1 w-full border rounded-lg p-5 lg:p-6 flex flex-col gap-5",
            dayTheme
              ? "bg-white/60 border-brand-olive-dark/15 shadow-sm"
              : "bg-brand-night/30 border-white/10 shadow-[0_2px_10px_rgba(20,26,20,0.10)]"
          )}
        >
          {activeCategory ? (
            <>
              {/* Category Header */}
              <div className={cn(
                "flex items-end justify-between border-b pb-4",
                dayTheme ? "border-brand-olive-dark/10" : "border-white/10"
              )}>
                <div>
                  <p className="font-condensed text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--pats-gold)]">
                    Selected Category
                  </p>
                  <h2 className={cn(
                    "font-display text-xl lg:text-2xl font-bold uppercase mt-1",
                    dayTheme ? "text-brand-olive-dark" : "text-[var(--pats-gold)]"
                  )}>
                    {translateGalleryCategory(activeCategory.category, locale)}
                  </h2>
                </div>
                {activeMediaItems.length > 1 ? (
                  <p className={cn(
                    "font-mono text-xs tracking-wider",
                    dayTheme ? "text-brand-olive-dark/60" : "text-brand-sand/60"
                  )}>
                    {selectedImageIndex + 1} / {activeMediaItems.length}
                  </p>
                ) : null}
              </div>

              <div ref={mediaTabsRef} className="mt-4 flex flex-wrap gap-2">
                {mediaTabs.map((tab) => {
                  const activeTab = mediaFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setMediaFilter(tab.key)}
                      aria-pressed={activeTab}
                      className={cn(
                        "inline-flex min-h-10 items-center justify-between gap-2 rounded-[2px] border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-wider transition-all duration-300",
                        activeTab
                          ? "border-brand-olive-dark bg-brand-olive-dark text-[var(--pats-gold)]"
                          : dayTheme
                            ? "border-brand-olive-dark/15 bg-white text-brand-olive-dark hover:border-brand-olive-dark/30 hover:bg-brand-olive-dark/5"
                            : "border-white/10 bg-transparent text-brand-sand hover:border-white/20 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-mono",
                          activeTab
                            ? "bg-brand-night/60 text-[var(--pats-gold)]"
                            : dayTheme
                              ? "bg-brand-olive-dark/10 text-brand-olive-dark/75"
                              : "bg-brand-night/40 text-brand-sand/70"
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Image Slider */}
              <div
                ref={imageFrameRef}
                className={cn(
                  "relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-black/40 border group/slider",
                  dayTheme ? "border-brand-olive-dark/10" : "border-white/5"
                )}
              >
                {activeMediaItems[selectedImageIndex] ? (
                  <>
                    {isVideo(activeMediaItems[selectedImageIndex]) ? (
                      // Video plays in place with native controls — wrapping it
                      // in the lightbox button would swallow every click on the
                      // scrubber and volume slider.
                      <video
                        key={activeMediaItems[selectedImageIndex].id}
                        src={activeMediaItems[selectedImageIndex].image}
                        poster={
                          activeMediaItems[selectedImageIndex].poster ??
                          undefined
                        }
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenAlbum(activeCategory.category);
                          setActiveIndex(selectedImageIndex);
                        }}
                        className="group/video relative h-full w-full cursor-pointer"
                      >
                        <Image
                          src={activeMediaItems[selectedImageIndex].image}
                          alt={activeMediaItems[selectedImageIndex].title}
                          fill
                          className="object-contain transition-transform duration-500 ease-mechanical hover:scale-[1.01]"
                          sizes="(max-width: 1024px) 100vw, 80vw"
                          priority
                        />
                        <span
                          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/45 opacity-90 transition-opacity duration-300 group-hover/video:opacity-100"
                          aria-hidden
                        />
                        <span
                          className="pointer-events-none absolute inset-0 grid place-items-center"
                          aria-hidden
                        >
                          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover/video:scale-105">
                            <Play className="ml-1 h-7 w-7 fill-current" />
                          </span>
                        </span>
                      </button>
                    )}

                    {activeMediaItems.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => cycleMainImage(-1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[var(--pats-gold)] text-white hover:text-black transition-all duration-300 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 focus:opacity-100"
                          aria-label={strings.previous}
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          type="button"
                          onClick={() => cycleMainImage(1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[var(--pats-gold)] text-white hover:text-black transition-all duration-300 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 focus:opacity-100"
                          aria-label={strings.next}
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-brand-sand/50">
                    <ImageOff size={32} />
                    <p className="font-condensed text-xs uppercase tracking-wider">
                      {mediaFilter === MEDIA_VIDEOS
                        ? strings.noVideosAvailable
                        : strings.noImagesAvailable}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Image Details */}
              {activeMediaItems[selectedImageIndex] && (
                <div className="flex flex-col gap-1 px-1">
                  {metaLine(activeMediaItems[selectedImageIndex], locale) ? (
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--pats-gold)]">
                      {metaLine(activeMediaItems[selectedImageIndex], locale)}
                    </p>
                  ) : null}
                  {/* <h3 className={cn(
                    "font-display text-base lg:text-lg font-bold uppercase leading-tight",
                    dayTheme ? "text-brand-olive-dark" : "text-white"
                  )}>
                    {activeCategory.items[selectedImageIndex].title}
                  </h3> */}
                  {activeMediaItems[selectedImageIndex].caption ? (
                    <p className={cn(
                      "font-condensed text-sm mt-1 leading-relaxed",
                      dayTheme ? "text-brand-olive-dark/85" : "text-brand-sand/85"
                    )}>
                      {activeMediaItems[selectedImageIndex].caption}
                    </p>
                  ) : null}
                </div>
              )}

              {/* Thumbnails Row */}
              {activeMediaItems.length > 1 ? (
                <div className={cn(
                  "flex flex-col gap-2 border-t pt-4",
                  dayTheme ? "border-brand-olive-dark/10" : "border-white/5"
                )}>
                  <p className={cn(
                    "font-condensed text-[10px] font-bold uppercase tracking-wider",
                    dayTheme ? "text-brand-olive-dark/50" : "text-brand-sand/40"
                  )}>
                    Select Image
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                    {activeMediaItems.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={cn(
                          "group/thumb relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:shadow-md",
                          selectedImageIndex === idx
                            ? "border-[var(--pats-gold)] opacity-100 scale-105"
                            : "border-transparent opacity-60 hover:opacity-90"
                        )}
                      >
                        {isVideo(item) ? (
                          <>
                            {item.poster ? (
                              <Image
                                src={item.poster}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <video
                                src={item.image}
                                muted
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            )}
                            <span
                              className="absolute inset-0 grid place-items-center bg-[linear-gradient(to_top,rgba(0,0,0,0.42),rgba(0,0,0,0.16))]"
                              aria-hidden
                            >
                              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white shadow-[0_6px_16px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover/thumb:scale-105">
                                <Play className="ml-0.5 h-4 w-4 fill-current drop-shadow" />
                              </span>
                            </span>
                          </>
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <ImageOff className="h-8 w-8 text-[var(--pats-gold)]" aria-hidden />
              <p className="font-condensed text-sm uppercase tracking-wider text-brand-sand/60">
                {strings.empty}
              </p>
            </div>
          )}
        </div>
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
              className="absolute left-4 top-4 p-2 text-white hover:text-brand-brass transition-colors duration-200"
              onClick={closeLightbox}
              aria-label="Back to gallery"
            >
              <ArrowLeft size={28} />
            </button>

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-brand-brass "
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
              initial={reduce ? false : { y: 24, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[92vh] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="overflow-hidden border border-brand-brass/25"
                style={{ borderRadius: "2px" }}
              >
                {isVideo(active) ? (
                  <video
                    src={active.image}
                    poster={active.poster ?? undefined}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[80vh] w-auto object-contain"
                  />
                ) : (
                  <Image
                    src={active.image}
                    alt={active.title}
                    width={1600}
                    height={1200}
                    className="max-h-[80vh] w-auto object-contain"
                  />
                )}
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
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-[2px] border px-4 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-brass hover:scale-[1.02] hover:shadow-sm"
      style={
        active
          ? {
            color: "var(--pats-gold)",
            backgroundColor: isHovered ? "rgba(47, 64, 37, 0.9)" : "rgb(47, 64, 37)",
            borderColor: isHovered ? "rgba(47, 64, 37, 0.9)" : "rgb(47, 64, 37)",
          }
          : {
            color: "var(--pats-gold)",
            backgroundColor: isHovered ? "rgba(200, 168, 75, 0.1)" : "transparent",
            borderColor: isHovered ? "var(--pats-gold)" : "rgba(200, 168, 75, 0.45)",
          }
      }
    >
      {children}
    </button>
  );
}
