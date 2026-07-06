import { PAKISTAN_COUNTRY } from "@/lib/countries";

export { PAKISTAN_COUNTRY };

export function displayCountry(country: string | null | undefined): string {
  return country?.trim() || "—";
}

export function isInternationalParticipant(
  country: string | null | undefined
): boolean {
  return !!country?.trim() && country.trim() !== PAKISTAN_COUNTRY;
}

export function formatAdminTableCountry(
  country: string | null | undefined,
  nationality: string | null | undefined
): string {
  if (!country?.trim()) return "—";
  if (!isInternationalParticipant(country)) return PAKISTAN_COUNTRY;
  const nat = nationality?.trim();
  return nat ? `${country} (${nat})` : country;
}

export function formatPendingApprovalCountryLine(
  country: string | null | undefined,
  nationality: string | null | undefined
): { text: string; tone: "pakistani" | "international" | "unknown" } {
  if (!country?.trim()) {
    return { text: "—", tone: "unknown" };
  }
  if (!isInternationalParticipant(country)) {
    return { text: PAKISTAN_COUNTRY, tone: "pakistani" };
  }
  const nat = nationality?.trim();
  return {
    text: nat ? `${country} · ${nat}` : country,
    tone: "international",
  };
}

export function resolveNationalityForSubmit(
  country: string,
  nationality: string | undefined
): string {
  return country === PAKISTAN_COUNTRY
    ? "Pakistani"
    : (nationality ?? "").trim();
}
