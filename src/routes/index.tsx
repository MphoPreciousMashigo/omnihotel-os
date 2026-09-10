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
import Incidents from "@/components/erp/Incidents";
import AssetsTab from "@/components/erp/Assets";
import SuppliersTab from "@/components/erp/Suppliers";
import Financials from "@/components/erp/Financials";
import IotFeed from "@/components/erp/IotFeed";
import ActivityLog from "@/components/erp/ActivityLog";
import { ErrorPanel, Loading, Mono, SectionHead, StatusBadge } from "@/components/erp/shared";
import {
  isTerminal,
  slaDeadline,
  useAgentProcurements,
  useAssets,
  useAuditLogs,
  useIotDevices,
  useProfiles,
  useRealtimeSync,
  useSuppliers,
  useTickets,
} from "@/lib/erp-db";

export const PROPERTIES = [
  "Grand Resort & Casino - Main",
  "Grand Resort & Casino - Tower B",
];
export const ROLES = ["Admin", "Operations Manager", "Fleet Supervisor"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmniHotel Enterprise — Live Hotel Operations ERP" },
      {
        name: "description",
        content:
          "Live hotel operations control centre: SLA incident grid, asset and fleet registry, IoT sensor feed, vendor contracts and financial analytics on real database records.",
      },
      { property: "og:title", content: "OmniHotel Enterprise — Live Hotel Operations ERP" },
      {
        property: "og:description",
        content:
          "Real-time incident SLA countdowns, asset registry, ambient IoT telemetry and vendor procurement in one dense enterprise console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardLayout,
});

function Kpi({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone: "critical" | "warn" | "ok" | "info" | "neutral";
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <StatusBadge tone={tone}>live</StatusBadge>
      </div>
      <div className="mt-1 font-mono text-[22px] font-semibold leading-none tabular-nums">
        {value}
      </div>
      {hint && <Mono className="mt-1 block text-muted-foreground">{hint}</Mono>}
    </div>
  );
}

