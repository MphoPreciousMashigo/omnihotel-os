export type Priority = "P1" | "P2" | "P3" | "P4";
export type Stage =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Pending Supplier/Parts"
  | "Resolved";

export const STAGES: Stage[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Pending Supplier/Parts",
  "Resolved",
];

export type EventEntry = {
  id: string;
  ts: string;
  actor: string;
  message: string;
  kind: "sla" | "asset" | "procurement" | "ticket" | "system";
};

export type Supplier = {
  id: string;
  name: string;
  reliability: number;
  contract: "Active" | "Expiring" | "Suspended";
  categories: string[];
  contact: string;
  spendYTD: number;
};

export type Asset = {
  id: string;
  category: "Shuttle Vans" | "HVAC Units" | "Housekeeping Carts" | "Bulk Linen";
  item: string;
  status: "Operational" | "In Maintenance" | "Out of Service" | "Low Stock";
  supplierId: string;
  lastInspection: string;
  mileage?: number;
  location: string;
};

export type Ticket = {
  id: string;
  uuid: string;
  title: string;
  stage: Stage;
  priority: Priority;
  department: string;
  slaMinutes: number;
  staffId: string;
  assetId?: string | undefined;
  supplierIds: string[];
  description: string;
  history: { ts: string; actor: string; message: string }[];
};

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  linkType: "Asset" | "Ticket";
  linkId: string;
  amount: number;
  status: "Pending Approval" | "Approved" | "Received";
  createdAt: string;
};

export const PROPERTIES = [
  "Grand Resort & Casino - Main",
  "Grand Resort & Casino - Tower B",
  "Harbourfront Suites - Cape Town",
  "Sky Lodge Conference Centre",
];

export const ROLES = ["Admin", "Operations Manager", "Fleet Supervisor"] as const;

export const suppliers: Supplier[] = [
  { id: "SUP-4A2F91C7", name: "Meridian Fleet Services", reliability: 5, contract: "Active", categories: ["Shuttle Vans", "Tyres", "Fuel Cards"], contact: "ops@meridianfleet.co.za", spendYTD: 1842000 },
  { id: "SUP-9C31B0DE", name: "ThermoCore Climate Group", reliability: 4, contract: "Active", categories: ["HVAC Units", "Chillers", "Filters"], contact: "service@thermocore.io", spendYTD: 964500 },
  { id: "SUP-77E1AA05", name: "Aqua Linen Industries", reliability: 3, contract: "Expiring", categories: ["Bulk Linen", "Laundry Chemicals"], contact: "orders@aqualinen.com", spendYTD: 512300 },
  { id: "SUP-2B84D6FA", name: "Nova Housekeeping Supply", reliability: 4, contract: "Active", categories: ["Housekeeping Carts", "Amenities"], contact: "hello@novasupply.com", spendYTD: 288900 },
  { id: "SUP-E5109B3C", name: "Sentinel Facility Parts", reliability: 2, contract: "Suspended", categories: ["Spare Parts", "Plumbing"], contact: "parts@sentinelfp.net", spendYTD: 173400 },
  { id: "SUP-1D6C4780", name: "Voltra Power Systems", reliability: 5, contract: "Active", categories: ["Generators", "UPS", "Electrical"], contact: "support@voltra.energy", spendYTD: 721000 },
];

