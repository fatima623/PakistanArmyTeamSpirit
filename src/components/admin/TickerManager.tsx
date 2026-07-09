"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminInput } from "@/lib/admin-ui";
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
    <div className="admin-ticker-page">
      <div className="admin-ticker-panel">
        <header className="admin-ticker-header">
          <div className="admin-ticker-header-text">
            <h2>Announcements</h2>
            
          </div>
          <Button type="button" variant="adminPrimary" asChild>
            <Link href="/admin/ticker/new">Add announcement</Link>
          </Button>
        </header>

        <div className="admin-ticker-toolbar-row">
          <div className="admin-ticker-toolbar-search">
            <Input
              type="search"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={adminInput}
              aria-label="Search announcements"
            />
          </div>
          <div className="admin-ticker-toolbar-filters">
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

        <div className="admin-ticker-table-shell">
          <table className="admin-ticker-table">
            <colgroup>
              <col className="admin-ticker-col-order" />
              <col className="admin-ticker-col-message" />
              <col className="admin-ticker-col-priority" />
              <col className="admin-ticker-col-status" />
              <col className="admin-ticker-col-visibility" />
              <col className="admin-ticker-col-expiry" />
              <col className="admin-ticker-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col" className="admin-ticker-th-message">
                  Message
                </th>
                <th scope="col">Priority</th>
                <th scope="col">Status</th>
                <th scope="col">Visibility</th>
                <th scope="col" className="admin-ticker-th-expiry">
                  Expiry
                </th>
                <th scope="col" className="admin-ticker-th-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-ticker-empty">
                    <div className="admin-ticker-empty-inner">
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
                      className="admin-ticker-row"
                      onClick={() => goToEdit(t.id)}
                    >
                      <td
                        className="admin-ticker-cell-order"
                        onClick={stopRowClick}
                      >
                        <div className="admin-ticker-order-manual">
                          <Input
                            type="number"
                            min={0}
                            className={cn(adminInput, "admin-ticker-order-input")}
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
                      <td className="admin-ticker-cell-message">
                        <div className="admin-ticker-message-cell">
                          <span
                            className="admin-ticker-message-text"
                            title={t.message}
                          >
                            {t.message}
                          </span>
                          {showUrgentDot ? (
                            <span
                              className="admin-ticker-urgent-dot"
                              title="Urgent"
                              aria-label="Urgent"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-ticker-badge ${priorityBadgeClass(t.priority)}`}
                        >
                          {TICKER_PRIORITY_LABELS[t.priority as TickerPriority] ??
                            t.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-ticker-badge ${statusBadgeClass(effective)}`}
                        >
                          {TICKER_STATUS_LABELS[effective]}
                        </span>
                      </td>
                      <td className="admin-ticker-cell-visibility">
                        {VISIBILITY_SHORT[t.visibility as TickerVisibility] ??
                          t.visibility}
                      </td>
                      <td
                        className={cn(
                          "admin-ticker-cell-expiry",
                          !t.expiresAt && "admin-ticker-cell-expiry--none"
                        )}
                      >
                        {formatTickerExpiry(t.expiresAt)}
                      </td>
                      <td onClick={stopRowClick}>
                        <div
                          className="admin-ticker-row-actions"
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
