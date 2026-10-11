import { Library, FolderOpen, Plug } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const features = [
  { label: "Library", to: "/library", icon: Library },
  { label: "Projects", to: "/projects", icon: FolderOpen },
  { label: "Plugins", to: "/integrations", icon: Plug },
] as const;

export default function SidebarFeatures({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav aria-label="Workspace features" className="space-y-px px-2.5 pt-1">
      {features.map(({ label, to, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <span className={cn("flex size-7 items-center justify-center rounded-lg", active ? "bg-primary/15 text-primary" : "bg-sidebar-accent/70 text-muted-foreground")}>
              <Icon className="size-4" />
            </span>
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
