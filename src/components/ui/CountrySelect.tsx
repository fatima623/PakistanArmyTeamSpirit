"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { WORLD_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
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
  "aria-invalid": ariaInvalid,
}: Props) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  /* An empty value means "no country recorded" and must STAY empty. Seeding the
     query with WORLD_COUNTRIES[0] (Pakistan) made a country-less participant
     look Pakistani, and handleBlur then committed it — silently stamping a
     nationality nobody chose. */
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter((country) =>
      country.toLowerCase().includes(q)
    );
  }, [query]);

  function selectCountry(country: string) {
    onChange(country);
    setQuery(country);
    setOpen(false);
  }

  function handleBlur() {
    const match = WORLD_COUNTRIES.find(
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

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        list={listId}
        value={query}
        className={className}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
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
            const exact = WORLD_COUNTRIES.find(
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
      <datalist id={listId}>
        {WORLD_COUNTRIES.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
      {open && filtered.length > 0 ? (
        <ul
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-brand-line bg-white py-1 shadow-md"
          role="listbox"
        >
          {filtered.map((country) => (
            <li key={country} role="option" aria-selected={country === value}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-brand-parchment-2/60",
                  country === value && "bg-brand-parchment-2 font-medium"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCountry(country)}
              >
                {country}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
