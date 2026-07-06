import type { Metadata } from "next";

import { TickerManager } from "@/components/admin/admin-dynamic";
import { TickerMarqueePreview } from "@/components/admin/TickerMarqueePreview";
import { adminNavLabel } from "@/lib/admin-navigation";
import { listAllTickerAnnouncements } from "@/lib/ticker-data";
import {
  publishStateFromTicker,
  serializeTickerRow,
} from "@/lib/ticker-form-helpers";
import "@/app/admin-ticker-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("ticker"),
};

export default async function AdminTickerPage() {
  const rows = await listAllTickerAnnouncements();
  const initialTickers = rows.map(serializeTickerRow);
  const preview =
    initialTickers.find((t) => publishStateFromTicker(t) === "LIVE") ??
    initialTickers[0];

  return (
    <>
      {preview ? (
        <div className="admin-ticker-live-preview">
          <span className="admin-ticker-live-preview__label">Live preview</span>
          <TickerMarqueePreview
            message={preview.message}
            isUrgent={preview.isUrgent}
            priority={preview.priority}
            className="min-w-0 flex-1"
          />
        </div>
      ) : null}
      <TickerManager initialTickers={initialTickers} />
    </>
  );
}
