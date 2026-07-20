/** Logged-in participant app routes (dashboard, payment, profile edits). */

/**
 * Every route that renders the `.pp` portal shell must be listed here.
 *
 * The shell sizes itself to the full viewport and the window scroll is locked
 * (`html:has(.dashboard-day)` in globals.css). If the public ticker + nav are
 * also mounted, they push the shell down by their own height — measured at
 * 112px — and that much of the shell's scroll pane ends up permanently below
 * the fold, because the window scroll needed to reach it is exactly what the
 * lock forbids. That is what hid the last traveller on the flights step.
 */
const PARTICIPANT_PORTAL_PREFIXES = [
  "/event/dashboard",
  "/event/payment",
  "/event/edit/",
  "/event/team",
  "/event/tickets",
  "/event/journey",
  "/event/flights",
  "/event/host-info",
  "/event/confirm-participation",
] as const;

export function pathnameIsParticipantPortalApp(pathname: string): boolean {
  return PARTICIPANT_PORTAL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}
