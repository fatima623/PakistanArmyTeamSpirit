"use client";

import { useId, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

/**
 * The answers a participant would otherwise raise a query for.
 *
 * Presented the way a search result's FAQ block is: a plain stack of questions
 * that each drop open to reveal the answer, one at a time, with the rest
 * staying in view. It sits above the ticket list so the common questions are
 * answered before anyone writes one in.
 *
 * The open panel animates on `grid-template-rows` (`0fr` → `1fr`) rather than a
 * measured pixel height, so an answer of any length opens smoothly and the
 * collapsed panel is genuinely zero-height.
 */
export function FaqAccordion({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: FaqItem[];
}) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-start gap-2.5">
        <HelpCircle
          className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-emerald-600"
          aria-hidden
        />
        <div className="min-w-0">
          <h2 className="m-0 text-[1.05rem] font-bold leading-[1.3] tracking-[-0.01em] text-slate-800">
            {title}
          </h2>
          {subtitle ? (
            <p className="m-0 mt-0.5 text-[0.82rem] leading-[1.5] !text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <ul className="m-0 flex list-none flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        {items.map((item, i) => {
          const open = openIndex === i;
          const panelId = `${baseId}-faq-panel-${i}`;
          const buttonId = `${baseId}-faq-button-${i}`;

          return (
            <li
              key={item.q}
              className={cn(
                "border-slate-200",
                i > 0 && "border-t"
              )}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 bg-transparent px-4 py-3 text-start transition-colors hover:bg-slate-50",
                    open && "bg-slate-50/70"
                  )}
                >
                  <span className="text-[0.9rem] font-semibold leading-[1.4] text-slate-800">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                      open && "rotate-180 text-emerald-600"
                    )}
                    aria-hidden
                  />
                </button>
              </h3>

              {/* `aria-hidden` rather than `hidden`, which would kill the open
                  animation. The panel holds text only, so taking it out of the
                  a11y tree while collapsed costs nothing reachable. */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!open}
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="m-0 whitespace-pre-line px-4 pb-3.5 text-[0.85rem] leading-[1.6] !text-slate-600">
                    {item.a}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
