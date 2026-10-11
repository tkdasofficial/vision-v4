import { ArrowUpRight, Brain, Code2, FileText, Lightbulb, Search, Sparkles, Table2 } from "lucide-react";
import type { AITool } from "@/lib/types";
import logo from "@/assets/logo.svg";

type Props = {
  tool?: AITool;
  onPromptClick: (prompt: string) => void;
};

const suggestions = [
  { icon: Lightbulb, label: "Can you help me explore a new idea?", prompt: "Can you help me explore a new idea?" },
  { icon: Code2, label: "How can I build my own website?", prompt: "How can I build my own website?" },
  { icon: FileText, label: "Write a professional email for me", prompt: "Write a professional email for me" },
];

const capabilities = [
  { icon: Brain, label: "Deep Thinking" },
  { icon: Search, label: "Research" },
  { icon: Code2, label: "Coding" },
  { icon: Table2, label: "Tables" },
];

const EmptyState = ({ tool, onPromptClick }: Props) => {
  const prompts = tool ? tool.samplePrompts.slice(0, 3) : suggestions;
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-8 animate-fade-up">
      {/* Logo with soft glow ring */}
      <div className="relative mb-6">
        <div aria-hidden className="absolute inset-0 -m-3 rounded-full bg-primary/15 blur-xl" />
        <img src={logo} alt="Vision" className="relative size-16 shrink-0 rounded-full object-cover ring-1 ring-border sm:size-20" />
      </div>

      <h2 className="mb-2 text-center font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {tool?.emptyStateTitle || "What can I help you with?"}
      </h2>
      <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
        Ask anything — answers, writing, code, plans and structured tables.
      </p>

      {/* Capability highlights */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2" aria-label="Capabilities">
        {capabilities.map((c) => (
          <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <c.icon className="size-3.5 text-primary" />
            {c.label}
          </span>
        ))}
      </div>

      {/* Suggestion cards */}
      <div aria-label="Suggested questions" className="grid w-full max-w-md gap-2.5">
        {prompts.map((item, i) => (
          <button
            key={item.prompt}
            type="button"
            onClick={() => onPromptClick(item.prompt)}
            style={{ animationDelay: `${120 + i * 80}ms` }}
            className="group flex min-h-11 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-all duration-200 animate-fade-up hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <item.icon className="size-4" />
            </span>
            <span className="flex-1 text-sm text-foreground">{item.label}</span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </button>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Sparkles className="size-3.5" />
        Tip: enable Deep Thinking for complex, multi-part requests
      </p>
    </div>
  );
};

export default EmptyState;
