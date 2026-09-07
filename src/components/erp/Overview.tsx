import {
  AlertTriangle,
  Boxes,
  FileCheck2,
  Gauge,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Mono, SectionHead, StatusBadge } from "./shared";
import { Progress } from "@/components/ui/progress";
import type { Asset, EventEntry, PurchaseOrder, Ticket } from "@/data/erp";
import { money, suppliers } from "@/data/erp";
import { cn } from "@/lib/utils";

const kindTone: Record<EventEntry["kind"], "critical" | "warn" | "ok" | "info" | "neutral"> = {
  sla: "critical",
  asset: "info",
  procurement: "warn",
  ticket: "ok",
  system: "neutral",
};

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  bar,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  tone: "critical" | "warn" | "ok" | "info";
  bar?: number;
}) {
  const ring: Record<string, string> = {
    critical: "text-critical",
    warn: "text-warn",
    ok: "text-ok",
    info: "text-info",
  };
  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-[0_1px_0_0_var(--grid)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-3.5 w-3.5", ring[tone])} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
      {bar !== undefined && <Progress value={bar} className="mt-2.5 h-1" />}
    </div>
  );
}

export default function Overview({
  events,
  tickets,
  assets,
  pos,
}: {
  events: EventEntry[];
  tickets: Ticket[];
  assets: Asset[];
  pos: PurchaseOrder[];
}) {
  const breaches = tickets.filter((t) => t.slaMinutes < 0).length;
  const vans = assets.filter((a) => a.category === "Shuttle Vans");
  const util = Math.round(
    (vans.filter((v) => v.status === "Operational").length / Math.max(vans.length, 1)) * 100,
  );
  const invAlerts = assets.filter(
    (a) => a.status === "Low Stock" || a.status === "Out of Service",
  ).length;
  const pending = pos.filter((p) => p.status === "Pending Approval");
  const pendingValue = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Active SLA Breaches" value={String(breaches)} sub="live tickets" icon={AlertTriangle} tone="critical" bar={breaches * 20} />
        <Kpi label="Fleet Utilization" value={`${util}%`} sub={`${vans.length} vehicles`} icon={Gauge} tone="info" bar={util} />
        <Kpi label="Critical Inventory Alerts" value={String(invAlerts)} sub="below par / offline" icon={Boxes} tone="warn" bar={invAlerts * 22} />
        <Kpi label="Pending PO Approvals" value={String(pending.length)} sub={money(pendingValue)} icon={FileCheck2} tone="ok" bar={pending.length * 25} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-3">
          <SectionHead title="Operational Load" subtitle="Open workload by department and priority" />
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full text-[12px]">
              <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2.5 py-1.5 text-left font-semibold">Department</th>
                  <th className="px-2.5 py-1.5 text-left font-semibold">Open</th>
                  <th className="px-2.5 py-1.5 text-left font-semibold">P1</th>
                  <th className="px-2.5 py-1.5 text-left font-semibold">Worst SLA</th>
                  <th className="px-2.5 py-1.5 text-left font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {["Engineering", "Fleet", "Housekeeping", "Procurement"].map((dep) => {
                  const rows = tickets.filter((t) => t.department === dep);
                  const open = rows.filter((t) => t.stage !== "Resolved").length;
                  const p1 = rows.filter((t) => t.priority === "P1").length;
                  const worst = rows.length ? Math.min(...rows.map((t) => t.slaMinutes)) : 0;
                  return (
                    <tr key={dep} className="border-t border-border hover:bg-accent/40">
                      <td className="px-2.5 py-1.5 font-medium">{dep}</td>
                      <td className="px-2.5 py-1.5"><Mono>{open}</Mono></td>
                      <td className="px-2.5 py-1.5"><Mono>{p1}</Mono></td>
                      <td className="px-2.5 py-1.5">
                        <StatusBadge tone={worst < 0 ? "critical" : worst < 60 ? "warn" : "neutral"}>
                          {worst < 0 ? `${Math.abs(worst)}m over` : `${worst}m`}
                        </StatusBadge>
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3" /> {open * 7 + 3}% wk
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SectionHead title="Supplier Exposure" subtitle="Year-to-date committed spend" />
          <div className="grid gap-2 sm:grid-cols-2">
            {suppliers.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-md border border-border bg-card px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[12px] font-medium">{s.name}</span>
                  <Mono className="text-muted-foreground">{s.id}</Mono>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <Mono className="text-foreground">{money(s.spendYTD)}</Mono>
                  <StatusBadge tone={s.contract === "Active" ? "ok" : s.contract === "Expiring" ? "warn" : "critical"}>
                    {s.contract}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionHead
            title="Live Audit Stream"
            subtitle="Immutable system event log"
            right={
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ok">
                <Activity className="h-3 w-3" /> streaming
              </span>
            }
          />
          <div className="max-h-[540px] overflow-y-auto rounded-md border border-border bg-card">
            <ol className="divide-y divide-border">
              {events.map((e) => (
                <li key={e.id} className="flex gap-2 px-2.5 py-2 hover:bg-accent/40">
                  <Mono className="pt-[2px] text-muted-foreground">{e.ts}</Mono>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge tone={kindTone[e.kind]}>{e.kind}</StatusBadge>
                      <Mono className="text-muted-foreground">{e.id.slice(-8)}</Mono>
                    </div>
                    <p className="mt-1 text-[12px] leading-snug text-foreground">{e.message}</p>
                    <Mono className="text-muted-foreground">actor {e.actor}</Mono>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
