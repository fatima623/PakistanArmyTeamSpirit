import { RouteLoadingShell } from "@/components/navigation/RouteLoadingShell";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function PublicLoading() {
  const { t } = await getDictionary();
  return (
    <RouteLoadingShell
      title={t.publicSite.loading.title}
      description={t.publicSite.loading.description}
    />
  );
}
