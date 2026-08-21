"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useI18nOptional } from "@/lib/i18n/I18nProvider";

/**
 * The way out of the tour.
 *
 * The tour is the former marketing site rendered inside the portal, so it has
 * none of the portal sidebar's chrome — and its navbar only carries the way
 * back inside the hamburger panel (and is dropped entirely on `/tour`). This
 * pill is fixed to the viewport so the return trip is one visible click from
 * every tour page, whatever the navbar is doing.
 */
export function TourBackToDashboard() {
  const i18n = useI18nOptional();
  const label = i18n?.t.common.backToDashboard ?? "Back to dashboard";

  return (
    <Link href="/event/dashboard" prefetch={false} className="pats-tour-exit">
      <ArrowLeft className="pats-tour-exit__icon" size={16} aria-hidden />
      <span className="pats-tour-exit__label">{label}</span>
    </Link>
  );
}
