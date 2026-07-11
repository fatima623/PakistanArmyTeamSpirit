"use client";

import { useState } from "react";
import { Eye, Users2 } from "lucide-react";

import {
  TeamRosterTable,
  type RosterMember,
} from "@/components/admin/TeamRosterTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** “View Roster” button + dialog listing the participant's team members. */
export function TeamRosterDialog({
  members,
  teamName,
}: {
  members: RosterMember[];
  teamName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-none transition-colors hover:border-brand-olive/40 hover:bg-slate-50 hover:text-green-800"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden />
        View Roster
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.14)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[1rem] font-bold tracking-[-0.01em] text-slate-900">
              <Users2 size={16} className="text-green-800" aria-hidden />
              Team roster{teamName ? ` — ${teamName}` : ""}
            </DialogTitle>
            <DialogDescription className="text-[0.8125rem] text-slate-500">
              {members.length} {members.length === 1 ? "member" : "members"}{" "}
              registered on this roster.
            </DialogDescription>
          </DialogHeader>
          <TeamRosterTable members={members} className="max-h-[60vh]" />
        </DialogContent>
      </Dialog>
    </>
  );
}
