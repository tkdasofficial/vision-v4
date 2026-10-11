import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";

export default function SidebarHeader({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="shrink-0 border-b border-sidebar-border px-3 pt-4 pb-3">
      <div className="flex items-center gap-2 px-1">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">V</span>
        <span className="flex-1 font-display text-lg font-semibold tracking-tight text-foreground">Vision</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground"
          aria-label="Search chats"
          onClick={() => { navigate("/search"); onNavigate?.(); }}
        >
          <Search />
        </Button>
      </div>
    </div>
  );
}
