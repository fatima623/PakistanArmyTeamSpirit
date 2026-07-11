"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  RefreshCw,
  ZoomIn,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  paymentId: string;
  /** Admin review uses admin-only route; participants use owner-only route. */
  access: "admin" | "user";
  mimeType?: string | null;
  fileName?: string | null;
  className?: string;
  /** Height classes for the inline preview (e.g. `h-80` for the admin cover
   *  preview, `max-h-48` for the participant inline view). */
  imageMaxHeight?: string;
  /** Render the media viewer chrome (view full / fullscreen / open / download).
   *  The inline image becomes a cover-cropped preview; clicking it opens the
   *  full-size proof in a lightbox. */
  withToolbar?: boolean;
};

function isImageMime(mime: string | null | undefined, fileName?: string | null) {
  if (mime?.startsWith("image/")) return true;
  if (!fileName) return false;
  return /\.(jpe?g|png)$/i.test(fileName);
}

export function PaymentProofViewer({
  paymentId,
  access,
  mimeType,
  fileName,
  className,
  imageMaxHeight = "max-h-48",
  withToolbar = false,
}: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mediaRef = useRef<HTMLElement>(null);

  const endpoint =
    access === "admin"
      ? `/api/admin/payment-proof/${paymentId}`
      : `/api/user/payment-proof/${paymentId}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    try {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Could not load payment proof"
        );
      }
      const blob = await res.blob();
      setObjectUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load proof");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
    return () => {
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [load]);

  const goFullscreen = () => {
    try {
      void mediaRef.current?.requestFullscreen?.();
    } catch {
      window.open(objectUrl ?? "", "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-500 ${className ?? ""}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading proof…
      </div>
    );
  }

  if (error || !objectUrl) {
    return (
      <div className={`space-y-2 text-sm ${className ?? ""}`}>
        <p className="text-red-700">{error ?? "Proof unavailable"}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 text-brand-olive-dark hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const showImage = isImageMime(mimeType, fileName);

  // —— Media viewer (admin detail page): cover preview + lightbox ——
  if (withToolbar) {
    return (
      <>
        <figure ref={mediaRef} className={cn("relative m-0 flex min-h-[200px] items-center justify-center overflow-hidden rounded-[14px] border border-gray-200 p-3 [background:linear-gradient(45deg,theme(colors.slate.100)_25%,transparent_25%)_-8px_0/16px_16px,linear-gradient(-45deg,theme(colors.slate.100)_25%,transparent_25%)_-8px_0/16px_16px,linear-gradient(45deg,transparent_75%,theme(colors.slate.100)_75%)_-8px_0/16px_16px,linear-gradient(-45deg,transparent_75%,theme(colors.slate.100)_75%)_-8px_0/16px_16px,theme(colors.slate.50)]", className)}>
          <div className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center gap-1 rounded-[10px] border border-gray-200 bg-white/90 p-1 shadow-[0_2px_8px_rgba(15,23,42,0.1)] backdrop-blur-[6px]">
            {showImage ? (
              <>
                <button
                  type="button"
                  className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-slate-600 transition-colors hover:bg-green-50 hover:text-green-700"
                  onClick={() => setLightboxOpen(true)}
                  title="View full image"
                  aria-label="View full image"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-slate-600 transition-colors hover:bg-green-50 hover:text-green-700"
                  onClick={goFullscreen}
                  title="Fullscreen"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : null}
            <a
              href={objectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-slate-600 transition-colors hover:bg-green-50 hover:text-green-700"
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={objectUrl}
              download={fileName ?? "payment-proof"}
              className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-slate-600 transition-colors hover:bg-green-50 hover:text-green-700"
              title="Download"
              aria-label="Download"
            >
              <Download className="h-4 w-4" aria-hidden />
            </a>
          </div>

          {showImage ? (
            <Image
              src={objectUrl}
              alt="Payment proof — click to view full size"
              width={1280}
              height={720}
              unoptimized
              onClick={() => setLightboxOpen(true)}
              title="Click to view full image"
              className={cn(
                "w-full cursor-zoom-in rounded-lg object-cover",
                imageMaxHeight
              )}
            />
          ) : (
            <a
              href={objectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-brand-ink shadow-sm transition hover:border-brand-olive"
            >
              <FileText className="h-4 w-4" aria-hidden />
              View receipt (PDF)
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </figure>

        {showImage ? (
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="w-auto max-w-[94vw] border-none bg-transparent p-0 shadow-none sm:rounded-xl [&>button:last-child]:rounded-full [&>button:last-child]:bg-white/90 [&>button:last-child]:p-1.5 [&>button:last-child]:text-slate-700 [&>button:last-child]:opacity-100 [&>button:last-child]:shadow">
              <DialogTitle className="sr-only">
                Payment proof — full size
              </DialogTitle>
              <Image
                src={objectUrl}
                alt="Payment proof full size"
                width={1600}
                height={1200}
                unoptimized
                onClick={() => setLightboxOpen(false)}
                className="max-h-[88vh] w-auto max-w-[92vw] cursor-zoom-out rounded-xl object-contain"
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </>
    );
  }

  // —— Compact inline viewer (participant portal) ——
  return (
    <div className={className}>
      {showImage ? (
        <a
          href={objectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Image
            src={objectUrl}
            alt="Payment proof"
            width={320}
            height={200}
            unoptimized
            className={`w-auto rounded border border-slate-200 object-contain ${imageMaxHeight}`}
          />
        </a>
      ) : (
        <a
          href={objectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cp-link inline-flex items-center gap-1 text-sm font-medium"
        >
          View receipt (PDF) <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
