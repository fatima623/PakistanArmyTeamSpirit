"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMemberRecord } from "@/lib/team-members";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-cp-border/70 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-cp-ink-muted">
        {label}
      </dt>
      <dd className="text-sm font-medium text-cp-ink">{value || "—"}</dd>
    </div>
  );
}

export function TeamMemberViewDialog({
  member,
  open,
  onOpenChange,
}: {
  member: TeamMemberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-cp-border bg-white text-cp-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]">
        <DialogHeader>
          <DialogTitle className="text-cp-ink">Team member details</DialogTitle>
          <DialogDescription className="text-cp-ink-muted">
            Read-only view of this team member.
          </DialogDescription>
        </DialogHeader>

        {member ? (
          <dl className="space-y-3">
            <Row label="Full name" value={member.fullName} />
            <Row label="Service number" value={member.serviceNumber} />
            <Row label="Service / Arm" value={member.serviceArm} />
            <Row label="Gender" value={member.gender} />
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
