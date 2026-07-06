import Link from "next/link";

import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PublicLayout>
      <article className="cp-page cp-page-inner py-12 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cp-khaki">
          404
        </p>
        <h1 className="cp-h1 mb-4">Page not found</h1>
        <p className="cp-body mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="cp-btn-primary">
          <Link href="/">Back to home</Link>
        </Button>
      </article>
    </PublicLayout>
  );
}
