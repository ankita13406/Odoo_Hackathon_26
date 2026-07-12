# Odoo_Hackathon_26


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