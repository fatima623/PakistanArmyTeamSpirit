"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

/**
 * Debounced, live-filtering search box. As the user types it rewrites the
 * current URL's `paramName` query value (preserving every other param, e.g.
 * filter/status) so the server component re-renders the list below — no submit
 * button or Enter key required. Resets to page 1 on each new query.
 */
export function LiveSearchInput({
  paramName = "search",
  placeholder = "Search…",
  ariaLabel = "Search",
  className,
  inputClassName,
  iconClassName,
  delay = 300,
}: {
  paramName?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  delay?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramName) ?? "";

  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();
  const lastPushed = useRef(initial);

  useEffect(() => {
    // Don't re-navigate if the value already matches what's in the URL.
    if (value === lastPushed.current) return;

    const handle = setTimeout(() => {
      const next = new URLSearchParams(Array.from(searchParams.entries()));
      const trimmed = value.trim();
      if (trimmed) next.set(paramName, trimmed);
      else next.delete(paramName);
      next.set("page", "1");
      lastPushed.current = value;
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    }, delay);

    return () => clearTimeout(handle);
    // searchParams is intentionally read at fire-time only; depending on it
    // would re-run this effect after our own replace() and risk a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, pathname, paramName, router]);

  // Keep the box in sync if the URL param changes externally (e.g. filter chip).
  useEffect(() => {
    setValue(initial);
    lastPushed.current = initial;
  }, [initial]);

  return (
    <div className={className}>
      <Search className={iconClassName} aria-hidden strokeWidth={2} />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={inputClassName}
      />
    </div>
  );
}
