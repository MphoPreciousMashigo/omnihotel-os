import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Hotel, Search, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Overview from "@/components/erp/Overview";
import Issues from "@/components/erp/Issues";
import AssetsTab from "@/components/erp/Assets";
import SuppliersTab from "@/components/erp/Suppliers";
import {
  PROPERTIES,
  ROLES,
  assets as seedAssets,
  initialEvents,
  purchaseOrders as seedPOs,
  suppliers as seedSuppliers,
  tickets as seedTickets,
  nowStamp,
  uuid8,
  type Asset,
  type EventEntry,
  type PurchaseOrder,
} from "@/data/erp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmniHotel Enterprise — Hotel Operations ERP" },
      {
        name: "description",
        content:
          "Unified hotel operations control centre: SLA tickets, fleet and asset tracking, supplier contracts and purchase orders in one dense enterprise console.",
      },
      { property: "og:title", content: "OmniHotel Enterprise — Hotel Operations ERP" },
      {
        property: "og:description",
        content:
          "Track SLA breaches, fleet utilization, inventory alerts and PO approvals across every property from a single console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "overview", label: "Executive Overview" },
  { id: "issues", label: "Issue & Query Lifecycle" },
  { id: "assets", label: "Asset & Fleet Tracking" },
  { id: "suppliers", label: "Supplier & Procurement" },
];

function Index() {
  const [property, setProperty] = useState<string>(PROPERTIES[0]!);
  const [role, setRole] = useState<string>(ROLES[0]!);
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<EventEntry[]>(initialEvents);
  const [assets, setAssets] = useState<Asset[]>(seedAssets);
  const [pos, setPos] = useState<PurchaseOrder[]>(seedPOs);

  const q = query.trim().toLowerCase();
  const match = (s: string) => s.toLowerCase().includes(q);

  const tickets = useMemo(
    () =>
      q === ""
        ? seedTickets
        : seedTickets.filter(
            (t) =>
              match(t.id) ||
              match(t.uuid) ||
              match(t.title) ||
              match(t.department) ||
              match(t.staffId) ||
              match(t.assetId ?? "") ||
              t.supplierIds.some(match),
          ),
    [q],
  );

  const visibleAssets = useMemo(
    () =>
      q === ""
        ? assets
        : assets.filter(
            (a) => match(a.id) || match(a.item) || match(a.category) || match(a.supplierId),
          ),
    [assets, q],
  );

  const visibleSuppliers = useMemo(
    () =>
      q === ""
        ? seedSuppliers
        : seedSuppliers.filter(
            (s) => match(s.id) || match(s.name) || s.categories.some(match),
          ),
    [q],
  );

  function pushEvent(e: Omit<EventEntry, "id" | "ts">) {
    setEvents((prev) => [{ id: `EVT-${uuid8()}`, ts: nowStamp(), ...e }, ...prev]);
  }

  function handleLog(
    assetId: string,
    mileage: number,
    status: Asset["status"],
    note: string,
  ) {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, mileage, status, lastInspection: new Date().toISOString().slice(0, 10) }
          : a,
      ),
    );
    pushEvent({
      actor: role === "Fleet Supervisor" ? "STF-1043" : "STF-2291",
      kind: "asset",
      message: `Mileage logged for ${assetId} · ${mileage.toLocaleString()} km · status ${status}${note ? ` · ${note}` : ""}`,
    });
    toast.success("Logged to audit stream", { description: `${assetId} updated` });
  }

  function handleCreatePO(po: Omit<PurchaseOrder, "id" | "createdAt" | "status">) {
    const id = `PO-${88218 + pos.length}`;
    setPos((prev) => [
      { ...po, id, status: "Pending Approval", createdAt: nowStamp() },
      ...prev,
    ]);
    pushEvent({
      actor: "STF-7702",
      kind: "procurement",
      message: `${id} raised against ${po.linkType} ${po.linkId} · ${po.supplierId}`,
    });
    toast.success("Purchase order raised", { description: `${id} pending approval` });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-header/40 bg-header text-header-foreground">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-2 pr-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-header-foreground/10">
              <Hotel className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-tight">OmniHotel OS</div>
              <div className="font-mono text-[10px] text-header-muted">enterprise · v4.2.1</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-header-muted" />
            <Select value={property} onValueChange={setProperty}>
              <SelectTrigger className="!h-7 w-[260px] border-header-foreground/20 bg-header-foreground/10 text-[12px] text-header-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTIES.map((p) => (
                  <SelectItem key={p} value={p} className="text-[12px]">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-header-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Global UUID search — tickets, assets, suppliers…"
              className="h-7 border-header-foreground/20 bg-header-foreground/10 pl-7 font-mono text-[12px] text-header-foreground placeholder:text-header-muted"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-header-muted" />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="!h-7 w-[190px] border-header-foreground/20 bg-header-foreground/10 text-[12px] text-header-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="text-[12px]">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-3 py-3">
        <h1 className="sr-only">OmniHotel Enterprise Hotel Operations ERP</h1>
        {q && (
          <p className="mb-2 rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
            filter “{query}” → {tickets.length} tickets · {visibleAssets.length} assets ·{" "}
            {visibleSuppliers.length} suppliers
          </p>
        )}
        <Tabs defaultValue="overview" className="gap-3">
          <TabsList className="h-8 w-full justify-start overflow-x-auto rounded-md bg-secondary p-0.5">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="h-7 whitespace-nowrap rounded-sm px-3 text-[12px] font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <Overview events={events} tickets={tickets} assets={visibleAssets} pos={pos} />
          </TabsContent>
          <TabsContent value="issues">
            <Issues tickets={tickets} />
          </TabsContent>
          <TabsContent value="assets">
            <AssetsTab assets={visibleAssets} onLog={handleLog} />
          </TabsContent>
          <TabsContent value="suppliers">
            <SuppliersTab suppliers={visibleSuppliers} pos={pos} onCreatePO={handleCreatePO} />
          </TabsContent>
        </Tabs>

        <footer className="mt-6 border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
          {property} · session role {role} · audit entries {events.length}
        </footer>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
