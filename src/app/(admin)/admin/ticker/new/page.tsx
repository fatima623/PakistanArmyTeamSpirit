import type { Metadata } from "next";

import { TickerAnnouncementForm } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";
import { listAllTickerAnnouncements } from "@/lib/ticker-data";
import { nextTickerSortOrder } from "@/lib/ticker-form-helpers";
import { getTickerPreviewContext } from "@/lib/ticker-settings";

export const metadata: Metadata = {
  title: adminNavLabel("ticker"),
};

export default async function AdminTickerNewPage() {
  const [rows, preview] = await Promise.all([
    listAllTickerAnnouncements(),
    getTickerPreviewContext(),
  ]);

  return (
    <TickerAnnouncementForm
      defaultSortOrder={nextTickerSortOrder(rows)}
      scrollDurationSec={preview.scrollDurationSec}
      homepageReferenceCharCount={preview.homepageReferenceCharCount}
    />
  );
}
