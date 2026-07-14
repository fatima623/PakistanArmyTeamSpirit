"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TOAST } from "@/lib/toast";

type Formation = { id: string; name: string };

/**
 * Admin-only per-team control: finalize a travel-ready team and allot it to a
 * Host Formation, or unassign it. The travel-ready gate is re-checked in the
 * API — `disabled` here is UX only.
 */
export function HostFormationAssign({
  userId,
  travelReady,
  currentFormationId,
  currentFormationName,
  formations,
}: {
  userId: string;
  travelReady: boolean;
  currentFormationId: string | null;
  currentFormationName: string | null;
  formations: Formation[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState(formations[0]?.id ?? "");

  const submit = async (hostFormationId: string | null) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/host-formation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostFormationId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          hostFormationId
            ? "Team finalized and marked to the host formation"
            : "Team unassigned from the host formation"
        );
        router.refresh();
      } else {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
        <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
          <Building2 size={16} aria-hidden />
          Host Formation
        </h3>
      </header>

      <div className="flex flex-col gap-3 p-[18px]">
        {currentFormationId ? (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3">
              <CheckCircle2
                size={18}
                className="flex-shrink-0 text-green-600"
                aria-hidden
              />
              <p className="m-0 text-[0.875rem] text-slate-800">
                Finalized and assigned to{" "}
                <strong className="font-semibold">
                  {currentFormationName ?? "a host formation"}
                </strong>
                .
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="adminOutline" size="sm" disabled={busy}>
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Unassign from host formation"
                  )}
                </Button>
              }
              title="Unassign team?"
              description="This removes the team from the host formation and clears its finalized-for-host status. You can re-assign it later."
              confirmLabel="Unassign"
              onConfirm={() => submit(null)}
            />
          </>
        ) : formations.length === 0 ? (
          <p className="m-0 text-[0.875rem] text-slate-600">
            No host formation exists yet. Create one on the{" "}
            <Link
              href="/admin/host-formations"
              className="font-semibold text-green-700 underline-offset-2 hover:underline"
            >
              Host Formations
            </Link>{" "}
            page first.
          </p>
        ) : (
          <>
            {formations.length > 1 ? (
              <label className="flex flex-col gap-1.5 text-[0.8125rem] font-semibold text-slate-700">
                Host formation
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-brand-olive/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-olive/15"
                >
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="m-0 text-[0.875rem] text-slate-600">
                Host formation:{" "}
                <strong className="font-semibold text-slate-800">
                  {formations[0].name}
                </strong>
              </p>
            )}

            <ConfirmDialog
              trigger={
                <Button
                  variant="adminApprove"
                  size="sm"
                  disabled={busy || !travelReady}
                  title={
                    travelReady
                      ? undefined
                      : "Team must be approved, payment verified, and flight details finalized first"
                  }
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Finalize & Mark to Host Fmn"
                  )}
                </Button>
              }
              title="Finalize & mark to host formation?"
              description="This finalizes the team and allots it to the selected host formation, which will see it on its read-only dashboard."
              confirmLabel="Finalize"
              onConfirm={() => submit(selectedId || formations[0].id)}
            />

            {!travelReady ? (
              <p className="m-0 text-[0.75rem] leading-snug text-amber-700">
                Not yet travel-ready — requires approved registration, verified
                payment, and finalized flight details.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
