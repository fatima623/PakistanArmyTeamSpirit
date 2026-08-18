"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  COUNTRY_NAME_TO_ISO2,
  normalizeCountryKey,
} from "@/lib/country-iso";

/** One country's team count for the selected year (or year range). */
export type MapDatum = {
  iso2: string;
  name: string;
  count: number;
  /** Editions this country took part in, newest first. */
  years: number[];
};

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/**
 * Palette. The admin shell is a light, green-accented theme (green sidebar,
 * `--admin-accent`), so the map is painted in that family rather than the
 * slate/blue choropleth it used to carry. Colors stay in rgb() form for the
 * "no raw hex in .tsx" guardrail.
 */
const IDLE_FILL = "rgb(232,238,229)";
const IDLE_STROKE = "rgb(255,255,255)";
const OCEAN = "rgb(246,249,244)";
/** Green base behind every flag so a missing/slow image still reads as taking part. */
const PARTICIPANT_GREEN = "rgb(61,82,48)";
const PARTICIPANT_STROKE = "rgb(47,64,37)";
const SELECT_STROKE = "rgb(184,148,31)";

type Tooltip = { x: number; y: number; datum: MapDatum };

/** Union bounding box of a country's paths, or null when it can't be measured. */
function unionBox(
  paths: SVGPathElement[]
): { x: number; y: number; w: number; h: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of paths) {
    const b = p.getBBox();
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { x: minX, y: minY, w, h };
}

/** Fill the union bounding box of a country's paths with its flag image. */
function buildFlagPattern(
  defs: SVGDefsElement,
  id: string,
  paths: SVGPathElement[],
  flagUrl: string
): boolean {
  const box = unionBox(paths);
  if (!box) return false;

  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", id);
  pattern.setAttribute("data-intl-flag", "true");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("x", `${box.x}`);
  pattern.setAttribute("y", `${box.y}`);
  pattern.setAttribute("width", `${box.w}`);
  pattern.setAttribute("height", `${box.h}`);

  const bg = document.createElementNS(SVG_NS, "rect");
  bg.setAttribute("width", `${box.w}`);
  bg.setAttribute("height", `${box.h}`);
  bg.setAttribute("fill", PARTICIPANT_GREEN);
  pattern.appendChild(bg);

  const img = document.createElementNS(SVG_NS, "image");
  img.setAttribute("href", flagUrl);
  img.setAttributeNS(XLINK_NS, "href", flagUrl);
  img.setAttribute("width", `${box.w}`);
  img.setAttribute("height", `${box.h}`);
  img.setAttribute("preserveAspectRatio", "xMidYMid slice");
  pattern.appendChild(img);

  defs.appendChild(pattern);
  return true;
}

