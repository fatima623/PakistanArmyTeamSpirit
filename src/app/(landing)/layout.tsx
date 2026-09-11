import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getLocale } from "@/lib/i18n/get-dictionary";

/**
 * The landing page owns its whole viewport.
 *
 * It sits in its own route group precisely so it does NOT inherit the public
 * marketing shell — no navbar, no announcement marquee, no footer, and none of
 * the chrome queries that shell runs. All it needs is the locale.
 */
export default async function LandingRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
