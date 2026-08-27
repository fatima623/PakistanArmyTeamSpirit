"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

import { WORLD_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/** Rendered-menu geometry, in viewport coordinates (the list is `fixed`). */
type MenuRect = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  /** The anchor's own direction — a body portal does not inherit it. */
  dir: "ltr" | "rtl";
};

const MENU_MAX_HEIGHT = 224;
const MENU_GAP = 4;
/** Matches `.pats-nav__lang-menu`, the other fixed menu that escapes a clip. */
const MENU_Z_INDEX = 200;

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  /**
   * The list to offer. Defaults to every country PLUS the "Other" escape
   * hatch — pass `NAMED_COUNTRIES` on a form that has no "specify your own"
   * follow-up field, or "Other" ends up stored as the country itself.
   */
  options?: readonly string[];
  "aria-invalid"?: boolean;
};

export function CountrySelect({
  value,
  onChange,
  id,
  className,
  /* No default: this component renders on the PUBLIC, fully-localized register
     page (en/ar/ru/tr/zh, incl. RTL). An English literal here would be the one
     untranslated string on that form. English-only callers (/admin) pass their
     own. */
  placeholder,
  options = WORLD_COUNTRIES,
  "aria-invalid": ariaInvalid,
}: Props) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /* An empty value means "no country recorded" and must STAY empty. Seeding the
     query with WORLD_COUNTRIES[0] (Pakistan) made a country-less participant
     look Pakistani, and handleBlur then committed it — silently stamping a
     nationality nobody chose. */
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<MenuRect | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  /* The menu is rendered into <body> so no ancestor's `overflow: hidden` can
     clip it — the unit form's cards are rounded-and-clipped, which cut the list
     off at the card's bottom edge no matter how high its z-index went. That
     costs us normal flow positioning, so the anchor's box is measured here and
     re-measured whenever anything moves it. */
  const measure = useCallback(() => {
    const anchor = containerRef.current;
    if (!anchor) return;
    const box = anchor.getBoundingClientRect();
    const below = window.innerHeight - box.bottom - MENU_GAP;
    const above = box.top - MENU_GAP;
    /* Drop upwards when the space underneath cannot show a usable list and
       there is more of it overhead — a field near the bottom of the viewport
       would otherwise get a two-row menu. */
    const flip = below < Math.min(MENU_MAX_HEIGHT, above) && above > below;
    const maxHeight = Math.max(
      96,
      Math.min(MENU_MAX_HEIGHT, flip ? above : below)
    );
    setRect({
      top: flip ? box.top - MENU_GAP - maxHeight : box.bottom + MENU_GAP,
      left: box.left,
      width: box.width,
      maxHeight,
      /* Carried explicitly: the menu is a child of <body>, so it escapes both
         the page's own dir and the wrapper the admin console uses to pin itself
         LTR inside an RTL document. */
      dir: getComputedStyle(anchor).direction === "rtl" ? "rtl" : "ltr",
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    /* Capture phase: the field can sit inside its own scrolling pane, and a
       scroll there does not bubble. */
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      /* The list lives in a portal, so it is NOT inside `containerRef` — without
         checking it too, mousedown on an option counted as "outside", closed the
         menu and unmounted the option before its click could land. */
      if (
        !containerRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((country) => country.toLowerCase().includes(q));
  }, [query, options]);

  function selectCountry(country: string) {
    onChange(country);
    setQuery(country);
    setOpen(false);
  }

  function handleBlur() {
    const match = options.find(
      (country) => country.toLowerCase() === query.trim().toLowerCase()
    );
    if (match) {
      onChange(match);
      setQuery(match);
    } else {
      /* Never fabricate a country. Unrecognised text reverts to whatever is
         actually committed — which may legitimately be empty. Defaulting to
         WORLD_COUNTRIES[0] here meant an admin who merely focused and blurred
         this field while editing something else would mark a participant whose
         country was never recorded as Pakistan. */
      setQuery(value);
    }
    setOpen(false);
  }

  const menu =
    open && rect && filtered.length > 0 && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            dir={rect.dir}
            className="fixed overflow-y-auto rounded-md border border-brand-line bg-white py-1 shadow-md"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              maxHeight: rect.maxHeight,
              zIndex: MENU_Z_INDEX,
            }}
            role="listbox"
          >
            {filtered.map((country) => (
              <li key={country} role="option" aria-selected={country === value}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-start text-sm hover:bg-brand-parchment-2/60",
                    country === value && "bg-brand-parchment-2 font-medium"
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCountry(country)}
                >
                  {country}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className="relative">
      {/* No <datalist>: the browser draws its own unstyled dropdown for one, so
          the field showed TWO menus at once — the themed list below and the
          native one on top of it. `filtered` already does the same job. */}
      <Input
        id={id}
        value={query}
        /* Room for the chevron below. It replaces the arrow the browser used to
           draw for the <datalist>, which is gone with it — without one the
           field reads as a plain text box next to the chevroned selects it sits
           beside. */
        className={cn(className, "pe-9")}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            /* An exact name always wins over the first substring hit. `filtered`
               is a plain `includes()` match in source order, so committing
               filtered[0] filed "Guinea" as Equatorial Guinea and "Sudan" as
               South Sudan — the exact country the user typed loses to a longer
               one that merely contains it. Mirrors handleBlur's exact lookup. */
            const q = query.trim().toLowerCase();
            const exact = options.find(
              (country) => country.toLowerCase() === q
            );
            const choice = exact ?? filtered[0];
            if (choice) {
              event.preventDefault();
              selectCountry(choice);
            }
          }
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      <ChevronDown
        className={cn(
          "pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-khaki-warm transition-transform",
          open && "rotate-180"
        )}
        aria-hidden
      />
      {menu}
    </div>
  );
}