export const assets: Asset[] = [
  { id: "AST-3F9B71D2", category: "Shuttle Vans", item: "Mercedes Sprinter 519 · GRC-SH-01", status: "Operational", supplierId: "SUP-4A2F91C7", lastInspection: "2026-08-28", mileage: 148230, location: "Porte Cochère" },
  { id: "AST-8A22C0E4", category: "Shuttle Vans", item: "Toyota Quantum GL · GRC-SH-02", status: "In Maintenance", supplierId: "SUP-4A2F91C7", lastInspection: "2026-09-01", mileage: 203914, location: "Fleet Bay 2" },
  { id: "AST-C74E1B90", category: "Shuttle Vans", item: "VW Crafter 50 · GRC-SH-03", status: "Operational", supplierId: "SUP-4A2F91C7", lastInspection: "2026-08-19", mileage: 96420, location: "Airport Loop" },
  { id: "AST-5B0D9A31", category: "HVAC Units", item: "Carrier 30XA Chiller · Tower A Roof", status: "Out of Service", supplierId: "SUP-9C31B0DE", lastInspection: "2026-08-30", location: "Roof Plant A" },
  { id: "AST-D1F86C57", category: "HVAC Units", item: "Daikin VRV IV · Casino Floor", status: "Operational", supplierId: "SUP-9C31B0DE", lastInspection: "2026-09-03", location: "Casino Floor" },
  { id: "AST-6E4A2288", category: "HVAC Units", item: "Trane RTU-12 · Conference Wing", status: "In Maintenance", supplierId: "SUP-9C31B0DE", lastInspection: "2026-08-11", location: "Conference Wing" },
  { id: "AST-90BC3E15", category: "Housekeeping Carts", item: "Cart Fleet 14–28 · Floors 3-7", status: "Operational", supplierId: "SUP-2B84D6FA", lastInspection: "2026-09-02", location: "Floor Pantries" },
  { id: "AST-4C7F05AB", category: "Housekeeping Carts", item: "Cart Fleet 29–40 · Tower B", status: "Low Stock", supplierId: "SUP-2B84D6FA", lastInspection: "2026-08-24", location: "Tower B Store" },
  { id: "AST-B2093DFE", category: "Bulk Linen", item: "King Sheet Sets · 1200ct", status: "Low Stock", supplierId: "SUP-77E1AA05", lastInspection: "2026-09-04", location: "Linen Room 1" },
  { id: "AST-7FA61C40", category: "Bulk Linen", item: "Pool Towels · 3400ct", status: "Operational", supplierId: "SUP-77E1AA05", lastInspection: "2026-08-31", location: "Pool Store" },
  { id: "AST-E830B9C6", category: "Bulk Linen", item: "Banquet Table Linen · 800ct", status: "Operational", supplierId: "SUP-77E1AA05", lastInspection: "2026-08-21", location: "Banquet Store" },
];

export const tickets: Ticket[] = [
  { id: "TCK-4821", uuid: "A19C4E7B", title: "Casino floor cooling below setpoint", stage: "In Progress", priority: "P1", department: "Engineering", slaMinutes: 42, staffId: "STF-2291", assetId: "AST-D1F86C57", supplierIds: ["SUP-9C31B0DE"], description: "Guest complaints of high ambient temperature on main casino floor. VRV condenser tripping intermittently.", history: [{ ts: "06:02", actor: "SYS", message: "Ticket auto-created from BMS alarm" }, { ts: "06:14", actor: "STF-2291", message: "Assigned to HVAC crew" }, { ts: "06:35", actor: "STF-2291", message: "Condenser fan module inspected" }] },
  { id: "TCK-4822", uuid: "7D2F08A1", title: "Shuttle van GRC-SH-02 brake noise", stage: "Pending Supplier/Parts", priority: "P2", department: "Fleet", slaMinutes: 180, staffId: "STF-1043", assetId: "AST-8A22C0E4", supplierIds: ["SUP-4A2F91C7", "SUP-E5109B3C"], description: "Driver reported grinding on front left. Vehicle grounded pending pad replacement.", history: [{ ts: "05:20", actor: "STF-1043", message: "Vehicle grounded" }, { ts: "05:48", actor: "SYS", message: "PO drafted to Meridian Fleet Services" }] },
  { id: "TCK-4823", uuid: "B603C95D", title: "King linen par level breached", stage: "Assigned", priority: "P3", department: "Housekeeping", slaMinutes: 320, staffId: "STF-3378", assetId: "AST-B2093DFE", supplierIds: ["SUP-77E1AA05"], description: "Par level at 38% for king sheet sets across Tower A.", history: [{ ts: "04:55", actor: "SYS", message: "Inventory threshold breached" }] },
  { id: "TCK-4824", uuid: "F41A7E22", title: "Chiller 30XA hard fault E-207", stage: "Open", priority: "P1", department: "Engineering", slaMinutes: -18, staffId: "STF-2291", assetId: "AST-5B0D9A31", supplierIds: ["SUP-9C31B0DE", "SUP-1D6C4780"], description: "Compressor lockout, unit offline. Redundancy running at capacity.", history: [{ ts: "03:11", actor: "SYS", message: "Hard fault captured" }] },
  { id: "TCK-4825", uuid: "C8290BE4", title: "Cart wheel assemblies worn - Tower B", stage: "Assigned", priority: "P4", department: "Housekeeping", slaMinutes: 600, staffId: "STF-5511", assetId: "AST-4C7F05AB", supplierIds: ["SUP-2B84D6FA"], description: "12 carts flagged during weekly inspection.", history: [{ ts: "Yesterday", actor: "STF-5511", message: "Inspection logged" }] },
  { id: "TCK-4826", uuid: "12E5D7F9", title: "Airport loop schedule overrun", stage: "In Progress", priority: "P2", department: "Fleet", slaMinutes: 75, staffId: "STF-1043", assetId: "AST-C74E1B90", supplierIds: ["SUP-4A2F91C7"], description: "Average pickup delay 14 min against 6 min target.", history: [{ ts: "05:02", actor: "STF-1043", message: "Route review started" }] },
  { id: "TCK-4827", uuid: "9AB4F310", title: "Conference wing RTU filter change", stage: "Resolved", priority: "P3", department: "Engineering", slaMinutes: 0, staffId: "STF-2288", assetId: "AST-6E4A2288", supplierIds: ["SUP-9C31B0DE"], description: "Quarterly filter replacement completed and signed off.", history: [{ ts: "02:40", actor: "STF-2288", message: "Filters replaced" }, { ts: "02:52", actor: "SYS", message: "Ticket resolved, SLA met" }] },
  { id: "TCK-4828", uuid: "5C7E1AD8", title: "Suspended vendor invoice dispute", stage: "Pending Supplier/Parts", priority: "P2", department: "Procurement", slaMinutes: 240, staffId: "STF-7702", assetId: undefined, supplierIds: ["SUP-E5109B3C"], description: "Sentinel Facility Parts invoice mismatch of R48,200 against PO scope.", history: [{ ts: "04:10", actor: "STF-7702", message: "Dispute raised" }] },
  { id: "TCK-4829", uuid: "3E90C6BB", title: "Pool towel restock request", stage: "Open", priority: "P4", department: "Housekeeping", slaMinutes: 480, staffId: "STF-3378", assetId: "AST-7FA61C40", supplierIds: ["SUP-77E1AA05"], description: "Weekend occupancy forecast at 94%, restock recommended.", history: [{ ts: "06:20", actor: "SYS", message: "Forecast trigger" }] },
  { id: "TCK-4830", uuid: "6F13B802", title: "Generator weekly load test", stage: "Resolved", priority: "P3", department: "Engineering", slaMinutes: 0, staffId: "STF-2291", assetId: undefined, supplierIds: ["SUP-1D6C4780"], description: "Load bank test at 80% for 30 minutes, no anomalies.", history: [{ ts: "01:30", actor: "STF-2291", message: "Test completed" }] },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-88214", supplierId: "SUP-4A2F91C7", linkType: "Ticket", linkId: "TCK-4822", amount: 18400, status: "Pending Approval", createdAt: "06:05" },
  { id: "PO-88215", supplierId: "SUP-9C31B0DE", linkType: "Asset", linkId: "AST-5B0D9A31", amount: 126750, status: "Pending Approval", createdAt: "05:41" },
  { id: "PO-88216", supplierId: "SUP-77E1AA05", linkType: "Asset", linkId: "AST-B2093DFE", amount: 64200, status: "Approved", createdAt: "04:58" },
  { id: "PO-88217", supplierId: "SUP-2B84D6FA", linkType: "Ticket", linkId: "TCK-4825", amount: 9350, status: "Pending Approval", createdAt: "03:22" },
];

