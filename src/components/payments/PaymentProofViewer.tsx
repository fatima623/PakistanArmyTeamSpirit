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
  ZoomOut,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  paymentId: string;
  /** Admin review uses admin-only route; participants use owner-only route. */
  access: "admin" | "user";
  mimeType?: string | null;
  fileName?: string | null;
  className?: string;
  imageMaxHeight?: string;
  /** Render the premium media viewer chrome (zoom / fullscreen / open / download). */
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
  const [zoomed, setZoomed] = useState(false);
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

  // —— Premium media viewer (admin detail page) ——
  if (withToolbar) {
    return (
      <figure ref={mediaRef} className={cn("relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[14px] border border-gray-200 p-4 [background:linear-gradient(45deg,theme(colors.slate.100)_25%,transparent_25%)_-8px_0/16px_16px,linear-gradient(-45deg,theme(colors.slate.100)_25%,transparent_25%)_-8px_0/16px_16px,linear-gradient(45deg,transparent_75%,theme(colors.slate.100)_75%)_-8px_0/16px_16px,linear-gradient(-45deg,transparent_75%,theme(colors.slate.100)_75%)_-8px_0/16px_16px,theme(colors.slate.50)] [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg", className)}>
        <div className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center gap-1 rounded-[10px] border border-gray-200 bg-white/90 p-1 shadow-[0_2px_8px_rgba(15,23,42,0.1)] backdrop-blur-[6px]">
          {showImage ? (
            <>
              <button
                type="button"
                className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-slate-600 transition-colors hover:bg-green-50 hover:text-green-700"
                onClick={() => setZoomed((z) => !z)}
                title={zoomed ? "Zoom out" : "Zoom in"}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
              >
                {zoomed ? (
                  <ZoomOut className="h-4 w-4" aria-hidden />
                ) : (
                  <ZoomIn className="h-4 w-4" aria-hidden />
                )}
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
            alt="Payment proof"
            width={640}
            height={400}
            unoptimized
            onClick={() => setZoomed((z) => !z)}
            className={cn(
              "w-auto object-contain transition-all duration-200",
              zoomed ? "max-h-[46rem] cursor-zoom-out" : imageMaxHeight,
              !zoomed && "cursor-zoom-in"
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
