import { useState, type ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

/** Page frame for every Settings sub-page. */
export function SettingsPage({ title, children, loading, backTo = "/settings" }: { title: string; children: ReactNode; loading?: boolean; backTo?: string }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  return (
    <div className="app-drawer relative grid h-[100dvh] grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-settings-canvas text-foreground" data-scrolled={scrolled}>
      <header className="drawer-top relative z-10 col-start-1 row-start-1 self-start px-4 pb-5 pt-[max(12px,env(safe-area-inset-top))] sm:px-8">
        <div className="mx-auto grid h-11 max-w-xl grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
          <Button variant="floating" size="icon" className="size-11 rounded-full [&_svg]:size-5" aria-label="Back" title="Back" onClick={() => navigate(backTo)}><ArrowLeft /></Button>
          <h1 className="drawer-floating flex h-11 min-w-0 max-w-full items-center justify-center justify-self-center rounded-full px-4 text-center font-display text-lg font-semibold sm:px-6 sm:text-xl"><span className="truncate">{title}</span></h1>
          <span aria-hidden="true" />
        </div>
      </header>
      <div className="col-start-1 row-start-1 min-h-0 overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(72px,calc(env(safe-area-inset-top)+60px))] sm:px-8" onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 8)}>
        <div className="max-w-xl mx-auto space-y-4">
          {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> : children}
        </div>
      </div>
    </div>
  );
}

export function SettingsSection({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <section>
      {description && !children && <p className="px-5 text-sm text-muted-foreground">{description}</p>}
       {children && <div className="space-y-1.5" aria-label={title}>{children}</div>}
    </section>
  );
}

export function SettingsRow({ label, hint, children, className }: { label: string; hint?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("drawer-floating flex items-center justify-between gap-3 rounded-full px-5 py-3 min-h-12", className)}>
      <p className="min-w-0 text-sm font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}

export function SettingsToggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <SettingsRow label={label} hint={hint}>
      <Button variant="ghost"
        type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("w-11 h-6 shrink-0 rounded-full p-0 transition-colors relative disabled:opacity-50", checked ? "bg-primary hover:bg-primary" : "bg-muted hover:bg-muted")}
      >
        <span className={cn("w-4 h-4 rounded-full bg-background absolute top-1 transition-all", checked ? "left-6" : "left-1")} />
      </Button>
    </SettingsRow>
  );
}

/** Segmented single-choice control. */
export function SettingsChoice<T extends string>({ label, hint, value, options, onChange }: {
  label: string; hint?: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="px-1 py-2">
      <p className="px-4 text-sm font-medium text-foreground">{label}</p>
      
      <div role="radiogroup" aria-label={label} className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <Button variant="floating"
            key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={cn("h-10 shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm",
              value === o.value && "bg-foreground text-background hover:bg-foreground hover:text-background")}
          >{o.label}</Button>
        ))}
      </div>
    </div>
  );
}

export function ConfirmBox({ text, confirmLabel, onCancel, onConfirm, busy }: { text: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; busy?: boolean }) {
  return (
    <div className="space-y-3 px-5 py-4">
      <p className="text-sm text-foreground mb-3">{text}</p>
      <div className="flex gap-2">
        <Button variant="floating" type="button" onClick={onCancel} className="h-auto min-h-11 flex-1 whitespace-normal py-2.5 rounded-full">Cancel</Button>
        <Button variant="floating" type="button" onClick={onConfirm} disabled={busy} className="h-auto min-h-11 flex-1 whitespace-normal py-2.5 rounded-full text-destructive">
          {busy ? "Working…" : confirmLabel}
        </Button>
      </div>
    </div>
  );
}
