import { useEffect, useState } from "react";
import { FolderMinus, FolderOpen, FolderPlus, MoreVertical, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useChatHistory } from "@/context/ChatHistoryContext";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/lib/cloud/client";
import { projectIcons } from "@/lib/project-options";

type Project = { id: string; name: string; icon?: string };

/** Shared clean row style for the chat/project option menus. */
const menuItemClass = "gap-3 rounded-full px-4 py-2.5 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

/** Three-dot options for one chat row (Recent list and project chat lists). */
export default function ChatItemMenu({ chatId, title, onRename, inProject = false, className }: {
  chatId: string; title: string; onRename: () => void; inProject?: boolean; className?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getChatById, togglePin, deleteChat, setChatProject } = useChatHistory();
  const chat = getChatById(chatId);
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!open || !user || inProject) return;
    supabase.from("workspace_projects").select("id,name,icon").eq("user_id", user.id).then(({ data }) => setProjects(data || []));
  }, [open, user?.id, inProject]);

  const move = async (projectId: string | null, label: string) => {
    if (await setChatProject(chatId, projectId)) toast.success(label);
    else toast.error("Couldn't update the chat. Please try again.");
  };
  const remove = () => { if (window.confirm(`Delete "${title}"?`)) deleteChat(chatId); };

  return <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className={className ?? "size-10 shrink-0 rounded-full"} aria-label={`Options for ${title}`} title="Chat options"><MoreVertical /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
      <DropdownMenuItem className="rounded-full" onSelect={() => togglePin(chatId)}>{chat?.pinned ? <><PinOff />Unpin</> : <><Pin />Pin</>}</DropdownMenuItem>
      <DropdownMenuItem className="rounded-full" onSelect={onRename}><Pencil />Rename</DropdownMenuItem>
      {inProject ? <DropdownMenuItem className="rounded-full" onSelect={() => void move(null, "Removed from project")}><FolderMinus />Remove from project</DropdownMenuItem> : <DropdownMenuSub>
        <DropdownMenuSubTrigger className="rounded-full"><FolderPlus className="mr-2 size-4" />Add to project</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="max-h-72 w-52 overflow-y-auto rounded-2xl p-1.5">
          {projects.map((project) => {
            const Icon = projectIcons.find((e) => e.value === project.icon)?.icon || FolderOpen;
            return <DropdownMenuItem key={project.id} className="rounded-full" onSelect={() => void move(project.id, `Moved to ${project.name}`)}><Icon /><span className="truncate">{project.name}</span></DropdownMenuItem>;
          })}
          {projects.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem className="rounded-full" onSelect={() => navigate(`/projects/new?chat=${chatId}`)}><Plus />Create new</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="rounded-full text-destructive focus:text-destructive" onSelect={remove}><Trash2 />Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
