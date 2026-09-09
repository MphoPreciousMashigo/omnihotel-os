import { Mail } from "lucide-react";
import { Mono, SectionHead, StatusBadge, Stars } from "./shared";
import {
  isTerminal,
  shortId,
  type AgentProcurement,
  type Asset,
  type Supplier,
  type Ticket,
} from "@/lib/erp-db";

function contractTone(s: string | null) {
  return s === "Active" ? "ok" : s === "Expiring" || s === "Pending" ? "warn" : s === "Expired" ? "critical" : "neutral";
}

export default function SuppliersTab({
  suppliers,
  assets,
  tickets,
  procurements,
}: {
  suppliers: Supplier[];
  assets: Asset[];
  tickets: Ticket[];
  procurements: AgentProcurement[];
}) {
  return (
    <div className="space-y-3">
      <SectionHead
        title="Vendor & Procurement Control"
        subtitle={`${suppliers.length} vendors on contract · ${procurements.length} agent procurement records`}
      />

      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => {
          const linkedAssets = assets.filter((a) => a.supplier_id === s.id);
          const openTickets = tickets.filter((t) => t.supplier_id === s.id && !isTerminal(t));
          return (
            <div key={s.id} className="rounded-md border border-border bg-card">
              <div className="flex items-start justify-between gap-2 border-b border-border px-2.5 py-1.5">
                <div className="leading-tight">
                  <div className="text-[12px] font-semibold">{s.name}</div>
                  <Mono className="text-muted-foreground">VND-{shortId(s.id)}</Mono>
                </div>
                <StatusBadge tone={contractTone(s.contract_status) as never}>
                  {s.contract_status ?? "unknown"}
                </StatusBadge>
              </div>
              <div className="space-y-1.5 px-2.5 py-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reliability</span>
                  <span className="flex items-center gap-1.5">
                    <Stars n={Number(s.rating ?? 0)} />
                    <Mono>{Number(s.rating ?? 0).toFixed(1)}</Mono>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <Mono className="truncate">
                    <Mail className="mr-1 inline h-3 w-3" />
                    {s.contact_email ?? "—"}
                  </Mono>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assets covered</span>
                  <Mono>{linkedAssets.length}</Mono>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Open incidents</span>
                  <StatusBadge tone={openTickets.length > 1 ? "critical" : openTickets.length ? "warn" : "ok"}>
                    {openTickets.length}
                  </StatusBadge>
                </div>
              </div>
              {linkedAssets.length > 0 && (
                <div className="border-t border-border px-2.5 py-1.5">
                  {linkedAssets.map((a) => (
                    <Mono key={a.id} className="block truncate text-muted-foreground">
                      CI-{shortId(a.id)} · {a.name}
                    </Mono>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <div className="border-b border-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide">
          Agent procurement ledger
        </div>
        <table className="w-full min-w-[560px] text-[12px]">
          <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Record", "Vendor", "Raised"].map((h) => (
                <th key={h} className="px-2.5 py-1.5 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {procurements.map((p) => {
              const sid = p["supplier_id"] as string | undefined;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-2.5 py-1.5"><Mono className="font-semibold">PRC-{shortId(p.id)}</Mono></td>
                  <td className="px-2.5 py-1.5">
                    <Mono className="text-muted-foreground">
                      {sid ? (suppliers.find((s) => s.id === sid)?.name ?? shortId(sid)) : "—"}
                    </Mono>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <Mono className="text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleString("en-ZA") : "—"}
                    </Mono>
                  </td>
                </tr>
              );
            })}
            {procurements.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-[11px] text-muted-foreground">
                  No agent procurement records in the database yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
