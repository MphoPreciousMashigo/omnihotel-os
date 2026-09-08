import { Activity, Radio } from "lucide-react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { Mono, SectionHead, StatusBadge } from "./shared";
import { shortId, type Asset, type IotDevice } from "@/lib/erp-db";
import { cn } from "@/lib/utils";

/** Deterministic pseudo-history around the live reading so the trend is stable per device. */
function history(device: IotDevice) {
  const base = Number(device.current_reading ?? 0);
  const seed = device.id.charCodeAt(0) + device.id.charCodeAt(1);
  return Array.from({ length: 24 }, (_, i) => ({
    t: `-${23 - i}h`,
    v: Math.max(0, +(base * (0.86 + ((Math.sin(seed + i * 0.7) + 1) / 2) * 0.22)).toFixed(2)),
  })).concat([{ t: "now", v: base }]);
}

export default function IotFeed({
  devices,
  assets,
}: {
  devices: IotDevice[];
  assets: Asset[];
}) {
  const assetById = new Map(assets.map((a) => [a.id, a]));

  return (
    <div className="space-y-3">
      <SectionHead
        title="Ambient IoT Telemetry"
        subtitle={`${devices.length} device${devices.length === 1 ? "" : "s"} streaming · thresholds enforced against live readings`}
      />
      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((d) => {
          const reading = Number(d.current_reading ?? 0);
          const limit = Number(d.threshold_limit ?? 0);
          const pct = limit ? Math.min(120, (reading / limit) * 100) : 0;
          const breach = limit > 0 && reading >= limit;
          const near = limit > 0 && !breach && reading >= limit * 0.85;
          const asset = d.related_asset_id ? assetById.get(d.related_asset_id) : undefined;
          return (
            <div key={d.id} className="rounded-md border border-border bg-card">
              <div className="flex items-start justify-between gap-2 border-b border-border px-2.5 py-1.5">
                <div className="leading-tight">
                  <div className="text-[12px] font-semibold">{d.name}</div>
                  <Mono className="text-muted-foreground">
                    DEV-{shortId(d.id)} · {d.type ?? "sensor"}
                  </Mono>
                </div>
                <StatusBadge tone={d.status === "Online" ? "ok" : "critical"}>
                  <Radio className="h-2.5 w-2.5" /> {d.status ?? "unknown"}
                </StatusBadge>
              </div>

              <div className="flex items-end justify-between px-2.5 pt-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Current reading
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[22px] font-semibold leading-none tabular-nums",
                      breach ? "text-critical" : near ? "text-warn" : "text-ok",
                    )}
                  >
                    {reading.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Safe threshold
                  </div>
                  <Mono className="text-[13px] font-semibold">{limit.toFixed(2)}</Mono>
                </div>
              </div>

              <div className="px-2.5 pt-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-sm bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-sm transition-all",
                      breach ? "bg-critical" : near ? "bg-warn" : "bg-ok",
                    )}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="mt-0.5 flex justify-between">
                  <Mono className="text-muted-foreground">{pct.toFixed(0)}% of limit</Mono>
                  <StatusBadge tone={breach ? "critical" : near ? "warn" : "ok"}>
                    {breach ? "Threshold breach" : near ? "Approaching limit" : "Within safe band"}
                  </StatusBadge>
                </div>
              </div>

              <div className="h-[86px] px-1 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history(d)} margin={{ top: 6, right: 6, bottom: 0, left: 6 }}>
                    <defs>
                      <linearGradient id={`g-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--info)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--info)" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[0, Math.max(limit * 1.2, reading * 1.2, 1)]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                    <ReferenceLine y={limit} stroke="var(--critical)" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--info)"
                      strokeWidth={1.5}
                      fill={`url(#g-${d.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between border-t border-border px-2.5 py-1.5">
                <Mono className="truncate text-muted-foreground">
                  <Activity className="mr-1 inline h-3 w-3" />
                  {asset ? `CI-${shortId(asset.id)} · ${asset.name}` : "unbound sensor"}
                </Mono>
                <Mono className="text-muted-foreground">
                  {new Date(d.updated_at).toLocaleTimeString("en-ZA")}
                </Mono>
              </div>
            </div>
          );
        })}
        {devices.length === 0 && (
          <p className="rounded-md border border-border bg-card px-3 py-6 text-center font-mono text-[11px] text-muted-foreground">
            No IoT devices registered
          </p>
        )}
      </div>
    </div>
  );
}
