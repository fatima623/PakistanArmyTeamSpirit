"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { COUNTRY_NAMES, type CountryCode } from "@/lib/pats-content";
import type { ContingentRecord } from "@/lib/contingents";
import { cn } from "@/lib/utils";

type Props = {
  contingent: ContingentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContingentDrawer({
  contingent,
  open,
  onOpenChange,
}: Props) {
  if (!contingent) return null;

  const flag = countryFlag(contingent.code);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "tac-contingent-drawer w-full border-l border-tactical-brass/25 bg-tactical-carbon-raised text-white sm:max-w-md",
          "[&>button]:text-white/70 [&>button]:hover:text-white"
        )}
      >
        <SheetHeader className="border-b border-white/10 pb-4 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-tactical-khaki">
            Contingent dossier
          </p>
          <SheetTitle className="font-display text-lg font-bold uppercase tracking-wide text-white">
            {contingent.label}
          </SheetTitle>
          <SheetDescription className="font-condensed text-sm text-tactical-sand">
            {flag} {COUNTRY_NAMES[contingent.code]} · International PATS participation
          </SheetDescription>
        </SheetHeader>

        <dl className="mt-6 space-y-4 font-condensed text-sm">
          <MetricRow label="Editions" value={String(contingent.appearances)} />
          <MetricRow
            label="Last deployment"
            value={String(contingent.lastEdition)}
          />
          <MetricRow
            label="Readiness index"
            value={`${contingent.readinessIndex}%`}
            mono
          />
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-tactical-khaki">
              PATS record
            </dt>
            <dd className="mt-2 text-tactical-sand">
              {contingent.editions.join(" · ")}
            </dd>
          </div>
        </dl>

        <p className="cinematic-body mt-8 border-t border-white/10 pt-4 font-condensed text-xs leading-relaxed text-white/65">
          Performance metrics reflect historical international participation.
          Live scoring updates during active competition cycles.
        </p>
      </SheetContent>
    </Sheet>
  );
}

function MetricRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-tactical-khaki">
        {label}
      </dt>
      <dd
        className={cn(
          "text-right font-semibold text-white",
          mono && "font-mono tabular-nums"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function countryFlag(code: CountryCode): string {
  const a = 0x1f1e6 - 65;
  const chars = code.toUpperCase().split("");
  if (chars.length !== 2) return "";
  return String.fromCodePoint(
    ...chars.map((c) => a + c.charCodeAt(0))
  );
}
