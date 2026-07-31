import type { Metadata } from "next";

import { InternationalParticipationDashboard } from "@/components/admin/international/InternationalParticipationDashboard";
import { adminNavLabel } from "@/lib/admin-navigation";
import { getInternationalParticipation } from "@/lib/international-participation";

export const metadata: Metadata = {
  title: adminNavLabel("international"),
};

// Recompute on every request so live registrations show in real time.
export const dynamic = "force-dynamic";

export default async function AdminInternationalPage() {
  const data = await getInternationalParticipation();
  return <InternationalParticipationDashboard data={data} />;
}
