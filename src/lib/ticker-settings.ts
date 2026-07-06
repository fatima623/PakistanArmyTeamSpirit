import { prisma } from "@/lib/prisma";
import { getPublicTickerItems } from "@/lib/ticker-data";
import {
  parseTickerScrollSpeed,
  sumTickerMessageChars,
  tickerScrollDurationSec,
  TICKER_VISIBILITY,
  type TickerScrollSpeed,
} from "@/lib/ticker";

export async function getTickerScrollSpeed(): Promise<TickerScrollSpeed> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { tickerScrollSpeed: true },
  });
  return parseTickerScrollSpeed(row?.tickerScrollSpeed);
}

export async function getTickerScrollDurationSec(
  reducedMotion = false
): Promise<number> {
  const speed = await getTickerScrollSpeed();
  return tickerScrollDurationSec(speed, { reducedMotion });
}

/** Homepage loop duration + content width reference for admin preview. */
export async function getTickerPreviewContext() {
  const [scrollDurationSec, items] = await Promise.all([
    getTickerScrollDurationSec(),
    getPublicTickerItems(TICKER_VISIBILITY.HOMEPAGE),
  ]);
  return {
    scrollDurationSec,
    homepageReferenceCharCount: Math.max(sumTickerMessageChars(items), 24),
  };
}

export async function setTickerScrollSpeed(
  speed: TickerScrollSpeed
): Promise<TickerScrollSpeed> {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { tickerScrollSpeed: speed },
    create: {
      id: "singleton",
      tickerScrollSpeed: speed,
      feeNoticeText: "",
      approvalNoticeText: "",
    },
  });
  return speed;
}
