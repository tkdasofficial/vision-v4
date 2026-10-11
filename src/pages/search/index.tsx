import { SearchDrawerPage } from "@/components/app-drawer";
import WorkspaceSearch from "@/components/workspace-search";
import WorkspaceShell from "@/components/workspace-shell";

export default function Search({ library = false }: { library?: boolean }) {
  if (!library) return <SearchDrawerPage />;
  return <WorkspaceShell title="Library"><div className="flex h-[calc(100dvh-120px)] min-h-0 flex-col"><WorkspaceSearch library /></div></WorkspaceShell>;
}
