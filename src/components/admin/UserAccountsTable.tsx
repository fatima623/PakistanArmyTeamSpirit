import Link from "next/link";
import { Pencil } from "lucide-react";

import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth-routes";
import { portalTableActionIconView } from "@/lib/admin-ui";
import { formatDateShort } from "@/lib/utils";

export type UserAccountRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  role: string;
  createdAt: Date;
  suspended: boolean;
  updatedAt: Date;
};

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "–";
}

/**
 * Account-management table for /admin/user-management — mockup layout:
 * USER (avatar + name + email) · ROLE · STATUS · LAST ACTIVE · ACTIONS.
 */
export function UserAccountsTable({
  users,
  startIndex = 0,
}: {
  users: UserAccountRow[];
  startIndex?: number;
}) {
  if (users.length === 0) {
    return (
      <div className="admin-users-table-shell">
        <p className="admin-users-empty">No users found</p>
      </div>
    );
  }

  return (
    <section className="admin-users-table-shell" aria-label="User accounts table">
      <table className="admin-users-table">
        <colgroup>
          <col className="admin-users-col-num" />
          <col className="admin-users-col-participant" />
          <col className="admin-users-col-unit" />
          <col className="admin-users-col-app" />
          <col className="admin-users-col-unit" />
          <col className="admin-users-col-actions" />
        </colgroup>
        <thead className="admin-users-thead">
          <tr>
            <th scope="col" className="admin-users-th-num">
              #
            </th>
            <th scope="col" className="admin-users-th-primary">
              User
            </th>
            <th scope="col" className="admin-users-th-status">
              Role
            </th>
            <th scope="col" className="admin-users-th-status">
              Status
            </th>
            <th scope="col" className="admin-users-th-date">
              Last active
            </th>
            <th scope="col" className="admin-users-th-actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} className="admin-users-row">
              <td className="admin-users-cell-num">{startIndex + i + 1}</td>
              <td className="admin-users-cell-participant">
                <div className="admin-users-participant">
                  <span className="admin-users-avatar" aria-hidden>
                    {initials(u.firstName, u.lastName)}
                  </span>
                  <div className="admin-users-participant-text">
                    <div className="admin-users-participant-name">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="admin-users-participant-sub">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="admin-users-cell-badge">
                <span className={`admin-role-pill admin-role-pill--${u.role}`}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </td>
              <td className="admin-users-cell-badge">
                <span
                  className={`admin-account-status admin-account-status--${
                    u.suspended ? "suspended" : "active"
                  }`}
                >
                  {u.suspended ? "Suspended" : "Active"}
                </span>
              </td>
              <td className="admin-users-cell-meta admin-users-cell-date">
                <span className="admin-users-cell-inner">
                  {formatDateShort(u.updatedAt)}
                </span>
              </td>
              <td className="admin-users-cell-actions">
                <div
                  className="admin-users-row-actions"
                  role="group"
                  aria-label="Row actions"
                >
                  <Button
                    size="sm"
                    variant="adminOutline"
                    className={portalTableActionIconView}
                    asChild
                  >
                    <Link
                      href={`/admin/user-management/${u.id}`}
                      aria-label="Manage account"
                      title="Manage account"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <DeleteUserButton userId={u.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
