# Odoo_Hackathon_26

# AssetFlow

**AssetFlow** is a full-stack Enterprise Asset Management System for tracking, allocating, booking, maintaining, and auditing organizational assets — from laptops to conference rooms. It was built end-to-end (schema → API → UI) as a hackathon project, with no Docker dependency required to run locally.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Seeded Login](#seeded-login)
- [Roles & Permissions](#roles--permissions)
- [Data Model Overview](#data-model-overview)
- [API Overview](#api-overview)
- [Demo Walkthrough](#demo-walkthrough)
- [Verification Checklist](#verification-checklist)
- [License](#license)

---

## Features

| Module | Description |
|---|---|
| **Organization Setup** | Manage departments (with hierarchy), asset categories with custom fields, and employees |
| **Asset Registry** | Register and track assets with tags, serial numbers, cost, condition, location, and photos |
| **Allocation & Transfer** | Allocate assets to employees with automatic conflict detection (409 on double-allocation), plus an approval-based transfer request workflow |
| **Resource Booking** | Book bookable assets (e.g. meeting rooms) with strict time-slot overlap validation |
| **Maintenance Workflow** | State-machine-driven maintenance requests (`Pending → Approved → TechnicianAssigned → InProgress → Resolved`) with automatic asset status side effects |
| **Audit Cycles** | Run scoped audit cycles, flag assets as `Missing`/`Damaged`, and cascade results into asset status on cycle close |
| **Dashboard & Reports** | Live KPIs, recent activity feed, and department/category breakdown charts |
| **Notifications** | In-app notifications for allocation, transfer, and maintenance events |

## Tech Stack

**Backend**
- Node.js 20 (LTS) + Express
- PostgreSQL + Prisma ORM
- JWT authentication, bcrypt password hashing
- morgan (logging), cors, dotenv

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Recharts (dashboard/report charts)

## Project Structure

```text
Odoo_Hackathon_26/
│
├── README.md
├── .gitignore
│
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── app.js                     # Express app
│   │   ├── server.js                  # Entry point
│   │   │
│   │   ├── config/
│   │   │   ├── prisma.js              # Prisma Client singleton
│   │   │   ├── env.js                 # Environment validation
│   │   │   └── constants.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── requireRole.js
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── asset.controller.js
│   │   │   ├── allocation.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── maintenance.controller.js
│   │   │   ├── audit.controller.js
│   │   │   └── dashboard.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── department.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── employee.routes.js
│   │   │   ├── asset.routes.js
│   │   │   ├── allocation.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── maintenance.routes.js
│   │   │   ├── audit.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── index.js               # Registers all routes
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── asset.service.js
│   │   │   ├── booking.service.js
│   │   │   ├── maintenance.service.js
│   │   │   ├── notification.service.js
│   │   │   └── audit.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── response.js
│   │   │   ├── assetTag.js
│   │   │   ├── logger.js
│   │   │   ├── notify.js
│   │   │   └── validators.js
│   │   │
│   │   └── types/
│   │       └── roles.js
│   │
│   └── API.md
│
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── api/
│       │   ├── axios.js
│       │   ├── auth.js
│       │   ├── assets.js
│       │   ├── allocation.js
│       │   ├── booking.js
│       │   ├── maintenance.js
│       │   ├── audit.js
│       │   └── dashboard.js
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       ├── hooks/
│       │   └── useAuth.js
│       │
│       ├── layouts/
│       │   └── DashboardLayout.jsx
│       │
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── cards/
│       │   ├── tables/
│       │   ├── forms/
│       │   └── common/
│       │
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── OrganizationSetupPage.jsx
│       │   ├── AssetsPage.jsx
│       │   ├── AllocationPage.jsx
│       │   ├── BookingPage.jsx
│       │   ├── MaintenancePage.jsx
│       │   ├── AuditPage.jsx
│       │   ├── ReportsPage.jsx
│       │   └── NotificationsPage.jsx
│       │
│       ├── routes/
│       │   └── AppRoutes.jsx
│       │
│       └── utils/
│           ├── formatDate.js
│           ├── formatCurrency.js
│           └── constants.js
│
└── docs/
    ├── DATABASE.md
    ├── API_FLOW.md
    └── ER_DIAGRAM.png
```

## Getting Started

### Prerequisites

Pin to these versions to avoid "works on my machine" issues:

```bash
node -v        # v20.x.x (LTS)
npm -v         # 10.x.x
git --version  # any recent version
```

If Node is missing or the wrong version:

```bash
# macOS/Linux (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 20 && nvm use 20

# Windows — download the Node 20 LTS installer:
# https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi
```

### Database Setup

No Docker required — pick one:

**Option 1 (recommended): Neon.tech free serverless Postgres**
1. Go to [neon.tech](https://neon.tech) → sign up free → create a project named `assetflow`.
2. Copy the connection string (e.g. `postgresql://user:pass@ep-xxxx.neon.tech/assetflow?sslmode=require`).

**Option 2: Local PostgreSQL install**

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt update && sudo apt install postgresql postgresql-contrib -y
sudo service postgresql start

# Windows: https://www.postgresql.org/download/windows/
```

```bash
psql -U postgres -c "CREATE DATABASE assetflow;"
# Connection string: postgresql://postgres:<password>@localhost:5432/assetflow
```

Verify connectivity:

```bash
psql "<your-connection-string>" -c "SELECT version();"
```

### Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```
DATABASE_URL="<your-connection-string>"
JWT_SECRET="change-me"
PORT=5000
```

Run migrations, seed the database, and start the API:

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

Verify the server is up:

```bash
curl http://localhost:5000/health
# {"success":true,"data":"AssetFlow API running"}
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open the printed local URL in your browser.

## Seeded Login

| Email | Password |
|---|---|
| `admin@assetflow.com` | `Admin@123` |

## Roles & Permissions

| Role | Description |
|---|---|
| `Admin` | Full access across all modules |
| `DepartmentHead` | Approves transfers and manages their department |
| `AssetManager` | Manages assets, allocations, maintenance, and audits |
| `Employee` | Requests bookings/maintenance, views assigned assets |

## Data Model Overview

Core entities (defined via Prisma):

- **Department** — supports parent/child hierarchy
- **AssetCategory** — supports custom fields via JSON
- **Employee** — role-based user accounts
- **Asset** — status-tracked (`Available`, `Allocated`, `Reserved`, `UnderMaintenance`, `Lost`, `Retired`, `Disposed`)
- **Allocation** — active/returned asset assignments
- **TransferRequest** — approval-gated ownership transfers
- **Booking** — time-boxed reservations with overlap protection
- **MaintenanceRequest** — state-machine-driven repair workflow
- **AuditCycle / AuditAssignment / AuditItem** — scoped verification cycles
- **Notification** / **ActivityLog** — user alerts and system audit trail

## API Overview

All routes are prefixed with `/api` and return `{ success, data }` or `{ success: false, error }`.

| Resource | Key Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login` |
| Departments | CRUD under `/departments` |
| Categories | CRUD under `/categories` |
| Employees | CRUD under `/employees` |
| Assets | CRUD under `/assets`, `GET /assets/:id/history` |
| Allocation | `POST /allocation/allocate`, `POST /allocation/transfer-request`, `PATCH /allocation/transfer-request/:id/approve`, `POST /allocation/return/:allocationId` |
| Booking | `POST /booking` (rejects overlapping slots with `409`) |
| Maintenance | `PATCH /maintenance/:id/status` (enforces valid state transitions) |
| Audit | `POST /audit/close/:id` (cascades flagged items into asset status) |
| Dashboard | `GET /dashboard/kpis`, `GET /activity?limit=5` |

## Demo Walkthrough

1. Sign up → admin promotes the new user to **Asset Manager**
2. Register an asset
3. Allocate it to Employee A → attempt allocating the same asset to Employee B → **409 conflict** with current holder shown
4. Approve a transfer request
5. Book Room B2 for 9:00–10:00 → attempt an overlapping 9:30–10:30 booking → **rejected**
6. Raise a maintenance request → approve it (asset flips to `UnderMaintenance`) → resolve it (asset flips back to `Available`)
7. Create an audit cycle → mark one item `Missing` → close the cycle (asset flips to `Lost`)
8. View the Dashboard for live KPIs and recent activity

## Verification Checklist

Before a demo or deployment, confirm:

- [ ] `node -v` / `npm -v` match the pinned versions
- [ ] `npx prisma studio` opens and shows populated tables
- [ ] Fresh `npm run dev` on both server and client with no console errors
- [ ] Double-allocation conflict returns `409` with current holder info
- [ ] Booking overlap rejection works (boundary case: back-to-back bookings succeed, overlapping ones don't)
- [ ] Maintenance status change updates the underlying asset status, not just the UI
- [ ] Closing an audit cycle cascades `Missing` → `Lost`
- [ ] Every sidebar page loads without a blank screen

## License

This project does not yet specify a license. Add one (e.g. MIT) if you plan to open-source it.
