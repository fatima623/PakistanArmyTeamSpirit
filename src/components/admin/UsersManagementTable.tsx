import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  ApplicationStatusBadge,
  OverallStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";
import {
  formatAdminTableCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { UserManagementRowActions } from "@/components/admin/UserManagementRowActions";
import { formatDateShort } from "@/lib/utils";
import { adminApproveBtnStyles, adminTablePillStyles } from "@/lib/admin-ui";

export type UserManagementRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  applicationStatus: string;
  paymentStatus: string;
  suspended: boolean;
  createdAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  country: string | null;
  nationality: string | null;
  unit: { unitName: string } | null;
};

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "–";
}

export function UsersManagementTable({
  users,
  canApprove = false,
}: {
  users: UserManagementRow[];
  /** SD (Sports Directorate) only — enables the verification row action. */
  canApprove?: boolean;
}) {
  if (users.length === 0) {
    return (
      <div className="overflow-x-hidden rounded-xl border border-brand-line/60 bg-white">
        <p className="px-6 py-14 text-center text-[0.9375rem] font-medium text-slate-900/70">No users found</p>
      </div>
    );
  }

  return (
    <section
      className="overflow-x-auto rounded-xl border border-brand-line/60 bg-white"
      aria-label="Participation requests table"
    >
      <table
        className={`admin-data-table min-w-[860px] ${adminTablePillStyles} ${adminApproveBtnStyles} [&>tbody>tr:nth-child(even)]:bg-neutral-50 [&>tbody>tr:hover]:bg-slate-50 [&_thead_th]:!text-[0.71875rem] [&_thead_th]:!tracking-[0.07em] [&_thead_th]:!text-slate-400`}
      >
        <colgroup>
          <col className="admin-users-col-participant" />
          <col className="admin-users-col-unit !w-[15%]" />
          <col className="admin-users-col-app !w-[13%]" />
          <col className="admin-users-col-pay !w-[12%]" />
          <col className="!w-[14%]" />
          <col className="admin-users-col-actions !w-[128px]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="admin-users-th-primary">
              Participant
            </th>
            <th scope="col">
              Unit
            </th>
            <th scope="col">
              Application Status
            </th>
            <th scope="col">
              Payment Status
            </th>
            <th scope="col">
              Overall Status
            </th>
            <th scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const international = isInternationalParticipant(u.country);
            const meta = [u.rank, formatAdminTableCountry(u.country, u.nationality)]
              .filter((v) => v && v !== "—")
              .join(" · ");
            const decisionDate = u.approvedAt ?? u.rejectedAt ?? u.createdAt;
            return (
              <tr key={u.id} className="admin-users-row">
                <td className="admin-users-cell-participant">
                  <div className="admin-users-participant">
                    <span className="admin-users-avatar" aria-hidden>
                      {initials(u.firstName, u.lastName)}
                    </span>
                    <div className="admin-users-participant-text">
                      <div className="admin-users-participant-name">
                        {u.firstName} {u.lastName}
                        {international ? <IntlBadge /> : null}
                      </div>
                      <div className="admin-users-participant-sub">{u.email}</div>
                      {meta ? (
                        <div className="admin-users-participant-sub !text-[11px]">
                          {meta}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="admin-users-unit-name">
                    {u.unit?.unitName ?? "—"}
                  </div>
                </td>
                <td>
                  <div className="flex w-full min-w-0 flex-col items-center justify-start gap-0.5">
                    <ApplicationStatusBadge
                      status={u.applicationStatus}
                      showPrefix={false}
                      density="table"
                      className="admin-users-status-badge--app"
                    />
                    <div className="admin-users-app-date">
                      {formatDateShort(decisionDate)}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex w-full min-w-0 flex-col items-center justify-start gap-1.5">
                    <PaymentStatusBadge
                      status={u.paymentStatus}
                      showPrefix={false}
                      density="table"
                      className="admin-users-status-badge--payment"
                    />
                  </div>
                </td>
                <td>
                  <OverallStatusBadge
                    applicationStatus={u.applicationStatus}
                    suspended={u.suspended}
                  />
                </td>
                <td>
                  <UserManagementRowActions
                    userId={u.id}
                    applicationStatus={u.applicationStatus}
                    canReview={canApprove}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
