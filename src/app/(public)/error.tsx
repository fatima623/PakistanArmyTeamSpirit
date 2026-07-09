"use client";

import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <h2 className="mb-2 text-2xl font-bold text-brand-ink">
        Something went wrong
      </h2>
      <p className="mb-6 text-sm text-brand-ink-muted">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again."}
      </p>
      <Button onClick={reset} className="cp-btn-primary">
        Try again
      </Button>
    </div>
  );
}
