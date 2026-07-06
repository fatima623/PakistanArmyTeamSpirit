"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";

type Props = {
  paymentId: string;
  /** Admin review uses admin-only route; participants use owner-only route. */
  access: "admin" | "user";
  mimeType?: string | null;
  fileName?: string | null;
  className?: string;
  imageMaxHeight?: string;
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
}: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          className="inline-flex items-center gap-1 text-cp-olive-dark hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const showImage = isImageMime(mimeType, fileName);

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
      <p className="mt-1 text-xs text-slate-500">
        Private storage · session required
        <button
          type="button"
          onClick={load}
          className="ml-2 text-cp-olive-dark hover:underline"
        >
          Reload
        </button>
      </p>
    </div>
  );
}
