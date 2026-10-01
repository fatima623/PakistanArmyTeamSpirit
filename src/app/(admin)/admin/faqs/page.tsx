import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { FaqsManager } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";

export const metadata: Metadata = {
  title: adminNavLabel("faqs"),
};

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return <FaqsManager initialFaqs={faqs} />;
}
