import { useMemo, useState } from "react";
import { Gauge, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mono, SectionHead, StatusBadge, assetTone } from "./shared";
import { suppliers, type Asset } from "@/data/erp";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Shuttle Vans", "HVAC Units", "Housekeeping Carts", "Bulk Linen"];
const STATUSES = ["All", "Operational", "In Maintenance", "Out of Service", "Low Stock"];

export default function Assets({
  assets,
  onLog,
}: {
  assets: Asset[];
  onLog: (assetId: string, mileage: number, status: Asset["status"], note: string) => void;
}) {
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Asset | null>(null);
  const [mileage, setMileage] = useState("");
  const [newStatus, setNewStatus] = useState<Asset["status"]>("Operational");
  const [note, setNote] = useState("");

  const rows = useMemo(
    () =>
      assets.filter(
        (a) =>
          (cat === "All" || a.category === cat) &&
          (status === "All" || a.status === status) &&
          (q === "" ||
            (a.item + a.id + a.location).toLowerCase().includes(q.toLowerCase())),
      ),
    [assets, cat, status, q],
  );

  function open(a: Asset) {
    if (a.category !== "Shuttle Vans") return;
    setActive(a);
    setMileage(String(a.mileage ?? 0));
    setNewStatus(a.status);
    setNote("");
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title="Asset & Fleet Tracking"
        subtitle={`${rows.length} of ${assets.length} assets · vehicles are clickable for mileage logging`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter assets…"
                className="h-7 w-44 pl-7 text-[12px]"
              />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="!h-7 w-44 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="!h-7 w-40 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((c) => <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[900px] text-[12px]">
          <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Asset UUID", "Category", "Item", "Status", "Linked supplier", "Location", "Mileage", "Last inspection"].map((h) => (
                <th key={h} className="px-2.5 py-1.5 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const s = suppliers.find((x) => x.id === a.supplierId)!;
              const clickable = a.category === "Shuttle Vans";
              return (
                <tr
                  key={a.id}
                  onClick={() => open(a)}
                  className={cn(
                    "border-t border-border",
                    clickable ? "cursor-pointer hover:bg-accent/50" : "hover:bg-accent/25",
                  )}
                >
                  <td className="px-2.5 py-1.5"><Mono className="font-semibold">{a.id}</Mono></td>
                  <td className="px-2.5 py-1.5">{a.category}</td>
                  <td className="px-2.5 py-1.5 font-medium">{a.item}</td>
                  <td className="px-2.5 py-1.5"><StatusBadge tone={assetTone(a.status) as never}>{a.status}</StatusBadge></td>
                  <td className="px-2.5 py-1.5">
                    <span className="block">{s.name}</span>
                    <Mono className="text-muted-foreground">{s.id}</Mono>
                  </td>
                  <td className="px-2.5 py-1.5 text-muted-foreground">{a.location}</td>
                  <td className="px-2.5 py-1.5"><Mono>{a.mileage ? a.mileage.toLocaleString() + " km" : "—"}</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono className="text-muted-foreground">{a.lastInspection}</Mono></td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-2.5 py-6 text-center text-muted-foreground">No assets match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4" /> Log Mileage &amp; Status
            </DialogTitle>
            <DialogDescription>
              {active?.item} · <Mono>{active?.id}</Mono>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Odometer (km)</Label>
              <Input value={mileage} onChange={(e) => setMileage(e.target.value)} inputMode="numeric" className="h-8 font-mono text-[12px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Vehicle status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Asset["status"])}>
                <SelectTrigger className="!h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.slice(1).map((s) => <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Inspection note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the audit log" className="h-8 text-[12px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setActive(null)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => {
                if (!active) return;
                onLog(active.id, Number(mileage) || active.mileage || 0, newStatus, note);
                setActive(null);
              }}
            >
              Submit to audit stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
