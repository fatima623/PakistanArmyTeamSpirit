import { RouteLoadingShell } from "@/components/navigation/RouteLoadingShell";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function DashboardLoading() {
  const { t } = await getDictionary();
  return (
    <RouteLoadingShell
      title={t.common.loadingTitle}
      description={t.common.loadingDesc}
      compact
    />
  );
}
