/** Maps filter keys to a shared tone id for portal filter chip colors */
const FILTER_TONE_MAP: Record<string, string> = {
  all: "all",
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  payment_pending: "payment",
  admins: "admins",
  submitted: "pending",
  verified: "approved",
  under_review: "payment",
  returned: "rejected",
};

export function filterChipTone(filterKey: string): string {
  const normalized = filterKey.toLowerCase().replace(/-/g, "_");
  return FILTER_TONE_MAP[normalized] ?? "all";
}

export function filterChipToneProps(filterKey: string) {
  return { "data-filter-tone": filterChipTone(filterKey) } as const;
}

/* —— Utility-class chips (replaces the data-filter-tone CSS mechanism) —— */

const CHIP_BASE =
  "inline-flex min-h-9 min-w-[5.75rem] cursor-pointer items-center justify-center whitespace-nowrap rounded-full border px-[1.125rem] py-2 text-[0.8125rem] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:brightness-[0.97]";

const CHIP_TONES: Record<string, { active: string; inactive: string }> = {
  all: {
    inactive: "border-slate-300 bg-slate-200 text-slate-700",
    active: "border-slate-500 bg-slate-600 text-white",
  },
  pending: {
    inactive: "border-amber-300 bg-amber-100 text-yellow-800",
    active: "border-amber-600 bg-amber-500 text-white",
  },
  approved: {
    inactive: "border-green-300 bg-green-100 text-green-800",
    active: "border-green-700 bg-green-700 text-white",
  },
  rejected: {
    inactive: "border-red-300 bg-red-100 text-red-700",
    active: "border-red-600 bg-red-600 text-white",
  },
  payment: {
    inactive: "border-sky-300 bg-sky-100 text-sky-700",
    active: "border-sky-600 bg-sky-600 text-white",
  },
};

/** Full chip class string: base + tone, active variant adds a stronger shadow. */
export function filterChipClasses(filterKey: string, active: boolean): string {
  const tone = CHIP_TONES[filterChipTone(filterKey)] ?? CHIP_TONES.all;
  return `${CHIP_BASE} ${active ? `${tone.active} shadow-[0_2px_6px_rgba(15,23,42,0.25)]` : tone.inactive}`;
}
