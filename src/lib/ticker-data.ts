import { prisma } from "@/lib/prisma";
import {
  compareTickersForDisplay,
  isTickerExpired,
  type PublicTickerItem,
  TICKER_STATUS,
} from "@/lib/ticker";

/** Mark active rows past expiry as EXPIRED (admin list accuracy). */
export async function syncExpiredTickerStatuses(now = new Date()) {
  await prisma.tickerAnnouncement.updateMany({
    where: { shortLabel: { not: null } },
    data: { shortLabel: null },
  });

  await prisma.tickerAnnouncement.updateMany({
    where: {
      status: TICKER_STATUS.ACTIVE,
      expiresAt: { lte: now },
    },
    data: { status: TICKER_STATUS.EXPIRED },
  });
}

/**
 * Active, unexpired ticker messages for the participant dashboard's Latest
 * Updates card. The legacy per-surface `visibility` column is ignored — every
 * live message reaches participants (the public marquee scrolls Announcements
 * instead).
 */
export async function getPublicTickerItems(
  now = new Date()
): Promise<PublicTickerItem[]> {
  const rows = await prisma.tickerAnnouncement.findMany({
    where: {
      status: TICKER_STATUS.ACTIVE,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
  });

  return rows
    .filter((row) => !isTickerExpired(row.expiresAt, now))
    .sort(compareTickersForDisplay)
    .map((row) => ({
      id: row.id,
      message: row.message,
      priority: row.priority as PublicTickerItem["priority"],
      isUrgent: row.isUrgent,
      createdAt: row.createdAt.toISOString(),
    }));
}

export async function listAllTickerAnnouncements() {
  await syncExpiredTickerStatuses();
  const rows = await prisma.tickerAnnouncement.findMany();
  return rows.sort(compareTickersForDisplay);
}
