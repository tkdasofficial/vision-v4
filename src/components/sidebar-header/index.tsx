import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";

export default function SidebarHeader({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="shrink-0 space-y-3 px-3 pt-4 pb-2">
      <div className="flex items-center gap-2 px-1">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">V</span>
        <span className="flex-1 font-display text-lg font-semibold tracking-tight text-foreground">Vision</span>
        {onClose && (
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" aria-label="Close sidebar" onClick={onClose}><X /></Button>
        )}
      </div>
      <button
        type="button"
        onClick={() => { navigate("/search"); onNavigate?.(); }}
        aria-label="Open search"
        className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-sidebar-border bg-background/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <Search className="size-4" />
        <span>Search chats</span>
      </button>
    </div>
  );
}
