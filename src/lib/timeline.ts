import { getDeadlines } from "@/lib/deadlines";
import { getKeyDates } from "@/lib/site-data";

export type DeadlineItem = {
  key: "registration" | "payment";
  label: string;
  date: Date;
  passed: boolean;
  daysRemaining: number;
};

export type TimelineKeyDate = {
  id: string;
  label: string;
  value: string;
  date: Date | null;
};

export type TimelineData = {
  deadlines: DeadlineItem[];
  keyDates: TimelineKeyDate[];
};

function daysFromNow(target: Date, now: Date): number {
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

export async function getTimelineData(): Promise<TimelineData> {
  const [keyDates, deadlines] = await Promise.all([
    getKeyDates(),
    getDeadlines(),
  ]);
  const now = new Date();

  const items: DeadlineItem[] = [];
  if (deadlines.registrationDeadline) {
    items.push({
      key: "registration",
      label: "Registration deadline",
      date: deadlines.registrationDeadline,
      passed: now.getTime() > deadlines.registrationDeadline.getTime(),
      daysRemaining: daysFromNow(deadlines.registrationDeadline, now),
    });
  }
  if (deadlines.paymentDeadline) {
    items.push({
      key: "payment",
      label: "Payment deadline",
      date: deadlines.paymentDeadline,
      passed: now.getTime() > deadlines.paymentDeadline.getTime(),
      daysRemaining: daysFromNow(deadlines.paymentDeadline, now),
    });
  }
  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    deadlines: items,
    keyDates: keyDates.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      date: k.date ?? null,
    })),
  };
}
