import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Star, Radio, Hand } from "lucide-react";
import { SEVERITY, type TicketPriority } from "@/lib/erp-db";

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[11px] tracking-tight tabular-nums", className)}>
      {children}
    </span>
  );
}

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: "critical" | "warn" | "ok" | "info" | "neutral";
  children: React.ReactNode;
  className?: string;
}) {
  const map: Record<string, string> = {
    critical: "bg-critical/12 text-critical border-critical/35",
    warn: "bg-warn/14 text-warn border-warn/40",
    ok: "bg-ok/12 text-ok border-ok/35",
    info: "bg-info/12 text-info border-info/35",
    neutral: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide leading-4",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function priorityTone(p: TicketPriority) {
  return p === "Critical" ? "critical" : p === "High" ? "warn" : p === "Medium" ? "info" : "neutral";
}

export function SeverityCell({ p }: { p: TicketPriority }) {
  const bars = { Critical: 4, High: 3, Medium: 2, Low: 1 }[p];
  const tone = priorityTone(p);
  const barColor =
    tone === "critical"
      ? "bg-critical"
      : tone === "warn"
        ? "bg-warn"
        : tone === "info"
          ? "bg-info"
          : "bg-muted-foreground/60";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-[1px]",
              i <= bars ? barColor : "bg-border",
              i === 1 ? "h-[5px]" : i === 2 ? "h-[7px]" : i === 3 ? "h-[9px]" : "h-[11px]",
            )}
          />
        ))}
      </span>
      <StatusBadge tone={tone as never}>{SEVERITY[p].label}</StatusBadge>
    </span>
  );
}

export function SourceBadge({ ambient }: { ambient: boolean }) {
  return (
    <StatusBadge tone={ambient ? "info" : "neutral"}>
      {ambient ? <Radio className="h-2.5 w-2.5" /> : <Hand className="h-2.5 w-2.5" />}
      {ambient ? "Ambient" : "Manual"}
    </StatusBadge>
  );
}

export function assetTone(status: string) {
  return status === "Operational"
    ? "ok"
    : status === "Maintenance Required"
      ? "warn"
      : status === "Decommissioned"
        ? "critical"
        : "info";
}

export function Stars({ n }: { n: number }) {
  const full = Math.round(n);
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("h-3 w-3", i < full ? "fill-warn text-warn" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}

/** Live ticking SLA countdown driven off created_at + severity target. */
export function SlaClock({
  deadline,
  frozen,
  now,
}: {
  deadline: number;
  frozen?: boolean;
  now: number;
}) {
  if (frozen) return <StatusBadge tone="ok">SLA closed</StatusBadge>;
  const ms = deadline - now;
  const breach = ms < 0;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const s = Math.floor((abs % 60_000) / 1000);
  const text = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const tone = breach ? "critical" : ms < 30 * 60_000 ? "warn" : "ok";
  return (
    <StatusBadge tone={tone as never} className={breach ? "animate-pulse" : undefined}>
      {breach ? "−" : ""}
      {text}
    </StatusBadge>
  );
}

export function useTick(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function SectionHead({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-2">
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
          {title}
        </h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Loading({ label = "Fetching live records…" }: { label?: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-6 text-center font-mono text-[11px] text-muted-foreground">
      {label}
    </div>
  );
}

export function ErrorPanel({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="rounded-md border border-critical/40 bg-critical/10 px-3 py-2 font-mono text-[11px] text-critical">
      database error · {msg}
    </div>
  );
}export { SlaClock as SlaChip };

