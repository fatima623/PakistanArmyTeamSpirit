import { cn } from "@/lib/utils";

export type RosterMember = {
  id: string;
  fullName: string;
  serviceNumber: string;
  rank: string;
  serviceArm: string;
  gender: string;
};

/**
 * Tabular team-member roster — shared by the Participating Teams card dialog
 * and the participant detail "View Roster" dialog.
 */
export function TeamRosterTable({
  members,
  className,
}: {
  members: RosterMember[];
  className?: string;
}) {
  if (members.length === 0) {
    return (
      <p className="m-0 rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-[12.5px] font-medium text-slate-500">
        No team members added yet.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "max-h-[46vh] overflow-y-auto overflow-x-auto rounded-[10px] border border-brand-line/70",
        className
      )}
    >
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-[1]">
          <tr className="bg-slate-50">
            {["#", "Full name", "Service no.", "Rank", "Service arm", "Gender"].map(
              (h) => (
                <th
                  key={h}
                  scope="col"
                  className="whitespace-nowrap border-b border-brand-line/70 px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr
              key={m.id}
              className="border-b border-brand-line/50 last:border-b-0 odd:bg-white even:bg-slate-50/60 hover:bg-brand-parchment/60"
            >
              <td className="px-3 py-2.5 text-[12px] tabular-nums text-slate-400">
                {i + 1}
              </td>
              <td className="px-3 py-2.5 text-[13px] font-semibold text-slate-900">
                {m.fullName || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] tabular-nums text-slate-600">
                {m.serviceNumber || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] text-slate-600">
                {m.rank || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] text-slate-600">
                {m.serviceArm || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] text-slate-600">
                {m.gender || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
