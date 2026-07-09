"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminInput, adminTableActionsCenter } from "@/lib/admin-ui";
import {
  formatTickerExpiry,
  priorityBadgeClass,
  serializeTickerFromApi,
  statusBadgeClass,
  tickerPayloadFromRow,
  type SerializedTicker,
} from "@/lib/ticker-form-helpers";
import { TOAST } from "@/lib/toast";
import {
  compareTickersForDisplay,
  effectiveTickerStatus,
  TICKER_PRIORITY,
  TICKER_PRIORITY_LABELS,
  TICKER_STATUS,
  TICKER_STATUS_LABELS,
  type TickerPriority,
  type TickerVisibility,
} from "@/lib/ticker";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export type { SerializedTicker } from "@/lib/ticker-form-helpers";

const VISIBILITY_SHORT: Record<TickerVisibility, string> = {
  HOMEPAGE: "Home",
  LOGIN: "Login",
  DASHBOARD_BANNER: "Dashboard",
  GLOBAL: "Global",
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...Object.values(TICKER_STATUS).map((s) => ({
    value: s,
    label: TICKER_STATUS_LABELS[s],
  })),
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All priorities" },
  ...Object.values(TICKER_PRIORITY).map((p) => ({
    value: p,
    label: TICKER_PRIORITY_LABELS[p],
  })),
];

async function putTicker(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/ticker/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("update failed");
  const { ticker } = await res.json();
  return serializeTickerFromApi(ticker);
}

