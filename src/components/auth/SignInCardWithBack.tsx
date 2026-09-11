"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SignInCard } from "@/components/auth/SignInCard";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * The standalone `/event/login` card.
 *
 * Same card the landing page opens as a dialog, with a back link where the
 * dialog has its close button — the page has no navbar, so this is the only
 * way back to `/` short of the browser control.
 */
export function SignInCardWithBack() {
  const { t } = useI18n();

  return (
    <SignInCard
      footer={
        <Link href="/" className="pats-signin__back">
          <ArrowLeft className="pats-signin__back-icon" aria-hidden strokeWidth={2} />
          <span>{t.publicSite.breadcrumb.home}</span>
        </Link>
      }
    />
  );
}
