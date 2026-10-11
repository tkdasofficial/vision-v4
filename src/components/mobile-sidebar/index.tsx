import { recentChats } from "@/lib/recent-chats";
import { cn } from "@/lib/utils";
import SidebarActions from "@/components/sidebar-actions";
import SidebarFeatures from "@/components/sidebar-features";
import SidebarHeader from "@/components/sidebar-header";
import SidebarChatList from "@/components/sidebar-chat-list";

type Props = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isMainChat: boolean;
  activeChatId?: string;
  chatHistory: { id: string; title: string; toolId?: string; projectId?: string | null; pinned?: boolean }[];
};

const MobileSidebar = ({ open, onClose, onNewChat, onSelectChat, activeChatId, chatHistory }: Props) => (
  <>
    {open && <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />}
    <div
      role="dialog" aria-label="Sidebar" aria-modal={open || undefined} inert={!open}
      onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}
      className={cn(
        "fixed top-0 left-0 bottom-0 w-[284px] max-w-[calc(100vw-3rem)] bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300 ease-in-out motion-reduce:transition-none",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <SidebarHeader onNavigate={onClose} />
      <SidebarFeatures onNavigate={onClose} />
      <SidebarChatList chats={recentChats(chatHistory)} activeChatId={activeChatId} onSelectChat={onSelectChat} onNavigate={onClose} />
      <SidebarActions onNewChat={() => { onNewChat(); onClose(); }} />
    </div>
  </>
);

export default MobileSidebar;
