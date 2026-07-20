"use client";

import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  TranslationFields,
  useTranslationDraft,
} from "@/components/admin/TranslationFields";
import { contourIcon } from "@/components/exercise-contour/icon-map";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTIES, EVENT_CATEGORIES } from "@/lib/exercise-contour";
import { TOAST } from "@/lib/toast";

export type EventBreakdownItem = { label: string; marks: number };

export type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  marks: number;
  icon: string;
  category: string;
  difficulty: string;
  duration: string;
  summary: string;
  details: string;
  participants: string | null;
  breakdown: EventBreakdownItem[] | null;
  thumbnailPath: string | null;
  sortOrder: number;
  published: boolean;
};

function thumbUrl(thumbnailPath: string, bust = 0): string {
  const base = `/uploads/${thumbnailPath}`;
  return bust ? `${base}?v=${bust}` : base;
}

export function EventsManager({
  initialEvents,
}: {
  initialEvents: AdminEvent[];
}) {
  const [events, setEvents] = useState<AdminEvent[]>(initialEvents);
  const [bust, setBust] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  const upsert = (ev: AdminEvent) =>
    setEvents((prev) => {
      const next = prev.some((e) => e.id === ev.id)
        ? prev.map((e) => (e.id === ev.id ? ev : e))
        : [...prev, ev];
      return next.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
      );
    });

  return (
    <div className="grid gap-5">
      <section className="rounded-[14px] border border-brand-line bg-white px-[1.4rem] pb-6 pt-5 shadow-[0_1px_3px_rgba(20,26,20,0.06)]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 [&_h2]:text-[1.05rem] [&_h2]:font-bold [&_h2]:text-brand-ink [&_p]:mt-0.5 [&_p]:text-[0.85rem] [&_p]:text-brand-ink-muted">
          <div>
            <h2>Competition events</h2>
            <p>
              Shown on the public Events Detail page. Lower order numbers appear
              first.
            </p>
          </div>
          <Button variant="adminPrimary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? (
              "Close"
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Add event
              </>
            )}
          </Button>
        </header>

        {showForm ? (
          <div className="mb-[1.35rem] border-b border-brand-line pb-[1.35rem]">
            <EventForm
              onSaved={(ev) => {
                upsert(ev);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-line px-4 py-10 text-center text-brand-ink-muted">
            No events yet — click “Add event” to create one.
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
            {events.map((ev) => {
              const Icon = contourIcon(ev.icon);
              return (
                <article
                  className="flex flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,26,20,0.12)]"
                  key={ev.id}
                >
                  <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    {ev.thumbnailPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl(ev.thumbnailPath, bust[ev.id])}
                        alt={ev.title}
                        loading="lazy"
                      />
                    ) : (
                      <Icon
                        className="h-10 w-10 text-brand-olive/70"
                        aria-hidden
                      />
                    )}
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.04em] text-white backdrop-blur-[4px] ${
                        ev.published
                          ? "bg-[rgba(46,107,79,0.9)]"
                          : "bg-brand-ink-muted/85"
                      }`}
                    >
                      {ev.published ? "Published" : "Draft"}
                    </span>
                    <span className="absolute right-2 top-2 rounded-md bg-brand-ink/70 px-[0.45rem] py-0.5 font-mono text-[0.66rem] text-white">
                      #{ev.sortOrder}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 px-[0.9rem] pb-[0.9rem] pt-[0.8rem]">
                    <div className="text-[0.92rem] font-bold leading-[1.25] text-brand-ink">
                      {ev.title}
                    </div>
                    <div className="text-xs text-brand-ink-muted">
                      {[ev.category, ev.difficulty, `${ev.marks} marks`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 border-t border-brand-line/70 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setEditing(ev)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-[0.42rem] text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </button>
                      <PublishToggle event={ev} onChange={upsert} />
                      <DeleteEventButton
                        event={ev}
                        onDeleted={(id) =>
                          setEvents((prev) => prev.filter((e) => e.id !== id))
                        }
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
          </DialogHeader>
          {editing ? (
            <EventForm
              initial={editing}
              onSaved={(ev, replaced) => {
                upsert(ev);
                if (replaced) setBust((p) => ({ ...p, [ev.id]: Date.now() }));
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------------------------------------- Form */

const labelCls =
  "mb-1 block text-[0.8rem] font-semibold text-brand-ink";

function EventForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: AdminEvent | null;
  onSaved: (event: AdminEvent, replaced: boolean) => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(initial);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [marks, setMarks] = useState(String(initial?.marks ?? 50));
  const [category, setCategory] = useState(
    initial?.category ?? EVENT_CATEGORIES[0]
  );
  const [difficulty, setDifficulty] = useState(
    initial?.difficulty ?? DIFFICULTIES[1]
  );
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "Target");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [participants, setParticipants] = useState(
    initial?.participants ?? ""
  );
  const [breakdown, setBreakdown] = useState<EventBreakdownItem[]>(
    initial?.breakdown ?? []
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  // Loaded on demand rather than shipped with the events list — only the record
  // actually being edited needs its translations. A new event has none yet.
  const translations = useTranslationDraft({
    url: initial ? `/api/admin/events/${initial.id}` : null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.thumbnailPath ? thumbUrl(initial.thumbnailPath) : null
  );
  const [submitting, setSubmitting] = useState(false);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const cleanBreakdown = () =>
    breakdown
      .map((b) => ({ label: b.label.trim(), marks: Number(b.marks) || 0 }))
      .filter((b) => b.label);

  const submit = async () => {
    if (!title.trim()) return toast.error("A title is required.");
    if (!category.trim()) return toast.error("A category is required.");
    if (!difficulty.trim()) return toast.error("A difficulty is required.");
    if (!duration.trim()) return toast.error("A duration is required.");
    if (!summary.trim()) return toast.error("A summary is required.");
    if (!details.trim()) return toast.error("Details are required.");

    setSubmitting(true);
    try {
      if (isEdit && initial) {
        // 1) metadata patch
        const res = await fetch(`/api/admin/events/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            marks: marks || "0",
            category: category.trim(),
            difficulty: difficulty.trim(),
            duration: duration.trim(),
            icon: icon.trim() || "Target",
            sortOrder: sortOrder || "0",
            summary: summary.trim(),
            details: details.trim(),
            participants: participants.trim(),
            breakdown: cleanBreakdown(),
            translations: translations.payload(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error ?? TOAST.GENERIC_ERROR);
          return;
        }
        let latest = data.event as AdminEvent;
        let replaced = false;
        // 2) optional thumbnail replace
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          const imgRes = await fetch(`/api/admin/events/${initial.id}/image`, {
            method: "POST",
            body: fd,
          });
          const imgData = await imgRes.json().catch(() => ({}));
          if (!imgRes.ok) {
            toast.error(
              imgData.error ?? "Event saved but the thumbnail could not be replaced."
            );
            onSaved(latest, false);
            return;
          }
          latest = imgData.event as AdminEvent;
          replaced = true;
        }
        toast.success(TOAST.SAVE_SUCCESS);
        onSaved(latest, replaced);
      } else {
        // create — multipart (thumbnail optional)
        const fd = new FormData();
        if (file) fd.append("file", file);
        fd.append("title", title.trim());
        fd.append("marks", marks || "0");
        fd.append("category", category.trim());
        fd.append("difficulty", difficulty.trim());
        fd.append("duration", duration.trim());
        fd.append("icon", icon.trim() || "Target");
        fd.append("sortOrder", sortOrder || "0");
        fd.append("summary", summary.trim());
        fd.append("details", details.trim());
        fd.append("participants", participants.trim());
        fd.append("breakdown", JSON.stringify(cleanBreakdown()));
        fd.append("published", published ? "true" : "false");
        const t = translations.payload();
        if (t) fd.append("translations", JSON.stringify(t));

        const res = await fetch("/api/admin/events", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error ?? TOAST.GENERIC_ERROR);
          return;
        }
        toast.success("Event created.");
        onSaved(data.event as AdminEvent, false);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-5 min-[820px]:grid-cols-[240px_1fr] min-[820px]:items-start">
        {/* Thumbnail */}
        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Card thumbnail</span>
          <button
            type="button"
            className="relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-brand-line bg-brand-parchment/40 p-5 text-center hover:border-brand-olive hover:bg-brand-olive/5 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" />
            ) : (
              <>
                <ImagePlus className="h-7 w-7 text-brand-olive" aria-hidden />
                <span className="text-[0.78rem] font-semibold text-brand-ink">
                  Click or drop an image
                </span>
                <span className="text-[0.7rem] text-brand-ink-muted">
                  Optional · JPG/PNG/WEBP · up to 8 MB
                </span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </button>
          {preview ? (
            <button
              type="button"
              className="text-[0.72rem] font-semibold text-brand-ink-muted underline"
              onClick={() => {
                setFile(null);
                setPreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear image
            </button>
          ) : null}
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 gap-[0.85rem] min-[560px]:grid-cols-2">
          <div className="col-span-full">
            <label className={labelCls} htmlFor="ev-title">
              Title *
            </label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
              placeholder="e.g. Close Target Reconnaissance"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ev-category">
              Category *
            </label>
            <select
              id="ev-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-input"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="ev-difficulty">
              Difficulty *
            </label>
            <select
              id="ev-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="admin-input"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="ev-marks">
              Marks
            </label>
            <Input
              id="ev-marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ev-order">
              Display order
            </label>
            <Input
              id="ev-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ev-duration">
              Duration *
            </label>
            <Input
              id="ev-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="admin-input"
              placeholder="e.g. 90 min"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ev-icon">
              Icon (Lucide name)
            </label>
            <Input
              id="ev-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="admin-input"
              placeholder="Target"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="ev-summary">
          Summary * <span className="font-normal text-brand-ink-muted">(card text)</span>
        </label>
        <Textarea
          id="ev-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className="admin-input"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="ev-details">
          Details * <span className="font-normal text-brand-ink-muted">(shown when a card is opened)</span>
        </label>
        <Textarea
          id="ev-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          className="admin-input"
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="ev-participants">
          Participants <span className="font-normal text-brand-ink-muted">(optional)</span>
        </label>
        <Input
          id="ev-participants"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          className="admin-input"
          placeholder="e.g. 3 members (excluding captain)"
        />
      </div>

      {/* Breakdown repeater */}
      <div>
        <span className={labelCls}>
          Marks breakdown <span className="font-normal text-brand-ink-muted">(optional)</span>
        </span>
        <div className="grid gap-2">
          {breakdown.map((row, i) => (
            <div className="flex items-center gap-2" key={i}>
              <Input
                value={row.label}
                onChange={(e) =>
                  setBreakdown((prev) =>
                    prev.map((r, idx) =>
                      idx === i ? { ...r, label: e.target.value } : r
                    )
                  )
                }
                className="admin-input flex-1"
                placeholder="Label (e.g. Movement)"
              />
              <Input
                type="number"
                value={String(row.marks)}
                onChange={(e) =>
                  setBreakdown((prev) =>
                    prev.map((r, idx) =>
                      idx === i
                        ? { ...r, marks: Number(e.target.value) || 0 }
                        : r
                    )
                  )
                }
                className="admin-input w-24"
                placeholder="Marks"
              />
              <button
                type="button"
                aria-label="Remove row"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-line text-brand-ink-muted hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                onClick={() =>
                  setBreakdown((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          <div>
            <Button
              variant="adminOutline"
              onClick={() =>
                setBreakdown((prev) => [...prev, { label: "", marks: 0 }])
              }
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Add breakdown row
            </Button>
          </div>
        </div>
      </div>

      <TranslationFields
        model="Event"
        draft={translations}
        idPrefix={`ev-t-${initial?.id ?? "new"}`}
      />

      <div className="flex items-center gap-3">
        <Switch
          id="ev-published"
          checked={published}
          onCheckedChange={setPublished}
          className="data-[state=checked]:bg-brand-olive"
        />
        <label htmlFor="ev-published" className="text-sm text-brand-ink-muted">
          {published ? "Published — visible on Events Detail" : "Draft — hidden"}
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={submitting} variant="adminPrimary">
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isEdit ? "Save changes" : "Create event"}
        </Button>
        {onCancel ? (
          <Button variant="adminOutline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Publish */

function PublishToggle({
  event,
  onChange,
}: {
  event: AdminEvent;
  onChange: (ev: AdminEvent) => void;
}) {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !event.published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      onChange(data.event as AdminEvent);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={event.published ? "Unpublish" : "Publish"}
      aria-label={event.published ? "Unpublish" : "Publish"}
      className="inline-flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-ink-muted transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : event.published ? (
        <EyeOff className="h-4 w-4" aria-hidden />
      ) : (
        <Eye className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

/* --------------------------------------------------------------- Delete */

function DeleteEventButton({
  event,
  onDeleted,
}: {
  event: AdminEvent;
  onDeleted: (id: string) => void;
}) {
  return (
    <ConfirmDialog
      trigger={
        <button
          type="button"
          title="Delete"
          aria-label="Delete"
          className="inline-flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-ink-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      }
      title="Delete event?"
      description="This permanently removes the event from the Events Detail page."
      confirmLabel="Delete"
      onConfirm={async () => {
        const res = await fetch(`/api/admin/events/${event.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success(TOAST.DELETE_SUCCESS);
          onDeleted(event.id);
        } else {
          toast.error(TOAST.GENERIC_ERROR);
        }
      }}
    />
  );
}