export function TickerManager({
  initialTickers,
}: {
  initialTickers: SerializedTicker[];
}) {
  const router = useRouter();
  const [tickers, setTickers] = useState(initialTickers);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [orderSavingId, setOrderSavingId] = useState<string | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const list = tickers.filter((t) => {
      const effective = effectiveTickerStatus(t.status, t.expiresAt);
      if (statusFilter !== "all" && effective !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return t.message.toLowerCase().includes(q);
    });
    return [...list].sort(compareTickersForDisplay);
  }, [tickers, debouncedSearch, statusFilter, priorityFilter]);

  const deleteTicker = async (id: string) => {
    const res = await fetch(`/api/admin/ticker/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTickers((prev) => prev.filter((t) => t.id !== id));
      toast.success(TOAST.DELETE_SUCCESS);
    } else {
      toast.error(TOAST.GENERIC_ERROR);
    }
  };

  const orderValueForRow = (t: SerializedTicker) =>
    orderDrafts[t.id] ?? String(t.sortOrder);

  const saveDisplayOrder = async (t: SerializedTicker) => {
    const raw = orderDrafts[t.id] ?? String(t.sortOrder);
    const next = Number.parseInt(raw, 10);
    if (Number.isNaN(next) || next < 0) {
      toast.error("Enter a valid display order (0 or higher).");
      setOrderDrafts((prev) => {
        const copy = { ...prev };
        delete copy[t.id];
        return copy;
      });
      return;
    }
    if (next === t.sortOrder) {
      setOrderDrafts((prev) => {
        const copy = { ...prev };
        delete copy[t.id];
        return copy;
      });
      return;
    }

    setOrderSavingId(t.id);
    try {
      const updated = await putTicker(t.id, tickerPayloadFromRow(t, next));
      setTickers((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );
      setOrderDrafts((prev) => {
        const copy = { ...prev };
        delete copy[t.id];
        return copy;
      });
      toast.success("Display order updated.");
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setOrderSavingId(null);
    }
  };

  const stopRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const goToEdit = (id: string) => {
    router.push(`/admin/ticker/${id}/edit`);
  };

  return (
    <div className="pb-8">
      <div className="admin-surface flex flex-col gap-6 p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="[&>h2]:text-[1.75rem] [&>h2]:font-bold [&>h2]:tracking-[-0.01em] [&>h2]:text-brand-ink [&>p]:mt-1.5 [&>p]:max-w-[40rem] [&>p]:text-sm [&>p]:leading-normal [&>p]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-brand-olive-dark">
            <h2>Announcements</h2>
            
          </div>
          <Button type="button" variant="adminPrimary" asChild>
            <Link href="/admin/ticker/new">Add announcement</Link>
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-[1_1_18rem] [&_.admin-input]:w-full">
            <Input
              type="search"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={adminInput}
              aria-label="Search announcements"
            />
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3 [&_.admin-input]:min-w-[11rem]">
            <select
              id="announcement-filter-status"
              className={adminInput}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              id="announcement-filter-priority"
              className={adminInput}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              {PRIORITY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-black/[0.06]">
          <table className="admin-data-table min-w-[56rem]">
            <colgroup>
              <col className="w-[5.5rem]" />
              <col className="w-auto" />
              <col className="w-[6.75rem]" />
              <col className="w-[6.75rem]" />
              <col className="w-[6.5rem]" />
              <col className="w-[10.5rem]" />
              <col className="w-[11.5rem]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col" className="!px-5">
                  Message
                </th>
                <th scope="col">Priority</th>
                <th scope="col">Status</th>
                <th scope="col">Visibility</th>
                <th scope="col" className="!pr-6">
                  Expiry
                </th>
                <th scope="col" className="!pl-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-4">
                      <p>
                        {tickers.length === 0
                          ? "No announcements yet."
                          : "No announcements match your filters."}
                      </p>
                      {tickers.length === 0 ? (
                        <Button type="button" variant="adminPrimary" asChild>
                          <Link href="/admin/ticker/new">
                            Create first announcement
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const effective = effectiveTickerStatus(
                    t.status,
                    t.expiresAt
                  );
                  const showUrgentDot =
                    t.isUrgent || t.priority === TICKER_PRIORITY.CRITICAL;
                  return (
                    <tr
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => goToEdit(t.id)}
                    >
                      <td
                        className="tabular-nums"
                        onClick={stopRowClick}
                      >
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            min={0}
                            className={cn(adminInput, "!w-[4.25rem] !min-h-9 !px-2 text-center font-semibold tabular-nums")}
                            value={orderValueForRow(t)}
                            disabled={orderSavingId === t.id}
                            aria-label="Display order for announcement"
                            onChange={(e) =>
                              setOrderDrafts((prev) => ({
                                ...prev,
                                [t.id]: e.target.value,
                              }))
                            }
                            onBlur={() => saveDisplayOrder(t)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveDisplayOrder(t);
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="max-w-0 !px-5 text-brand-ink">
                        <div className="flex min-w-0 flex-nowrap items-center justify-center gap-1.5">
                          <span
                            className="min-w-0 truncate font-medium leading-[1.35]"
                            title={t.message}
                          >
                            {t.message}
                          </span>
                          {showUrgentDot ? (
                            <span
                              className="h-2 w-2 flex-shrink-0 rounded-full bg-orange-600 ring-2 ring-orange-50"
                              title="Urgent"
                              aria-label="Urgent"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2 py-[0.2rem] text-[0.8125rem] font-semibold ${priorityBadgeClass(t.priority)}`}
                        >
                          {TICKER_PRIORITY_LABELS[t.priority as TickerPriority] ??
                            t.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2 py-[0.2rem] text-[0.8125rem] font-semibold ${statusBadgeClass(effective)}`}
                        >
                          {TICKER_STATUS_LABELS[effective]}
                        </span>
                      </td>
                      <td className="text-[0.8125rem]">
                        {VISIBILITY_SHORT[t.visibility as TickerVisibility] ??
                          t.visibility}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap !pr-6 text-[0.8125rem] tabular-nums",
                          !t.expiresAt && "text-muted-foreground/50"
                        )}
                      >
                        {formatTickerExpiry(t.expiresAt)}
                      </td>
                      <td onClick={stopRowClick}>
                        <div
                          className={adminTableActionsCenter}
                          role="group"
                          aria-label="Announcement actions"
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant="adminOutline"
                            className="portal-table-action-btn portal-table-action-btn--view portal-table-action-btn--icon"
                            asChild
                          >
                            <Link
                              href={`/admin/ticker/${t.id}/edit`}
                              aria-label="Edit announcement"
                              title="Edit announcement"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Link>
                          </Button>
                          <ConfirmDialog
                            title="Delete announcement?"
                            description="This will be removed from all public surfaces."
                            confirmLabel="Delete"
                            onConfirm={() => deleteTicker(t.id)}
                            trigger={
                              <Button
                                type="button"
                                size="sm"
                                variant="adminDestructive"
                                className="portal-table-action-btn portal-table-action-btn--danger portal-table-action-btn--icon"
                                aria-label="Delete announcement"
                                title="Delete announcement"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
