import { prisma } from "@/lib/prisma";
import { AWARDS_ROLL_YEAR } from "@/lib/awards-data";

export type AwardsRoll = {
  year: number;
  rows: {
    id: string;
    callSign: string;
    unit: string;
    medal: string;
  }[];
};

/**
 * Published results roll for the most recent year that has any rows.
 *
 * Returns an empty roll (rather than throwing) when the `Award` table has not
 * been migrated yet, matching how the gallery page degrades — a missing table
 * should hide the section, not 500 the whole awards page.
 */
export async function getAwardsRoll(): Promise<AwardsRoll> {
  try {
    const latest = await prisma.award.findFirst({
      where: { published: true },
      orderBy: { year: "desc" },
      select: { year: true },
    });

    const year = latest?.year ?? AWARDS_ROLL_YEAR;

    const rows = await prisma.award.findMany({
      where: { published: true, year },
      orderBy: [{ sortOrder: "asc" }, { callSign: "asc" }],
      select: { id: true, callSign: true, unit: true, medal: true },
    });

    return { year, rows };
  } catch {
    return { year: AWARDS_ROLL_YEAR, rows: [] };
  }
}
