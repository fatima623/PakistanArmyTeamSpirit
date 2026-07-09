import type { Metadata } from "next";

import { NewsPostForm } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";

export const metadata: Metadata = {
  title: adminNavLabel("news"),
};

export default async function AdminNewsNewPage() {

  return (
      <NewsPostForm />
  );
}
