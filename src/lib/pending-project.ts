/** "New project chat": the next chat created in this tab joins this project. */
const KEY = "vision_pending_project";

export function setPendingProject(projectId: string) {
  try { sessionStorage.setItem(KEY, projectId); } catch { /* storage unavailable */ }
}

export function takePendingProject(): string | null {
  try {
    const id = sessionStorage.getItem(KEY);
    if (id) sessionStorage.removeItem(KEY);
    return id || null;
  } catch { return null; }
}

/** Pinned projects first, then most recently updated. */
export function sortProjects<T extends { pinned?: boolean | number | null; updated_at?: string; created_at?: string }>(list: T[]): T[] {
  const stamp = (p: T) => p.updated_at || p.created_at || "";
  return [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || stamp(b).localeCompare(stamp(a)));
}
