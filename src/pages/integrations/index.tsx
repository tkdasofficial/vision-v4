import { RefreshCw, CircleHelp } from "lucide-react";
import { useMemo, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import WorkspaceShell from "@/components/workspace-shell";
import BottomSearch from "@/components/bottom-search";
import { PLUGINS as services } from "@/lib/plugins";

export default function Plugins() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => services.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <WorkspaceShell title="Plugins" backTo="/chat" menu={[{ label: "Refresh", icon: RefreshCw, onSelect: () => window.location.reload() }, { label: "Help & FAQ", icon: CircleHelp, onSelect: () => window.location.assign("/help/faq") }]} footer={<BottomSearch value={query} onChange={setQuery} placeholder="Search plugins" />}>
    <h2 className="mb-3 flex items-center gap-1 text-lg font-semibold text-muted-foreground">Popular <ChevronRight className="size-5" /></h2>
    <div className="space-y-1">
      {filtered.map(({ name, description, icon: Icon }) => <div key={name} className="flex items-center gap-4 py-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary"><Icon className="size-6 text-foreground" /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-base font-medium text-foreground">{name}</p><p className="truncate text-sm text-muted-foreground">{description}</p></div>
        <button type="button" aria-label={`Add ${name}`} title={`Add ${name}`} onClick={() => toast.error(`${name} isn't available yet.`)} className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent"><Plus className="size-6" /></button>
      </div>)}
    </div>
    {filtered.length === 0 && <p className="py-16 text-center text-muted-foreground">No plugins found</p>}
  </WorkspaceShell>;
}
