import { useMemo, useState } from "react";
import { AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mono,
  SectionHead,
  SeverityCell,
  SlaClock,
  SourceBadge,
  StatusBadge,
  useTick,
} from "./shared";
import {
  PRIORITIES,
  TICKET_STATES,
  createTicket,
  isTerminal,
  shortId,
  slaDeadline,
  updateTicket,
  type Asset,
  type IotDevice,
  type Supplier,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/erp-db";
import { cn } from "@/lib/utils";

function stateTone(s: TicketStatus) {
  return s === "Open" ? "critical" : s === "In Progress" ? "warn" : s === "Resolved" ? "ok" : "neutral";
}

export default function Incidents({
  tickets,
  assets,
  suppliers,
  devices,
}: {
  tickets: Ticket[];
  assets: Asset[];
  suppliers: Supplier[];
  devices: IotDevice[];
}) {
  const now = useTick();
  const [severity, setSeverity] = useState<string>("all");
  const [state, setState] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const ambientAssetIds = useMemo(
    () => new Set(devices.map((d) => d.related_asset_id).filter(Boolean) as string[]),
    [devices],
  );
  const assetById = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  const rows = useMemo(
    () =>
      tickets
        .filter((t) => (severity === "all" ? true : t.priority === severity))
        .filter((t) => (state === "all" ? true : t.status === state))
        .sort((a, b) => {
          const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          const at = isTerminal(a) ? 1 : 0;
          const bt = isTerminal(b) ? 1 : 0;
          if (at !== bt) return at - bt;
          if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
          return slaDeadline(a) - slaDeadline(b);
        }),
    [tickets, severity, state],
  );

  const breached = rows.filter((t) => !isTerminal(t) && slaDeadline(t) < now).length;

  async function setStatus(t: Ticket, status: TicketStatus) {
    setBusy(t.id);
    try {
      await updateTicket(t.id, { status });
      toast.success(`INC${shortId(t.id)} → ${status}`, {
        description: "Database trigger wrote the audit entry",
      });
    } catch (e) {
      toast.error("Mutation rejected", { description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title="Incident Operations Grid"
        subtitle={`${rows.length} configuration-item incidents in scope · ${breached} SLA breach${breached === 1 ? "" : "es"} live`}
        right={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="!h-7 w-[150px] text-[12px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All severities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="text-[12px]">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="!h-7 w-[140px] text-[12px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All states</SelectItem>
                {TICKET_STATES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <NewIncident
              open={open}
              setOpen={setOpen}
              assets={assets}
              suppliers={suppliers}
            />
          </div>
        }
      />

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[1080px] border-collapse text-[12px]">
          <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {[
                "Incident",
                "Source",
                "Short description",
                "Configuration item",
                "Severity matrix",
                "SLA countdown",
                "Assigned state",
                "Vendor",
                "Opened",
                "Action",
              ].map((h) => (
                <th key={h} className="border-b border-border px-2.5 py-1.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const asset = t.asset_id ? assetById.get(t.asset_id) : undefined;
              const ambient = !!t.asset_id && ambientAssetIds.has(t.asset_id);
              const term = isTerminal(t);
              const breach = !term && slaDeadline(t) < now;
              return (
                <tr
                  key={t.id}
                  className={cn(
                    "border-b border-border/70 transition-colors hover:bg-accent/50",
                    breach && "bg-critical/[0.06]",
                  )}
                >
                  <td className="px-2.5 py-1">
                    <Mono className="font-semibold text-foreground">INC{shortId(t.id)}</Mono>
                  </td>
                  <td className="px-2.5 py-1"><SourceBadge ambient={ambient} /></td>
                  <td className="max-w-[300px] truncate px-2.5 py-1 font-medium">{t.title}</td>
                  <td className="px-2.5 py-1">
                    {asset ? (
                      <div className="leading-tight">
                        <div className="truncate">{asset.name}</div>
                        <Mono className="text-muted-foreground">
                          CI-{shortId(asset.id)} · {asset.serial_number}
                        </Mono>
                      </div>
                    ) : (
                      <Mono className="text-muted-foreground">— unlinked —</Mono>
                    )}
                  </td>
                  <td className="px-2.5 py-1"><SeverityCell p={t.priority} /></td>
                  <td className="px-2.5 py-1">
                    <SlaClock deadline={slaDeadline(t)} frozen={term} now={now} />
                  </td>
                  <td className="px-2.5 py-1">
                    <StatusBadge tone={stateTone(t.status) as never}>{t.status}</StatusBadge>
                    <div className="mt-0.5"><Mono className="text-muted-foreground">{t.department}</Mono></div>
                  </td>
                  <td className="px-2.5 py-1">
                    <Mono className="text-muted-foreground">
                      {t.supplier_id ? (supplierById.get(t.supplier_id)?.name ?? "—") : "—"}
                    </Mono>
                  </td>
                  <td className="px-2.5 py-1">
                    <Mono className="text-muted-foreground">
                      {new Date(t.created_at).toLocaleString("en-ZA", {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Mono>
                  </td>
                  <td className="px-2.5 py-1">
                    <Select
                      value={t.status}
                      onValueChange={(v) => setStatus(t, v as TicketStatus)}
                      disabled={busy === t.id}
                    >
                      <SelectTrigger className="!h-6 w-[124px] text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_STATES.map((s) => (
                          <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-[11px] text-muted-foreground">
                  <AlertTriangle className="mx-auto mb-1 h-4 w-4" />
                  No incidents match the active filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
        <RefreshCw className="h-3 w-3" /> SLA targets: P1 60m · P2 240m · P3 480m · P4 1440m from
        opened timestamp · source inferred from linked ambient sensors
      </p>
    </div>
  );
}

function NewIncident({
  open,
  setOpen,
  assets,
  suppliers,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  assets: Asset[];
  suppliers: Supplier[];
}) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [priority, setPriority] = useState<TicketPriority>("High");
  const [assetId, setAssetId] = useState<string>("none");
  const [supplierId, setSupplierId] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return toast.error("Short description required");
    setSaving(true);
    try {
      await createTicket({
        title: title.trim(),
        priority,
        status: "Open",
        department,
        asset_id: assetId === "none" ? null : assetId,
        supplier_id: supplierId === "none" ? null : supplierId,
      });
      toast.success("Incident committed to database", {
        description: "audit_logs updated by trigger",
      });
      setTitle("");
      setOpen(false);
    } catch (e) {
      toast.error("Insert rejected", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1 text-[12px]">
          <Plus className="h-3.5 w-3.5" /> New incident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Raise incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short description"
            className="h-8 text-[12px]"
          />
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Assignment group / department"
            className="h-8 text-[12px]"
          />
          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
            <SelectTrigger className="!h-8 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="text-[12px]">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assetId} onValueChange={setAssetId}>
            <SelectTrigger className="!h-8 text-[12px]">
              <SelectValue placeholder="Configuration item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-[12px]">No configuration item</SelectItem>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id} className="text-[12px]">{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="!h-8 text-[12px]">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-[12px]">No vendor</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button size="sm" className="h-7 text-[12px]" onClick={submit} disabled={saving}>
            {saving ? "Committing…" : "Commit to database"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
