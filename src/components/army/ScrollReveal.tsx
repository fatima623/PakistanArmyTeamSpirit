"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.classList.add("visible", "in-view");
      return;
    }

    const showIfInView = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("visible", "in-view");
        return true;
      }
      return false;
    };

    if (showIfInView()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const reveal = () => {
            el.classList.add("visible", "in-view");
          };
          if (delay > 0) {
            setTimeout(reveal, delay);
          } else {
            reveal();
          }
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "reveal animate-on-scroll",
        delay >= 360 && "reveal-delay-3",
        delay >= 240 && delay < 360 && "reveal-delay-2",
        delay >= 120 && delay < 240 && "reveal-delay-1",
        className
      )}
    >
      {children}
    </Tag>
  );
}
