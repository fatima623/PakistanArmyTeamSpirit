import { IntlBadge } from "@/components/admin/IntlBadge";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import {
  formatAdminTableCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { UserApplicationStatusCell } from "@/components/admin/UserApplicationStatusCell";
import { UserManagementRowActions } from "@/components/admin/UserManagementRowActions";
import { formatDateShort } from "@/lib/utils";

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
  /** SD (Sports Directorate) only — enables the quick-approve button. */
  canApprove?: boolean;
}) {
  if (users.length === 0) {
    return (
      <div className="admin-users-table-shell">
        <p className="admin-users-empty">No users found</p>
      </div>
    );
  }

  return (
    <section
      className="admin-users-table-shell"
      aria-label="Participation requests table"
    >
      <table className="admin-users-table">
        <colgroup>
          <col className="admin-users-col-participant" />
          <col className="admin-users-col-unit" />
          <col className="admin-users-col-app" />
          <col className="admin-users-col-pay" />
          <col className="admin-users-col-actions" />
        </colgroup>
        <thead className="admin-users-thead">
          <tr>
            <th scope="col" className="admin-users-th-primary">
              Participant
            </th>
            <th scope="col" className="admin-users-th-unit">
              Unit
            </th>
            <th scope="col" className="admin-users-th-status">
              Application
            </th>
            <th scope="col" className="admin-users-th-status">
              Payment
            </th>
            <th scope="col" className="admin-users-th-actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const international = isInternationalParticipant(u.country);
            const unitSub = [u.rank, formatAdminTableCountry(u.country, u.nationality)]
              .filter((v) => v && v !== "—")
              .join(" · ");
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
                    </div>
                  </div>
                </td>
                <td className="admin-users-cell-unit">
                  <div className="admin-users-unit-name">
                    {u.unit?.unitName ?? "—"}
                  </div>
                  {unitSub ? (
                    <div className="admin-users-unit-sub">{unitSub}</div>
                  ) : null}
                </td>
                <td className="admin-users-cell-badge admin-users-cell-app-status">
                  <UserApplicationStatusCell
                    userId={u.id}
                    applicationStatus={u.applicationStatus}
                    suspended={u.suspended}
                    canApprove={canApprove}
                  />
                  <div className="admin-users-app-date">
                    {formatDateShort(u.createdAt)}
                  </div>
                </td>
                <td className="admin-users-cell-badge admin-users-cell-pay">
                  <div className="admin-users-badge-cell">
                    <PaymentStatusBadge
                      status={u.paymentStatus}
                      showPrefix={false}
                      density="table"
                      className="admin-users-status-badge--payment"
                    />
                  </div>
                </td>
                <td className="admin-users-cell-actions">
                  <UserManagementRowActions userId={u.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
