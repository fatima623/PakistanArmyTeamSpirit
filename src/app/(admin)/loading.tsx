import { RouteLoadingShell } from "@/components/navigation/RouteLoadingShell";

export default function AdminLoading() {
  return (
    <RouteLoadingShell
      title="Admin page"
      description="Loading administrative data and controls."
      compact
    />
  );
}