export function ParticipationWorldMap({
  data,
  label,
  selectedName,
  onSelect,
}: {
  data: MapDatum[];
  /** Period the map is showing, e.g. "2026" or "2016–2026". */
  label: string;
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

    let defs = svgEl.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVG_NS, "defs");
      svgEl.prepend(defs);
    }
    // Drop the previous year's flag patterns before repainting.
    defs.querySelectorAll("[data-intl-flag]").forEach((n) => n.remove());

    const byIso = new Map<string, MapDatum>();
    const byName = new Map<string, MapDatum>();
    for (const d of data) {
      if (d.iso2) byIso.set(d.iso2.toUpperCase(), d);
      byName.set(normalizeCountryKey(d.name), d);
    }

    const paths = Array.from(svgEl.querySelectorAll<SVGPathElement>("path"));
    const cleanups: Array<() => void> = [];

    // Group every matched path by country so one flag pattern spans all of a
    // nation's islands and exclaves instead of repeating per shape.
    const grouped = new Map<
      string,
      { datum: MapDatum; iso: string; paths: SVGPathElement[] }
    >();

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
        p.setAttribute("fill", IDLE_FILL);
        p.setAttribute("fill-opacity", "1");
        p.setAttribute("stroke", IDLE_STROKE);
        p.style.cursor = "default";
        p.style.filter = "";
        p.removeAttribute("tabindex");
        p.removeAttribute("role");
        p.removeAttribute("aria-label");
        continue;
      }

      const key = iso || nameKey;
      const entry = grouped.get(key) ?? { datum: match, iso, paths: [] };
      entry.paths.push(p);
      grouped.set(key, entry);
    }

    for (const [key, { datum, iso, paths: cps }] of grouped) {
      let fill = PARTICIPANT_GREEN;
      if (iso) {
        const patternId = `admin-flag-${key}`;
        if (
          buildFlagPattern(
            defs as SVGDefsElement,
            patternId,
            cps,
            `/flags/${iso.toLowerCase()}.png`
          )
        ) {
          fill = `url(#${patternId})`;
        }
      }

      const isSelected = datum.name === selectedName;

      for (const p of cps) {
        p.setAttribute("fill", fill);
        p.setAttribute("fill-opacity", "1");
        p.setAttribute("stroke", isSelected ? SELECT_STROKE : PARTICIPANT_STROKE);
        p.setAttribute("stroke-width", isSelected ? "1.2" : "0.5");
        p.style.cursor = "pointer";
        p.style.filter = isSelected ? "brightness(1.12)" : "";
        p.setAttribute("tabindex", "0");
        p.setAttribute("role", "button");
        p.setAttribute(
          "aria-label",
          `${datum.name}: ${datum.count} team${
            datum.count === 1 ? "" : "s"
          } in ${label}`
        );

        const place = (clientX: number, clientY: number) => {
          const stage = stageRef.current?.getBoundingClientRect();
          if (!stage) return;
          setTooltip({ x: clientX - stage.left, y: clientY - stage.top, datum });
        };
        const onEnter = (e: Event) => {
          if (!isSelected) p.style.filter = "brightness(1.14)";
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
        const onFocus = () => {
          const b = p.getBoundingClientRect();
          place(b.left + b.width / 2, b.top);
        };
        const onClick = () => onSelect(datum.name);
        const onKey = (e: Event) => {
          const ke = e as KeyboardEvent;
          if (ke.key === "Enter" || ke.key === " ") {
            ke.preventDefault();
            onSelect(datum.name);
          }
        };

        p.addEventListener("mouseenter", onEnter);
        p.addEventListener("mousemove", onMove);
        p.addEventListener("mouseleave", onLeave);
        p.addEventListener("focus", onFocus);
        p.addEventListener("blur", onLeave);
        p.addEventListener("click", onClick);
        p.addEventListener("keydown", onKey);
        cleanups.push(() => {
          p.removeEventListener("mouseenter", onEnter);
          p.removeEventListener("mousemove", onMove);
          p.removeEventListener("mouseleave", onLeave);
          p.removeEventListener("focus", onFocus);
          p.removeEventListener("blur", onLeave);
          p.removeEventListener("click", onClick);
          p.removeEventListener("keydown", onKey);
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [svgReady, data, selectedName, onSelect, label]);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return (
    <div className="intl-map">
      <div
        ref={stageRef}
        onMouseLeave={hideTooltip}
        className="intl-map__stage"
        style={{ background: OCEAN }}
      >
        <div
          ref={containerRef}
          className="intl-map__svg"
          aria-label={`World map of participating nations in ${label}`}
          role="img"
        />

        {/* Legend — flags mark participants, so the key explains the two states. */}
        <div className="intl-map__legend">
          <span className="intl-map__legend-row">
            <span className="intl-map__legend-swatch intl-map__legend-swatch--on" />
            Participating nation
          </span>
          <span className="intl-map__legend-row">
            <span className="intl-map__legend-swatch intl-map__legend-swatch--off" />
            No participation
          </span>
        </div>

        {tooltip ? (
          <div
            className="intl-map__tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
            role="tooltip"
          >
            <p className="intl-map__tooltip-title">{tooltip.datum.name}</p>
            <p className="intl-map__tooltip-meta">
              {tooltip.datum.count} team{tooltip.datum.count === 1 ? "" : "s"} ·{" "}
              {label}
            </p>
            {tooltip.datum.years.length > 1 ? (
              <p className="intl-map__tooltip-years">
                Editions: {tooltip.datum.years.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
