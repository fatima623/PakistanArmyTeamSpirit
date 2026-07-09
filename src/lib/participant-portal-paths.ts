/** Logged-in participant app routes (dashboard, payment, profile edits). */

const PARTICIPANT_PORTAL_PREFIXES = [
  "/event/dashboard",
  "/event/payment",
  "/event/edit/",
  "/event/team",
  "/event/tickets",
] as const;

export function pathnameIsParticipantPortalApp(pathname: string): boolean {
  return PARTICIPANT_PORTAL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}
