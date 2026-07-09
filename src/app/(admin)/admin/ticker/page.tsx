import type { Metadata } from "next";

import { TickerManager } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";
import { listAllTickerAnnouncements } from "@/lib/ticker-data";
import { serializeTickerRow } from "@/lib/ticker-form-helpers";
import "@/app/admin-ticker-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("ticker"),
};

export default async function AdminTickerPage() {
  const rows = await listAllTickerAnnouncements();
  const initialTickers = rows.map(serializeTickerRow);

  return <TickerManager initialTickers={initialTickers} />;
}
