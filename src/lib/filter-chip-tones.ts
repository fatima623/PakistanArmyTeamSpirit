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