export const initialEvents: EventEntry[] = [
  { id: "EVT-7A31C0D9", ts: "06:41:12", actor: "SYS", message: "SLA breach recorded on TCK-4824 · F41A7E22", kind: "sla" },
  { id: "EVT-B920E45F", ts: "06:38:04", actor: "STF-1043", message: "Mileage logged for AST-C74E1B90 · 96,420 km", kind: "asset" },
  { id: "EVT-4C8D110A", ts: "06:31:57", actor: "STF-7702", message: "PO-88215 submitted for approval · SUP-9C31B0DE", kind: "procurement" },
  { id: "EVT-D5E2093B", ts: "06:22:40", actor: "SYS", message: "Inventory threshold breached on AST-B2093DFE", kind: "system" },
  { id: "EVT-3F71A6C8", ts: "06:14:11", actor: "STF-2291", message: "TCK-4821 moved to In Progress", kind: "ticket" },
  { id: "EVT-90C4BE21", ts: "06:02:33", actor: "SYS", message: "BMS alarm ingested from Casino Floor VRV", kind: "system" },
  { id: "EVT-1E60D7FA", ts: "05:48:09", actor: "SYS", message: "Parts hold applied to TCK-4822 · 7D2F08A1", kind: "ticket" },
  { id: "EVT-A2B5F038", ts: "05:20:44", actor: "STF-1043", message: "AST-8A22C0E4 grounded · status In Maintenance", kind: "asset" },
  { id: "EVT-6D18C93E", ts: "04:58:02", actor: "STF-7702", message: "PO-88216 approved · R64,200", kind: "procurement" },
  { id: "EVT-C037E1B5", ts: "04:10:19", actor: "STF-7702", message: "Invoice dispute opened against SUP-E5109B3C", kind: "procurement" },
];

export function uuid8() {
  return Array.from({ length: 8 }, () =>
    "0123456789ABCDEF"[Math.floor(Math.random() * 16)],
  ).join("");
}

export function nowStamp() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function money(n: number) {
  return "R" + n.toLocaleString("en-ZA");
}
