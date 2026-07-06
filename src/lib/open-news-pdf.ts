/** Direct PDF stream — browser native viewer in the new tab (inline, not a wrapper page). */
export function getAdminNewsPdfUrl(postId: string): string {
  return `/api/admin/news-pdf/${encodeURIComponent(postId)}`;
}
