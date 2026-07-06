"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TickerMarqueePreview } from "@/components/admin/TickerMarqueePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminInput } from "@/lib/admin-ui";
import {
  EMPTY_TICKER_FORM,
  formFromTicker,
  payloadFromTickerForm,
  type SerializedTicker,
  type TickerFormState,
} from "@/lib/ticker-form-helpers";
import { TOAST } from "@/lib/toast";
import {
  isTickerExpired,
  TICKER_PRIORITY,
  TICKER_PRIORITY_LABELS,
  tickerPreviewDurationSec,
  TICKER_VISIBILITY,
  TICKER_VISIBILITY_LABELS,
  type TickerPriority,
  type TickerVisibility,
} from "@/lib/ticker";
import { cn } from "@/lib/utils";

export function TickerAnnouncementForm({
  announcementId,
  initial,
  defaultSortOrder = 0,
  scrollDurationSec,
  homepageReferenceCharCount,
}: {
  announcementId?: string;
  initial?: SerializedTicker;
  defaultSortOrder?: number;
  /** Live homepage loop duration (from site settings). */
  scrollDurationSec: number;
  /** Sum of homepage ticker message lengths for speed scaling. */
  homepageReferenceCharCount: number;
}) {
  const router = useRouter();
  const isNew = !announcementId;
  const initialMessageLength = initial?.message.length ?? 0;

  const [form, setForm] = useState<TickerFormState>(() => {
    if (initial) return formFromTicker(initial);
    return { ...EMPTY_TICKER_FORM, sortOrder: defaultSortOrder };
  });
  const [submitting, setSubmitting] = useState(false);

  const referenceCharCount = useMemo(() => {
    const base = Math.max(homepageReferenceCharCount, initialMessageLength, 24);
    if (!initial) {
      return Math.max(base, form.message.trim().length, 24);
    }
    return Math.max(
      base - initialMessageLength + form.message.trim().length,
      form.message.trim().length,
      24
    );
  }, [
    homepageReferenceCharCount,
    initialMessageLength,
    initial,
    form.message,
  ]);

  const previewScrollDurationSec = useMemo(
    () =>
      tickerPreviewDurationSec(
        form.message,
        scrollDurationSec,
        referenceCharCount
      ),
    [form.message, scrollDurationSec, referenceCharCount]
  );

  const formExpired =
    form.expiresAt.trim() !== "" && isTickerExpired(form.expiresAt.trim());

  const publishBadge = form.publishState;

  const handleSave = async () => {
    if (!form.message.trim()) {
      toast.error("Announcement message is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = payloadFromTickerForm(form);
      const res = await fetch(
        isNew ? "/api/admin/ticker" : `/api/admin/ticker/${announcementId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        toast.error(TOAST.GENERIC_ERROR);
        return;
      }

      toast.success(TOAST.SAVE_SUCCESS);
      router.push("/admin/ticker");
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-user-detail-page admin-ticker-edit-page">
      <header className="admin-user-detail-hero">
        <div className="admin-user-detail-hero-main">
          <Link href="/admin/ticker" className="admin-user-detail-back">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Back to announcements
          </Link>
          <h1 className="admin-user-detail-name">
            {isNew ? "Add announcement" : "Edit announcement"}
          </h1>
          <p className="admin-user-detail-subline">
            Configure scrolling text shown on the homepage and other surfaces.
          </p>
          <div className="admin-user-detail-badges">
            {publishBadge === "LIVE" ? (
              <span className="admin-news-published-label">Live</span>
            ) : publishBadge === "DISABLED" ? (
              <span className="admin-ticker-badge-disabled-label">Disabled</span>
            ) : (
              <span className="admin-news-draft-label">Draft</span>
            )}
          </div>
        </div>
      </header>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Content</h3>
          <p className="admin-user-detail-card-desc">
            The message visitors see scrolling across the top of the site.
          </p>
        </div>
        <div className="admin-user-detail-card-body">
          <div className="admin-user-detail-field">
            <label htmlFor="ticker-message">
              Message <span className="text-red-600">*</span>
            </label>
            <Textarea
              id="ticker-message"
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              className="admin-input min-h-[6rem]"
              rows={4}
              maxLength={500}
              placeholder="Operational announcement text…"
            />
            <p className="admin-user-detail-status-controls-hint text-right">
              {form.message.length}/500
            </p>
          </div>
        </div>
      </section>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Where &amp; how it appears</h3>
          <p className="admin-user-detail-card-desc">
            Control which pages show this item and how prominently.
          </p>
        </div>
        <div className="admin-user-detail-card-body">
          <div className="admin-user-detail-grid admin-user-detail-grid--duo">
            <div className="admin-user-detail-field">
              <label htmlFor="ticker-visibility">Visibility</label>
              <select
                id="ticker-visibility"
                className={adminInput}
                value={form.visibility}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visibility: e.target.value as TickerVisibility,
                  }))
                }
              >
                {Object.values(TICKER_VISIBILITY).map((v) => (
                  <option key={v} value={v}>
                    {TICKER_VISIBILITY_LABELS[v]}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-user-detail-field">
              <label htmlFor="ticker-priority">Priority</label>
              <select
                id="ticker-priority"
                className={adminInput}
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as TickerPriority,
                  }))
                }
              >
                {Object.values(TICKER_PRIORITY).map((p) => (
                  <option key={p} value={p}>
                    {TICKER_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
              <p className="admin-user-detail-status-controls-hint">
                Critical items appear first on the homepage ticker.
              </p>
            </div>
          </div>
          <div
            className={cn(
              "admin-ticker-form-publish-row mt-4",
              form.isUrgent && "admin-ticker-form-publish-row--urgent"
            )}
          >
            <div className="admin-user-detail-field">
              <label htmlFor="ticker-urgent" className="flex items-center gap-3">
                <Switch
                  id="ticker-urgent"
                  checked={form.isUrgent}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isUrgent: checked }))
                  }
                  className="data-[state=checked]:bg-cp-olive"
                />
                <span className="text-sm text-cp-ink-muted">
                  Urgent — highlight in the marquee
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Publishing</h3>
          <p className="admin-user-detail-card-desc">
            Only live announcements appear on the public site when not expired.
          </p>
        </div>
        <div className="admin-user-detail-card-body">
          <div
            className={cn(
              "admin-ticker-form-publish-row",
              form.publishState === "LIVE" &&
                "admin-ticker-form-publish-row--live",
              form.publishState === "DRAFT" &&
                "admin-ticker-form-publish-row--draft",
              form.publishState === "DISABLED" &&
                "admin-ticker-form-publish-row--disabled"
            )}
          >
            <div className="admin-user-detail-field">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#0f172a]">
                Status
              </span>
              <div
                className="admin-ticker-publish-options"
                role="group"
                aria-label="Publishing status"
              >
              {(
                [
                  { value: "DRAFT", label: "Draft" },
                  { value: "LIVE", label: "Live" },
                  { value: "DISABLED", label: "Disabled" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "admin-ticker-publish-option",
                    form.publishState === opt.value &&
                      "admin-ticker-publish-option--active"
                  )}
                  onClick={() =>
                    setForm((f) => ({ ...f, publishState: opt.value }))
                  }
                >
                  {opt.label}
                </button>
              ))}
              </div>
            </div>
          </div>
          {formExpired ? (
            <p className="admin-ticker-expired-note mt-4" role="status">
              Expiry date is in the past — this will show as Expired on the site
              even if set to Live.
            </p>
          ) : null}
          <div className="admin-user-detail-grid admin-user-detail-grid--duo mt-4">
            <div className="admin-user-detail-field">
              <label htmlFor="ticker-expires">Expiry</label>
              <Input
                id="ticker-expires"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresAt: e.target.value }))
                }
                className="admin-input"
              />
              <p className="admin-user-detail-status-controls-hint">
                Leave blank to run until you turn it off.
              </p>
            </div>
            <div className="admin-user-detail-field">
              <label htmlFor="ticker-sort-order">Display order</label>
              <Input
                id="ticker-sort-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sortOrder: Number.parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="admin-input max-w-[8rem]"
              />
              <p className="admin-user-detail-status-controls-hint">
                Lower numbers appear first within the same priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Preview</h3>
          <p className="admin-user-detail-card-desc">
            How this will look on the homepage ticker.
          </p>
        </div>
        <div className="admin-user-detail-card-body">
          <TickerMarqueePreview
            message={form.message || "Your announcement preview…"}
            isUrgent={form.isUrgent}
            priority={form.priority}
            scrollDurationSec={previewScrollDurationSec}
          />
        </div>
      </section>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-body">
          <div className="admin-user-detail-actions">
            <Button
              type="button"
              variant="adminPrimary"
              disabled={submitting}
              onClick={() => void handleSave()}
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {isNew ? "Create announcement" : "Save changes"}
            </Button>
            <Button type="button" variant="adminOutline" disabled={submitting} asChild>
              <Link href="/admin/ticker">Cancel</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
