import { displayCountry, isInternationalParticipant } from "@/lib/participant-country";
import { formatDateShort } from "@/lib/utils";

type UnitSummary = {
  unitName: string;
  branch: string;
  bdeOrFmn: string;
} | null;

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  createdAt: Date;
  country: string | null;
  nationality: string | null;
  unit: UnitSummary;
};

export function ParticipantRegistrationDetailsCard({
  firstName,
  lastName,
  email,
  rank,
  createdAt,
  country,
  nationality,
  unit,
}: Props) {
  return (
    <section className="portal-card pats-panel">
      <h2 className="participant-dash-section-title mb-4 border-b border-cp-border pb-3">
        Registration details
      </h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="portal-subtitle text-[11px]">Name</dt>
          <dd className="mt-1 font-semibold text-cp-ink">
            {firstName} {lastName}
          </dd>
        </div>
        <div>
          <dt className="portal-subtitle text-[11px]">Unit</dt>
          <dd className="mt-1 font-semibold text-cp-ink">
            {unit?.unitName ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="portal-subtitle text-[11px]">Email</dt>
          <dd className="mt-1 text-cp-ink">{email}</dd>
        </div>
        <div>
          <dt className="portal-subtitle text-[11px]">Rank</dt>
          <dd className="mt-1 text-cp-ink">{rank || "—"}</dd>
        </div>
        <div>
          <dt className="portal-subtitle text-[11px]">Date registered</dt>
          <dd className="mt-1 text-cp-ink">{formatDateShort(createdAt)}</dd>
        </div>
        <div>
          <dt className="portal-subtitle text-[11px]">Country of Application</dt>
          <dd className="mt-1 text-cp-ink">{displayCountry(country)}</dd>
        </div>
        {isInternationalParticipant(country) ? (
          <div>
            <dt className="portal-subtitle text-[11px]">Nationality</dt>
            <dd className="mt-1 text-cp-ink">{nationality?.trim() || "—"}</dd>
          </div>
        ) : null}
        {unit ? (
          <div>
            <dt className="portal-subtitle text-[11px]">Branch / formation</dt>
            <dd className="mt-1 text-cp-ink">
              {unit.branch}
              {unit.bdeOrFmn ? ` · ${unit.bdeOrFmn}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
