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
    <section className="pp-card">
      <div className="pp-card__head">
        <div>
          <p className="pp-eyebrow">Profile</p>
          <h2 className="pp-card__title" style={{ marginTop: "0.15rem" }}>
            Registration details
          </h2>
        </div>
      </div>
      <dl className="pp-dl">
        <div>
          <dt className="pp-dl__term">Name</dt>
          <dd className="pp-dl__desc">
            {firstName} {lastName}
          </dd>
        </div>
        <div>
          <dt className="pp-dl__term">Unit</dt>
          <dd className="pp-dl__desc">{unit?.unitName ?? "—"}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">Email</dt>
          <dd className="pp-dl__desc">{email}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">Rank</dt>
          <dd className="pp-dl__desc">{rank || "—"}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">Date registered</dt>
          <dd className="pp-dl__desc">{formatDateShort(createdAt)}</dd>
        </div>
        <div>
          <dt className="pp-dl__term">Country of Application</dt>
          <dd className="pp-dl__desc">{displayCountry(country)}</dd>
        </div>
        {isInternationalParticipant(country) ? (
          <div>
            <dt className="pp-dl__term">Nationality</dt>
            <dd className="pp-dl__desc">{nationality?.trim() || "—"}</dd>
          </div>
        ) : null}
        {unit ? (
          <div>
            <dt className="pp-dl__term">Branch / formation</dt>
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
