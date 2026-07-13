import { PublicLayout } from "@/components/public/PublicLayout";
import { PatsPortalNavServer } from "@/components/pats/PatsPortalNavServer";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getLocale } from "@/lib/i18n/get-dictionary";
import { localeDir } from "@/lib/i18n/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = localeDir(locale);

  return (
    <PublicLayout>
      {/* Legacy shell classes are kept so not-yet-redesigned pages keep their
          scoped styles during the phased rollout; `pp` adds the new system.
          `dir`/`lang` scope the portal's text direction so Arabic renders
          right-to-left without affecting the public/admin areas. */}
      <I18nProvider locale={locale}>
        <div
          className="pats-portal participant-portal dashboard-day pp w-full"
          dir={dir}
          lang={locale}
          data-locale={locale}
        >
          <div className="pp-shell">
            <PatsPortalNavServer />
            <main className="pp-main">
              <div className="pp-main__scroll">{children}</div>
            </main>
          </div>
        </div>
      </I18nProvider>
    </PublicLayout>
  );
}
