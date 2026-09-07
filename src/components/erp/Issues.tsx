import { useState } from "react";
import { Columns3, Table2, User2, Building2, Link2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Mono, SectionHead, SlaChip, StatusBadge, priorityTone } from "./shared";
import { STAGES, suppliers, assets as allAssets, type Ticket } from "@/data/erp";
import { cn } from "@/lib/utils";

function stageTone(s: string) {
  return s === "Resolved"
    ? "ok"
    : s === "Open"
      ? "critical"
      : s === "Pending Supplier/Parts"
        ? "warn"
        : "info";
}

export default function Issues({ tickets }: { tickets: Ticket[] }) {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [active, setActive] = useState<Ticket | null>(null);

  return (
    <div className="space-y-3">
      <SectionHead
        title="Issue & Query Lifecycle"
        subtitle={`${tickets.length} tickets in scope · click any ticket for the full audit record`}
        right={
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            {(["kanban", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent",
                )}
              >
                {v === "kanban" ? <Columns3 className="h-3 w-3" /> : <Table2 className="h-3 w-3" />}
                {v}
              </button>
            ))}
          </div>
        }
      />

      {view === "kanban" ? (
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((stage) => {
            const rows = tickets.filter((t) => t.stage === stage);
            return (
              <div key={stage} className="rounded-md border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {stage}
                  </span>
                  <Mono className="rounded-sm bg-secondary px-1.5 py-[1px] text-muted-foreground">
                    {rows.length}
                  </Mono>
                </div>
                <div className="space-y-2 p-2">
                  {rows.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActive(t)}
                      className="w-full rounded-md border border-border bg-card p-2 text-left transition-colors hover:border-ring hover:bg-accent/50"
                    >
                      <div className="flex items-center justify-between">
                        <Mono className="font-semibold text-foreground">#{t.id}</Mono>
                        <StatusBadge tone={priorityTone(t.priority) as never}>{t.priority}</StatusBadge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-snug">{t.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge tone="neutral">{t.department}</StatusBadge>
                        <SlaChip minutes={t.slaMinutes} />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-muted-foreground">
                        <Mono>{t.staffId}</Mono>
                        <Mono>{t.uuid}</Mono>
                      </div>
                    </button>
                  ))}
                  {rows.length === 0 && (
                    <p className="px-1 py-3 text-center text-[11px] text-muted-foreground">
                      No tickets
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[880px] text-[12px]">
            <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Ticket", "UUID", "Summary", "Stage", "Priority", "Dept", "SLA", "Staff", "Asset"].map((h) => (
                  <th key={h} className="px-2.5 py-1.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setActive(t)}
                  className="cursor-pointer border-t border-border hover:bg-accent/50"
                >
                  <td className="px-2.5 py-1.5"><Mono className="font-semibold">#{t.id}</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono className="text-muted-foreground">{t.uuid}</Mono></td>
                  <td className="max-w-[260px] truncate px-2.5 py-1.5">{t.title}</td>
                  <td className="px-2.5 py-1.5"><StatusBadge tone={stageTone(t.stage) as never}>{t.stage}</StatusBadge></td>
                  <td className="px-2.5 py-1.5"><StatusBadge tone={priorityTone(t.priority) as never}>{t.priority}</StatusBadge></td>
                  <td className="px-2.5 py-1.5">{t.department}</td>
                  <td className="px-2.5 py-1.5"><SlaChip minutes={t.slaMinutes} /></td>
                  <td className="px-2.5 py-1.5"><Mono>{t.staffId}</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono className="text-muted-foreground">{t.assetId ?? "—"}</Mono></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {active && (
            <>
              <SheetHeader className="gap-1">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <Mono className="text-sm font-semibold">#{active.id}</Mono>
                  <StatusBadge tone={priorityTone(active.priority) as never}>{active.priority}</StatusBadge>
                  <StatusBadge tone={stageTone(active.stage) as never}>{active.stage}</StatusBadge>
                </SheetTitle>
                <SheetDescription>{active.title}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[
                    ["Ticket UUID", active.uuid],
                    ["Department", active.department],
                    ["Owner", active.staffId],
                    ["Linked asset", active.assetId ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border border-border bg-surface px-2 py-1.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
                      <Mono className="text-foreground">{v}</Mono>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-md border border-border bg-surface px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">SLA</div>
                    <SlaChip minutes={active.slaMinutes} />
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</h4>
                  <p className="text-[12px] leading-relaxed">{active.description}</p>
                </div>

                {active.assetId && (
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Link2 className="h-3 w-3" /> Linked asset
                    </h4>
                    {allAssets
                      .filter((a) => a.id === active.assetId)
                      .map((a) => (
                        <div key={a.id} className="rounded-md border border-border px-2 py-1.5 text-[12px]">
                          <div className="font-medium">{a.item}</div>
                          <Mono className="text-muted-foreground">{a.id} · {a.category} · {a.location}</Mono>
                        </div>
                      ))}
                  </div>
                )}

                <div>
                  <h4 className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Building2 className="h-3 w-3" /> Linked suppliers
                  </h4>
                  <div className="space-y-1.5">
                    {active.supplierIds.map((sid) => {
                      const s = suppliers.find((x) => x.id === sid)!;
                      return (
                        <div key={sid} className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-[12px]">
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <Mono className="text-muted-foreground">{s.id}</Mono>
                          </div>
                          <StatusBadge tone={s.contract === "Active" ? "ok" : s.contract === "Expiring" ? "warn" : "critical"}>
                            {s.contract}
                          </StatusBadge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <User2 className="h-3 w-3" /> Immutable event history
                  </h4>
                  <ol className="rounded-md border border-border">
                    {active.history.map((h, i) => (
                      <li key={i} className="flex gap-2 border-b border-border px-2 py-1.5 text-[12px] last:border-b-0">
                        <Mono className="text-muted-foreground">{h.ts}</Mono>
                        <Mono className="text-muted-foreground">{h.actor}</Mono>
                        <span className="flex-1">{h.message}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => setActive(null)}>
                  Close record
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
