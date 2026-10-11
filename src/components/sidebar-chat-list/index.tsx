import { useEffect, useState } from "react";
import { FolderOpen, FolderPlus, MoreHorizontal, Pencil, Pin, Plus, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useChatHistory } from "@/context/ChatHistoryContext";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/lib/cloud/client";
import { projectIcons } from "@/lib/project-options";
import { CHAT_TITLE_MAX, normalizeChatTitle } from "@/lib/chat-title";

type Chat = { id: string; title: string; projectId?: string | null; pinned?: boolean };
type Project = { id: string; name: string; icon?: string };

type Props = {
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (id: string) => void;
  onNavigate?: () => void;
};

export default function SidebarChatList({ chats, activeChatId, onSelectChat, onNavigate }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { renameChat, deleteChat, setChatProject } = useChatHistory();
  const [projects, setProjects] = useState<Project[]>([]);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Chat | null>(null);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<Chat | null>(null);

  useEffect(() => {
    if (!menuFor || !user) return;
    supabase.from("workspace_projects").select("id,name,icon").eq("user_id", user.id).then(({ data }) => setProjects(data || []));
  }, [menuFor, user?.id]);

  if (chats.length === 0) return <div className="flex-1" />;

  const share = async (chat: Chat) => {
    const url = `${window.location.origin}/chat/${chat.id}`;
    try {
      if (navigator.share) await navigator.share({ title: chat.title || "Vision chat", url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch { /* cancelled */ }
  };

  const moveTo = async (chat: Chat, project: Project) => {
    if (await setChatProject(chat.id, project.id)) toast.success(`Moved to ${project.name}`);
    else toast.error("Couldn't move the chat. Please try again.");
  };

  const saveName = () => {
    const title = normalizeChatTitle(name);
    if (renaming && title) renameChat(renaming.id, title);
    setRenaming(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteChat(deleting.id);
    if (deleting.id === activeChatId) navigate("/chat");
    setDeleting(null);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pt-5 pb-2">
      <p className="px-3 pb-2 text-[11px] font-medium text-muted-foreground">Recent chats</p>
      <nav aria-label="Recent chats" className="space-y-px">
        {chats.map((chat) => {
          const active = chat.id === activeChatId;
          const open = menuFor === chat.id;
          return (
            <div
              key={chat.id}
              className={cn(
                "group relative flex items-center rounded-xl transition-colors",
                active || open ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
              )}
            >
              <button
                onClick={() => { onSelectChat(chat.id); onNavigate?.(); }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 py-2 pl-3 pr-1 text-left text-sm",
                  active ? "font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground",
                )}
              >
                {chat.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
                <span className="truncate">{chat.title}</span>
              </button>
              <DropdownMenu open={open} onOpenChange={(o) => setMenuFor(o ? chat.id : null)}>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label={`Options for ${chat.title}`}
                    className={cn(
                      "mr-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-opacity hover:bg-background/60 hover:text-foreground",
                      "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
                      (open || active) && "lg:opacity-100",
                    )}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
                  <DropdownMenuItem className="rounded-xl" onSelect={() => { setName(chat.title); setRenaming(chat); }}><Pencil />Rename</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl"><FolderPlus className="mr-2 size-4" />Add to project</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-72 w-52 overflow-y-auto rounded-2xl p-1.5">
                      {projects.map((project) => {
                        const Icon = projectIcons.find((e) => e.value === project.icon)?.icon || FolderOpen;
                        return <DropdownMenuItem key={project.id} className="rounded-xl" disabled={chat.projectId === project.id} onSelect={() => void moveTo(chat, project)}><Icon /><span className="truncate">{project.name}</span></DropdownMenuItem>;
                      })}
                      {projects.length > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem className="rounded-xl" onSelect={() => { navigate(`/projects/new?chat=${chat.id}`); onNavigate?.(); }}><Plus />Create new</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem className="rounded-xl" onSelect={() => void share(chat)}><Share2 />Share</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl text-destructive focus:text-destructive" onSelect={() => setDeleting(chat)}><Trash2 />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Rename chat</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveName(); }} className="space-y-1.5">
            <Input autoFocus value={name} maxLength={CHAT_TITLE_MAX} onChange={(e) => setName(e.target.value.slice(0, CHAT_TITLE_MAX))} aria-label="Chat name" className="rounded-xl" />
            <p className="text-right text-xs text-muted-foreground">{name.length}/{CHAT_TITLE_MAX}</p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" className="rounded-full" onClick={() => setRenaming(null)}>Cancel</Button>
              <Button type="submit" className="rounded-full" disabled={!normalizeChatTitle(name)}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Delete chat?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">“{deleting?.title}” will be permanently deleted.</p>
          <DialogFooter className="gap-2">
            <Button variant="secondary" className="rounded-full" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-full" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
