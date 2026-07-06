import type { Metadata } from "next";

import { NewsPostForm } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";
import "@/app/admin-user-detail.css";
import "@/app/admin-news-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("news"),
};

export default async function AdminNewsNewPage() {

  return (
      <NewsPostForm />
  );
}
