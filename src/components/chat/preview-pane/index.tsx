import { useState, type Ref } from "react";
import { AlertCircle, Loader2, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PreviewPane({ html, title = "Code preview", iframeRef }: { html: string; title?: string; iframeRef?: Ref<HTMLIFrameElement> }) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [revision, setRevision] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const key = `${revision}:${html}`;
  const loading = loadedKey !== key && !failed;
  return <section aria-label="Preview panel" className="flex h-full min-h-0 min-w-0 flex-col bg-background text-foreground">
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-1 border-b border-border bg-muted/40 px-2">
      <span role="status" className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">{loading && <Loader2 className="size-3 animate-spin" />}{failed ? "Preview unavailable" : loading ? "Loading preview" : "Preview ready"}</span>
      <div className="flex items-center gap-1" aria-label="Preview size">
        {([{ value: "desktop", Icon: Monitor }, { value: "tablet", Icon: Tablet }, { value: "mobile", Icon: Smartphone }] as const).map(({ value, Icon }) => <Button key={value} variant="ghost" size="icon" className={cn("size-8 rounded-md", device === value && "bg-accent")} aria-label={`${value} preview`} title={`${value} preview`} aria-pressed={device === value} onClick={() => setDevice(value)}><Icon /></Button>)}
        <Button variant="ghost" size="icon" className="size-8 rounded-md" aria-label="Reload preview" title="Reload preview" onClick={() => { setFailed(false); setRevision((r) => r + 1); }}><RotateCw /></Button>
      </div>
    </div>
    <div className="relative flex min-h-0 flex-1 justify-center overflow-auto bg-muted/40 p-2 sm:p-4">
      {failed ? <div role="alert" className="flex items-center gap-2 self-center text-sm text-destructive"><AlertCircle className="size-4" />Preview could not load.</div> : <div className={cn("h-full min-h-64 shrink-0 overflow-hidden border border-border bg-background", device === "desktop" ? "w-full" : device === "tablet" ? "w-[768px]" : "w-[375px]")}>
        <iframe ref={iframeRef} key={key} srcDoc={html} sandbox="allow-scripts" referrerPolicy="no-referrer" title={title} className="h-full w-full border-0" onLoad={() => { setFailed(false); setLoadedKey(key); }} onError={() => setFailed(true)} />
      </div>}
    </div>
    <div className="flex h-7 shrink-0 items-center justify-between border-t border-border px-3 font-mono text-[11px] text-muted-foreground"><span>{device === "desktop" ? "Fit to window" : device === "tablet" ? "768 px" : "375 px"}</span><span>Sandboxed</span></div>
  </section>;
}