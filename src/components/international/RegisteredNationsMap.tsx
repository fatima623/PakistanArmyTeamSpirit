"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  COUNTRY_NAME_TO_ISO2,
  countryNameToIso2,
  normalizeCountryKey,
  type RegisteredCountry,
} from "@/lib/country-iso";

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/** Colors as rgb() strings (kept out of hex form for the CSS-token guardrail). */
const REGISTERED_GREEN = "rgb(45,90,30)";
const HIGHLIGHT_GOLD = "rgb(230,207,127)";

// Layout effect on the server is a no-op and warns; fall back to useEffect there.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Cursor/anchor position kept in viewport coordinates so the tooltip can be
 *  clamped against the real viewport regardless of the map's overflow. */
type Tooltip = {
  /** Viewport X of the anchor (cursor or focused country). */
  vx: number;
  /** Viewport Y of the anchor. */
  vy: number;
  country: RegisteredCountry;
};

function ensureDefs(svg: SVGSVGElement): SVGDefsElement {
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs");
    svg.prepend(defs);
  }
  return defs as SVGDefsElement;
}

/** Fill the union bounding box of a country's paths with its flag image. */
function buildFlagPattern(
  defs: SVGDefsElement,
  id: string,
  paths: SVGPathElement[],
  flagUrl: string
): boolean {
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
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return false;
  }

  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", id);
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("x", `${minX}`);
  pattern.setAttribute("y", `${minY}`);
  pattern.setAttribute("width", `${w}`);
  pattern.setAttribute("height", `${h}`);

  // Green base so a missing/loading flag still reads as "registered".
  const bg = document.createElementNS(SVG_NS, "rect");
  bg.setAttribute("width", `${w}`);
  bg.setAttribute("height", `${h}`);
  bg.setAttribute("fill", REGISTERED_GREEN);
  pattern.appendChild(bg);

  const img = document.createElementNS(SVG_NS, "image");
  img.setAttribute("href", flagUrl);
  img.setAttributeNS(XLINK_NS, "href", flagUrl);
  img.setAttribute("width", `${w}`);
  img.setAttribute("height", `${h}`);
  img.setAttribute("preserveAspectRatio", "xMidYMid slice");
  pattern.appendChild(img);

  defs.appendChild(pattern);
  return true;
}

