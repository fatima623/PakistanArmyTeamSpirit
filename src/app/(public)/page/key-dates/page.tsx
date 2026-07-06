import { redirect } from "next/navigation";

/** Legacy URL from reference site — canonical route is /key-dates */
export default function LegacyKeyDatesPage() {
  redirect("/key-dates");
}
