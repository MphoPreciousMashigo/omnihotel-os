import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

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

export function priorityTone(p: string) {
  return p === "P1" ? "critical" : p === "P2" ? "warn" : p === "P3" ? "info" : "neutral";
}

export function assetTone(status: string) {
  return status === "Operational"
    ? "ok"
    : status === "In Maintenance"
      ? "warn"
      : status === "Out of Service"
        ? "critical"
        : "info";
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < n ? "fill-warn text-warn" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

export function SlaChip({ minutes }: { minutes: number }) {
  if (minutes < 0)
    return <StatusBadge tone="critical">Breach {Math.abs(minutes)}m</StatusBadge>;
  if (minutes === 0) return <StatusBadge tone="ok">SLA met</StatusBadge>;
  return (
    <StatusBadge tone={minutes < 60 ? "warn" : "neutral"}>
      {minutes < 60 ? `${minutes}m left` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`}
    </StatusBadge>
  );
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
