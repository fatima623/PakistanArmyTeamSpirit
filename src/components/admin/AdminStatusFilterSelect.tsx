"use client";

import { useRouter } from "next/navigation";

export type AdminStatusFilterOption = {
  /** Stable key for the filter (matches the chip key / status param). */
  value: string;
  /** Visible label, already including its count — e.g. "Pending (4)". */
  label: string;
  /** Fully-built href the chip would have navigated to. */
  href: string;
};

/**
 * Phone-sized replacement for a status chip row.
 *
 * The chips wrap onto three or four lines on a 375px screen, pushing the table
 * below the fold. This renders the same set as a single native <select> (so the
 * OS picker does the work) and navigates to the option's own href — the exact
 * URL its chip pointed at, so filter/search/country params stay intact.
 */
export function AdminStatusFilterSelect({
  options,
  value,
  ariaLabel,
  className,
}: {
  options: AdminStatusFilterOption[];
  value: string;
  ariaLabel: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <select
      className={className}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => {
        const next = options.find((o) => o.value === e.target.value);
        if (next) router.push(next.href);
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
