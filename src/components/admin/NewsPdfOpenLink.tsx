import { FileText } from "lucide-react";

import { portalTableActionView } from "@/lib/admin-ui";
import { getAdminNewsPdfUrl } from "@/lib/open-news-pdf";
import { cn } from "@/lib/utils";

type NewsPdfOpenLinkProps = {
  postId: string;
  fileName?: string | null;
  className?: string;
};

/** Opens the PDF in a new tab — browser native viewer only (inline API response). */
export function NewsPdfOpenLink({
  postId,
  fileName,
  className,
}: NewsPdfOpenLinkProps) {
  const title = fileName ? `Open ${fileName}` : "Open PDF attachment";
  const href = getAdminNewsPdfUrl(postId);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={cn(
        portalTableActionView,
        "ops-btn ops-btn-secondary max-w-[7.5rem] gap-[0.35rem] no-underline hover:no-underline",
        className
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>View PDF</span>
    </a>
  );
}
