"use client";

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 5500;

type Props = {
  children: ReactNode;
  /** Accessible name for the card list */
  ariaLabel: string;
  /** Auto-scroll interval in ms; 0 disables */
  autoPlayMs?: number;
  className?: string;
};

/**
 * Horizontal forest-card track — arrows only when slides overflow one row.
 * Use for any group of 2+ mission/pillar/forest cards sitewide.
 */
export function ForestCardCarousel({
  children,
  ariaLabel,
  autoPlayMs = AUTO_ADVANCE_MS,
  className,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const items = Children.toArray(children).filter(Boolean) as ReactElement[];
  const showArrows = overflows && items.length >= 2;

  const getScrollStep = useCallback(() => {
    const el = trackRef.current;
    if (!el?.firstElementChild) return 0;
    const child = el.firstElementChild as HTMLElement;
    const gap = Number.parseFloat(getComputedStyle(el).gap) || 16;
    return child.offsetWidth + gap;
  }, []);

  const getActiveIndex = useCallback(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) return 0;
    const step = getScrollStep();
    if (step <= 0) return 0;
    const raw = Math.round(el.scrollLeft / step);
    return ((raw % items.length) + items.length) % items.length;
  }, [getScrollStep, items.length]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = trackRef.current;
      if (!el || items.length === 0) return;
      const normalized = ((index % items.length) + items.length) % items.length;
      const slide = el.children[normalized] as HTMLElement | undefined;
      if (slide) {
        el.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      }
    },
    [items.length]
  );

  const scrollByStep = useCallback(
    (direction: -1 | 1) => {
      const current = getActiveIndex();
      scrollToIndex(current + direction);
    },
    [getActiveIndex, scrollToIndex]
  );

  const scrollNext = useCallback(() => {
    scrollByStep(1);
  }, [scrollByStep]);

  const measureOverflow = useCallback(() => {
    const el = trackRef.current;
    if (!el || items.length < 2) {
      setOverflows(false);
      return;
    }
    setOverflows(el.scrollWidth > el.clientWidth + 2);
  }, [items.length]);

  useLayoutEffect(() => {
    measureOverflow();
    const el = trackRef.current;
    if (!el) return;

    const ro = new ResizeObserver(measureOverflow);
    ro.observe(el);
    const shell = el.parentElement;
    if (shell) ro.observe(shell);

    window.addEventListener("resize", measureOverflow, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureOverflow);
    };
  }, [measureOverflow, items.length]);

  useLayoutEffect(() => {
    measureOverflow();
  }, [measureOverflow, showArrows]);

  useEffect(() => {
    if (autoPlayMs <= 0 || paused || items.length < 2 || !overflows) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(scrollNext, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, paused, scrollNext, items.length, overflows]);

  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div
        className={cn(
          "forest-carousel forest-carousel--single mx-auto w-full max-w-[min(100%,20rem)]",
          className
        )}
      >
        <div className="forest-carousel__slide" role="listitem">
          {items[0]}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "forest-carousel",
        !showArrows && "forest-carousel--fits",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {showArrows ? (
        <CarouselArrow direction="prev" onClick={() => scrollByStep(-1)} />
      ) : null}

      <div
        ref={trackRef}
        className={cn(
          "forest-carousel__track min-w-0",
          !showArrows && "forest-carousel__track--centered"
        )}
        role="list"
        aria-label={ariaLabel}
        tabIndex={showArrows ? 0 : undefined}
        onKeyDown={
          showArrows
            ? (e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  scrollByStep(-1);
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  scrollByStep(1);
                }
              }
            : undefined
        }
      >
        {items.map((child, index) => (
          <div
            key={child.key ?? `forest-slide-${index}`}
            role="listitem"
            className="forest-carousel__slide"
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows ? (
        <CarouselArrow direction="next" onClick={() => scrollByStep(1)} />
      ) : null}
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label =
    direction === "prev" ? "Previous cards" : "Next cards";

  return (
    <button
      type="button"
      className={cn(
        "forest-carousel__arrow shrink-0",
        direction === "prev"
          ? "forest-carousel__arrow--prev"
          : "forest-carousel__arrow--next"
      )}
      onClick={onClick}
      aria-label={label}
    >
      <Icon aria-hidden />
    </button>
  );
}
