import { PublicLayout } from "@/components/public/PublicLayout";
import { PatsPortalNavServer } from "@/components/pats/PatsPortalNavServer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      {/* Legacy shell classes are kept so not-yet-redesigned pages keep their
          scoped styles during the phased rollout; `pp` adds the new system. */}
      <div className="pats-portal participant-portal dashboard-day pp w-full">
        <div className="pp-shell">
          <PatsPortalNavServer />
          <main className="pp-main">{children}</main>
        </div>
      </div>
    </PublicLayout>
  );
}
