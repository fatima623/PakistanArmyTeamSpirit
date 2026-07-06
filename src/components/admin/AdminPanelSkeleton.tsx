export function AdminPanelSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-slate-200" />
      <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}
