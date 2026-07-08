"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  TICKER_PRIORITY,
  TICKER_PRIORITY_LABELS,
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
}: {
  announcementId?: string;
  initial?: SerializedTicker;
  defaultSortOrder?: number;
  /** Accepted for compatibility with callers; no longer used by the form. */
  scrollDurationSec?: number;
  /** Accepted for compatibility with callers; no longer used by the form. */
  homepageReferenceCharCount?: number;
}) {
  const router = useRouter();
  const isNew = !announcementId;

  const [form, setForm] = useState<TickerFormState>(() => {
    if (initial) return formFromTicker(initial);
    return { ...EMPTY_TICKER_FORM, sortOrder: defaultSortOrder };
  });
  const [submitting, setSubmitting] = useState(false);

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
        
        </div>
      </header>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Announcement</h3>
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

          <div className="admin-user-detail-grid admin-user-detail-grid--duo mt-4">
          
          </div>

          <div className="admin-user-detail-field mt-4">
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
            <Button
              type="button"
              variant="adminOutline"
              disabled={submitting}
              asChild
            >
              <Link href="/admin/ticker">Cancel</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
