"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const QUOTES = [
  "With faith, discipline, and selfless devotion to duty, there is nothing worthwhile that you cannot achieve.",
  "There is no power on earth that can undo Pakistan.",
  "Think 100 times before you take a decision, but once that decision is taken, stand by it as one man.",
  "No struggle can ever succeed without women participating side by side with men.",
  "We are now all Pakistanis — not Baluchis, Pathans, Sindhis, Bengalis — and we should be proud to be known as Pakistanis.",
];

const ATTRIBUTION = "Quaid-e-Azam Muhammad Ali Jinnah";
const CYCLE_MS = 4000;
const TRANSITION_MS = 700;

/** Strip stray leading/trailing quote characters from copy (not part of the spoken line). */
function stripSurroundingQuotes(text: string): string {
  return text.replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "");
}

export function QuaidQuoteSection() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let exitTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setExiting(true);
      exitTimeout = setTimeout(() => {
        setCurrent((c) => (c + 1) % QUOTES.length);
        setExiting(false);
      }, TRANSITION_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(interval);
      if (exitTimeout) clearTimeout(exitTimeout);
    };
  }, []);

  return (
    <section
      className="quaid-quote-strip"
      aria-label="Quaid-e-Azam quotes"
      aria-live="polite"
    >
      <div className="quaid-quote-strip__stage">
        {QUOTES.map((quote, i) => (
          <p
            key={quote}
            className={cn(
              "quote-slide",
              i === current && !exiting && "active",
              i === current && exiting && "exit"
            )}
          >
            {stripSurroundingQuotes(quote)}
          </p>
        ))}
      </div>
      <p className="quaid-strip-attribution">— {ATTRIBUTION}</p>
    </section>
  );
}
