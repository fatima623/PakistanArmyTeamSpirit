// TEMPORARY local verification route — renders the admin International
// Participation dashboard with the real aggregated data, without admin auth.
// Deleted after browser verification; not linked from anywhere.
import { InternationalParticipationDashboard } from "@/components/admin/international/InternationalParticipationDashboard";
import { getInternationalParticipation } from "@/lib/international-participation";

export const dynamic = "force-dynamic";

export default async function IntlPreviewPage() {
  const data = await getInternationalParticipation();
  return (
    <div style={{ minHeight: "100vh", background: "rgb(6,9,17)", padding: 24 }}>
      <InternationalParticipationDashboard data={data} />
    </div>
  );
}
