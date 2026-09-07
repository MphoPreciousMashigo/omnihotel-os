import { useState } from "react";
import { FilePlus2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mono, SectionHead, Stars, StatusBadge } from "./shared";
import {
  assets,
  money,
  suppliers as allSuppliers,
  tickets as allTickets,
  type PurchaseOrder,
  type Supplier,
} from "@/data/erp";

export default function Suppliers({
  suppliers,
  pos,
  onCreatePO,
}: {
  suppliers: Supplier[];
  pos: PurchaseOrder[];
  onCreatePO: (po: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(allSuppliers[0]!.id);
  const [linkType, setLinkType] = useState<"Asset" | "Ticket">("Asset");
  const [linkId, setLinkId] = useState(assets[0]!.id);
  const [amount, setAmount] = useState("25000");

  const linkOptions =
    linkType === "Asset"
      ? assets.map((a) => ({ id: a.id, label: `${a.id} · ${a.item}` }))
      : allTickets.map((t) => ({ id: t.id, label: `${t.id} · ${t.title}` }));

  return (
    <div className="space-y-3">
      <SectionHead
        title="Supplier & Procurement"
        subtitle={`${suppliers.length} vendors · ${pos.filter((p) => p.status === "Pending Approval").length} POs awaiting approval`}
        right={
          <Button size="sm" className="h-7 text-[12px]" onClick={() => setOpen(true)}>
            <FilePlus2 className="h-3.5 w-3.5" /> Create Purchase Order
          </Button>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => (
          <div key={s.id} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[13px] font-semibold">{s.name}</h3>
                <Mono className="text-muted-foreground">{s.id}</Mono>
              </div>
              <StatusBadge tone={s.contract === "Active" ? "ok" : s.contract === "Expiring" ? "warn" : "critical"}>
                {s.contract}
              </StatusBadge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Stars n={s.reliability} />
              <Mono className="text-muted-foreground">{s.reliability}.0 / 5 reliability</Mono>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.categories.map((c) => (
                <StatusBadge key={c} tone="neutral">{c}</StatusBadge>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[11px]">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3 w-3" /> {s.contact}
              </span>
              <Mono className="font-semibold">{money(s.spendYTD)}</Mono>
            </div>
          </div>
        ))}
      </div>

      <SectionHead title="Purchase Orders" subtitle="Linked to assets and tickets" />
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[720px] text-[12px]">
          <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {["PO", "Supplier", "Link type", "Linked UUID", "Amount", "Status", "Raised"].map((h) => (
                <th key={h} className="px-2.5 py-1.5 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pos.map((p) => {
              const s = allSuppliers.find((x) => x.id === p.supplierId)!;
              return (
                <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-2.5 py-1.5"><Mono className="font-semibold">{p.id}</Mono></td>
                  <td className="px-2.5 py-1.5">{s?.name}</td>
                  <td className="px-2.5 py-1.5">{p.linkType}</td>
                  <td className="px-2.5 py-1.5"><Mono className="text-muted-foreground">{p.linkId}</Mono></td>
                  <td className="px-2.5 py-1.5"><Mono>{money(p.amount)}</Mono></td>
                  <td className="px-2.5 py-1.5">
                    <StatusBadge tone={p.status === "Approved" ? "ok" : p.status === "Received" ? "info" : "warn"}>
                      {p.status}
                    </StatusBadge>
                  </td>
                  <td className="px-2.5 py-1.5"><Mono className="text-muted-foreground">{p.createdAt}</Mono></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Create Purchase Order</DialogTitle>
            <DialogDescription>Link the order to an asset UUID or ticket UUID.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="!h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allSuppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Link type</Label>
              <Select
                value={linkType}
                onValueChange={(v) => {
                  const t = v as "Asset" | "Ticket";
                  setLinkType(t);
                  setLinkId(t === "Asset" ? assets[0]!.id : allTickets[0]!.id);
                }}
              >
                <SelectTrigger className="!h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset" className="text-[12px]">Asset UUID</SelectItem>
                  <SelectItem value="Ticket" className="text-[12px]">Ticket UUID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Linked record</Label>
              <Select value={linkId} onValueChange={setLinkId}>
                <SelectTrigger className="!h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {linkOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id} className="text-[12px]">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wide">Amount (ZAR)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" className="h-8 font-mono text-[12px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => {
                onCreatePO({ supplierId, linkType, linkId, amount: Number(amount) || 0 });
                setOpen(false);
              }}
            >
              Submit PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
