"use client";



import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { ArrowLeft, Eye, FileText, Loader2, Pencil, Upload, X } from "lucide-react";

import { toast } from "sonner";



import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";
import { getAdminNewsPdfUrl } from "@/lib/open-news-pdf";

import {

  INVALID_NEWS_PDF_MESSAGE,

  MAX_NEWS_PDF_BYTES,

  MIN_NEWS_PDF_BYTES,

} from "@/lib/news-pdf-constants";

import { sanitizeNewsContent } from "@/lib/sanitize-news";

import { TOAST } from "@/lib/toast";



function slugify(title: string) {

  return title

    .toLowerCase()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/(^-|-$)/g, "");

}



function toDatetimeLocal(date: Date) {

  const d = new Date(date);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

}



function formatFileSize(bytes: number) {

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}



function htmlToPlainText(html: string) {

  return html

    .replace(/<br\s*\/?>/gi, "\n")

    .replace(/<\/?p[^>]*>/gi, (match) => (match.startsWith("</") ? "\n\n" : ""))

    .replace(/<[^>]+>/g, "")

    .replace(/\n{3,}/g, "\n\n")

    .trim();

}



function escapeHtml(text: string) {

  return text

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;");

}



function prepareContentForSave(raw: string) {

  const trimmed = raw.trim();

  if (!trimmed) return "";

  if (/<\s*(p|ul|ol|h[2-3]|div|br|strong|em|a)\b/i.test(trimmed)) {

    return trimmed;

  }

  return trimmed

    .split(/\n\s*\n/)

    .map((p) => p.trim())

    .filter(Boolean)

    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)

    .join("\n");

}



