import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Mono, SectionHead, StatusBadge } from "./shared";
import {
  SEVERITY,
  isTerminal,
  money,
  type Asset,
  type AuditLog,
  type Ticket,
  type TicketPriority,
} from "@/lib/erp-db";

/* cost model applied to live incident + asset rows */
const COST: Record<string, number> = { Critical: 42000, High: 18500, Medium: 6200, Low: 1800 };
const BASE_REVPAR = 1850; // rand per available room, baseline
const ROOMS = 420;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export default function Financials({
  tickets,
  assets,
  logs,
}: {
  tickets: Ticket[];
  assets: Asset[];
  logs: AuditLog[];
}) {
  const series = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });
    return days.map((day) => {
      const opened = tickets.filter((t) => dayKey(t.created_at) === day);
      const critical = opened.filter((t) => t.priority === "Critical").length;
      const maintenanceCost = opened.reduce((s, t) => s + (COST[t.priority] ?? 0), 0);
      const changes = logs.filter((l) => dayKey(l.timestamp) === day).length;
      const downtimePenalty = critical * 0.055 + opened.length * 0.012;
      const revpar = +(BASE_REVPAR * (1 - Math.min(0.35, downtimePenalty))).toFixed(2);
      return {
        day: day.slice(5),
        revpar,
        maintenanceCost,
        incidents: opened.length,
        changes,
        netContribution: +(revpar * ROOMS - maintenanceCost).toFixed(0),
      };
    });
  }, [tickets, logs]);

  const openExposure = tickets
    .filter((t) => !isTerminal(t))
    .reduce((s, t) => s + (COST[t.priority] ?? 0), 0);
  const availability =
    assets.length === 0
      ? 100
      : (assets.filter((a) => a.status === "Operational").length / assets.length) * 100;
  const latestRevpar = series.at(-1)?.revpar ?? BASE_REVPAR;
  const mtdCost = series.reduce((s, d) => s + d.maintenanceCost, 0);

  const kpis = [
    { label: "RevPAR (modelled)", value: money(latestRevpar), sub: `baseline ${money(BASE_REVPAR)} · ${ROOMS} keys`, tone: latestRevpar < BASE_REVPAR * 0.95 ? "warn" : "ok" },
    { label: "Open SLA exposure", value: money(openExposure), sub: `${tickets.filter((t) => !isTerminal(t)).length} active incidents`, tone: openExposure > 50000 ? "critical" : "info" },
    { label: "14-day maintenance cost", value: money(mtdCost), sub: "priority-weighted incident cost", tone: "neutral" },
    { label: "CI availability", value: `${availability.toFixed(1)}%`, sub: `${assets.length} configuration items`, tone: availability < 80 ? "warn" : "ok" },
  ];

  return (
    <div className="space-y-3">
      <SectionHead
        title="RevPAR & Financial Control"
        subtitle="Revenue and cost model computed from live incident, asset and audit rows"
      />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-md border border-border bg-card px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {k.label}
              </span>
              <StatusBadge tone={k.tone as never}>live</StatusBadge>
            </div>
            <div className="mt-1 font-mono text-[20px] font-semibold leading-none tabular-nums">
              {k.value}
            </div>
            <Mono className="text-muted-foreground">{k.sub}</Mono>
          </div>
        ))}
      </div>

      <div className="grid gap-2.5 xl:grid-cols-2">
        <ChartCard title="RevPAR trend vs baseline">
          <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="revpar" name="RevPAR" stroke="var(--ok)" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="incidents" name="Incidents" stroke="var(--critical)" strokeWidth={1.2} dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Maintenance cost vs audit throughput">
          <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="maintenanceCost" name="Maintenance cost" stroke="var(--warn)" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="changes" name="Audit events" stroke="var(--info)" strokeWidth={1.2} dot={false} />
          </LineChart>
        </ChartCard>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[720px] text-[12px]">
          <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Severity", "SLA target", "Open", "Unit cost", "Exposure"].map((h) => (
                <th key={h} className="px-2.5 py-1.5 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(COST) as (keyof typeof COST)[]).map((p) => {
              const open = tickets.filter((t) => t.priority === p && !isTerminal(t)).length;
              return (
                <tr key={p} className="border-t border-border">
                  <td className="px-2.5 py-1.5 font-medium">{SEVERITY[p as TicketPriority].label}</td>
                  <td className="px-2.5 py-1.5"><Mono>{SEVERITY[p as TicketPriority].sla}m</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono>{open}</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono>{money(COST[p]!)}</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono className="font-semibold">{money(open * COST[p]!)}</Mono></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">
        note · your schema has no revenue table, so RevPAR is modelled from a {money(BASE_REVPAR)}{" "}
        baseline reduced by live downtime from critical incidents. Point this at a revenue table and
        the charts switch to reported figures.
      </p>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 11,
} as const;

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide">
        {title}
      </div>
      <div className="h-[240px] p-1">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
