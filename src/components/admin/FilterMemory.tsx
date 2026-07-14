"use client";

import { useEffect } from "react";

/**
 * Persists the active list filter to a session cookie so the selection
 * survives navigating away and back to the page — e.g. via the sidebar,
 * which links to the bare page URL with no query string. The server reads
 * this cookie as the fallback default whenever no explicit filter param is
 * present.
 *
 * Session-scoped (no Max-Age/Expires): the cookie is dropped when the
 * browser closes, so a brand-new session falls back to the role default.
 */
export function FilterMemory({
  cookieName,
  value,
}: {
  cookieName: string;
  value: string;
}) {
  useEffect(() => {
    document.cookie = `${cookieName}=${encodeURIComponent(
      value
    )}; path=/admin; samesite=lax`;
  }, [cookieName, value]);

  return null;
}
