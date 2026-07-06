import { PublicLayout } from "@/components/public/PublicLayout";
import { PatsPortalNavServer } from "@/components/pats/PatsPortalNavServer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <div className="pats-portal participant-portal dashboard-day w-full">
        <div className="pats-portal-shell">
          <div className="pats-portal-layout">
            <PatsPortalNavServer />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
