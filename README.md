# 🏨 OmniHotel OS

> **"A high-density, mission-critical Hotel Operations ERP platform designed to unify guest issue lifecycles, asset maintenance matrices, and procurement logistics under a single high-performance pane of glass."**

---

## 👁️ The Architectural Vision
Modern hospitality software is fragmented. Front-desk teams, facilities engineering, fleet management, and supply chain logistics usually operate on separate data silos, causing delayed resolution times and broken Service Level Agreements (SLAs).

**OmniHotel Enterprise OS** solves this fragmentation by consolidating hotel operations into a dense, ultra-high-performance Single Page Application (SPA). By eliminating lazy-loaded routing barriers, the platform cross-links live tickets, physical infrastructure assets, and supplier directories within a shared relational state memory. 

---

## 🛠️ The Full-Stack & Interface Blueprints
This platform is engineered for data-dense corporate monitoring environments, prioritizing information density and rapid navigation:

* **Core Stack:** React 19, TypeScript, Vite, and Tailwind CSS.
* **UI Foundation:** Radix UI primitives (`@radix-ui/react-tabs`, `react-dialog`, components) styled with **shadcn/ui** frameworks.
* **Visual Tracing:** Functional icon tagging via `lucide-react`.
* **State & Performance Architecture:** Implemented as a single, unified main tabbed layout using standard `Tabs` and `TabsContent`. This architecture ensures zero route-file compilation overhead, 100% state preservation when clicking between modules, and instant client-side rendering.

---

## 🏎️ Core Operational Subsystems

### 1. 📊 Executive Overview Dashboard
* **KPI Telemetry Grid:** Tracks live operational health vectors including Active SLA Breaches, Fleet Utilization %, Critical Inventory Alerts, and Pending PO Approvals.
* **Live System Audit Stream:** A vertical ticker streaming atomic infrastructure and operational status changes in real-time, bound to unique 8-character UUID hash tags.

### 2. 🎫 Issue & Query Lifecycle (Kanban vs. Dense Matrix)
* **Dual-View Handler:** Dynamically toggles between a visual Kanban board and an high-density corporate data table.
* **Stage Controls:** Tracks lifecycle mutations across *Open, Assigned, In Progress, Pending Supplier/Parts,* and *Resolved* boundaries.
* **Deep Inspect Sheet:** Clicking any ticket card slides out an expansion drawer exposing linked vendor contractors, assigned staff telemetry, and an un-alterable incident history ledger.

### 3. 🚐 Asset & Fleet Tracking Engine
* **Property Infrastructure Ledger:** Filterable dense logging system tracking heavy industrial appliances (HVAC Units), transport fleets (Shuttle Vans), and operational inventory (Housekeeping Carts, Bulk Linen).
* **Live Maintenance Dialogue:** Clicking a transport asset opens an immediate "Log Mileage & Status" transaction module. Submitting the record appends the metadata straight into the global audit timeline instantly.

### 4. 🤝 Supplier & Procurement Network
* **Vendor Directory Grid:** Tracks asset suppliers cross-referenced by service categorization, compliance validity status, and historical 1-5 star reliability weightings.
* **Targeted PO Component:** Generates customized Purchase Orders explicitly bound down to the specific Asset UUID or Ticket UUID that triggered the financial request.

---
*Designed and engineered by Mpho Precious Mashigo—redefining data-dense enterprise application resilience.*
