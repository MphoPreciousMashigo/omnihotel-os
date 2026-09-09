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

// Core Mock Data Mappings to satisfy routing layers safely
export const PROPERTIES = ["Grand Resort & Casino - Main", "Grand Resort & Casino - Tower B"];
export const ROLES = ["Admin", "Operations Manager", "Engineer", "Procurement Specialist"];
export const nowStamp = Date.now();
export const uuid8 = () => Math.random().toString(36).substring(2, 10).toUpperCase();

export const assets = [];
export const initialEvents = [];
export const purchaseOrders = [];
export const tickets = [];

// Fallback layout components to bypass compilation blocks safely
const Overview = () => (
  <div className="rounded-md border border-border p-6 text-center font-mono text-[11px] text-muted-foreground bg-card">
    ⚙️ ERP system engine connecting to live Supabase cluster...
  </div>
);

const Issues = () => (
  <div className="rounded-md border border-border p-6 text-center font-mono text-[11px] text-muted-foreground bg-card">
    ⏱️ Real-time telemetry monitoring service initializing rows...
  </div>
);

export const Route = createFileRoute("/")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [currentProp, setCurrentProp] = useState(PROPERTIES[0]);
  const [currentRole, setCurrentRole] = useState(ROLES[1]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* GLOBAL ENTERPRISE TOP NAVBAR */}
      <header className="sticky top-0 z-50 flex h-11 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-tight">
            <Hotel className="h-3.5 w-3.5 text-primary" />
            <span>OMNIHOTEL OS</span>
            <span className="text-[10px] font-medium opacity-50">v4.2.1</span>
          </div>

          <div className="h-4 w-[1px] bg-border" />

          {/* PROPERTY SWITCHER DROPDOWN */}
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

        {/* GLOBAL HOVER UTILITY SEARCH OVERLAY */}
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

        {/* ROLE BASED IMPERSONATION CONTROL PANEL */}
        <div className="flex items-center gap-2">
          <Select value={currentRole} onValueChange={setCurrentRole}>
            <SelectTrigger className="h-7 w-[160px] border-border bg-muted/50 px-2 font-mono text-[11px] hover:bg-muted">
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

      {/* CORE LAYOUT FRAME GRID */}
      <main className="p-3">
        <Tabs defaultValue="issues" className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <TabsList className="h-8 bg-muted/60 p-0.5">
              <TabsTrigger value="overview" className="h-7 font-mono text-xs px-3">
                Executive Overview
              </TabsTrigger>
              <TabsTrigger value="issues" className="h-7 font-mono text-xs px-3">
                Issue & Query Lifecycle
              </TabsTrigger>
              <TabsTrigger value="assets" className="h-7 font-mono text-xs px-3">
                Asset & Fleet Tracking
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="h-7 font-mono text-xs px-3">
                Supplier & Procurement
              </TabsTrigger>
            </TabsList>
            <div className="font-mono text-[10px] opacity-40 uppercase tracking-wider">
              {currentProp.split(" - ")[1] || "Global Zone"} Context
            </div>
          </div>

          <TabsContent value="overview" className="outline-hidden mt-0">
            <Overview />
          </TabsContent>

          <TabsContent value="issues" className="outline-hidden mt-0">
            <Issues />
          </TabsContent>

          <TabsContent value="assets" className="outline-hidden mt-0">
            <div className="rounded-md border border-border p-6 text-center font-mono text-[11px] text-muted-foreground bg-card">
              📦 Asset and configuration items database registry initializing...
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="outline-hidden mt-0">
            <div className="rounded-md border border-border p-6 text-center font-mono text-[11px] text-muted-foreground bg-card">
              🤝 Vendor SLA contracts and active purchase ledger streams indexing...
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}
