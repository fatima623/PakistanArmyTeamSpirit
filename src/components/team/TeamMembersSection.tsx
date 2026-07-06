"use client";

import { useState } from "react";
import { Eye, Loader2, Trash2, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TeamMemberFormDialog } from "@/components/team/TeamMemberFormDialog";
import { TeamMemberViewDialog } from "@/components/team/TeamMemberViewDialog";
import type { TeamMemberRecord } from "@/lib/team-members";
import type { TeamMemberInput } from "@/lib/validations";

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "–";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function TeamMembersSection({
  members,
  onAdd,
  onDelete,
  loading = false,
  deletingId = null,
  title = "Team Members",
}: {
  members: TeamMemberRecord[];
  onAdd: (values: TeamMemberInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  /** Initial list still loading (panel/API mode). */
  loading?: boolean;
  /** Id currently being deleted, for a per-row spinner. */
  deletingId?: string | null;
  title?: string;
  description?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [viewMember, setViewMember] = useState<TeamMemberRecord | null>(null);

  const hasMembers = members.length > 0;

  return (
    <div className="team-members">
      <div className="team-members__header">
        <div>
          <h2 className="team-members__title">{title}</h2>
          
          {hasMembers ? (
            <span className="team-members__count">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {members.length} registered
            </span>
          ) : null}
        </div>
        {hasMembers ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="tm-outline-btn"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="mr-1.5 h-4 w-4" aria-hidden />
            Add team member
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="team-members__empty">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading team members…
        </div>
      ) : !hasMembers ? (
        <div className="team-members__empty">
          <Users className="h-6 w-6 opacity-60" aria-hidden />
          <p>No team members added yet.</p>
          <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" aria-hidden />
            Add team member
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="team-members__table-wrap hidden md:block">
            <table className="team-members__table">
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Service Number</th>
                  <th scope="col">Service Arm</th>
                  <th scope="col">Gender</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="team-members__name">
                      <span className="team-members__member">
                        <span className="team-members__avatar" aria-hidden>
                          {memberInitials(m.fullName)}
                        </span>
                        <span className="team-members__member-name">
                          {m.fullName}
                        </span>
                      </span>
                    </td>
                    <td>{m.serviceNumber}</td>
                    <td>{m.serviceArm}</td>
                    <td>{m.gender}</td>
                    <td>
                      <div className="team-members__actions">
                        <button
                          type="button"
                          className="tm-icon-btn"
                          onClick={() => setViewMember(m)}
                          aria-label={`View ${m.fullName}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" aria-hidden />
                        </button>
                        <ConfirmDialog
                          title="Delete team member"
                          description={`Remove ${m.fullName} from your team? This cannot be undone.`}
                          confirmLabel="Delete"
                          onConfirm={() => onDelete(m.id)}
                          trigger={
                            <button
                              type="button"
                              className="tm-icon-btn tm-icon-btn--danger"
                              disabled={deletingId === m.id}
                              aria-label={`Delete ${m.fullName}`}
                              title="Delete"
                            >
                              {deletingId === m.id ? (
                                <Loader2
                                  className="h-4 w-4 animate-spin"
                                  aria-hidden
                                />
                              ) : (
                                <Trash2 className="h-4 w-4" aria-hidden />
                              )}
                            </button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="team-members__cards md:hidden">
            {members.map((m) => (
              <li key={m.id} className="team-members__card">
                <p className="team-members__card-name">{m.fullName}</p>
                <div className="team-members__card-row">
                  <span className="team-members__card-label">Service Number</span>
                  <span className="team-members__card-value">
                    {m.serviceNumber}
                  </span>
                </div>
                <div className="team-members__card-row">
                  <span className="team-members__card-label">Service Arm</span>
                  <span className="team-members__card-value">{m.serviceArm}</span>
                </div>
                <div className="team-members__card-row">
                  <span className="team-members__card-label">Gender</span>
                  <span className="team-members__card-value">{m.gender}</span>
                </div>
                <div className="team-members__card-actions">
                  <button
                    type="button"
                    className="tm-icon-btn"
                    onClick={() => setViewMember(m)}
                    aria-label={`View ${m.fullName}`}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                  </button>
                  <ConfirmDialog
                    title="Delete team member"
                    description={`Remove ${m.fullName} from your team? This cannot be undone.`}
                    confirmLabel="Delete"
                    onConfirm={() => onDelete(m.id)}
                    trigger={
                      <button
                        type="button"
                        className="tm-icon-btn tm-icon-btn--danger"
                        disabled={deletingId === m.id}
                        aria-label={`Delete ${m.fullName}`}
                        title="Delete"
                      >
                        {deletingId === m.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <TeamMemberFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={onAdd}
      />
      <TeamMemberViewDialog
        member={viewMember}
        open={viewMember !== null}
        onOpenChange={(open) => {
          if (!open) setViewMember(null);
        }}
      />
    </div>
  );
}
