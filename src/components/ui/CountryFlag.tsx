import { Globe } from "lucide-react";

import { countryNameToIso2 } from "@/lib/country-iso";
import { cn } from "@/lib/utils";

/**
 * Renders a participant's country as a flag image (from `/public/flags/<iso2>.png`).
 * The country is stored as a full name (e.g. "Pakistan"); we resolve it to an
 * ISO-3166 alpha-2 code. Unknown / free-text ("Other") countries fall back to a
 * neutral globe so the slot never renders broken.
 *
 * Sizing, radius and border come from `className` so callers can match the slot
 * the old initials avatar used. `alt` carries the country name for a11y since
 * the visible country label is intentionally removed alongside this.
 */
export function CountryFlag({
  country,
  className,
}: {
  country: string | null | undefined;
  className?: string;
}) {
  const iso = country ? countryNameToIso2(country) : "";

  if (!iso) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center bg-slate-100 text-slate-400",
          className
        )}
        title={country ?? undefined}
        role="img"
        aria-label={country ?? "Unknown country"}
      >
        <Globe className="h-1/2 w-1/2" aria-hidden />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${iso.toLowerCase()}.png`}
      alt={country ?? ""}
      title={country ?? undefined}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}
