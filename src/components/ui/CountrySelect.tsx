"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { WORLD_COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  "aria-invalid"?: boolean;
};

export function CountrySelect({
  value,
  onChange,
  id,
  "aria-invalid": ariaInvalid,
}: Props) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value || WORLD_COUNTRIES[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value || WORLD_COUNTRIES[0]);
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
    } else if (value) {
      setQuery(value);
    } else {
      setQuery(WORLD_COUNTRIES[0]);
      onChange(WORLD_COUNTRIES[0]);
    }
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        list={listId}
        value={query}
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
          if (event.key === "Enter" && filtered[0]) {
            event.preventDefault();
            selectCountry(filtered[0]);
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
