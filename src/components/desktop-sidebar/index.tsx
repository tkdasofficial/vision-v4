import { recentChats } from "@/lib/recent-chats";
import SidebarActions from "@/components/sidebar-actions";
import SidebarFeatures from "@/components/sidebar-features";
import SidebarHeader from "@/components/sidebar-header";
import SidebarChatList from "@/components/sidebar-chat-list";

type Props = {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isMainChat: boolean;
  activeChatId?: string;
  chatHistory: { id: string; title: string; toolId?: string; preview: string; date: string; createdAt: number; projectId?: string | null; pinned?: boolean }[];
};

const DesktopSidebar = ({ onNewChat, onSelectChat, activeChatId, chatHistory }: Props) => (
  <aside className="hidden lg:flex flex-col w-[264px] bg-sidebar border-r border-sidebar-border h-full min-h-0 shrink-0">
    <SidebarHeader />
    <SidebarFeatures />
    <SidebarChatList chats={recentChats(chatHistory)} activeChatId={activeChatId} onSelectChat={onSelectChat} />
    <SidebarActions onNewChat={onNewChat} />
  </aside>
);

export default DesktopSidebar;
