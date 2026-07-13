import { displayCountry, isInternationalParticipant } from "@/lib/participant-country";
import { formatDateShort } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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
  t: Dictionary["registration"];
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
  t,
}: Props) {
  return (
    <section className="pp-card" style={{ borderRadius: "1rem", overflow: "hidden" }}>
      <div className="pp-card__head">
        <div>
          <p className="pp-eyebrow">{t.profileEyebrow}</p>
          <h2 className="pp-card__title" style={{ marginTop: "0.15rem" }}>
            {t.title}
          </h2>
        </div>
      </div>
      <dl className="pp-dl">
        <div>
          <dt className="pp-dl__term">{t.name}</dt>
          <dd className="pp-dl__desc">
            {firstName} {lastName}
          </dd>
        </div>
        <div>
          <dt className="pp-dl__term">{t.unit}</dt>
          <dd className="pp-dl__desc">{unit?.unitName ?? "—"}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">{t.email}</dt>
          <dd className="pp-dl__desc">{email}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">{t.rank}</dt>
          <dd className="pp-dl__desc">{rank || "—"}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">{t.dateRegistered}</dt>
          <dd className="pp-dl__desc">{formatDateShort(createdAt)}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">{t.countryOfApplication}</dt>
          <dd className="pp-dl__desc">{displayCountry(country)}</dd>
        </div>
        {isInternationalParticipant(country) ? (
          <div>
            <dt className="pp-dl__term">{t.nationality}</dt>
            <dd className="pp-dl__desc">{nationality?.trim() || "—"}</dd>
          </div>
        ) : null}
        {unit ? (
          <div>
            <dt className="pp-dl__term">{t.branchFormation}</dt>
            <dd className="pp-dl__desc">
              {unit.branch}
              {unit.bdeOrFmn ? ` · ${unit.bdeOrFmn}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
