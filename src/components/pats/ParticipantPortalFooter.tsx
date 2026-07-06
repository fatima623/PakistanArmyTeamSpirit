import Link from "next/link";

import { COMPETITION_NAME, SITE_NAME } from "@/lib/branding";

/** Compact bookend for logged-in portal pages — not the full public site footer. */
export function ParticipantPortalFooter() {
  const year = new Date().getFullYear();

  return (
    <div className="participant-portal-footer">
      <div className="participant-portal-footer__inner">
        <p className="participant-portal-footer__brand">
          {SITE_NAME} · {COMPETITION_NAME} © {year}
        </p>
        <nav className="participant-portal-footer__links" aria-label="Portal links">
          <Link href="/">Public site</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/event/dashboard">Dashboard</Link>
        </nav>
      </div>
    </div>
  );
}
