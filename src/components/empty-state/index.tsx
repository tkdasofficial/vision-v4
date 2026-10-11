import { ArrowUpRight, Code2, FileText, Lightbulb } from "lucide-react";
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

const EmptyState = ({ tool, onPromptClick }: Props) => {
  const prompts = tool ? tool.samplePrompts.slice(0, 3) : suggestions;
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-10 animate-fade-up">
      <img src={logo} alt="Vision" className="mb-5 size-14 shrink-0 rounded-full object-cover ring-1 ring-border" />

      <h2 className="mb-1.5 text-center font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {tool?.emptyStateTitle || "What can I help you with?"}
      </h2>
      <p className="mb-8 max-w-xs text-center text-sm text-muted-foreground">
        Ask anything — answers, writing, code and plans.
      </p>

      <div aria-label="Suggested questions" className="grid w-full max-w-md gap-2">
        {prompts.map((item, i) => (
          <button
            key={item.prompt}
            type="button"
            onClick={() => onPromptClick(item.prompt)}
            style={{ animationDelay: `${80 + i * 60}ms` }}
            className="group flex min-h-11 w-full items-center gap-3 rounded-xl border border-border/60 px-4 py-2.5 text-left transition-colors duration-150 animate-fade-up hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <item.icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span className="flex-1 text-sm text-foreground">{item.label}</span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
