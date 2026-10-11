import { useState, type ComponentType } from "react";
import { Palette, Languages, Sparkles, MessagesSquare, Database, ShieldCheck, Accessibility, Bell, Info, User, Inbox, Crown, LayoutDashboard, HelpCircle, LifeBuoy, LogOut, ChevronRight, Pencil, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

export const SETTINGS_CATEGORIES = [
  { to: "/settings/appearance", icon: Palette, title: "Appearance", desc: "Theme, accent colour and text size" },
  { to: "/settings/language", icon: Languages, title: "Language", desc: "Interface language" },
  { to: "/settings/ai", icon: Sparkles, title: "AI Preferences", desc: "Default mode, answer style, custom instructions" },
  { to: "/settings/chat", icon: MessagesSquare, title: "Chat & History", desc: "Export or clear conversations" },
  { to: "/settings/privacy", icon: Database, title: "Privacy & Data", desc: "Your data, research documents and deletion" },
  { to: "/settings/security", icon: ShieldCheck, title: "Security", desc: "Password and two-step sign-in" },
  { to: "/settings/accessibility", icon: Accessibility, title: "Accessibility", desc: "Motion, contrast and tap size" },
  { to: "/settings/notifications", icon: Bell, title: "Notifications", desc: "Browser alerts" },
  { to: "/settings/about", icon: Info, title: "About VISION", desc: "Version, help and legal" },
] as const;

type Row = { to: string; icon: ComponentType<{ className?: string }>; title: string };

function Group({ title, rows }: { title?: string; rows: Row[] }) {
  const navigate = useNavigate();
  return (
    <section aria-label={title}>
      <h2 className="mb-3 px-5 text-xs font-medium uppercase tracking-normal text-muted-foreground">{title}</h2>
      <div className="overflow-hidden rounded-[2rem] bg-settings-surface">
        {rows.map(({ to, icon: Icon, title: label }, index) => (
          <Button key={to + label} variant="ghost" onClick={() => navigate(to)} className={cn("h-auto min-h-16 w-full justify-start gap-4 whitespace-normal rounded-none px-6 py-5 text-left text-base font-medium focus-visible:ring-inset focus-visible:ring-offset-0 [&_svg]:size-6", index > 0 && "border-t border-settings-divider")}>
            <Icon className="text-muted-foreground" />
            <span className="min-w-0 flex-1">{label}</span>
            <ChevronRight className="text-muted-foreground opacity-50" />
          </Button>
        ))}
      </div>
    </section>
  );
}

export default function SettingsDirectory() {
  const { profile, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const name = profile?.full_name || "User";
  const email = profile?.email || user?.email;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";
  const avatar = profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="size-full object-cover" /> : initials;

  const account: Row[] = [
    { to: "/account", icon: User, title: "Manage account" },
    { to: "/inbox", icon: Inbox, title: "Inbox" },
    ...(isAdmin ? [{ to: "/admin/dashboard", icon: LayoutDashboard, title: "Admin Panel" }] : []),
  ];
  const help: Row[] = [
    { to: "/support", icon: LifeBuoy, title: "Support" },
    { to: "/help/faq", icon: HelpCircle, title: "FAQ" },
    { to: "/settings/about", icon: Info, title: "About Vision" },
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-settings-canvas text-foreground">
      <header className="z-10 shrink-0 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-8" data-compact={scrolled}>
        <div className="mx-auto flex h-11 max-w-2xl items-center justify-between gap-4">
          {scrolled ? <Button variant="ghost" onClick={() => navigate("/account")} className="h-11 min-w-0 justify-start gap-3 px-0 text-left hover:bg-transparent">
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-settings-surface text-xs">{avatar}</span>
            <span className="truncate text-sm font-medium">{email || name}</span>
          </Button> : <h1 className="pl-2 font-display text-xl font-semibold">Settings</h1>}
          <Button variant="ghost" size="icon" className="size-11 shrink-0 [&_svg]:size-6" aria-label="Close settings" title="Close settings" onClick={() => navigate("/chat")}><X /></Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(32px,env(safe-area-inset-bottom))] pt-3 sm:px-8" onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 100)}>
        <div className="mx-auto max-w-2xl space-y-6">
          <Button variant="ghost" onClick={() => navigate("/account")} aria-label="Edit profile" className="h-auto min-h-28 w-full justify-start gap-5 whitespace-normal rounded-[2rem] bg-settings-surface px-5 py-6 text-left sm:px-7">
            <span className="relative shrink-0">
              <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-secondary text-xl font-semibold sm:size-20">{avatar}</span>
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-settings-surface bg-secondary"><Pencil className="size-3.5" /></span>
            </span>
            <span className="min-w-0 flex-1"><span className="block break-words font-display text-xl font-semibold sm:text-2xl">{name}</span>{email && <span className="mt-1 block truncate text-sm font-normal text-muted-foreground sm:text-base">{email}</span>}</span>
            <ChevronRight className="shrink-0 text-muted-foreground" />
          </Button>
          <Button variant="ghost" onClick={() => navigate("/billing/plans")} className="h-auto min-h-16 w-full justify-start gap-4 rounded-full bg-settings-surface px-6 py-5 text-base [&_svg]:size-6"><Crown className="text-muted-foreground" /><span className="flex-1 text-left">Upgrade plan</span><ChevronRight className="text-muted-foreground opacity-50" /></Button>
          <Group title="Account" rows={account} />
          <Group title="Preferences" rows={SETTINGS_CATEGORIES.filter(({ to }) => to !== "/settings/about").map(({ to, icon, title }) => ({ to, icon, title }))} />
          <Group title="Help" rows={help} />
          <Button variant="ghost" disabled={signingOut} onClick={async () => { setSigningOut(true); setSignOutError(false); try { await signOut(); navigate("/auth/login", { replace: true }); } catch { setSignOutError(true); setSigningOut(false); } }} className="h-auto min-h-16 w-full justify-start gap-4 rounded-full bg-settings-surface px-6 py-5 text-base text-destructive [&_svg]:size-6">{signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}{signingOut ? "Logging out…" : "Log out"}</Button>
          {signOutError && <p role="alert" className="px-5 text-sm text-destructive">Couldn’t log out. Please try again.</p>}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-2 text-sm text-muted-foreground">
            <Button variant="link" onClick={() => navigate("/legal/privacy")} className="h-auto px-0 text-muted-foreground">Privacy Policy</Button><span aria-hidden="true">·</span><Button variant="link" onClick={() => navigate("/legal/terms")} className="h-auto px-0 text-muted-foreground">Terms of Service</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
