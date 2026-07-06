import { prisma } from "@/lib/prisma";

export type Deadlines = {
  registrationDeadline: Date | null;
  paymentDeadline: Date | null;
};

export const NO_DEADLINES: Deadlines = {
  registrationDeadline: null,
  paymentDeadline: null,
};

/**
 * Reads the configured deadlines directly (uncached) — used for enforcement so
 * a stale cache can't let a submission through after the cut-off.
 */
export async function getDeadlines(): Promise<Deadlines> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { registrationDeadline: true, paymentDeadline: true },
    });
    return {
      registrationDeadline: row?.registrationDeadline ?? null,
      paymentDeadline: row?.paymentDeadline ?? null,
    };
  } catch {
    return { ...NO_DEADLINES };
  }
}

export function isPastDeadline(
  deadline: Date | null,
  now: Date = new Date()
): boolean {
  return !!deadline && now.getTime() > deadline.getTime();
}

export function registrationClosedByDeadline(
  deadlines: Deadlines,
  now: Date = new Date()
): boolean {
  return isPastDeadline(deadlines.registrationDeadline, now);
}

export function paymentClosedByDeadline(
  deadlines: Deadlines,
  now: Date = new Date()
): boolean {
  return isPastDeadline(deadlines.paymentDeadline, now);
}
