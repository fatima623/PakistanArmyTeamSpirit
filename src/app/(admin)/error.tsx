"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminLayout title="Error" userInitials="…">
      <div className="py-16 text-center">
        <h2 className="mb-2 text-2xl admin-heading">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm admin-muted">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Please try again."}
        </p>
        <Button
          onClick={reset}
          variant="adminPrimary"
        >
          Try again
        </Button>
      </div>
    </AdminLayout>
  );
}
