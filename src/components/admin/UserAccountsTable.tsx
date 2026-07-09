import Link from "next/link";
import { Pencil } from "lucide-react";

import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth-routes";
import { portalTableActionIconView,
  adminApproveBtnStyles,
  adminTableActionsCenter,
  adminTablePillStyles,
} from "@/lib/admin-ui";
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
      <div className="overflow-x-hidden rounded-xl border border-brand-line/60 bg-white">
        <p className="px-6 py-14 text-center text-[0.9375rem] font-medium text-slate-900/70">No users found</p>
      </div>
    );
  }

  return (
    <section className="overflow-x-hidden rounded-xl border border-brand-line/60 bg-white" aria-label="User accounts table">
      <table className={`admin-data-table ${adminTablePillStyles} ${adminApproveBtnStyles} [&>tbody>tr:nth-child(even)]:bg-neutral-50 [&>tbody>tr:hover]:bg-slate-50`}>
        <colgroup>
          <col className="w-16" />
          <col className="admin-users-col-participant" />
          <col className="admin-users-col-unit !w-[13%]" />
          <col className="admin-users-col-app" />
          <col className="admin-users-col-unit !w-[13%]" />
          <col className="admin-users-col-actions !w-[10%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              #
            </th>
            <th scope="col" className="admin-users-th-primary">
              User
            </th>
            <th scope="col">
              Role
            </th>
            <th scope="col">
              Status
            </th>
            <th scope="col">
              Last active
            </th>
            <th scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} className="admin-users-row">
              <td className="font-semibold tabular-nums text-slate-500">{startIndex + i + 1}</td>
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
              <td>
                <span className={`admin-role-pill admin-role-pill--${u.role}`}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </td>
              <td>
                <span
                  className={`admin-account-status admin-account-status--${
                    u.suspended ? "suspended" : "active"
                  }`}
                >
                  {u.suspended ? "Suspended" : "Active"}
                </span>
              </td>
              <td>
                <span className="admin-users-cell-inner truncate text-[0.8125rem] leading-[1.4] text-slate-900">
                  {formatDateShort(u.updatedAt)}
                </span>
              </td>
              <td>
                <div
                  className={adminTableActionsCenter}
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
