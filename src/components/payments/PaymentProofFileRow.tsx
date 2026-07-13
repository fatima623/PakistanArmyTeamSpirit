"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Download, Eye, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

function isImageMime(mime: string | null | undefined, fileName?: string | null) {
  if (mime?.startsWith("image/")) return true;
  if (!fileName) return false;
  return /\.(jpe?g|png)$/i.test(fileName);
}

function fmtFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Compact proof file row — “[icon] 1.jpeg · 164.5 KB … [view] [download]”.
 * The blob is fetched on first use; viewing an image opens a lightbox,
 * viewing a PDF opens a new tab.
 */
export function PaymentProofFileRow({
  paymentId,
  access,
  fileName,
  fileSize,
  mimeType,
}: {
  paymentId: string;
  access: "admin" | "user";
  fileName: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
}) {
  const [busy, setBusy] = useState<"view" | "download" | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const cachedUrl = useRef<string | null>(null);

  const isImage = isImageMime(mimeType, fileName);
  const size = fmtFileSize(fileSize);
  const endpoint =
    access === "admin"
      ? `/api/admin/payment-proof/${paymentId}`
      : `/api/user/payment-proof/${paymentId}`;

  const getUrl = useCallback(async (): Promise<string | null> => {
    if (cachedUrl.current) return cachedUrl.current;
    try {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Could not load payment proof"
        );
      }
      const blob = await res.blob();
      cachedUrl.current = URL.createObjectURL(blob);
      return cachedUrl.current;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load proof");
      return null;
    }
  }, [endpoint]);

  const view = async () => {
    setBusy("view");
    const url = await getUrl();
    setBusy(null);
    if (!url) return;
    if (isImage) setLightboxUrl(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  const download = async () => {
    setBusy("download");
    const url = await getUrl();
    setBusy(null);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ?? "payment-proof";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const RowIcon = isImage ? ImageIcon : FileText;

  return (
    <>
      <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700"
          aria-hidden
        >
          <RowIcon className="h-[18px] w-[18px]" />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-0.5">
          <p className="m-0 max-w-full truncate text-[0.875rem] font-bold text-slate-900">
            {fileName ?? "Payment proof"}
          </p>
          {size ? (
            <p className="m-0 text-[0.78rem] font-medium text-slate-400">
              {size}
            </p>
          ) : null}
        </div>
        <div className="flex flex-none items-center gap-1.5">
          <button
            type="button"
            onClick={() => void view()}
            disabled={busy !== null}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
            title={isImage ? "View image" : "View PDF"}
            aria-label={isImage ? "View image" : "View PDF"}
          >
            {busy === "view" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => void download()}
            disabled={busy !== null}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
            title="Download"
            aria-label="Download"
          >
            {busy === "download" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {isImage ? (
        <Dialog
          open={!!lightboxUrl}
          onOpenChange={(o) => {
            if (!o) setLightboxUrl(null);
          }}
        >
          <DialogContent className="w-auto max-w-[94vw] border-none bg-transparent p-0 shadow-none sm:rounded-xl [&>button:last-child]:rounded-full [&>button:last-child]:bg-white/90 [&>button:last-child]:p-1.5 [&>button:last-child]:text-slate-700 [&>button:last-child]:opacity-100 [&>button:last-child]:shadow">
            <DialogTitle className="sr-only">
              Payment proof — full size
            </DialogTitle>
            {lightboxUrl ? (
              <Image
                src={lightboxUrl}
                alt="Payment proof full size"
                width={1600}
                height={1200}
                unoptimized
                onClick={() => setLightboxUrl(null)}
                className="max-h-[88vh] w-auto max-w-[92vw] cursor-zoom-out rounded-xl object-contain"
              />
            ) : null}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
