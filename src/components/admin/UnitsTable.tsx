"use client";

import { useState } from "react";
import Link from "next/link";

import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  displayCountry,
  formatAdminTableCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { Button } from "@/components/ui/button";
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
  service: string;
  patrolsRequested: number;
  preferredPhase: string | null;
  jointPatrol: boolean;
  bdeOrFmn: string;
  divOrFmn: string;
  arm: string;
  unitAddress: string;
  postcode: string;
  telephoneMil: string;
  telephoneCiv: string;
  secondPocEmail: string | null;
  thirdPocEmail: string | null;
  additionalInfo: string | null;
  coName: string;
  coEmail: string;
  coPhone: string;
  coRank: string;
  coSalutations: string | null;
  canAccommodateIntl: boolean;
  preferredIntlPatrol: string | null;
  longStandingRelation: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    approved: boolean;
    country: string | null;
    nationality: string | null;
    _count: { teamMembers: number };
  };
};

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "–";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="font-medium text-cp-ink-muted">{label}</span>
      <span className="text-cp-ink">{value || "—"}</span>
    </>
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
            ? `${u.coRank} ${u.coName}`.trim()
            : `${u.user.firstName} ${u.user.lastName}`;
          const intl = isInternationalParticipant(u.user.country);
          const country = formatAdminTableCountry(
            u.user.country,
            u.user.nationality
          );
          const members = u.user._count.teamMembers;
          const sub = [u.branch, u.bdeOrFmn].filter(Boolean).join(" · ");
          return (
            <article key={u.id} className="admin-team-card">
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
                <button
                  type="button"
                  className="admin-team-card-link"
                  onClick={() => setViewUnit(u)}
                >
                  View team roster →
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!viewUnit} onOpenChange={() => setViewUnit(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-cp-border bg-white text-cp-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]">
          {viewUnit && (
            <>
              <DialogHeader>
                <DialogTitle>{viewUnit.unitName}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-[160px_1fr]">
                <DetailRow
                  label="Team members"
                  value={String(viewUnit.user._count.teamMembers)}
                />
                <DetailRow
                  label="User"
                  value={`${viewUnit.user.firstName} ${viewUnit.user.lastName}`}
                />
                <DetailRow label="Email" value={viewUnit.user.email} />
                <DetailRow
                  label="Country of application"
                  value={displayCountry(viewUnit.user.country)}
                />
                {isInternationalParticipant(viewUnit.user.country) ? (
                  <DetailRow
                    label="Nationality"
                    value={viewUnit.user.nationality ?? ""}
                  />
                ) : null}
                <DetailRow label="Unit type" value={viewUnit.unitType} />
                <DetailRow label="Branch" value={viewUnit.branch} />
                <DetailRow label="Joint patrol" value={viewUnit.jointPatrol ? "Yes" : "No"} />
                <DetailRow label="Bde / Fmn" value={viewUnit.bdeOrFmn} />
                <DetailRow label="Div / Fmn" value={viewUnit.divOrFmn} />
                <DetailRow label="Arm" value={viewUnit.arm} />
                <DetailRow label="Service" value={viewUnit.service} />
                <DetailRow label="Address" value={viewUnit.unitAddress} />
                <DetailRow label="Postcode" value={viewUnit.postcode} />
                <DetailRow label="Tel (mil)" value={viewUnit.telephoneMil} />
                <DetailRow label="Tel (civ)" value={viewUnit.telephoneCiv} />
                <DetailRow label="2nd POC" value={viewUnit.secondPocEmail ?? ""} />
                <DetailRow label="3rd POC" value={viewUnit.thirdPocEmail ?? ""} />
                <DetailRow label="Additional" value={viewUnit.additionalInfo ?? ""} />
                <span className="col-span-2 mt-4 border-t border-cp-border pt-4 font-bold text-cp-ink-muted">
                  CO details
                </span>
                <DetailRow label="CO name" value={viewUnit.coName} />
                <DetailRow label="CO email" value={viewUnit.coEmail} />
                <DetailRow label="CO phone" value={viewUnit.coPhone} />
                <DetailRow label="CO rank" value={viewUnit.coRank} />
                <DetailRow label="Salutations" value={viewUnit.coSalutations ?? ""} />
                <span className="col-span-2 mt-4 border-t border-cp-border pt-4 font-bold text-cp-ink-muted">
                  Hosting
                </span>
                <DetailRow label="Preferred phase" value={viewUnit.preferredPhase ?? ""} />
                <DetailRow label="Patrols requested" value={String(viewUnit.patrolsRequested)} />
                <DetailRow
                  label="Can accommodate intl"
                  value={viewUnit.canAccommodateIntl ? "Yes" : "No"}
                />
                <DetailRow
                  label="Preferred intl patrol"
                  value={viewUnit.preferredIntlPatrol ?? ""}
                />
                <DetailRow
                  label="Long-standing relation"
                  value={viewUnit.longStandingRelation ? "Yes" : "No"}
                />
              </div>
              <div className="mt-5 flex justify-end border-t border-cp-border pt-4">
                <Button
                  size="sm"
                  variant="adminPrimary"
                  className="portal-table-action-btn portal-table-action-btn--primary"
                  asChild
                >
                  <Link href={`/admin/units/${viewUnit.id}/edit`}>Edit unit</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
