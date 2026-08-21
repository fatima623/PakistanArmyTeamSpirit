import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Unit Information",
};

/** Unit information is now a step of the guided registration wizard — this
 *  route forwards old links / bookmarks to that step. */
export default function EditUnitPage() {
  redirect("/event/journey?step=unitInfo");
}