export function NewsPostForm({

  postId,

  initial,

}: {

  postId?: string;

  initial?: {

    title: string;

    slug: string;

    content: string;

    publishedAt: Date;

    published: boolean;

    pdfOriginalName?: string | null;

    pdfFileSize?: number | null;

    hasPdf?: boolean;

    pdfReadable?: boolean;

  };

}) {

  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNew = !postId;

  const [title, setTitle] = useState(initial?.title ?? "");

  const [slug, setSlug] = useState(initial?.slug ?? "");

  const [content, setContent] = useState(

    initial?.content ? htmlToPlainText(initial.content) : ""

  );

  const [contentView, setContentView] = useState<"write" | "preview">("write");

  const [publishedAt, setPublishedAt] = useState(

    initial ? toDatetimeLocal(initial.publishedAt) : ""

  );

  const [slugManual, setSlugManual] = useState(!!initial?.slug);

  const [published, setPublished] = useState(initial?.published ?? true);

  const [submitting, setSubmitting] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [removePdf, setRemovePdf] = useState(false);

  const [attachedName, setAttachedName] = useState(

    initial?.pdfOriginalName ?? null

  );

  const [attachedSize, setAttachedSize] = useState<number | null>(

    initial?.pdfFileSize ?? null

  );

  const hasExistingPdf =

    Boolean(initial?.hasPdf && attachedName) && !removePdf && !pdfFile;



  const previewHtml = sanitizeNewsContent(prepareContentForSave(content));



  useEffect(() => {

    if (!slugManual && title) {

      setSlug(slugify(title));

    }

  }, [title, slugManual]);



  useEffect(() => {

    if (!isNew || publishedAt) return;

    setPublishedAt(toDatetimeLocal(new Date()));

  }, [isNew, publishedAt]);



  const onPickPdf = (file: File | null) => {

    if (!file) return;

    if (file.type !== "application/pdf") {

      toast.error(INVALID_NEWS_PDF_MESSAGE);

      return;

    }

    if (file.size <= MIN_NEWS_PDF_BYTES) {

      toast.error(INVALID_NEWS_PDF_MESSAGE);

      return;

    }

    if (file.size > MAX_NEWS_PDF_BYTES) {

      toast.error("PDF must be 10 MB or smaller.");

      return;

    }

    setPdfFile(file);

    setRemovePdf(false);

    setAttachedName(file.name);

    setAttachedSize(file.size);

  };



  const clearPdfSelection = () => {

    setPdfFile(null);

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (initial?.hasPdf && !removePdf) {

      setAttachedName(initial.pdfOriginalName ?? null);

      setAttachedSize(initial.pdfFileSize ?? null);

    } else {

      setAttachedName(null);

      setAttachedSize(null);

    }

  };



  const markRemovePdf = () => {

    setRemovePdf(true);

    setPdfFile(null);

    setAttachedName(null);

    setAttachedSize(null);

    if (fileInputRef.current) fileInputRef.current.value = "";

  };



  const syncPdf = async (id: string) => {

    if (removePdf && initial?.hasPdf) {

      const res = await fetch(`/api/admin/news/${id}/pdf`, {

        method: "DELETE",

      });

      if (!res.ok) {

        throw new Error("PDF_REMOVE_FAILED");

      }

    }

    if (pdfFile) {

      const formData = new FormData();

      formData.append("file", pdfFile);

      const res = await fetch(`/api/admin/news/${id}/pdf`, {

        method: "POST",

        body: formData,

      });

      if (!res.ok) {

        const data = await res.json().catch(() => ({}));

        throw new Error(

          typeof data.error === "string" ? data.error : "PDF_UPLOAD_FAILED"

        );

      }

    }

  };



  const handleSave = async () => {

    setSubmitting(true);

    try {

      const body = {

        title,

        slug,

        content: prepareContentForSave(content),

        publishedAt: new Date(publishedAt).toISOString(),

        published,

      };

      const res = await fetch(

        isNew ? "/api/admin/news" : `/api/admin/news/${postId}`,

        {

          method: isNew ? "POST" : "PUT",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify(body),

        }

      );

      if (!res.ok) {

        const data = await res.json();

        toast.error(data.error ?? TOAST.GENERIC_ERROR);

        return;

      }



      const data = await res.json();

      const savedId = isNew ? data.post.id : postId!;



      if (pdfFile || (removePdf && initial?.hasPdf)) {

        try {

          await syncPdf(savedId);

        } catch (err) {

          toast.error(

            err instanceof Error && err.message !== "PDF_UPLOAD_FAILED"

              ? err.message

              : "Post saved but PDF could not be updated. Try editing the post."

          );

          router.push("/admin/news");

          router.refresh();

          return;

        }

      }



      toast.success(TOAST.SAVE_SUCCESS);

      router.push("/admin/news");

      router.refresh();

    } catch {

      toast.error(TOAST.GENERIC_ERROR);

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <div className="flex w-full flex-col gap-[0.85rem] pb-2">

      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">

        <div className="min-w-0 flex-[1_1_16rem]">

          <Link href="/admin/news" className="mb-1.5 inline-flex items-center text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800">

            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />

            Back to news

          </Link>

          <h1 className="m-0 flex flex-wrap items-center gap-2 text-[1.15rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">

            {isNew ? "Create news post" : "Edit news post"}

          </h1>

          <p className="mt-1 text-[0.8125rem] text-muted-foreground">

            Publish updates to the public site. An optional PDF appears as a

            download on the article page.

          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">

            {published ? (

              <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.06em] text-green-800">Published</span>

            ) : (

              <span className="inline-block rounded bg-brand-parchment-2/60 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">Draft</span>

            )}

          </div>

        </div>

      </header>



      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">

        <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">

          <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Details</h3>

          <p className="mt-1 text-xs leading-[1.4] text-muted-foreground">

            Title and URL slug shown on the public news pages.

          </p>

        </div>

        <div className="px-[1.1rem] pb-4 pt-[0.9rem]">

          <div className="flex flex-col gap-[0.85rem]">
            <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
              <label htmlFor="news-title">
                Title <span className="text-red-600">*</span>
              </label>

              <Input

                id="news-title"

                value={title}

                onChange={(e) => setTitle(e.target.value)}

                className="admin-input"

                placeholder="e.g. Annual competition results"

              />

            </div>

            <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
              <label htmlFor="news-slug">
                Slug <span className="text-red-600">*</span>
              </label>

              <Input

                id="news-slug"

                value={slug}

                onChange={(e) => {

                  setSlugManual(true);

                  setSlug(e.target.value);

                }}

                className="admin-input font-mono text-sm"

                placeholder="annual-competition-results"

              />

              <p className="mt-2 text-[0.8rem] leading-[1.4] text-slate-900">

                URL path on the public site. Auto-generated from title.

              </p>

            </div>

          </div>

        </div>

      </section>



      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">

        <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">

          <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Publishing</h3>

          <p className="mt-1 text-xs leading-[1.4] text-muted-foreground">

            Control visibility and the date shown on the public site.

          </p>

        </div>

        <div className="px-[1.1rem] pb-4 pt-[0.9rem]">

          <div

            className={cn(

              "rounded-[10px] border border-slate-200 bg-slate-50 px-[1.125rem] py-4",

              published

                ? "border-green-200 bg-green-50"

                : "border-amber-200 bg-amber-50"

            )}

          >

            <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">

              <label htmlFor="news-published">Visible on public site</label>

              <div className="flex items-center gap-3">

                <Switch

                  id="news-published"

                  checked={published}

                  onCheckedChange={setPublished}

                  className="data-[state=checked]:bg-brand-olive"

                />

                <span className="text-sm text-brand-ink-muted">

                  {published

                    ? "Published — visible on homepage and news pages"

                    : "Draft — hidden from visitors"}

                </span>

              </div>

            </div>

          </div>

          <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y mt-4">

            <label htmlFor="news-published-at">

              Published date <span className="text-red-600">*</span>

            </label>

            <Input

              id="news-published-at"

              type="datetime-local"

              value={publishedAt}

              onChange={(e) => setPublishedAt(e.target.value)}

              className="admin-input max-w-sm"

            />

          </div>

        </div>

      </section>



      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">

        <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">

          <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">PDF attachment</h3>

          <p className="mt-1 text-xs leading-[1.4] text-muted-foreground">

            Optional file shown as a download link on the public article. Max 10

            MB.

          </p>

        </div>

        <div className="px-[1.1rem] pb-4 pt-[0.9rem]">

          <div

            className="flex flex-col items-center justify-center gap-2.5 rounded-[10px] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors focus-within:border-brand-olive-dark focus-within:bg-brand-olive/5 hover:border-brand-olive-dark hover:bg-brand-olive/5"

            onDragOver={(e) => e.preventDefault()}

            onDrop={(e) => {

              e.preventDefault();

              const file = e.dataTransfer.files?.[0];

              onPickPdf(file ?? null);

            }}

          >

            <Upload className="h-9 w-9 text-brand-olive-dark opacity-85" aria-hidden />

            <p className="text-[0.9375rem] font-semibold text-slate-800">

              Drag and drop a PDF, or browse

            </p>

            <p className="text-[0.8125rem] text-slate-900">PDF only · up to 10 MB</p>

            <input

              ref={fileInputRef}

              type="file"

              accept="application/pdf,.pdf"

              className="sr-only"

              id="news-pdf-input"

              onChange={(e) => onPickPdf(e.target.files?.[0] ?? null)}

            />

            <Button

              type="button"

              size="sm"

              variant="adminOutline"

              onClick={() => fileInputRef.current?.click()}

            >

              Choose PDF

            </Button>

          </div>



          {(hasExistingPdf || pdfFile) && attachedName ? (

            <div

              className={

                attachedSize != null && attachedSize <= MIN_NEWS_PDF_BYTES

                  ? "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-3.5"

                  : "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5"

              }

            >

              <div className="flex min-w-0 flex-wrap items-center gap-2 text-[0.8125rem] text-slate-800">

                <FileText className="h-4 w-4 shrink-0 text-brand-olive" />

                <span className="truncate font-medium">{attachedName}</span>

                {attachedSize != null ? (

                  <span className="text-brand-ink-muted">

                    ({formatFileSize(attachedSize)})

                  </span>

                ) : null}

                {attachedSize != null && attachedSize <= MIN_NEWS_PDF_BYTES ? (

                  <span className="flex-[1_0_100%] text-[0.8125rem] font-semibold text-amber-700">

                    Invalid file — re-upload a valid PDF

                  </span>

                ) : null}

                {pdfFile ? (

                  <span className="text-xs text-brand-olive">(new upload)</span>

                ) : null}

              </div>

              <div className="flex flex-wrap gap-2">

                {postId &&
                hasExistingPdf &&
                !pdfFile &&
                initial?.pdfReadable !== false ? (
                  <a
                    href={getAdminNewsPdfUrl(postId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ops-btn ops-btn-secondary inline-flex min-h-[2.5rem] items-center justify-center rounded-md border px-4 py-2 text-[0.8125rem] font-semibold"
                  >
                    View PDF
                  </a>
                ) : null}

                {pdfFile ? (

                  <Button

                    type="button"

                    size="sm"

                    variant="adminOutline"

                    onClick={clearPdfSelection}

                  >

                    <X className="mr-1 h-3.5 w-3.5" />

                    Clear selection

                  </Button>

                ) : (

                  <Button

                    type="button"

                    size="sm"

                    variant="adminDestructive"

                    onClick={markRemovePdf}

                  >

                    Remove PDF

                  </Button>

                )}

              </div>

            </div>

          ) : null}

        </div>

      </section>



      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">

        <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem] flex flex-wrap items-center justify-between gap-3">

          <div>

            <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Article body</h3>

            <p className="mt-1 text-xs leading-[1.4] text-muted-foreground">

              Write in plain text — paragraphs are formatted automatically.

              Use Preview to check how it will appear on the site.

            </p>

          </div>

          <div className="inline-flex gap-1 rounded-[10px] border border-slate-200 bg-slate-50 p-1" role="tablist">

            <button

              type="button"

              role="tab"

              aria-selected={contentView === "write"}

              className={cn(

                "inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border-none bg-transparent px-3 py-1.5 text-[0.8125rem] font-semibold text-slate-900 transition-colors hover:text-slate-800",

                contentView === "write" && "bg-white text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"

              )}

              onClick={() => setContentView("write")}

            >

              <Pencil className="h-3.5 w-3.5" aria-hidden />

              Write

            </button>

            <button

              type="button"

              role="tab"

              aria-selected={contentView === "preview"}

              className={cn(

                "inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border-none bg-transparent px-3 py-1.5 text-[0.8125rem] font-semibold text-slate-900 transition-colors hover:text-slate-800",

                contentView === "preview" && "bg-white text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"

              )}

              onClick={() => setContentView("preview")}

            >

              <Eye className="h-3.5 w-3.5" aria-hidden />

              Preview

            </button>

          </div>

        </div>

        <div className="px-[1.1rem] pb-4 pt-[0.9rem]">

          {contentView === "write" ? (

            <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">

              <label htmlFor="news-content" className="sr-only">

                Content

              </label>

              <Textarea

                id="news-content"

                value={content}

                onChange={(e) => setContent(e.target.value)}

                rows={12}

                className="admin-input min-h-[14rem] resize-y text-sm leading-relaxed"

                placeholder="Write your announcement here. Separate paragraphs with a blank line."

              />

            </div>

          ) : previewHtml ? (

            <div

              className="rounded-[10px] border border-slate-200 bg-slate-50 px-5 py-[1.125rem] text-[0.9375rem] leading-[1.65] text-slate-700 [&_a]:text-brand-olive-dark [&_a]:underline [&_ol]:mb-3.5 [&_ol]:pl-5 [&_p:last-child]:mb-0 [&_p]:mb-3.5 [&_ul]:mb-3.5 [&_ul]:pl-5"

              dangerouslySetInnerHTML={{ __html: previewHtml }}

            />

          ) : (

            <p className="m-0 text-[0.8125rem] text-muted-foreground">

              Nothing to preview yet — add some text in Write mode.

            </p>

          )}

        </div>

      </section>



      <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">

        <div className="px-[1.1rem] pb-4 pt-[0.9rem]">

          <div className="mt-[0.9rem] flex flex-wrap gap-2 [&_.ops-btn-approve]:!border-[var(--portal-approve)] [&_.ops-btn-approve]:!bg-[var(--portal-approve)] [&_.ops-btn-approve]:!text-white [&_.ops-btn-approve:hover]:!border-[var(--portal-approve-hover)] [&_.ops-btn-approve:hover]:!bg-[var(--portal-approve-hover)] [&_.ops-btn-approve:disabled]:!border-slate-300 [&_.ops-btn-approve:disabled]:!bg-slate-200 [&_.ops-btn-approve:disabled]:!text-slate-900 [&_.ops-btn-approve:disabled]:!opacity-100 [&_.ops-btn-secondary]:!border-gray-300 [&_.ops-btn-secondary]:!bg-white [&_.ops-btn-secondary]:!text-slate-600">

            <Button

              onClick={handleSave}

              disabled={submitting}

              variant="adminPrimary"

            >

              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {isNew ? "Create post" : "Save changes"}

            </Button>

            <Button

              type="button"

              variant="adminOutline"

              disabled={submitting}

              onClick={() => router.push("/admin/news")}

            >

              Cancel

            </Button>

          </div>

        </div>

      </section>

    </div>

  );

}


