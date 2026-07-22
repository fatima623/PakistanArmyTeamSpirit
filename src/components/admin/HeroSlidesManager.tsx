"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TOAST } from "@/lib/toast";

export type AdminHeroSlide = {
  id: string;
  title: string;
  alt: string | null;
  imagePath: string;
  sortOrder: number;
  published: boolean;
};

const ACCEPT_HERO = "image/png,image/jpeg,image/webp";
const MAX_HERO_BYTES = 16 * 1024 * 1024;

function imageUrl(imagePath: string, bust = 0): string {
  const base = `/uploads/${imagePath}`;
  return bust ? `${base}?v=${bust}` : base;
}

function sortSlides(list: AdminHeroSlide[]): AdminHeroSlide[] {
  return [...list].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
  );
}

export function HeroSlidesManager({
  initialSlides,
}: {
  initialSlides: AdminHeroSlide[];
}) {
  const [slides, setSlides] = useState<AdminHeroSlide[]>(
    sortSlides(initialSlides)
  );
  const [bust, setBust] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<AdminHeroSlide | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reordering, setReordering] = useState(false);

  const upsert = (slide: AdminHeroSlide) =>
    setSlides((prev) =>
      sortSlides(
        prev.some((s) => s.id === slide.id)
          ? prev.map((s) => (s.id === slide.id ? slide : s))
          : [...prev, slide]
      )
    );

  const publishedCount = slides.filter((s) => s.published).length;

  /**
   * Swaps a slide with its neighbour and persists both new orders. The list is
   * re-sorted from the server responses so a partial failure cannot leave the
   * UI claiming an order the database does not have.
   */
  const move = async (slide: AdminHeroSlide, direction: -1 | 1) => {
    const index = slides.findIndex((s) => s.id === slide.id);
    const neighbour = slides[index + direction];
    if (!neighbour) return;

    setReordering(true);
    try {
      const results = await Promise.all([
        fetch(`/api/admin/hero-slides/${slide.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: neighbour.sortOrder }),
        }),
        fetch(`/api/admin/hero-slides/${neighbour.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: slide.sortOrder }),
        }),
      ]);
      if (results.some((r) => !r.ok)) {
        toast.error(TOAST.GENERIC_ERROR);
        return;
      }
      const [a, b] = await Promise.all(results.map((r) => r.json()));
      setSlides((prev) =>
        sortSlides(
          prev.map((s) =>
            s.id === a.slide.id ? a.slide : s.id === b.slide.id ? b.slide : s
          )
        )
      );
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setReordering(false);
    }
  };

  // Adding a hero image takes over the whole view with a centered, form-only
  // layout (matching /admin/ticker/new) — the list of existing slides is
  // hidden while you fill in a new one.
  if (showForm) {
    return (
      <UploadForm
        nextOrder={slides.length}
        onCreated={(slide) => {
          upsert(slide);
          setShowForm(false);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[14px] border border-brand-line bg-white px-[1.4rem] pb-6 pt-5 shadow-[0_1px_3px_rgba(20,26,20,0.06)]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 [&_h2]:text-[1.05rem] [&_h2]:font-bold [&_h2]:text-brand-ink [&_p]:mt-0.5 [&_p]:text-[0.85rem] [&_p]:text-brand-ink-muted">
          <div>
            <h2>Home hero images</h2>
            <p>
              Published slides crossfade on the home page, in display order.
              Unpublish a slide to pull it without deleting it.
            </p>
          </div>
          <Button variant="adminPrimary" onClick={() => setShowForm(true)}>
            <ImagePlus className="mr-2 h-4 w-4" aria-hidden />
            Add slide
          </Button>
        </header>

        {slides.length > 0 && publishedCount === 0 ? (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.82rem] text-amber-900">
            No slides are published — the home page is showing its built-in
            fallback images.
          </p>
        ) : null}

        {slides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-line px-4 py-10 text-center text-brand-ink-muted">
            No hero slides yet — the home page is using its built-in images.
            Click “Add slide” to take control of the hero.
          </div>
        ) : (
          <div className="grid gap-3">
            {slides.map((slide, index) => (
              <article
                key={slide.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-line bg-white p-3"
              >
                <div className="relative h-[4.5rem] w-32 shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl(slide.imagePath, bust[slide.id])}
                    alt={slide.alt ?? slide.title}
                    loading="lazy"
                  />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-brand-ink/70 px-[0.35rem] py-0.5 font-mono text-[0.62rem] text-white">
                    #{slide.sortOrder}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[0.92rem] font-bold leading-[1.25] text-brand-ink">
                    {slide.title}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-brand-ink-muted">
                    {slide.alt ?? "No alt text"}
                  </div>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.04em] text-white ${
                      slide.published
                        ? "bg-[rgba(46,107,79,0.9)]"
                        : "bg-brand-ink-muted/85"
                    }`}
                  >
                    {slide.published ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <IconButton
                    label="Move up"
                    disabled={index === 0 || reordering}
                    onClick={() => move(slide, -1)}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={index === slides.length - 1 || reordering}
                    onClick={() => move(slide, 1)}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <button
                    type="button"
                    onClick={() => setEditing(slide)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-[0.42rem] text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </button>
                  <PublishToggle slide={slide} onChange={upsert} />
                  <DeleteSlideButton
                    slide={slide}
                    onDeleted={(id) =>
                      setSlides((prev) => prev.filter((s) => s.id !== id))
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <EditDialog
        slide={editing}
        onClose={() => setEditing(null)}
        onSaved={(slide, replaced) => {
          upsert(slide);
          if (replaced) {
            setBust((prev) => ({ ...prev, [slide.id]: Date.now() }));
          }
          setEditing(null);
        }}
      />
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-ink-muted transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- Upload */

function UploadForm({
  nextOrder,
  onCreated,
  onCancel,
}: {
  nextOrder: number;
  onCreated: (slide: AdminHeroSlide) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState(String(nextOrder));
  const [published, setPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (f.size > MAX_HERO_BYTES) {
      toast.error("Hero images must be 16 MB or smaller.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setAlt("");
    setSortOrder(String(nextOrder));
    setPublished(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (!file) {
      toast.error("Choose an image to upload.");
      return;
    }
    if (!title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title.trim());
      fd.append("alt", alt.trim());
      fd.append("sortOrder", sortOrder || "0");
      fd.append("published", published ? "true" : "false");

      const res = await fetch("/api/admin/hero-slides", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      onCreated(data.slide as AdminHeroSlide);
      toast.success("Hero slide added.");
      reset();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[0.85rem] pb-8">
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="min-w-0 flex-[1_1_16rem]">
          <button
            type="button"
            onClick={onCancel}
            className="mb-1.5 inline-flex items-center text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800"
          >
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Back to hero images
          </button>
          <h1 className="m-0 text-[1.375rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">
            Add hero image
          </h1>
          <p className="mt-1 text-[0.8rem] leading-[1.4] text-muted-foreground">
            Upload an image and give it an admin title. Published slides
            crossfade on the home page hero, in display order.
          </p>
        </div>
      </header>

      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
          <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">
            Hero image
          </h3>
        </div>
        <div className="flex flex-col gap-5 px-[1.1rem] pb-4 pt-[0.9rem]">
          <div className="grid grid-cols-1 gap-5 min-[820px]:grid-cols-[280px_1fr] min-[820px]:items-start">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-semibold text-brand-ink">
                Image *
              </label>
              <button
                type="button"
                className="relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-brand-line bg-brand-parchment/40 p-5 text-center hover:border-brand-olive hover:bg-brand-olive/5 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
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
                    <ImagePlus className="h-8 w-8 text-brand-olive" aria-hidden />
                    <span className="text-[0.82rem] font-semibold text-brand-ink">
                      Click or drop to upload
                    </span>
                    <span className="text-[0.72rem] text-brand-ink-muted">
                      JPG, PNG or WEBP · up to 16 MB
                    </span>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_HERO}
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
              </button>
              <p className="text-[0.72rem] text-brand-ink-muted">
                The hero is full-bleed and cropped to the viewport — landscape
                images around 2560×1440 work best.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-1 gap-[0.85rem] min-[560px]:grid-cols-2">
                <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
                  <label htmlFor="h-title">Title *</label>
                  <Input
                    id="h-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="admin-input"
                    placeholder="e.g. Opening parade — wide shot"
                  />
                  <p className="mt-1 text-[0.72rem] text-brand-ink-muted">
                    Admin-only label so you can tell slides apart. Not shown
                    publicly.
                  </p>
                </div>
                <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
                  <label htmlFor="h-alt">Alt text</label>
                  <Input
                    id="h-alt"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="admin-input"
                    placeholder="Optional description for screen readers"
                  />
                </div>
                <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
                  <label htmlFor="h-order">Display order</label>
                  <Input
                    id="h-order"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Switch
                  id="h-published"
                  checked={published}
                  onCheckedChange={setPublished}
                  className="data-[state=checked]:bg-brand-olive"
                />
                <label
                  htmlFor="h-published"
                  className="text-sm text-brand-ink-muted"
                >
                  {published
                    ? "Published — appears in the hero"
                    : "Draft — hidden"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        {file ? (
          <Button variant="adminOutline" onClick={reset} disabled={submitting}>
            Clear
          </Button>
        ) : null}
        <Button variant="adminOutline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={submitting} variant="adminPrimary">
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Add slide
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Publish */

function PublishToggle({
  slide,
  onChange,
}: {
  slide: AdminHeroSlide;
  onChange: (slide: AdminHeroSlide) => void;
}) {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !slide.published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      onChange(data.slide as AdminHeroSlide);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };
  return (
    <IconButton
      label={slide.published ? "Unpublish" : "Publish"}
      disabled={busy}
      onClick={toggle}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : slide.published ? (
        <EyeOff className="h-4 w-4" aria-hidden />
      ) : (
        <Eye className="h-4 w-4" aria-hidden />
      )}
    </IconButton>
  );
}

/* --------------------------------------------------------------- Delete */

function DeleteSlideButton({
  slide,
  onDeleted,
}: {
  slide: AdminHeroSlide;
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
      title="Delete hero slide?"
      description="This permanently removes the slide from the home page hero."
      confirmLabel="Delete"
      onConfirm={async () => {
        const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success(TOAST.DELETE_SUCCESS);
          onDeleted(slide.id);
        } else {
          toast.error(TOAST.GENERIC_ERROR);
        }
      }}
    />
  );
}

/* --------------------------------------------------------------- Edit */

function EditDialog({
  slide,
  onClose,
  onSaved,
}: {
  slide: AdminHeroSlide | null;
  onClose: () => void;
  onSaved: (slide: AdminHeroSlide, replaced: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickReplace = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (f.size > MAX_HERO_BYTES) {
      toast.error("Hero images must be 16 MB or smaller.");
      return;
    }
    setReplaceFile(f);
    setReplacePreview(URL.createObjectURL(f));
  };

  // Sync local state whenever a new slide is opened.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (slide && slide.id !== loadedId) {
    setLoadedId(slide.id);
    setTitle(slide.title);
    setAlt(slide.alt ?? "");
    setSortOrder(String(slide.sortOrder));
    setReplaceFile(null);
    setReplacePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  } else if (!slide && loadedId !== null) {
    setLoadedId(null);
  }

  const save = async () => {
    if (!slide) return;
    if (!title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          alt: alt.trim(),
          sortOrder: sortOrder || "0",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      let latest = data.slide as AdminHeroSlide;
      let replaced = false;

      if (replaceFile) {
        const fd = new FormData();
        fd.append("file", replaceFile);
        const imgRes = await fetch(
          `/api/admin/hero-slides/${slide.id}/image`,
          { method: "POST", body: fd }
        );
        const imgData = await imgRes.json().catch(() => ({}));
        if (!imgRes.ok) {
          toast.error(
            imgData.error ?? "Details saved but the image could not be replaced."
          );
          onSaved(latest, false);
          return;
        }
        latest = imgData.slide as AdminHeroSlide;
        replaced = true;
      }

      toast.success(TOAST.SAVE_SUCCESS);
      onSaved(latest, replaced);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(slide)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="ltr" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit hero slide</DialogTitle>
        </DialogHeader>

        {slide ? (
          <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="he-title">Title *</label>
              <Input
                id="he-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="he-alt">Alt text</label>
              <Input
                id="he-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="he-order">Display order</label>
              <Input
                id="he-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="he-replace">Replace image</label>
              <div
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-brand-line bg-brand-parchment/40 p-2.5 transition-colors hover:border-brand-olive/60"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickReplace(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                <div className="relative h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={replacePreview ?? imageUrl(slide.imagePath)}
                    alt={replaceFile ? "New image preview" : "Current image"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden />
                    {replaceFile ? "Choose a different image" : "Choose new image"}
                  </button>
                  <p className="mt-1 truncate text-[0.72rem] text-brand-ink-muted">
                    {replaceFile
                      ? replaceFile.name
                      : "Drag & drop or click to replace — keeps the current image if left unchanged."}
                  </p>
                </div>
                <input
                  id="he-replace"
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_HERO}
                  className="sr-only"
                  onChange={(e) => pickReplace(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="adminOutline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="adminPrimary" onClick={save} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
