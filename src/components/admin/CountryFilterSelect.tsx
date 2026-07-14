"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { adminInput } from "@/lib/admin-ui";

export type CountryFilterOption = {
  /** URL value: "all", the sentinel for "not set", or a country name. */
  value: string;
  label: string;
};

/**
 * Native <select> that rewrites the `country` query param on change (keeping
 * every other param — filter / search / payStatus — intact) so the server
 * component re-renders the list. Resets to page 1 on each change.
 */
export function CountryFilterSelect({
  value,
  options,
  className,
}: {
  value: string;
  options: CountryFilterOption[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = (next: string) => {
    const query = new URLSearchParams(Array.from(searchParams.entries()));
    if (next && next !== "all") query.set("country", next);
    else query.delete("country");
    query.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${query.toString()}`, { scroll: false });
    });
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Filter by country"
      className={cn(adminInput, "h-11 w-full min-w-0 bg-white", className)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
