RiccoRide project -

We are moving to next js project in /nextjs-app as last one / root project is not capable . 
this is kept only for reference now. 


===

PROJECT: RiccoRide - Cab Service Accounts

  ---
  1. TECH STACK

  - HTML/CSS/JS (Vanilla) - SPA architecture
  - Supabase (PostgreSQL cloud database)
  - LocalStorage (session/backup)
  - Vite (build tool)

  ---
  2. AUTHENTICATION

  - Simple credential-based login
  - 24-hour session management
  - LocalStorage session tracking
  - Auto-logout on expiry

  ---
  3. MASTER DATA (4 Entities)

  Vehicles:
  - Name, Registration Number
  - Type: Sedan/SUV/Hatchback/Tempo Traveller/Bus
  - Owner: Own/Partner
  - Status: Active/Inactive/Under Maintenance

  Drivers:
  - Name, Phone, Status (Active/Inactive)

  Companies:
  - Name, Contact Person, Phone, Email, Address, Status

  Vendors:
  - Name, Contact Person, Phone, Commission %, Status

  ---
  4. TRIP TYPES (Core Logic)

  | Type       | Cost Formula                       | Key Fields
   |
  |------------|------------------------------------|----------------------------------------    
  -|
  | Company    | Driver + Fuel + Maintenance        | Company, Start/End DateTime, Total Days    
   |
  | Individual | Driver + Fuel + Maintenance + Toll | Client Name/Phone
   |
  | Outsource  | Vendor Share + Toll                | Vendor Name, Manual Vehicle Entry
   |

  Key Distinction:
  - Company trips: Toll/Parking NOT deducted (reimbursed)
  - Outsource: No driver/fuel/maintenance costs

  ---
  5. TRIP DATA FIELDS

  - Date, Route, Route Type (Local/Outstation)
  - Vehicle (dropdown or manual text)
  - Driver (dropdown)
  - Kilometre, Description
  - Payment, Payment Method (Online/Cash/UPI/Card)
  - Driver Cost, Fuel Cost, Maintenance, Toll/Parking
  - Vendor Share (outsource only)
  - Client Name/Phone (individual/outsource)
  - Company + Date Range (company trips)

  ---
  6. PROFIT CALCULATION

  Outsource:  Payment - (VendorShare + Toll)
  Company:    Payment - (Driver + Fuel + Maintenance)
  Individual: Payment - (Driver + Fuel + Maintenance + Toll)

  ---
  7. DASHBOARD STATS

  - Today's Trip Count
  - Monthly Revenue (sum of payments)
  - Monthly Profit (revenue - costs)
  - Active Vehicles Count
  - Recent 5 Trips Display

  ---
  8. REPORTS & ANALYTICS

  Summary: Total Revenue, Cost Breakdown, Net Profit, Trip Type Stats

  Vehicle Performance: Trips, Distance, Revenue, Costs, Profit per vehicle

  Company Analysis: Trips, Revenue, Profit per company

  Monthly Analysis: Year-wise month breakdown chart

  Filters: Date Range Presets (Today/This Month/Last Month/Year/All Time), Trip Type, Vehicle    

  ---
  9. UI SCREENS

  - Dashboard (home)
  - Add Trip (with real-time profit calculator)
  - Trips List (filter/view/edit/delete)
  - Manage Data (4 tabs: Vehicles/Drivers/Companies/Vendors)
  - Reports (5 sections with filters)

  ---
  10. KEY FEATURES

  - Real-time profit preview before saving trip
  - Quick-add modals (vehicle/driver from trip form)
  - Conditional form fields based on trip type
  - CSV export for detailed reports
  - Color-coded profit display (green/red)
  - Only Active items in dropdowns
  - Modal-based CRUD operations

  ---
  11. DATABASE TABLES

  trips, vehicles, drivers, companies, vendors

  Field Mapping: camelCase (JS) ↔ snake_case (DB)

  ---
  12. BUSINESS INSIGHTS TRACKED

  - Trip profitability (per trip/per type)
  - Vehicle performance & utilization
  - Company-wise revenue/profit
  - Cost trends (fuel/driver/maintenance)
  - Payment method distribution
  - Distance metrics (per vehicle/company)
  - Monthly/yearly revenue patterns

  ---