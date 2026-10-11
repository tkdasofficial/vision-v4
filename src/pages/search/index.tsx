import DrawerPage from "@/pages/drawer";
import WorkspaceSearch from "@/components/workspace-search";
import WorkspaceShell from "@/components/workspace-shell";

export default function Search({ library = false }: { library?: boolean }) {
  if (!library) return <DrawerPage initialSearch />;
  return <WorkspaceShell title="Library"><div className="flex h-[calc(100dvh-120px)] min-h-0 flex-col"><WorkspaceSearch library /></div></WorkspaceShell>;
}
