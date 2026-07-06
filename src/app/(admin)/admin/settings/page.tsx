import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";
import "@/app/admin-user-detail.css";
import "@/app/admin-settings-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("settings"),
};

export default async function AdminSettingsPage() {
  return <SettingsForm />;
}