function DashboardLayout() {
  const [currentProp, setCurrentProp] = useState(PROPERTIES[0]!);
  const [currentRole, setCurrentRole] = useState(ROLES[1]!);
  const [searchQuery, setSearchQuery] = useState("");

  useRealtimeSync();

  const profilesQ = useProfiles();
  const suppliersQ = useSuppliers();
  const assetsQ = useAssets();
  const ticketsQ = useTickets();
  const logsQ = useAuditLogs();
  const devicesQ = useIotDevices();
  const procQ = useAgentProcurements();

  const loading =
    ticketsQ.isLoading || assetsQ.isLoading || suppliersQ.isLoading || profilesQ.isLoading;
  const error = ticketsQ.error ?? assetsQ.error ?? suppliersQ.error ?? profilesQ.error;

  const profiles = profilesQ.data ?? [];
  const suppliers = suppliersQ.data ?? [];
  const allAssets = assetsQ.data ?? [];
  const allTickets = ticketsQ.data ?? [];
  const logs = logsQ.data ?? [];
  const devices = devicesQ.data ?? [];
  const procurements = procQ.data ?? [];

  const q = searchQuery.trim().toLowerCase();
  const hit = (...parts: (string | null | undefined)[]) =>
    q === "" || parts.some((p) => (p ?? "").toLowerCase().includes(q));

  const tickets = useMemo(
    () =>
      allTickets.filter((t) =>
        hit(t.id, t.title, t.department, t.status, t.priority, t.asset_id, t.supplier_id),
      ),
    [allTickets, q],
  );
  const assets = useMemo(
    () =>
      allAssets.filter((a) => hit(a.id, a.name, a.category, a.status, a.serial_number, a.supplier_id)),
    [allAssets, q],
  );
  const vendors = useMemo(
    () => suppliers.filter((s) => hit(s.id, s.name, s.contact_email, s.contract_status)),
    [suppliers, q],
  );

  const now = Date.now();
  const breaches = tickets.filter((t) => !isTerminal(t) && slaDeadline(t) < now).length;
  const operational = assets.filter((a) => a.status === "Operational").length;
  const utilization = assets.length ? Math.round((operational / assets.length) * 100) : 0;
  const sensorAlerts = devices.filter(
    (d) =>
      d.threshold_limit != null &&
      d.current_reading != null &&
      Number(d.current_reading) > Number(d.threshold_limit),
  ).length;
  const openIncidents = tickets.filter((t) => !isTerminal(t)).length;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <header className="sticky top-0 z-50 flex h-11 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-tight">
            <Hotel className="h-3.5 w-3.5 text-primary" />
            <span>OMNIHOTEL OS</span>
            <span className="text-[10px] font-medium opacity-50">v4.2.1</span>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <Select value={currentProp} onValueChange={setCurrentProp}>
            <SelectTrigger className="h-7 w-[240px] border-none bg-transparent px-2 font-mono text-xs font-medium hover:bg-muted focus:ring-0 focus:ring-offset-0">
              <Building2 className="mr-1.5 h-3 w-3 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTIES.map((p) => (
                <SelectItem key={p} value={p} className="font-mono text-xs">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative max-w-sm flex-1 px-4">
          <Search className="absolute top-1/2 left-6 h-3 w-3 -translate-y-1/2 opacity-40" />
          <Input
            type="search"
            placeholder="Global UUID search - tickets, assets, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 w-full border-border bg-muted/40 pl-7 font-mono text-xs focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={currentRole} onValueChange={setCurrentRole}>
            <SelectTrigger className="h-7 w-[170px] border-border bg-muted/50 px-2 font-mono text-[11px] hover:bg-muted">
              <ShieldCheck className="mr-1.5 h-3 w-3 text-emerald-500 opacity-80" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r} className="font-mono text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] p-3">
        <h1 className="sr-only">OmniHotel Enterprise Hotel Operations ERP</h1>

        {error && <ErrorPanel error={error} />}

        <Tabs defaultValue="overview" className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <TabsList className="h-8 overflow-x-auto bg-muted/60 p-0.5">
              {[
                ["overview", "Executive Overview"],
                ["issues", "Issue & Query Lifecycle"],
                ["assets", "Asset & Fleet Tracking"],
                ["iot", "Ambient IoT Feed"],
                ["financials", "RevPAR & Financials"],
                ["suppliers", "Supplier & Procurement"],
              ].map(([id, label]) => (
                <TabsTrigger key={id} value={id!} className="h-7 whitespace-nowrap px-3 font-mono text-xs">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="font-mono text-[10px] uppercase tracking-wider opacity-40">
              {currentProp.split(" - ")[1] || "Global Zone"} Context
            </div>
          </div>

          <TabsContent value="overview" className="outline-hidden mt-0 space-y-3">
            {loading ? (
              <Loading />
            ) : (
              <>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  <Kpi
                    label="Active SLA breaches"
                    value={breaches}
                    tone={breaches ? "critical" : "ok"}
                    hint={`${openIncidents} open incidents`}
                  />
                  <Kpi
                    label="Fleet / asset utilization"
                    value={`${utilization}%`}
                    tone={utilization > 80 ? "ok" : utilization > 60 ? "warn" : "critical"}
                    hint={`${operational}/${assets.length} operational`}
                  />
                  <Kpi
                    label="Sensor threshold alerts"
                    value={sensorAlerts}
                    tone={sensorAlerts ? "warn" : "ok"}
                    hint={`${devices.length} devices reporting`}
                  />
                  <Kpi
                    label="Procurement records"
                    value={procurements.length}
                    tone="info"
                    hint={`${vendors.length} vendors on contract`}
                  />
                </div>

                <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                  <div className="space-y-3">
                    <SectionHead
                      title="Priority incident queue"
                      subtitle="Live SLA countdowns driven by the slaMinutes column"
                    />
                    <Incidents
                      tickets={tickets.filter((t) => !isTerminal(t)).slice(0, 8)}
                      assets={allAssets}
                      suppliers={suppliers}
                      devices={devices}
                    />
                  </div>
                  <ActivityLog logs={logs} profiles={profiles} connected />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="issues" className="outline-hidden mt-0">
            {loading ? (
              <Loading />
            ) : (
              <Incidents
                tickets={tickets}
                assets={allAssets}
                suppliers={suppliers}
                devices={devices}
              />
            )}
          </TabsContent>

          <TabsContent value="assets" className="outline-hidden mt-0">
            {loading ? (
              <Loading />
            ) : (
              <AssetsTab assets={assets} suppliers={suppliers} devices={devices} />
            )}
          </TabsContent>

          <TabsContent value="iot" className="outline-hidden mt-0">
            {devicesQ.isLoading ? <Loading /> : <IotFeed devices={devices} assets={allAssets} />}
          </TabsContent>

          <TabsContent value="financials" className="outline-hidden mt-0">
            {loading ? (
              <Loading />
            ) : (
              <Financials tickets={allTickets} assets={allAssets} logs={logs} />
            )}
          </TabsContent>

          <TabsContent value="suppliers" className="outline-hidden mt-0">
            {loading ? (
              <Loading />
            ) : (
              <SuppliersTab
                suppliers={vendors}
                assets={allAssets}
                tickets={allTickets}
                procurements={procurements}
              />
            )}
          </TabsContent>
        </Tabs>

        <footer className="mt-6 border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
          {currentProp} · session role {currentRole} · {allTickets.length} incidents ·{" "}
          {allAssets.length} configuration items · {logs.length} audit entries
        </footer>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
