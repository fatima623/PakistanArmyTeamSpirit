import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Team Members",
};

/** Team registration / roster now live inside the guided registration
 *  wizard — this route forwards old links / bookmarks to that step. The
 *  separate `teamRegistration` step was folded into `roster`, so that is
 *  where both old and new links land. */
export default function TeamMembersPage() {
  redirect("/event/journey?step=roster");
}
