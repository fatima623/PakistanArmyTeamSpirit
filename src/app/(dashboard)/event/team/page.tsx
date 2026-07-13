import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Team Registration",
};

/** Team registration / roster now live inside the guided registration
 *  wizard — this route forwards old links / bookmarks to that step. */
export default function TeamMembersPage() {
  redirect("/event/journey?step=teamRegistration");
}
