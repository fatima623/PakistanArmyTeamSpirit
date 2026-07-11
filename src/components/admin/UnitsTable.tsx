"use client";

import { useState } from "react";

import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  TeamRosterTable,
  type RosterMember,
} from "@/components/admin/TeamRosterTable";
import {
  displayCountry,
  formatAdminTableCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UnitRow = {
  id: string;
  unitName: string;
  unitType: string;
  branch: string;
  arm: string;
  secondPocEmail: string | null;
  thirdPocEmail: string | null;
  additionalInfo: string | null;
  coName: string;
  coEmail: string;
  coPhone: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    approved: boolean;
    country: string | null;
    nationality: string | null;
    _count: { teamMembers: number };
    teamMembers: RosterMember[];
  };
};

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "–";
}

/** One labelled field block — laid out 2–3 per row inside a section grid. */
function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 rounded-[9px] border border-input bg-muted/40 px-2.5 py-2 ${
        wide ? "col-span-full" : ""
      }`.trim()}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </span>
      <span className="break-words text-[13px] font-semibold text-brand-ink">
        {value || "—"}
      </span>
    </div>
  );
}

export function UnitsTable({ units }: { units: UnitRow[] }) {
  const [viewUnit, setViewUnit] = useState<UnitRow | null>(null);

  if (units.length === 0) {
    return <div className="admin-team-empty">No teams found</div>;
  }

  return (
    <>
      <div className="admin-team-grid">
        {units.map((u) => {
          const captain = u.coName
            ? u.coName
            : `${u.user.firstName} ${u.user.lastName}`;
          const intl = isInternationalParticipant(u.user.country);
          const country = formatAdminTableCountry(
            u.user.country,
            u.user.nationality
          );
          const members = u.user._count.teamMembers;
          const sub = [u.branch, u.arm].filter(Boolean).join(" · ");
          return (
            <article
              key={u.id}
              className="admin-team-card admin-team-card--clickable"
              role="button"
              tabIndex={0}
              aria-label={`View ${u.unitName} details`}
              onClick={() => setViewUnit(u)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setViewUnit(u);
                }
              }}
            >
              <div className="admin-team-card-head">
                <div className="min-w-0">
                  <div className="admin-team-card-name">{u.unitName}</div>
                  {sub ? <div className="admin-team-card-sub">{sub}</div> : null}
                </div>
                <span
                  className={`admin-team-card-status ${
                    u.user.approved
                      ? "admin-team-card-status--active"
                      : "admin-team-card-status--pending"
                  }`}
                >
                  {u.user.approved ? "Active" : "Pending"}
                </span>
              </div>

              <div className="admin-team-card-captain">
                <span className="admin-users-avatar" aria-hidden>
                  {initials(u.user.firstName, u.user.lastName)}
                </span>
                <div className="admin-team-card-captain-text">
                  <div className="admin-team-card-captain-name">
                    {captain}
                    {intl ? <IntlBadge /> : null}
                  </div>
                  <div className="admin-team-card-captain-role">Team captain</div>
                </div>
                {country && country !== "—" ? (
                  <span className="admin-team-card-country">{country}</span>
                ) : null}
              </div>

              <div className="admin-team-card-foot">
                <span className="admin-team-card-members">
                  {members} {members === 1 ? "member" : "members"}
                </span>
                <span className="admin-team-card-link" aria-hidden>
                  View details →
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!viewUnit} onOpenChange={() => setViewUnit(null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]">
          {viewUnit && (
            <>
              <DialogHeader>
                <DialogTitle className="text-brand-olive-dark">
                  {viewUnit.unitName}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-0.5 flex flex-col gap-3.5">
                <section>
                  <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-olive-dark">Team &amp; captain</h4>
                  <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">
                    <Field
                      label="Team members"
                      value={String(viewUnit.user._count.teamMembers)}
                    />
                    <Field
                      label="Captain"
                      value={`${viewUnit.user.firstName} ${viewUnit.user.lastName}`}
                    />
                    <Field
                      label="Country"
                      value={displayCountry(viewUnit.user.country)}
                    />
                    <Field label="Email" value={viewUnit.user.email} wide />
                    {isInternationalParticipant(viewUnit.user.country) ? (
                      <Field
                        label="Nationality"
                        value={viewUnit.user.nationality ?? ""}
                      />
                    ) : null}
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-olive-dark">Unit details</h4>
                  <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">
                    <Field label="Unit type" value={viewUnit.unitType} />
                    <Field label="Branch" value={viewUnit.branch} />
                    <Field label="Arm" value={viewUnit.arm} />
                    <Field
                      label="2nd POC email"
                      value={viewUnit.secondPocEmail ?? ""}
                    />
                    <Field
                      label="3rd POC email"
                      value={viewUnit.thirdPocEmail ?? ""}
                    />
                    {viewUnit.additionalInfo ? (
                      <Field
                        label="Additional info"
                        value={viewUnit.additionalInfo}
                        wide
                      />
                    ) : null}
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-olive-dark">CO / 2IC</h4>
                  <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">
                    <Field label="CO name" value={viewUnit.coName} />
                    <Field label="CO email" value={viewUnit.coEmail} />
                    <Field label="CO phone" value={viewUnit.coPhone} />
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 flex items-center justify-between gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-olive-dark">
                    <span>Team members</span>
                    <span className="rounded-full bg-brand-olive/10 px-2 py-0.5 text-[10.5px] font-bold normal-case tracking-normal text-brand-olive-dark">
                      {viewUnit.user.teamMembers.length}{" "}
                      {viewUnit.user.teamMembers.length === 1
                        ? "member"
                        : "members"}
                    </span>
                  </h4>
                  <TeamRosterTable members={viewUnit.user.teamMembers} />
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
