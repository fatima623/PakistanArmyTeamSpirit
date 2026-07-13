import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Flight Details",
};

/** Flight details now live inside the guided registration wizard — this
 *  route forwards old links / bookmarks to that step. */
export default function FlightDetailsPage() {
  redirect("/event/journey?step=flights");
}
