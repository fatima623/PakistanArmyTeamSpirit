"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Upload } from "lucide-react";
import { toast } from "sonner";

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
import { TOAST } from "@/lib/toast";

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
    <div className="admin-gallery-page">
      <section className="admin-gallery-panel">
        <header className="admin-gallery-header">
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
          <div className="admin-gallery-form-wrap">
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
          <div className="admin-gallery-empty">
            No images yet — click “Add image” to upload your first photo.
          </div>
        ) : (
          <div className="admin-gallery-grid">
            {images.map((img) => (
              <article className="admin-gallery-card" key={img.id}>
                <div className="admin-gallery-card__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl(img.imagePath, bust[img.id])}
                    alt={img.title}
                    loading="lazy"
                  />
                  <span
                    className={`admin-gallery-card__badge admin-gallery-card__badge--${
                      img.published ? "published" : "draft"
                    }`}
                  >
                    {img.published ? "Published" : "Draft"}
                  </span>
                  <span className="admin-gallery-card__order">
                    #{img.sortOrder}
                  </span>
                </div>
                <div className="admin-gallery-card__body">
                  <div className="admin-gallery-card__title">{img.title}</div>
                  <div className="admin-gallery-card__meta">
                    {[img.category, img.year].filter(Boolean).join(" · ") ||
                      "Uncategorised"}
                  </div>
                  <div className="admin-gallery-card__actions">
                    <Button
                      size="sm"
                      variant="adminOutline"
                      onClick={() => setEditing(img)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
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
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [published, setPublished] = useState(true);
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

  const reset = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setCategory("");
    setYear("");
    setCaption("");
    setSortOrder("0");
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
      fd.append("category", category.trim());
      fd.append("year", year.trim());
      fd.append("caption", caption.trim());
      fd.append("sortOrder", sortOrder || "0");
      fd.append("published", published ? "true" : "false");

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
    <div className="admin-gallery-form">
      <div className="admin-gallery-upload">
        <label className="admin-gallery-upload-label">Image *</label>
        <button
          type="button"
          className="admin-gallery-drop"
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
              <ImagePlus className="h-8 w-8 text-cp-olive" aria-hidden />
              <span className="admin-gallery-drop__hint">
                Click or drop to upload an image
              </span>
              <span className="admin-gallery-drop__sub">
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
        <div className="admin-gallery-fields">
          <div className="admin-gallery-field">
            <label htmlFor="g-title">Title *</label>
            <Input
              id="g-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
              placeholder="e.g. 5th International PATS — Opening"
            />
          </div>
          <div className="admin-gallery-field">
            <label htmlFor="g-category">Category</label>
            <Input
              id="g-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-input"
              placeholder="e.g. Ceremony"
            />
          </div>
          <div className="admin-gallery-field">
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
          <div className="admin-gallery-field">
            <label htmlFor="g-order">Display order</label>
            <Input
              id="g-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="admin-gallery-field admin-gallery-field--wide">
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

        <div className="admin-gallery-publish-row mt-3">
          <Switch
            id="g-published"
            checked={published}
            onCheckedChange={setPublished}
            className="data-[state=checked]:bg-cp-olive"
          />
          <label htmlFor="g-published" className="text-sm text-cp-ink-muted">
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
    <Button
      size="sm"
      variant="adminOutline"
      onClick={toggle}
      disabled={busy}
      title={image.published ? "Unpublish" : "Publish"}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : image.published ? (
        "Unpublish"
      ) : (
        "Publish"
      )}
    </Button>
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
        <Button size="sm" variant="adminDestructive">
          Delete
        </Button>
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
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync local state whenever a new image is opened.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (image && image.id !== loadedId) {
    setLoadedId(image.id);
    setTitle(image.title);
    setCategory(image.category ?? "");
    setYear(image.year != null ? String(image.year) : "");
    setCaption(image.caption ?? "");
    setSortOrder(String(image.sortOrder));
    setReplaceFile(null);
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
          category: category.trim(),
          year: year.trim() === "" ? null : year.trim(),
          caption: caption.trim(),
          sortOrder: sortOrder || "0",
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
          <div className="admin-gallery-dialog-fields">
            <div className="admin-gallery-field admin-gallery-field--wide">
              <label htmlFor="e-title">Title *</label>
              <Input
                id="e-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-gallery-field">
              <label htmlFor="e-category">Category</label>
              <Input
                id="e-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-gallery-field">
              <label htmlFor="e-year">Year</label>
              <Input
                id="e-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-gallery-field">
              <label htmlFor="e-order">Display order</label>
              <Input
                id="e-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-gallery-field">
              <label htmlFor="e-replace">Replace image</label>
              <input
                id="e-replace"
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="text-xs"
                onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="admin-gallery-field admin-gallery-field--wide">
              <label htmlFor="e-caption">Caption</label>
              <Textarea
                id="e-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="admin-input"
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
