import { useState, type ReactNode } from "react";
import { useNavigate } from "@/lib/router-compat";
import AppDrawer from "@/components/app-drawer";
import PageHeader, { type PageMenuItem } from "@/components/page-header";

export default function WorkspaceShell({ title, children, actions, backTo, footer, menu }: { title: string; children: ReactNode; actions?: ReactNode; backTo?: string; footer?: ReactNode; menu?: PageMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const props = { onNewChat: () => navigate("/chat"), onSelectChat: (id: string) => navigate(`/chat/${id}`) };
  return <div className="flex h-[100dvh] overflow-hidden bg-background">
    <AppDrawer {...props} open={open} onClose={() => setOpen(false)} />
    <main className="flex min-w-0 flex-1 flex-col">
      <PageHeader title={title} backTo={backTo} onMenu={backTo ? undefined : () => setOpen(true)} actions={actions} menu={menu} />
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"><div className="mx-auto max-w-4xl">{children}</div></div>
      {footer}
    </main>
  </div>;
}