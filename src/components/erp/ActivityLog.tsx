import { Mono, StatusBadge } from "./shared";
import { shortId, type AuditLog, type Profile } from "@/lib/erp-db";

function tone(action: string) {
  return action === "INSERT" ? "ok" : action === "DELETE" ? "critical" : "info";
}

function describe(log: AuditLog) {
  const state = (log.new_state ?? log.previous_state ?? {}) as Record<string, unknown>;
  const label = (state["name"] ?? state["title"] ?? state["id"] ?? log.target_entity_id) as string;
  const status = state["status"] as string | undefined;
  return `${label ?? "record"}${status ? ` · ${status}` : ""}`;
}

export default function ActivityLog({
  logs,
  profiles,
  connected,
}: {
  logs: AuditLog[];
  profiles: Profile[];
  connected: boolean;
}) {
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-2.5 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          Real-time activity stream
        </span>
        <StatusBadge tone={connected ? "ok" : "neutral"}>
          <span
            className={`mr-0.5 inline-block h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-ok" : "bg-muted-foreground"}`}
          />
          {connected ? "replicating" : "polling"}
        </StatusBadge>
      </div>
      <ol className="max-h-[520px] divide-y divide-border overflow-y-auto">
        {logs.map((l) => (
          <li key={l.id} className="flex items-start gap-2 px-2.5 py-1.5">
            <Mono className="w-[62px] shrink-0 text-muted-foreground">
              {new Date(l.timestamp).toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Mono>
            <StatusBadge tone={tone(l.action_type) as never}>{l.action_type}</StatusBadge>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[12px]">{describe(l)}</div>
              <Mono className="text-muted-foreground">
                {l.actor_id ? (byId.get(l.actor_id)?.full_name ?? shortId(l.actor_id)) : "SYSTEM"}
                {l.target_entity_id ? ` · ${shortId(l.target_entity_id)}` : ""}
              </Mono>
            </div>
          </li>
        ))}
        {logs.length === 0 && (
          <li className="px-2.5 py-6 text-center font-mono text-[11px] text-muted-foreground">
            audit stream empty
          </li>
        )}
      </ol>
    </div>
  );
}
