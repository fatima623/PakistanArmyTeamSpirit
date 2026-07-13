import { PublicLayout } from "@/components/public/PublicLayout";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getLocale } from "@/lib/i18n/get-dictionary";

export default async function PublicRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <I18nProvider locale={locale}>
      <PublicLayout>{children}</PublicLayout>
    </I18nProvider>
  );
}
