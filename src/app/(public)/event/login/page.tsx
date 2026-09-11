import { Suspense } from "react";
import type { Metadata } from "next";

import { SignInCardWithBack } from "@/components/auth/SignInCardWithBack";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.login };
}

/**
 * `/event/login` — the sign-in screen as a standalone route.
 *
 * The landing page normally opens this same card as a dialog over itself; this
 * route is where the middleware's `?next=` redirects land, and where a direct
 * bookmark resolves. It renders bare (no navbar, marquee or footer — see
 * `BARE_CHROME_PREFIXES`) so both routes present exactly the same surface, with
 * a back link standing in for the dialog's close button.
 */
export default async function EventLoginPage() {
  const { locale, dir } = await getDictionary();

  // `pats-auth-shell` is on the wrapper only for its exemption from the
  // site-wide square-off rule; the layout below is this page's own.
  return (
    <div className="pats-signin-page pats-auth-shell" lang={locale} dir={dir}>
      <div className="pats-signin-page__sky" aria-hidden />
      <Suspense fallback={null}>
        <SignInCardWithBack />
      </Suspense>
    </div>
  );
}
