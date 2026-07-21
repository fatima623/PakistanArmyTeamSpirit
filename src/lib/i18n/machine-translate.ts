import "server-only";

import type { Locale } from "@/lib/i18n/config";

/**
 * Best-effort machine translation via a LOCAL, self-hosted LibreTranslate
 * instance (https://github.com/LibreTranslate/LibreTranslate).
 *
 * This is the only piece that can turn brand-new admin content (ticker
 * messages, announcements) into other languages automatically: the static UI
 * is a fixed phrase set that ships pre-translated, but admin text is unbounded
 * and must be translated when it is written.
 *
 * By design the engine runs on the SAME server (default 127.0.0.1:5000) — the
 * content never leaves the machine, there is no paid API, and the result is
 * stored in the DB so rendering stays instant and offline. The feature is
 * OFF unless `AUTO_TRANSLATE_URL` is set, so a deployment without the engine
 * behaves exactly as before (manual entry + English fallback).
 */

const ENDPOINT = process.env.AUTO_TRANSLATE_URL?.replace(/\/+$/, "") || null;
const API_KEY = process.env.AUTO_TRANSLATE_API_KEY || undefined;
const TIMEOUT_MS = 20000;

/** True when a local translation engine is configured. */
export function autoTranslateEnabled(): boolean {
  return ENDPOINT !== null;
}

/**
 * Translate one string en → `target`. Returns null on ANY failure (engine off,
 * unreachable, timeout, empty result) so every caller falls back to English.
 * `html` preserves markup for the news article body.
 */
export async function machineTranslate(
  text: string,
  target: Exclude<Locale, "en">,
  opts?: { html?: boolean; source?: Locale }
): Promise<string | null> {
  if (!ENDPOINT) return null;
  const q = text.trim();
  if (!q) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q,
        source: opts?.source ?? "en",
        target,
        format: opts?.html ? "html" : "text",
        ...(API_KEY ? { api_key: API_KEY } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { translatedText?: string };
    const out = data.translatedText?.trim();
    return out && out.length > 0 ? out : null;
  } catch {
    // Connection refused (engine not running) fails fast; a slow engine hits
    // the timeout. Either way the caller keeps English.
    return null;
  } finally {
    clearTimeout(timer);
  }
}