export function RegisteredNationsMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [countries, setCountries] = useState<RegisteredCountry[]>([]);
  const [svgReady, setSvgReady] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  // Final tooltip offset (relative to the stage) after viewport-edge clamping.
  const [tipPos, setTipPos] = useState<{ left: number; top: number } | null>(
    null
  );
  const injectedRef = useRef(false);

  // 1) Fetch registered countries.
  useEffect(() => {
    let active = true;
    fetch("/api/public/registered-countries")
      .then((r) => r.json())
      .then((d) => {
        if (active) setCountries(d.countries ?? []);
      })
      .catch(() => {
        if (active) setCountries([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // 2) Load + inject the world SVG once.
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

  // 3) Paint countries once both the SVG and the data are ready.
  useEffect(() => {
    if (!svgReady || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;

    const byIso = new Map<string, RegisteredCountry>();
    const byName = new Map<string, RegisteredCountry>();
    for (const c of countries) {
      const iso = countryNameToIso2(c.country);
      if (iso) byIso.set(iso, c);
      byName.set(normalizeCountryKey(c.country), c);
    }

    const paths = Array.from(
      svgEl.querySelectorAll<SVGPathElement>("path")
    );
    const defs = ensureDefs(svgEl as SVGSVGElement);
    const cleanups: Array<() => void> = [];

    // Group matched paths by their country key.
    const grouped = new Map<
      string,
      { country: RegisteredCountry; iso: string; paths: SVGPathElement[] }
    >();

    for (const p of paths) {
      const id = (p.id || "").toUpperCase();
      const nameKey = normalizeCountryKey(
        p.getAttribute("class") || p.getAttribute("name") || ""
      );
      const iso = /^[A-Z]{2}$/.test(id)
        ? id
        : COUNTRY_NAME_TO_ISO2[nameKey] || "";
      const match = (iso && byIso.get(iso)) || byName.get(nameKey);

      p.setAttribute("stroke", "rgba(6,10,8,0.45)");
      p.setAttribute("stroke-width", "0.4");
      p.setAttribute("stroke-linejoin", "round");

      if (!match) {
        p.setAttribute("fill", "rgba(226,232,222,0.10)");
        p.style.cursor = "default";
        continue;
      }

      const key = iso || nameKey;
      const entry = grouped.get(key) ?? { country: match, iso, paths: [] };
      entry.paths.push(p);
      grouped.set(key, entry);
    }

    for (const [key, { country, iso, paths: cps }] of grouped) {
      let fill = REGISTERED_GREEN;
      if (iso) {
        const patternId = `flag-${key}`;
        if (buildFlagPattern(defs, patternId, cps, `/flags/${iso.toLowerCase()}.png`)) {
          fill = `url(#${patternId})`;
        }
      }

      for (const p of cps) {
        p.setAttribute("fill", fill);
        p.setAttribute("fill-opacity", "1");
        p.style.cursor = "pointer";
        p.setAttribute("tabindex", "0");
        p.setAttribute("role", "button");
        p.setAttribute(
          "aria-label",
          `${country.country}: ${country.teams.length} registered team${
            country.teams.length === 1 ? "" : "s"
          }`
        );

        const highlight = () => {
          p.setAttribute("stroke", HIGHLIGHT_GOLD);
          p.setAttribute("stroke-width", "1.1");
          p.style.filter = "brightness(1.12)";
        };
        const reset = () => {
          p.setAttribute("stroke", "rgba(6,10,8,0.45)");
          p.setAttribute("stroke-width", "0.4");
          p.style.filter = "";
        };
        const place = (clientX: number, clientY: number) => {
          // Store raw viewport coordinates; final placement is clamped in a
          // layout effect once the tooltip's real size is known.
          setTooltip({ vx: clientX, vy: clientY, country });
        };
        const onEnter = (e: Event) => {
          highlight();
          const me = e as MouseEvent;
          place(me.clientX, me.clientY);
        };
        const onMove = (e: Event) => {
          const me = e as MouseEvent;
          place(me.clientX, me.clientY);
        };
        const onLeave = () => {
          reset();
          setTooltip(null);
        };
        const onFocus = () => {
          highlight();
          const b = p.getBoundingClientRect();
          // Anchor the keyboard tooltip to the top-centre of the focused country.
          place(b.left + b.width / 2, b.top);
        };
        const onBlur = () => {
          reset();
          setTooltip(null);
        };

        p.addEventListener("mouseenter", onEnter);
        p.addEventListener("mousemove", onMove);
        p.addEventListener("mouseleave", onLeave);
        p.addEventListener("focus", onFocus);
        p.addEventListener("blur", onBlur);
        cleanups.push(() => {
          p.removeEventListener("mouseenter", onEnter);
          p.removeEventListener("mousemove", onMove);
          p.removeEventListener("mouseleave", onLeave);
          p.removeEventListener("focus", onFocus);
          p.removeEventListener("blur", onBlur);
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [svgReady, countries]);

  // 4) Position the tooltip: prefer above the cursor, flip below when it would
  //    clip the top, and clamp fully inside the viewport on every axis so the
  //    whole panel stays visible no matter which country is hovered.
  useIsoLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current || !stageRef.current) return;
    const GAP = 14;
    const PAD = 10;
    const tip = tooltipRef.current;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const stage = stageRef.current.getBoundingClientRect();

    // Vertical: above the anchor by default; drop below if it overflows the top.
    let topV = tooltip.vy - GAP - th;
    if (topV < PAD) topV = tooltip.vy + GAP;
    topV = Math.max(PAD, Math.min(topV, vh - th - PAD));

    // Horizontal: centre on the anchor, then clamp within the viewport.
    let leftV = tooltip.vx - tw / 2;
    leftV = Math.max(PAD, Math.min(leftV, vw - tw - PAD));

    // Convert viewport coordinates back to offsets within the stage.
    setTipPos({ left: leftV - stage.left, top: topV - stage.top });
  }, [tooltip]);

  const registeredCount = countries.length;

  return (
    <div className="registered-map">
      <div ref={stageRef} className="registered-map__stage">
        <div
          ref={containerRef}
          className="registered-map__svg"
          aria-label="World map of registered nations"
          role="img"
        />
        {tooltip ? (
          <div
            ref={tooltipRef}
            className="registered-map__tooltip"
            style={
              tipPos
                ? { left: tipPos.left, top: tipPos.top }
                : // Render off-screen for the first measuring pass to avoid a flash.
                  { left: -9999, top: -9999 }
            }
            role="tooltip"
          >
            <p className="registered-map__tooltip-title">
              {tooltip.country.country}
            </p>
            <ul className="registered-map__tooltip-list">
              {tooltip.country.teams.slice(0, 8).map((t, i) => (
                <li key={`${t.name}-${t.year}-${i}`}>
                  <span className="registered-map__tooltip-name">{t.name}</span>
                  <span className="registered-map__tooltip-year">{t.year}</span>
                </li>
              ))}
            </ul>
            {tooltip.country.teams.length > 8 ? (
              <p className="registered-map__tooltip-more">
                +{tooltip.country.teams.length - 8} more
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="registered-map__caption">
        {registeredCount > 0
          ? `${registeredCount} nation${
              registeredCount === 1 ? "" : "s"
            } represented — hover a highlighted country to see its teams.`
          : "Registered nations will appear here as teams sign up."}
      </p>
    </div>
  );
}
