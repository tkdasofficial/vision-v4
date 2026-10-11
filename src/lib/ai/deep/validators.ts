// Deterministic validators for Deep Thinking Mode candidates. Pure; never relies on the model's self-assessment.
import type { RequestAnalysis } from "./analyze";
import { planDurations } from "./durations";

export type Issue = { code: string; message: string };

const NUMBER_WORDS = "\\d{1,3}";

/** Numbers of the top-level outputs, in the order they appear. Prefers labelled items ("Scene 3"). */
export function extractItemNumbers(text: string, noun?: string): number[] {
  const body = text.replace(/```[\s\S]*?```/g, (m) => (/^```json/i.test(m) ? m : "")); // ignore code bodies except JSON
  if (noun) {
    const re = new RegExp(`^\\s{0,3}(?:#{1,6}\\s*)?(?:[*_]{1,2})?${noun}s?\\s*#?(${NUMBER_WORDS})\\b`, "gim");
    const nums = [...body.matchAll(re)].map((m) => Number(m[1]));
    if (nums.length) return nums;
  }
  const re = /^(?:#{1,6}\s*)?(?:[*_]{1,2})?(\d{1,3})[.)]\s+\S/gm;
  return [...body.matchAll(re)].map((m) => Number(m[1]));
}

/** Missing, duplicated and out-of-order numbers against 1..expected. */
export function checkSequence(nums: number[], expected: number): Issue[] {
  const issues: Issue[] = [];
  const seen = new Set<number>();
  const dups = new Set<number>();
  for (const n of nums) (seen.has(n) ? dups : seen).add(n);
  const missing = Array.from({ length: expected }, (_, i) => i + 1).filter((n) => !seen.has(n));
  const extra = [...seen].filter((n) => n < 1 || n > expected).sort((a, b) => a - b);
  if (missing.length) issues.push({ code: "missing", message: `Missing item(s): ${missing.join(", ")}.` });
  if (dups.size) issues.push({ code: "duplicate", message: `Duplicated item(s): ${[...dups].join(", ")}.` });
  if (extra.length) issues.push({ code: "extra", message: `Unrequested extra item(s): ${extra.join(", ")} (only ${expected} requested).` });
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < nums[i - 1]) { issues.push({ code: "order", message: `Items are out of order (${nums[i - 1]} appears before ${nums[i]}).` }); break; }
  }
  return issues;
}

export function checkJson(text: string): Issue[] {
  const fenced = /```json\s*([\s\S]*?)```/i.exec(text);
  const src = fenced ? fenced[1] : text.trim();
  if (!fenced && !/^[[{]/.test(src)) return [{ code: "json_missing", message: "JSON was requested but no JSON block was found." }];
  try { JSON.parse(src); return []; } catch (e: any) { return [{ code: "json_invalid", message: `The JSON is invalid: ${String(e?.message ?? e).slice(0, 120)}.` }]; }
}

/** Per-item durations written as "Duration: 6s" / "(8 seconds)" / "0:00–0:06". */
export function extractDurations(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/\bduration\b[^\d\n]{0,15}(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?)?\b/gi)) out.push(Number(m[1]));
  return out;
}

export function checkDurations(text: string, a: RequestAnalysis): Issue[] {
  if (!a.allowedDurations) return [];
  const d = extractDurations(text);
  if (!d.length) return [{ code: "duration_missing", message: `Each clip must state its duration as "Duration: Ns" using only ${a.allowedDurations.join("/")} seconds.` }];
  const issues: Issue[] = [];
  const bad = d.filter((v) => !a.allowedDurations!.includes(v));
  if (bad.length) issues.push({ code: "duration_unsupported", message: `Unsupported clip duration(s): ${bad.join(", ")}s. Allowed: ${a.allowedDurations.join(", ")}s.` });
  if (a.totalDuration) {
    const feasible = planDurations(Math.round(a.totalDuration), a.allowedDurations, a.items?.noun === "scene" || a.items?.noun === "clip" ? a.items.count : undefined);
    const sum = d.reduce((x, y) => x + y, 0);
    if (feasible && Math.abs(sum - a.totalDuration) > 0.01) issues.push({ code: "duration_total", message: `Clip durations sum to ${sum}s but the audio is ${a.totalDuration}s.` });
    if (!feasible && !/\b(not possible|impossible|cannot|can't|mismatch|conflict)\b/i.test(text)) {
      issues.push({ code: "duration_conflict_hidden", message: `A ${a.totalDuration}s total cannot be built exactly from ${a.allowedDurations.join("/")}s clips; the answer must state this conflict and offer feasible alternatives.` });
    }
  }
  return issues;
}

/** Truncation signs: provider stopped for length or a code fence was left open. */
export function checkComplete(text: string, finishReason: string | null): Issue[] {
  const issues: Issue[] = [];
  if (finishReason === "length") issues.push({ code: "truncated", message: "The response was cut off by the output limit." });
  if (((text.match(/```/g) ?? []).length) % 2 === 1) issues.push({ code: "open_fence", message: "A code block is not closed." });
  if (!text.trim()) issues.push({ code: "empty", message: "The response is empty." });
  return issues;
}

export function validateCandidate(text: string, a: RequestAnalysis, finishReason: string | null = "stop"): Issue[] {
  const issues = [...checkComplete(text, finishReason)];
  if (a.items) issues.push(...checkSequence(extractItemNumbers(text, a.items.noun), a.items.count));
  if (a.wantsJson) issues.push(...checkJson(text));
  issues.push(...checkDurations(text, a));
  return issues;
}
