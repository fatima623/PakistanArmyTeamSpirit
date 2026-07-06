"use client";

import { useState } from "react";
import { toast } from "sonner";

import { TeamMembersSection } from "@/components/team/TeamMembersSection";
import { TOAST } from "@/lib/toast";
import type { TeamMemberRecord } from "@/lib/team-members";
import type { TeamMemberInput } from "@/lib/validations";

/**
 * API-backed Team Members manager for the Participant Panel. Hydrates from the
 * server-rendered list, then performs create/delete against the participant's
 * own endpoints with optimistic UI + toast feedback.
 */
export function TeamMembersPanel({
  initialMembers,
}: {
  initialMembers: TeamMemberRecord[];
}) {
  const [members, setMembers] = useState<TeamMemberRecord[]>(initialMembers);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (values: TeamMemberInput) => {
    const res = await fetch("/api/user/team-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? TOAST.GENERIC_ERROR);
      throw new Error("add failed");
    }
    const { teamMember } = (await res.json()) as {
      teamMember: TeamMemberRecord;
    };
    setMembers((prev) => [...prev, teamMember]);
    toast.success("Team member added");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/user/team-members/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Team member removed");
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <TeamMembersSection
      members={members}
      onAdd={handleAdd}
      onDelete={handleDelete}
      deletingId={deletingId}
    />
  );
}
