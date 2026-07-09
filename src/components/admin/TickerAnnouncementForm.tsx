"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_TICKER_FORM,
  formFromTicker,
  payloadFromTickerForm,
  type SerializedTicker,
  type TickerFormState,
} from "@/lib/ticker-form-helpers";
import { TOAST } from "@/lib/toast";

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
    // New announcements go live immediately — the form no longer exposes a
    // status control, so default to LIVE rather than a hidden draft.
    return {
      ...EMPTY_TICKER_FORM,
      sortOrder: defaultSortOrder,
      publishState: "LIVE",
    };
  });
  const [submitting, setSubmitting] = useState(false);

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
    <div className="flex w-full flex-col gap-[0.85rem] pb-2 mx-auto max-w-[52rem] pb-8">
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="min-w-0 flex-[1_1_16rem]">
          <Link href="/admin/ticker" className="mb-1.5 inline-flex items-center text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Back to announcements
          </Link>
          <h1 className="m-0 flex flex-wrap items-center gap-2 text-[1.15rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">
            {isNew ? "Add announcement" : "Edit announcement"}
          </h1>
        </div>
      </header>

      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
          <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Announcement</h3>
        </div>
        <div className="px-[1.1rem] pb-4 pt-[0.9rem]">
          <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
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
            <p className="mt-2 text-[0.8rem] leading-[1.4] text-slate-900 text-right">
              {form.message.length}/500
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[0.85rem] lg:grid-cols-2 mt-4">
            <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
              <label htmlFor="ticker-expires">Expiry date</label>
              <Input
                id="ticker-expires"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresAt: e.target.value }))
                }
                className="admin-input"
              />
              <p className="mt-2 text-[0.8rem] leading-[1.4] text-slate-900">
                Leave blank to run until you remove it.
              </p>
            </div>
            <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
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
              <p className="mt-2 text-[0.8rem] leading-[1.4] text-slate-900">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          <div className="mt-[0.9rem] flex flex-wrap gap-2 [&_.ops-btn-approve]:!border-[var(--portal-approve)] [&_.ops-btn-approve]:!bg-[var(--portal-approve)] [&_.ops-btn-approve]:!text-white [&_.ops-btn-approve:hover]:!border-[var(--portal-approve-hover)] [&_.ops-btn-approve:hover]:!bg-[var(--portal-approve-hover)] [&_.ops-btn-approve:disabled]:!border-slate-300 [&_.ops-btn-approve:disabled]:!bg-slate-200 [&_.ops-btn-approve:disabled]:!text-slate-900 [&_.ops-btn-approve:disabled]:!opacity-100 [&_.ops-btn-secondary]:!border-gray-300 [&_.ops-btn-secondary]:!bg-white [&_.ops-btn-secondary]:!text-slate-600">
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
