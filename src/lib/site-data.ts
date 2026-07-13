import { unstable_cache } from "next/cache";
import type { KeyDate, NewsPost } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeBrandingCopy } from "@/lib/site-copy";

export type PublicSiteSettings = {
  registrationOpen: boolean;
  intlRegistrationOpen: boolean;
  registrationDeadline: Date | null;
  paymentDeadline: Date | null;
  exerciseYear: number;
  exerciseDates: string;
  privacyPolicyUrl: string;
  feeNoticeText: string;
  approvalNoticeText: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
};

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  registrationOpen: true,
  intlRegistrationOpen: true,
  registrationDeadline: null,
  paymentDeadline: null,
  exerciseYear: 2026,
  exerciseDates: "2 – 13 October 2026",
  privacyPolicyUrl: "/privacy",
  feeNoticeText: "",
  approvalNoticeText: "",
  facebookUrl: "#",
  twitterUrl: "#",
  instagramUrl: "#",
};

export const DEFAULT_SOCIAL = {
  facebookUrl: DEFAULT_SITE_SETTINGS.facebookUrl,
  twitterUrl: DEFAULT_SITE_SETTINGS.twitterUrl,
  instagramUrl: DEFAULT_SITE_SETTINGS.instagramUrl,
};

function logDbError(context: string, error: unknown) {
  console.error(`[site-data] ${context}:`, error);
}

const SITE_DATA_REVALIDATE_SEC = 3600;

const getCachedSiteSettingsRow = unstable_cache(
  async () => {
    try {
      return await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
      });
    } catch (error) {
      logDbError("getSiteSettings", error);
      return null;
    }
  },
  ["site-settings"],
  { revalidate: SITE_DATA_REVALIDATE_SEC }
);

const getCachedPublicSocialRow = unstable_cache(
  async () => {
    try {
      return await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: {
          facebookUrl: true,
          twitterUrl: true,
          instagramUrl: true,
        },
      });
    } catch (error) {
      logDbError("getPublicSocialLinks", error);
      return null;
    }
  },
  ["site-social-links"],
  { revalidate: SITE_DATA_REVALIDATE_SEC }
);

const getCachedLatestNewsRows = unstable_cache(
  async () => {
    try {
      return await prisma.newsPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 10,
      });
    } catch (error) {
      logDbError("getLatestNews", error);
      return [];
    }
  },
  ["latest-news"],
  { revalidate: SITE_DATA_REVALIDATE_SEC }
);

const getCachedKeyDatesRows = unstable_cache(
  async () => {
    try {
      return await prisma.keyDate.findMany({
        orderBy: { sortOrder: "asc" },
      });
    } catch (error) {
      logDbError("getKeyDates", error);
      return [];
    }
  },
  ["key-dates"],
  { revalidate: SITE_DATA_REVALIDATE_SEC }
);

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  const row = await getCachedSiteSettingsRow();
  if (!row) return { ...DEFAULT_SITE_SETTINGS };
  return {
    registrationOpen: row.registrationOpen,
    intlRegistrationOpen: row.intlRegistrationOpen,
    registrationDeadline: row.registrationDeadline
      ? new Date(row.registrationDeadline)
      : null,
    paymentDeadline: row.paymentDeadline
      ? new Date(row.paymentDeadline)
      : null,
    exerciseYear: row.exerciseYear,
    exerciseDates: row.exerciseDates,
    privacyPolicyUrl: row.privacyPolicyUrl,
    feeNoticeText: row.feeNoticeText,
    approvalNoticeText: normalizeBrandingCopy(row.approvalNoticeText),
    facebookUrl: row.facebookUrl,
    twitterUrl: row.twitterUrl,
    instagramUrl: row.instagramUrl,
  };
}

export async function getPublicSocialLinks() {
  const settings = await getCachedPublicSocialRow();
  return settings ?? DEFAULT_SOCIAL;
}

export async function getLatestNews(limit = 5): Promise<NewsPost[]> {
  const posts = await getCachedLatestNewsRows();
  return posts.slice(0, limit);
}

export async function getKeyDates(): Promise<KeyDate[]> {
  return getCachedKeyDatesRows();
}

export async function getNewsPostBySlug(slug: string) {
  try {
    return await prisma.newsPost.findFirst({
      where: { slug, published: true },
    });
  } catch (error) {
    logDbError("getNewsPostBySlug", error);
    return null;
  }
}

const getCachedAnnouncementRows = unstable_cache(
  async () => {
    try {
      return await prisma.newsPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 60,
      });
    } catch (error) {
      logDbError("getAnnouncements", error);
      return [];
    }
  },
  ["announcements"],
  { revalidate: SITE_DATA_REVALIDATE_SEC }
);

/** All published announcements (NewsPost) for the public /announcements page. */
export async function getAnnouncements(): Promise<NewsPost[]> {
  return getCachedAnnouncementRows();
}
