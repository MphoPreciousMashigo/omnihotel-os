import { useMemo, useState } from "react";
import { Plus, Wrench } from "lucide-react";
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
import { Mono, SectionHead, StatusBadge, assetTone } from "./shared";
import {
  ASSET_STATES,
  createAsset,
  shortId,
  updateAsset,
  type Asset,
  type AssetStatus,
  type IotDevice,
  type Supplier,
} from "@/lib/erp-db";

export default function AssetsTab({
  assets,
  suppliers,
  devices,
}: {
  assets: Asset[];
  suppliers: Supplier[];
  devices: IotDevice[];
}) {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Asset | null>(null);
  const [creating, setCreating] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(assets.map((a) => a.category).filter(Boolean) as string[])),
    [assets],
  );
  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const deviceByAsset = useMemo(
    () => new Map(devices.map((d) => [d.related_asset_id ?? "", d])),
    [devices],
  );

  const rows = assets
    .filter((a) => (status === "all" ? true : a.status === status))
    .filter((a) => (category === "all" ? true : a.category === category));

  return (
    <div className="space-y-3">
      <SectionHead
        title="Configuration Item & Asset Register"
        subtitle={`${rows.length} assets · edits commit straight to the database`}
        right={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="!h-7 w-[160px] text-[12px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="!h-7 w-[170px] text-[12px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All states</SelectItem>
                {ASSET_STATES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-7 gap-1 text-[12px]" onClick={() => setCreating(true)}>
              <Plus className="h-3.5 w-3.5" /> New asset
            </Button>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[920px] text-[12px]">
          <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {["CI ID", "Item", "Category", "Serial", "State", "Vendor", "Sensor", "Updated", ""].map((h) => (
                <th key={h} className="border-b border-border px-2.5 py-1.5 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const dev = deviceByAsset.get(a.id);
              return (
                <tr key={a.id} className="border-b border-border/70 hover:bg-accent/50">
                  <td className="px-2.5 py-1"><Mono className="font-semibold">CI-{shortId(a.id)}</Mono></td>
                  <td className="px-2.5 py-1 font-medium">{a.name}</td>
                  <td className="px-2.5 py-1">{a.category ?? "—"}</td>
                  <td className="px-2.5 py-1"><Mono className="text-muted-foreground">{a.serial_number ?? "—"}</Mono></td>
                  <td className="px-2.5 py-1">
                    <StatusBadge tone={assetTone(a.status) as never}>{a.status}</StatusBadge>
                  </td>
                  <td className="px-2.5 py-1">
                    <Mono className="text-muted-foreground">
                      {a.supplier_id ? (supplierById.get(a.supplier_id)?.name ?? "—") : "—"}
                    </Mono>
                  </td>
                  <td className="px-2.5 py-1">
                    {dev ? (
                      <Mono className="text-info">{Number(dev.current_reading ?? 0).toFixed(2)} / {Number(dev.threshold_limit ?? 0).toFixed(2)}</Mono>
                    ) : (
                      <Mono className="text-muted-foreground">none</Mono>
                    )}
                  </td>
                  <td className="px-2.5 py-1">
                    <Mono className="text-muted-foreground">
                      {new Date(a.updated_at).toLocaleString("en-ZA", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </Mono>
                  </td>
                  <td className="px-2.5 py-1 text-right">
                    <Button size="sm" variant="outline" className="h-6 gap-1 text-[11px]" onClick={() => setEditing(a)}>
                      <Wrench className="h-3 w-3" /> Update
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-[11px] text-muted-foreground">No assets match the filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <UpdateAssetDialog asset={editing} onClose={() => setEditing(null)} suppliers={suppliers} />
      <CreateAssetDialog open={creating} setOpen={setCreating} suppliers={suppliers} />
    </div>
  );
}

function UpdateAssetDialog({
  asset,
  onClose,
  suppliers,
}: {
  asset: Asset | null;
  onClose: () => void;
  suppliers: Supplier[];
}) {
  const [status, setStatus] = useState<AssetStatus>("Operational");
  const [supplierId, setSupplierId] = useState("none");
  const [saving, setSaving] = useState(false);

  const key = asset?.id ?? "none";

  async function submit() {
    if (!asset) return;
    setSaving(true);
    try {
      await updateAsset(asset.id, {
        status,
        supplier_id: supplierId === "none" ? null : supplierId,
        updated_at: new Date().toISOString(),
      });
      toast.success("Asset state committed", { description: `CI-${shortId(asset.id)} · ${status}` });
      onClose();
    } catch (e) {
      toast.error("Update rejected", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={!!asset}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (asset) {
          setStatus(asset.status);
          setSupplierId(asset.supplier_id ?? "none");
        }
      }}
    >
      <DialogContent className="sm:max-w-md" key={key}>
        {asset && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[14px]">Update {asset.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Mono className="text-muted-foreground">CI-{shortId(asset.id)} · {asset.serial_number}</Mono>
              <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                <SelectTrigger className="!h-8 text-[12px]"><SelectValue placeholder="Operational state" /></SelectTrigger>
                <SelectContent>
                  {ASSET_STATES.map((s) => (
                    <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="!h-8 text-[12px]"><SelectValue placeholder="Vendor" /></SelectTrigger>
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
                {saving ? "Committing…" : "Commit change"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateAssetDialog({
  open,
  setOpen,
  suppliers,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  suppliers: Supplier[];
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState<AssetStatus>("Operational");
  const [supplierId, setSupplierId] = useState("none");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim() || !serial.trim()) return toast.error("Name and serial number required");
    setSaving(true);
    try {
      await createAsset({
        name: name.trim(),
        category: category.trim() || "General",
        serial_number: serial.trim(),
        status,
        supplier_id: supplierId === "none" ? null : supplierId,
      });
      toast.success("Asset registered", { description: "audit_logs updated by trigger" });
      setName("");
      setSerial("");
      setCategory("");
      setOpen(false);
    } catch (e) {
      toast.error("Insert rejected", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-[14px]">Register configuration item</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Asset name" className="h-8 text-[12px]" />
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (HVAC, Laundry, Fleet…)" className="h-8 text-[12px]" />
          <Input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="Serial number" className="h-8 font-mono text-[12px]" />
          <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
            <SelectTrigger className="!h-8 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ASSET_STATES.map((s) => (
                <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="!h-8 text-[12px]"><SelectValue placeholder="Vendor" /></SelectTrigger>
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
