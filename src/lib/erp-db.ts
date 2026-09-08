import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ---------- row shapes (mirrors the live public schema) ---------- */

export type Profile = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  role: string | null;
  department: string | null;
  created_at: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact_email: string | null;
  rating: number | null;
  contract_status: string | null;
};

export type AssetStatus = "Operational" | "Maintenance Required" | "Decommissioned";

export type Asset = {
  id: string;
  name: string;
  category: string | null;
  status: AssetStatus;
  serial_number: string | null;
  supplier_id: string | null;
  updated_at: string;
};

export type TicketPriority = "Critical" | "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export type Ticket = {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  department: string;
  asset_id: string | null;
  supplier_id: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  actor_id: string | null;
  action_type: string;
  target_entity_id: string | null;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
};

export type IotDevice = {
  id: string;
  name: string;
  type: string | null;
  status: string | null;
  related_asset_id: string | null;
  current_reading: number | null;
  threshold_limit: number | null;
  updated_at: string;
};

export type AgentProcurement = Record<string, unknown> & { id: string; created_at?: string };

/* ---------- severity / SLA model ---------- */

export const PRIORITIES: TicketPriority[] = ["Critical", "High", "Medium", "Low"];
export const TICKET_STATES: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];
export const ASSET_STATES: AssetStatus[] = [
  "Operational",
  "Maintenance Required",
  "Decommissioned",
];

export const SEVERITY: Record<TicketPriority, { code: string; label: string; sla: number }> = {
  Critical: { code: "P1", label: "P1 · Critical", sla: 60 },
  High: { code: "P2", label: "P2 · High", sla: 240 },
  Medium: { code: "P3", label: "P3 · Medium", sla: 480 },
  Low: { code: "P4", label: "P4 · Low", sla: 1440 },
};

export function slaDeadline(t: Ticket) {
  return new Date(t.created_at).getTime() + SEVERITY[t.priority].sla * 60_000;
}

export function isTerminal(t: Ticket) {
  return t.status === "Resolved" || t.status === "Closed";
}

export function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/* ---------- queries ---------- */

async function selectAll<T>(table: string, order: string, ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

export const useProfiles = () =>
  useQuery({ queryKey: ["profiles"], queryFn: () => selectAll<Profile>("profiles", "created_at") });

export const useSuppliers = () =>
  useQuery({
    queryKey: ["suppliers"],
    queryFn: () => selectAll<Supplier>("suppliers", "rating"),
  });

export const useAssets = () =>
  useQuery({ queryKey: ["assets"], queryFn: () => selectAll<Asset>("assets", "updated_at") });

export const useTickets = () =>
  useQuery({ queryKey: ["tickets"], queryFn: () => selectAll<Ticket>("tickets", "created_at") });

export const useAuditLogs = () =>
  useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as AuditLog[];
    },
  });

export const useIotDevices = () =>
  useQuery({
    queryKey: ["iot_devices"],
    queryFn: () => selectAll<IotDevice>("iot_devices", "updated_at"),
  });

export const useAgentProcurements = () =>
  useQuery({
    queryKey: ["agent_procurements"],
    queryFn: () => selectAll<AgentProcurement>("agent_procurements", "created_at"),
  });

/* ---------- mutations (triggers write audit_logs server-side) ---------- */

export async function createTicket(input: {
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  department: string;
  asset_id: string | null;
  supplier_id: string | null;
}) {
  const { error } = await supabase.from("tickets").insert(input);
  if (error) throw error;
}

export async function updateTicket(id: string, patch: Partial<Ticket>) {
  const { error } = await supabase.from("tickets").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createAsset(input: {
  name: string;
  category: string;
  status: AssetStatus;
  serial_number: string;
  supplier_id: string | null;
}) {
  const { error } = await supabase.from("assets").insert(input);
  if (error) throw error;
}

export async function updateAsset(id: string, patch: Partial<Asset>) {
  const { error } = await supabase.from("assets").update(patch).eq("id", id);
  if (error) throw error;
}

/* ---------- realtime replication ---------- */

const TABLES = [
  "profiles",
  "suppliers",
  "assets",
  "tickets",
  "audit_logs",
  "iot_devices",
  "agent_procurements",
] as const;

export function useRealtimeSync(onEvent?: (table: string, eventType: string) => void) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel("omnihotel-ops");
    for (const table of TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        qc.invalidateQueries({ queryKey: [table] });
        qc.invalidateQueries({ queryKey: ["audit_logs"] });
        onEvent?.(table, payload.eventType);
      });
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc]);
}

export function money(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA");
}
