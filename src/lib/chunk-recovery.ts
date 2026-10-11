/** Reloads the page once when a page file fails to download (a new version went live). At most one reload per 5 minutes, and never in the dev preview, where the dev server already refreshes the page itself — reloading there caused repeated reload loops. */
export const CHUNK_ERROR_RE = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .* failed/i;
const KEY = "vision_chunk_reload";
const WINDOW_MS = 5 * 60_000;
let pending = false;

export function recoverFromChunkError(): boolean {
  if (typeof window === "undefined" || import.meta.env.DEV) return false;
  if (pending) return true;
  let at = 0;
  try { at = Number(sessionStorage.getItem(KEY)) || 0; } catch { /* ignore */ }
  if (Date.now() - at < WINDOW_MS) return false;
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch { return false; }
  pending = true;
  setTimeout(() => window.location.reload(), 500);
  return true;
}
