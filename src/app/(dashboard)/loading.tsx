import { RouteLoadingShell } from "@/components/navigation/RouteLoadingShell";

export default function DashboardLoading() {
  return (
    <RouteLoadingShell
      title="Participant dashboard"
      description="Loading participant actions and status panels."
      compact
    />
  );
}
