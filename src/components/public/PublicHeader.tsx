import { PatsLogo } from "@/components/pats/PatsLogo";
import {
  ARMY_NAME,
  COUNTRY,
  HQ_ORG,
  SITE_NAME,
} from "@/lib/branding";

export function PublicHeader() {
  return (
    <header className="relative overflow-hidden bg-cp-gunmetal">
      <div className="cp-institutional-bar">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <span>{HQ_ORG}</span>
          <span className="hidden text-cp-brass-light sm:inline">
            Official {SITE_NAME} Portal
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="absolute inset-0 bg-cp-hero" />
        <div className="absolute inset-0 bg-cp-stripe opacity-40" />

        <div className="relative flex flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 sm:py-10">
          <div className="min-w-0 flex-1 text-white">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-cp-brass-light">
              {ARMY_NAME} · {COUNTRY}
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {SITE_NAME}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cp-khaki sm:text-base">
              The {ARMY_NAME}&apos;s premier patrolling exercise mission-focused,
              scenario-based, and open to Pakistan and international participants.
            </p>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-sm border-2 border-cp-brass/40 bg-white/5 p-2 backdrop-blur-sm sm:h-[120px] sm:w-[120px]">
              <PatsLogo size={104} variant="nav" priority={false} />
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-cp-brass to-transparent" />
      </div>
    </header>
  );
}
