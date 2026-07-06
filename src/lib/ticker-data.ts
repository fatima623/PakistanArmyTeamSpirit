import { prisma } from "@/lib/prisma";
import {
  compareTickersForDisplay,
  isTickerExpired,
  type PublicTickerItem,
  TICKER_STATUS,
  type TickerVisibilityContext,
  visibilityMatchesContext,
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

export async function getPublicTickerItems(
  context: TickerVisibilityContext,
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
    .filter((row) => visibilityMatchesContext(row.visibility, context))
    .filter((row) => !isTickerExpired(row.expiresAt, now))
    .sort(compareTickersForDisplay)
    .map((row) => ({
      id: row.id,
      message: row.message,
      priority: row.priority as PublicTickerItem["priority"],
      isUrgent: row.isUrgent,
    }));
}

export async function listAllTickerAnnouncements() {
  await syncExpiredTickerStatuses();
  const rows = await prisma.tickerAnnouncement.findMany();
  return rows.sort(compareTickersForDisplay);
}
