// Deep Thinking Mode — bounded generate → validate → correct → revalidate workflow.
// Pure orchestration: the model call is injected, so this runs in unit tests with mocks.
import type { RequestAnalysis } from "./analyze";
import { nearestFeasible, planDurations } from "./durations";
import { validateCandidate, type Issue } from "./validators";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: unknown };
export type CallResult = { ok: true; text: string; finishReason: string | null } | { ok: false; status: number; reason: string };
export type ModelCall = (messages: ChatMsg[]) => Promise<CallResult>;

export const DEEP_LIMITS = { maxCorrections: 2, maxContinuations: 3, budgetMs: 100_000 };

export type DeepResult =
  | { ok: true; text: string; remaining: Issue[]; corrections: number; continuations: number; stages: string[] }
  | { ok: false; status: number; reason: string; stages: string[] };

/** Extra system instructions derived from the deterministic analysis (incl. a pre-computed feasible timeline). */
export function planAddendum(a: RequestAnalysis): string {
  const lines: string[] = [];
  if (a.items) lines.push(`Deliver exactly ${a.items.count} ${a.items.noun}s, labelled "${cap(a.items.noun)} 1" … "${cap(a.items.noun)} ${a.items.count}", in order. Do not add, merge, skip or reorder any.`);
  if (a.length === "short") lines.push("The user asked for a short answer: keep the final reply brief while keeping every required element.");
  if (a.length === "detailed") lines.push("The user asked for detail: give a complete, thorough answer covering every requested element.");
  if (a.wantsJson) lines.push("Output valid JSON in a single ```json fenced block.");
  if (a.allowedDurations) {
    lines.push(`Clip lengths may only be ${a.allowedDurations.join(", ")} seconds. Write each clip's length as "Duration: Ns" and give start/end times.`);
    if (a.totalDuration) {
      const n = a.items && (a.items.noun === "scene" || a.items.noun === "clip" || a.items.noun === "shot") ? a.items.count : undefined;
      const plan = planDurations(Math.round(a.totalDuration), a.allowedDurations, n);
      if (plan) lines.push(`A verified timeline that sums exactly to ${a.totalDuration}s: ${plan.join("s + ")}s. Use it (or another exact combination fitting the story).`);
      else {
        const near = nearestFeasible(Math.round(a.totalDuration), a.allowedDurations, n);
        lines.push(`It is mathematically impossible to reach exactly ${a.totalDuration}s with these clip lengths${n ? ` and ${n} clips` : ""}. State this conflict clearly and offer feasible alternatives${near.below || near.above ? ` (nearest exact totals: ${[near.below, near.above].filter(Boolean).map((v) => `${v}s`).join(" or ")})` : ""}. Never present an impossible timeline as exact.`);
      }
    }
  }
  return lines.length ? `\n\nRequirements checked automatically after you answer:\n- ${lines.join("\n- ")}` : "";
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function runDeepPipeline(opts: {
  messages: ChatMsg[];
  analysis: RequestAnalysis;
  call: ModelCall;
  limits?: Partial<typeof DEEP_LIMITS>;
  now?: () => number;
}): Promise<DeepResult> {
  const L = { ...DEEP_LIMITS, ...opts.limits };
  const now = opts.now ?? Date.now;
  const start = now();
  const stages: string[] = [];
  const overBudget = () => now() - start > L.budgetMs;

  // 1. Candidate
  stages.push("generate");
  const first = await opts.call(opts.messages);
  if (!first.ok) return { ok: false, status: first.status, reason: first.reason, stages };
  let text = first.text;
  let finish = first.finishReason;

  // 2. Continuation for provider output limits — append, never silently truncate.
  let continuations = 0;
  while (finish === "length" && continuations < L.maxContinuations && !overBudget()) {
    continuations++;
    stages.push("continue");
    const r = await opts.call([...opts.messages, { role: "assistant", content: text },
      { role: "user", content: "Continue exactly where you stopped. Do not repeat anything already written and keep the same numbering and format." }]);
    if (!r.ok) break;
    text += r.text;
    finish = r.finishReason;
  }

  // 3. Validate → bounded correction → revalidate.
  stages.push("validate");
  let issues = validateCandidate(text, opts.analysis, finish);
  let corrections = 0;
  while (issues.some((i) => i.code !== "truncated") && corrections < L.maxCorrections && !overBudget()) {
    corrections++;
    stages.push("correct");
    const r = await opts.call([...opts.messages, { role: "assistant", content: text },
      { role: "user", content: `Automatic verification found these problems in your answer:\n- ${issues.map((i) => i.message).join("\n- ")}\nReturn the complete corrected answer only (not a diff, no commentary about the correction). Keep everything that was already correct.` }]);
    if (!r.ok) break;
    const next = validateCandidate(r.text, opts.analysis, r.finishReason);
    stages.push("revalidate");
    if (next.length <= issues.length) { text = r.text; issues = next; }
    if (!issues.length) break;
  }

  // 4. Honest disclosure of anything still unresolved.
  if (issues.length) {
    text += `\n\n> **Verification note:** some requirements could not be confirmed after ${corrections} correction attempt(s):\n${issues.map((i) => `> - ${i.message}`).join("\n")}`;
  }
  return { ok: true, text, remaining: issues, corrections, continuations, stages };
}
