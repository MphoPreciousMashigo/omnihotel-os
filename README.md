# OmniHotel Hub (00)

Build a complete enterprise-grade, single-page Hotel Operations ERP called “OmniHotel Enterprise.” Use React, Tailwind CSS, Lucide icons, and shadcn/ui. CRITICAL: implement as a dense high-performance SPA with one unified main tabbed layout using Tabs/TabsContent, not multiple route files. Include a slate enterprise header/body style and richly cross-linked hotel mock data.

Global shell: top bar with “OmniHotel OS” logo, property selector default “Grand Resort & Casino - Main”, global UUID search filtering tickets/assets/suppliers, and role selector (Admin, Operations Manager, Fleet Supervisor). Primary tabs: Executive Overview, Issue & Query Lifecycle, Asset & Fleet Tracking, Supplier & Procurement.

Overview: KPI grid with Active SLA Breaches, Fleet Utilization %, Critical Inventory Alerts, Pending PO Approvals. Live vertical audit stream with timestamped system events and 8-character UUIDs.

Issues: toggle Kanban versus dense table. Kanban stages Open, Assigned, In Progress, Pending Supplier/Parts, Resolved. Cards show #TCK-XXXX, priority badge, department, SLA countdown, staff ID. Card click opens Sheet with full details, linked suppliers, immutable event history.

Assets: filterable dense table populated with Shuttle Vans, HVAC Units, Housekeeping Carts, Bulk Linen. Columns asset UUID/category/item/status/linked supplier/last inspection. Vehicle click opens “Log Mileage & Status” dialog and submission immediately appends to global audit stream.

Suppliers: vendor directory grid with 1-5 star reliability, contract status, active categories. Create Purchase Order button opens modal linking PO to specific Asset UUID or Ticket UUID.

Make interactions functional locally, responsive, polished, ultra-dense with compact rows, crisp borders and high-contrast status badges.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5f9f6964-7d5d-4403-aa51-1cc065568349).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
