"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  TranslationFields,
  useTranslationDraft,
} from "@/components/admin/TranslationFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GALLERY_CATEGORIES } from "@/lib/gallery-categories";
import { TOAST } from "@/lib/toast";

/** Suggestion list shared by the upload form and the edit dialog. Category is
 *  free text in the schema, so the input allows values outside these. */
const CATEGORY_LIST_ID = "gallery-category-options";

function CategoryOptions() {
  return (
    <datalist id={CATEGORY_LIST_ID}>
      {GALLERY_CATEGORIES.map((c) => (
        <option key={c} value={c} />
      ))}
    </datalist>
  );
}

export type AdminGalleryImage = {
  id: string;
  title: string;
  caption: string | null;
  year: number | null;
  category: string | null;
  imagePath: string;
  sortOrder: number;
  published: boolean;
};

function imageUrl(imagePath: string, bust = 0): string {
  const base = `/uploads/${imagePath}`;
  return bust ? `${base}?v=${bust}` : base;
}

export function GalleryManager({
  initialImages,
}: {
  initialImages: AdminGalleryImage[];
}) {
  const [images, setImages] = useState<AdminGalleryImage[]>(initialImages);
  const [bust, setBust] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<AdminGalleryImage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const upsert = (img: AdminGalleryImage) =>
    setImages((prev) => {
      const next = prev.some((i) => i.id === img.id)
        ? prev.map((i) => (i.id === img.id ? img : i))
        : [...prev, img];
      return next.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
      );
    });

  return (
    <div className="grid gap-5">
      <section className="rounded-[14px] border border-brand-line bg-white px-[1.4rem] pb-6 pt-5 shadow-[0_1px_3px_rgba(20,26,20,0.06)]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 [&_h2]:text-[1.05rem] [&_h2]:font-bold [&_h2]:text-brand-ink [&_p]:mt-0.5 [&_p]:text-[0.85rem] [&_p]:text-brand-ink-muted">
          <div>
            <h2>Gallery images</h2>
            <p>Lower order numbers appear first on the public gallery.</p>
          </div>
          <Button
            variant="adminPrimary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? (
              "Close"
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" aria-hidden />
                Add image
              </>
            )}
          </Button>
        </header>

        {showForm ? (
          <div className="mb-[1.35rem] border-b border-brand-line pb-[1.35rem]">
            <UploadForm
              onCreated={(img) => {
                upsert(img);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-line px-4 py-10 text-center text-brand-ink-muted">
            No images yet — click “Add image” to upload your first photo.
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {images.map((img) => (
              <article className="flex flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,26,20,0.12)]" key={img.id}>
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl(img.imagePath, bust[img.id])}
                    alt={img.title}
                    loading="lazy"
                  />
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.04em] text-white backdrop-blur-[4px] ${
                      img.published ? "bg-[rgba(46,107,79,0.9)]" : "bg-brand-ink-muted/85"
                    }`}
                  >
                    {img.published ? "Published" : "Draft"}
                  </span>
                  <span className="absolute right-2 top-2 rounded-md bg-brand-ink/70 px-[0.45rem] py-0.5 font-mono text-[0.66rem] text-white">
                    #{img.sortOrder}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 px-[0.9rem] pb-[0.9rem] pt-[0.8rem]">
                  <div className="text-[0.92rem] font-bold leading-[1.25] text-brand-ink">{img.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-ink-muted">
                    <span>{img.year ? String(img.year) : "Undated"}</span>
                    {img.category ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="rounded-full bg-brand-olive/10 px-2 py-0.5 font-semibold text-brand-olive-dark">
                          {img.category}
                        </span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden>·</span>
                        <span className="italic">Uncategorised</span>
                      </>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-1.5 border-t border-brand-line/70 pt-2.5">
                    <button
                      type="button"
                      onClick={() => setEditing(img)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-[0.42rem] text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                    <PublishToggle image={img} onChange={upsert} />
                    <DeleteImageButton
                      image={img}
                      onDeleted={(id) =>
                        setImages((prev) => prev.filter((i) => i.id !== id))
                      }
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <EditDialog
        image={editing}
        onClose={() => setEditing(null)}
        onSaved={(img, replaced) => {
          upsert(img);
          if (replaced) {
            setBust((prev) => ({ ...prev, [img.id]: Date.now() }));
          }
          setEditing(null);
        }}
      />
    </div>
  );
}

/* --------------------------------------------------------------- Upload */

function UploadForm({
  onCreated,
  onCancel,
}: {
  onCreated: (img: AdminGalleryImage) => void;
  onCancel?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [published, setPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const translations = useTranslationDraft();

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setYear("");
    setCategory("");
    setCaption("");
    setSortOrder("0");
    setPublished(true);
    // This form stays mounted after a save, so the draft must be cleared too or
    // the next upload inherits the last one's translations.
    translations.reset();
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
      fd.append("year", year.trim());
      fd.append("category", category.trim());
      fd.append("caption", caption.trim());
      fd.append("sortOrder", sortOrder || "0");
      fd.append("published", published ? "true" : "false");
      const t = translations.payload();
      if (t) fd.append("translations", JSON.stringify(t));

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      onCreated(data.image as AdminGalleryImage);
      toast.success("Image added.");
      reset();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 min-[820px]:grid-cols-[260px_1fr] min-[820px]:items-start">
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.8rem] font-semibold text-brand-ink">Image *</label>
        <button
          type="button"
          className="relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-brand-line bg-brand-parchment/40 p-5 text-center hover:border-brand-olive hover:bg-brand-olive/5 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
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
                Click or drop to upload an image
              </span>
              <span className="text-[0.72rem] text-brand-ink-muted">
                JPG, PNG, WEBP or GIF · up to 8 MB
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
      </div>

      <div>
        <div className="grid grid-cols-1 gap-[0.85rem] min-[560px]:grid-cols-2">
          <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
            <label htmlFor="g-title">Title *</label>
            <Input
              id="g-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
              placeholder="e.g. 5th International PATS — Opening"
            />
          </div>
          <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
            <label htmlFor="g-year">Year</label>
            <Input
              id="g-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="admin-input"
              placeholder="2022"
            />
          </div>
          <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
            <label htmlFor="g-category">Category</label>
            <Input
              id="g-category"
              list={CATEGORY_LIST_ID}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-input"
              placeholder="e.g. Opening Ceremony"
            />
            <p className="mt-1 text-[0.72rem] text-brand-ink-muted">
              Groups the image into an album on the public gallery. Pick a
              suggestion or type your own.
            </p>
            <CategoryOptions />
          </div>
          <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
            <label htmlFor="g-order">Display order</label>
            <Input
              id="g-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
            <label htmlFor="g-caption">Caption</label>
            <Textarea
              id="g-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="admin-input"
              placeholder="Optional short description shown with the image."
            />
          </div>
        </div>

        <div className="mt-3">
          <TranslationFields
            model="GalleryImage"
            draft={translations}
            idPrefix="g-t-new"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Switch
            id="g-published"
            checked={published}
            onCheckedChange={setPublished}
            className="data-[state=checked]:bg-brand-olive"
          />
          <label htmlFor="g-published" className="text-sm text-brand-ink-muted">
            {published ? "Published — visible on the public gallery" : "Draft — hidden"}
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submit} disabled={submitting} variant="adminPrimary">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Add image
          </Button>
          {file ? (
            <Button variant="adminOutline" onClick={reset} disabled={submitting}>
              Clear
            </Button>
          ) : null}
          {onCancel ? (
            <Button
              variant="adminOutline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Publish */

function PublishToggle({
  image,
  onChange,
}: {
  image: AdminGalleryImage;
  onChange: (img: AdminGalleryImage) => void;
}) {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/gallery/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !image.published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      onChange(data.image as AdminGalleryImage);
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
      title={image.published ? "Unpublish" : "Publish"}
      aria-label={image.published ? "Unpublish" : "Publish"}
      className="inline-flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-ink-muted transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : image.published ? (
        <EyeOff className="h-4 w-4" aria-hidden />
      ) : (
        <Eye className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

/* --------------------------------------------------------------- Delete */

function DeleteImageButton({
  image,
  onDeleted,
}: {
  image: AdminGalleryImage;
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
      title="Delete image?"
      description="This permanently removes the image from the gallery."
      confirmLabel="Delete"
      onConfirm={async () => {
        const res = await fetch(`/api/admin/gallery/${image.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success(TOAST.DELETE_SUCCESS);
          onDeleted(image.id);
        } else {
          toast.error(TOAST.GENERIC_ERROR);
        }
      }}
    />
  );
}

/* --------------------------------------------------------------- Edit */

function EditDialog({
  image,
  onClose,
  onSaved,
}: {
  image: AdminGalleryImage | null;
  onClose: () => void;
  onSaved: (img: AdminGalleryImage, replaced: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // This dialog is always mounted and swaps records via `loadedId`, so the draft
  // is keyed off the open image and reloads whenever that changes.
  const translations = useTranslationDraft({
    url: image ? `/api/admin/gallery/${image.id}` : null,
  });

  const pickReplace = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setReplaceFile(f);
    setReplacePreview(URL.createObjectURL(f));
  };

  // Sync local state whenever a new image is opened.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (image && image.id !== loadedId) {
    setLoadedId(image.id);
    setTitle(image.title);
    setYear(image.year != null ? String(image.year) : "");
    setCategory(image.category ?? "");
    setCaption(image.caption ?? "");
    setSortOrder(String(image.sortOrder));
    setReplaceFile(null);
    setReplacePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  } else if (!image && loadedId !== null) {
    // Dialog closed — reset the key so reopening the same image re-syncs
    // from its real values instead of showing abandoned edits.
    setLoadedId(null);
  }

  const save = async () => {
    if (!image) return;
    if (!title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/gallery/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          year: year.trim() === "" ? null : year.trim(),
          category: category.trim(),
          caption: caption.trim(),
          sortOrder: sortOrder || "0",
          translations: translations.payload(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      let latest = data.image as AdminGalleryImage;
      let replaced = false;

      if (replaceFile) {
        const fd = new FormData();
        fd.append("file", replaceFile);
        const imgRes = await fetch(`/api/admin/gallery/${image.id}/image`, {
          method: "POST",
          body: fd,
        });
        const imgData = await imgRes.json().catch(() => ({}));
        if (!imgRes.ok) {
          toast.error(imgData.error ?? "Image saved but the file could not be replaced.");
          onSaved(latest, false);
          return;
        }
        latest = imgData.image as AdminGalleryImage;
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
    <Dialog open={Boolean(image)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit image</DialogTitle>
        </DialogHeader>

        {image ? (
          <div className="grid grid-cols-2 gap-[0.85rem]">
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="e-title">Title *</label>
              <Input
                id="e-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="e-year">Year</label>
              <Input
                id="e-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="e-order">Display order</label>
              <Input
                id="e-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="e-category">Category</label>
              <Input
                id="e-category"
                list={CATEGORY_LIST_ID}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-input"
                placeholder="e.g. Opening Ceremony"
              />
              <CategoryOptions />
            </div>
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="e-replace">Replace image</label>
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
                    src={replacePreview ?? imageUrl(image.imagePath)}
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
                  id="e-replace"
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => pickReplace(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
              <label htmlFor="e-caption">Caption</label>
              <Textarea
                id="e-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="admin-input"
              />
            </div>
            <div className="col-span-full">
              <TranslationFields
                model="GalleryImage"
                draft={translations}
                idPrefix={`g-t-${image.id}`}
              />
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
