"use client";

import { useEffect, useRef, useState } from "react";

import {
  COUNTRY_NAME_TO_ISO2,
  normalizeCountryKey,
} from "@/lib/country-iso";

/** One country's team count for the selected year. */
export type MapDatum = { iso2: string; name: string; count: number };

/** Choropleth buckets — matches the legend, magenta (highest) → blue (lowest). */
const BUCKETS = [
  { min: 100, label: "100+", color: "rgb(214,93,196)" },
  { min: 51, label: "51–100", color: "rgb(150,96,214)" },
  { min: 21, label: "21–50", color: "rgb(88,101,214)" },
  { min: 11, label: "11–20", color: "rgb(56,116,222)" },
  { min: 1, label: "1–10", color: "rgb(45,96,168)" },
  { min: 0, label: "0", color: "rgb(31,42,66)" },
] as const;

const BASE_FILL = "rgb(31,42,66)";
const BASE_STROKE = "rgba(148,163,190,0.18)";
const SELECT_STROKE = "rgb(230,207,127)";

function bucketColor(count: number): string {
  for (const b of BUCKETS) {
    if (count >= b.min) return b.color;
  }
  return BASE_FILL;
}

type Tooltip = { x: number; y: number; name: string; count: number };

export function ParticipationWorldMap({
  data,
  year,
  selectedName,
  onSelect,
}: {
  data: MapDatum[];
  year: number;
  selectedName: string | null;
  onSelect: (name: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svgReady, setSvgReady] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const injectedRef = useRef(false);

  // Load + inject the world SVG once.
  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;
    fetch("/world.svg")
      .then((r) => r.text())
      .then((svg) => {
        const cleaned = svg.replace(
          /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
          ""
        );
        if (containerRef.current) {
          containerRef.current.innerHTML = cleaned;
          const el = containerRef.current.querySelector("svg");
          if (el) {
            el.setAttribute("width", "100%");
            el.setAttribute("height", "100%");
            el.setAttribute("preserveAspectRatio", "xMidYMid meet");
          }
          setSvgReady(true);
        }
      })
      .catch(() => {});
  }, []);

  // Paint countries whenever the data, selection or SVG readiness changes.
  useEffect(() => {
    if (!svgReady || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;

    const byIso = new Map<string, MapDatum>();
    const byName = new Map<string, MapDatum>();
    for (const d of data) {
      if (d.iso2) byIso.set(d.iso2.toUpperCase(), d);
      byName.set(normalizeCountryKey(d.name), d);
    }

    const paths = Array.from(svgEl.querySelectorAll<SVGPathElement>("path"));
    const cleanups: Array<() => void> = [];

    for (const p of paths) {
      const id = (p.id || "").toUpperCase();
      const nameKey = normalizeCountryKey(
        p.getAttribute("class") || p.getAttribute("name") || ""
      );
      const iso = /^[A-Z]{2}$/.test(id) ? id : COUNTRY_NAME_TO_ISO2[nameKey] || "";
      const match = (iso && byIso.get(iso)) || byName.get(nameKey);

      p.setAttribute("stroke-width", "0.4");
      p.setAttribute("stroke-linejoin", "round");
      p.style.transition = "filter 120ms ease";

      if (!match) {
        p.setAttribute("fill", BASE_FILL);
        p.setAttribute("stroke", BASE_STROKE);
        p.style.cursor = "default";
        p.style.filter = "";
        continue;
      }

      const isSelected = match.name === selectedName;
      p.setAttribute("fill", bucketColor(match.count));
      p.setAttribute("stroke", isSelected ? SELECT_STROKE : "rgba(9,13,24,0.55)");
      p.setAttribute("stroke-width", isSelected ? "1.1" : "0.5");
      p.style.cursor = "pointer";
      p.style.filter = isSelected ? "brightness(1.18)" : "";
      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "button");
      p.setAttribute(
        "aria-label",
        `${match.name}: ${match.count} team${match.count === 1 ? "" : "s"} in ${year}`
      );

      const place = (clientX: number, clientY: number) => {
        const stage = stageRef.current?.getBoundingClientRect();
        if (!stage) return;
        setTooltip({
          x: clientX - stage.left,
          y: clientY - stage.top,
          name: match.name,
          count: match.count,
        });
      };
      const onEnter = (e: Event) => {
        if (!isSelected) p.style.filter = "brightness(1.22)";
        const me = e as MouseEvent;
        place(me.clientX, me.clientY);
      };
      const onMove = (e: Event) => {
        const me = e as MouseEvent;
        place(me.clientX, me.clientY);
      };
      const onLeave = () => {
        if (!isSelected) p.style.filter = "";
        setTooltip(null);
      };
      const onClick = () => onSelect(match.name);
      const onKey = (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") {
          ke.preventDefault();
          onSelect(match.name);
        }
      };

      p.addEventListener("mouseenter", onEnter);
      p.addEventListener("mousemove", onMove);
      p.addEventListener("mouseleave", onLeave);
      p.addEventListener("click", onClick);
      p.addEventListener("keydown", onKey);
      cleanups.push(() => {
        p.removeEventListener("mouseenter", onEnter);
        p.removeEventListener("mousemove", onMove);
        p.removeEventListener("mouseleave", onLeave);
        p.removeEventListener("click", onClick);
        p.removeEventListener("keydown", onKey);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [svgReady, data, selectedName, onSelect, year]);

  return (
    <div className="relative">
      <div
        ref={stageRef}
        className="relative h-[300px] w-full overflow-hidden sm:h-[360px] lg:h-[420px]"
      >
        <div
          ref={containerRef}
          className="h-full w-full"
          aria-label={`World map of participating nations in ${year}`}
          role="img"
        />

        {/* Legend */}
        <div
          className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-lg px-2.5 py-2"
          style={{
            background: "rgba(9,13,24,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {BUCKETS.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ background: b.color }}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: "rgb(148,163,190)" }}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {tooltip ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-lg px-2.5 py-1.5"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              background: "rgb(17,23,40)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            }}
          >
            <p
              className="text-[12px] font-semibold leading-tight"
              style={{ color: "rgb(236,240,248)" }}
            >
              {tooltip.name}
            </p>
            <p
              className="text-[11px] font-medium leading-tight"
              style={{ color: "rgb(120,180,255)" }}
            >
              {tooltip.count} team{tooltip.count === 1 ? "" : "s"} · {year}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
