import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { KeyDatesManager } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";
import "@/app/admin-key-dates-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("keyDates"),
};

export default async function AdminKeyDatesPage() {
  const keyDates = await prisma.keyDate.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
      <KeyDatesManager initialKeyDates={keyDates} />
  );
}
