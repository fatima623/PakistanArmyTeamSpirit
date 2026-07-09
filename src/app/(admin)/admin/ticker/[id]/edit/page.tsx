import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { TickerAnnouncementForm } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";
import { syncExpiredTickerStatuses } from "@/lib/ticker-data";
import { serializeTickerRow } from "@/lib/ticker-form-helpers";
import { getTickerPreviewContext } from "@/lib/ticker-settings";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: adminNavLabel("ticker"),
};

export default async function AdminTickerEditPage({ params }: PageProps) {
  await syncExpiredTickerStatuses();
  const { id } = await params;

  const [row, preview] = await Promise.all([
    prisma.tickerAnnouncement.findUnique({ where: { id } }),
    getTickerPreviewContext(),
  ]);

  if (!row) {
    notFound();
  }

  return (
    <TickerAnnouncementForm
      announcementId={row.id}
      initial={serializeTickerRow(row)}
      scrollDurationSec={preview.scrollDurationSec}
      homepageReferenceCharCount={preview.homepageReferenceCharCount}
    />
  );
}
