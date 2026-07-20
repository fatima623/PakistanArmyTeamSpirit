"use client";

import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Film,
  ImagePlus,
  Loader2,
  Pencil,
  Play,
  Trash2,
  Upload,
} from "lucide-react";
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
  mediaType: string;
  imagePath: string;
  posterPath: string | null;
  sortOrder: number;
  published: boolean;
};

const ACCEPT_IMAGE = "image/png,image/jpeg,image/webp,image/gif";
const ACCEPT_VIDEO = "video/mp4,video/webm,video/quicktime";
const ACCEPT_MEDIA = `${ACCEPT_IMAGE},${ACCEPT_VIDEO}`;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 128 * 1024 * 1024;

function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * Client-side gate mirroring the server's per-kind ceilings. Advisory only —
 * the API re-checks after sniffing the bytes.
 */
function tooLarge(file: File): boolean {
  return file.size > (isVideoFile(file) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES);
}

function imageUrl(imagePath: string, bust = 0): string {
  const base = `/uploads/${imagePath}`;
  return bust ? `${base}?v=${bust}` : base;
}

/** Thumbnail source for a card: the poster for video, the still otherwise. */
function thumbUrl(img: AdminGalleryImage, bust = 0): string | null {
  if (img.mediaType === "video") {
    return img.posterPath ? imageUrl(img.posterPath, bust) : null;
  }
  return imageUrl(img.imagePath, bust);
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
            <h2>Gallery media</h2>
            <p>
              Photos and videos. Lower order numbers appear first on the public
              gallery.
            </p>
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
                Add media
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
            Nothing here yet — click “Add media” to upload your first photo or
            video.
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {images.map((img) => (
              <article className="flex flex-col overflow-hidden rounded-xl border border-brand-line bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,26,20,0.12)]" key={img.id}>
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
                  {img.mediaType === "video" ? (
                    thumbUrl(img, bust[img.id]) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl(img, bust[img.id]) as string}
                        alt={img.title}
                        loading="lazy"
                      />
                    ) : (
                      // No poster uploaded — let the browser paint the first
                      // frame via the metadata preload instead of a blank tile.
                      <video
                        src={imageUrl(img.imagePath, bust[img.id])}
                        preload="metadata"
                        muted
                        playsInline
                      />
                    )
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl(img.imagePath, bust[img.id])}
                      alt={img.title}
                      loading="lazy"
                    />
                  )}
                  {img.mediaType === "video" ? (
                    <span
                      className="absolute inset-0 grid place-items-center"
                      aria-hidden
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-ink/60 text-white backdrop-blur-[2px]">
                        <Play className="h-4 w-4 translate-x-[1px]" />
                      </span>
                    </span>
                  ) : null}
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
  const posterRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
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
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error("Please choose an image or video file.");
      return;
    }
    if (tooLarge(f)) {
      toast.error(
        isVideoFile(f)
          ? "Videos must be 128 MB or smaller."
          : "Images must be 8 MB or smaller."
      );
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    // A poster only applies to video; drop a stale one when swapping to a still.
    if (!isVideoFile(f)) {
      setPoster(null);
      setPosterPreview(null);
      if (posterRef.current) posterRef.current.value = "";
    }
  };

  const pickPoster = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("The poster frame must be an image.");
      return;
    }
    if (tooLarge(f)) {
      toast.error("Images must be 8 MB or smaller.");
      return;
    }
    setPoster(f);
    setPosterPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setPoster(null);
    setPosterPreview(null);
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
    if (posterRef.current) posterRef.current.value = "";
  };

  const submit = async () => {
    if (!file) {
      toast.error("Choose an image or video to upload.");
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
      if (poster && isVideoFile(file)) fd.append("poster", poster);
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
      toast.success(isVideoFile(file) ? "Video added." : "Image added.");
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
        <label className="text-[0.8rem] font-semibold text-brand-ink">
          Photo or video *
        </label>
        <button
          type="button"
          className="relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-brand-line bg-brand-parchment/40 p-5 text-center hover:border-brand-olive hover:bg-brand-olive/5 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:absolute [&_video]:inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          {preview && file ? (
            isVideoFile(file) ? (
              <video src={preview} muted playsInline preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" />
            )
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-brand-olive" aria-hidden />
              <span className="text-[0.82rem] font-semibold text-brand-ink">
                Click or drop to upload a photo or video
              </span>
              <span className="text-[0.72rem] text-brand-ink-muted">
                JPG, PNG, WEBP, GIF up to 8 MB · MP4, WEBM, MOV up to 128 MB
              </span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_MEDIA}
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </button>

        {file && isVideoFile(file) ? (
          <div className="mt-1 rounded-xl border border-brand-line bg-brand-parchment/40 p-2.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-semibold text-brand-ink">
              <Film className="h-3.5 w-3.5 text-brand-olive" aria-hidden />
              Poster frame
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                {posterPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterPreview} alt="Poster preview" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-brand-ink-muted">
                    <Film className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => posterRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  {poster ? "Change poster" : "Choose poster"}
                </button>
                <p className="mt-1 truncate text-[0.7rem] text-brand-ink-muted">
                  {poster
                    ? poster.name
                    : "Optional — the thumbnail shown before the video plays."}
                </p>
              </div>
            </div>
            <input
              ref={posterRef}
              type="file"
              accept={ACCEPT_IMAGE}
              className="sr-only"
              onChange={(e) => pickPoster(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : null}
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
            Add media
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
      title={image.mediaType === "video" ? "Delete video?" : "Delete image?"}
      description="This permanently removes the item from the gallery."
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
  const posterRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // This dialog is always mounted and swaps records via `loadedId`, so the draft
  // is keyed off the open image and reloads whenever that changes.
  const translations = useTranslationDraft({
    url: image ? `/api/admin/gallery/${image.id}` : null,
  });

  const pickReplace = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error("Please choose an image or video file.");
      return;
    }
    if (tooLarge(f)) {
      toast.error(
        isVideoFile(f)
          ? "Videos must be 128 MB or smaller."
          : "Images must be 8 MB or smaller."
      );
      return;
    }
    setReplaceFile(f);
    setReplacePreview(URL.createObjectURL(f));
  };

  const pickPoster = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("The poster frame must be an image.");
      return;
    }
    if (tooLarge(f)) {
      toast.error("Images must be 8 MB or smaller.");
      return;
    }
    setPosterFile(f);
    setPosterPreview(URL.createObjectURL(f));
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
    setPosterFile(null);
    setPosterPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    if (posterRef.current) posterRef.current.value = "";
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

      // The binary endpoint takes the media, the poster, or both — so a poster
      // can be added to an existing video without re-uploading the video.
      if (replaceFile || posterFile) {
        const fd = new FormData();
        if (replaceFile) fd.append("file", replaceFile);
        if (posterFile) fd.append("poster", posterFile);
        const imgRes = await fetch(`/api/admin/gallery/${image.id}/image`, {
          method: "POST",
          body: fd,
        });
        const imgData = await imgRes.json().catch(() => ({}));
        if (!imgRes.ok) {
          toast.error(
            imgData.error ?? "Details saved but the file could not be replaced."
          );
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

  const currentIsVideo = image?.mediaType === "video";
  const isReplacingWithVideo = Boolean(
    replaceFile && replacePreview && isVideoFile(replaceFile)
  );
  // Offer the poster field whenever the item is (or is becoming) a video, and
  // hide it the moment a still is staged to replace a video.
  const showsPosterField = replaceFile
    ? isReplacingWithVideo
    : currentIsVideo;

  return (
    <Dialog open={Boolean(image)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{currentIsVideo ? "Edit video" : "Edit image"}</DialogTitle>
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
              <label htmlFor="e-replace">Replace photo or video</label>
              <div
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-brand-line bg-brand-parchment/40 p-2.5 transition-colors hover:border-brand-olive/60"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickReplace(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                <div className="relative h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
                  {isReplacingWithVideo ? (
                    <video
                      src={replacePreview as string}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : currentIsVideo && !replaceFile ? (
                    <video
                      src={imageUrl(image.imagePath)}
                      poster={
                        image.posterPath
                          ? imageUrl(image.posterPath)
                          : undefined
                      }
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={replacePreview ?? imageUrl(image.imagePath)}
                      alt={replaceFile ? "New media preview" : "Current image"}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden />
                    {replaceFile ? "Choose a different file" : "Choose new file"}
                  </button>
                  <p className="mt-1 truncate text-[0.72rem] text-brand-ink-muted">
                    {replaceFile
                      ? replaceFile.name
                      : "Drag & drop or click to replace — keeps the current file if left unchanged."}
                  </p>
                </div>
                <input
                  id="e-replace"
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_MEDIA}
                  className="sr-only"
                  onChange={(e) => pickReplace(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {showsPosterField ? (
              <div className="col-span-full [&>label]:mb-1 [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink">
                <label htmlFor="e-poster">Poster frame</label>
                <div className="flex items-center gap-3 rounded-xl border border-brand-line bg-brand-parchment/40 p-2.5">
                  <div className="relative h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-lg border border-brand-line bg-brand-parchment-2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    {posterPreview ?? image.posterPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          posterPreview ??
                          imageUrl(image.posterPath as string)
                        }
                        alt={posterFile ? "New poster preview" : "Current poster"}
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-brand-ink-muted">
                        <Film className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => posterRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-brand-olive/45 hover:bg-brand-parchment-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive/25"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden />
                      {posterFile ? "Change poster" : "Choose poster"}
                    </button>
                    <p className="mt-1 truncate text-[0.72rem] text-brand-ink-muted">
                      {posterFile
                        ? posterFile.name
                        : "Optional — the thumbnail shown before the video plays."}
                    </p>
                  </div>
                  <input
                    id="e-poster"
                    ref={posterRef}
                    type="file"
                    accept={ACCEPT_IMAGE}
                    className="sr-only"
                    onChange={(e) => pickPoster(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            ) : null}
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
