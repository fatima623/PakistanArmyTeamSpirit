import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Payment",
};

/** Payment now lives inside the guided registration wizard — this route is
 *  kept for old links / bookmarks and simply forwards to that step. */
export default function PaymentPage() {
  redirect("/event/journey?step=payment");
}
