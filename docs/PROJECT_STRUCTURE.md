# Project Structure - Sora POS

## Tổng quan

```
sora-pos/
├── frontend/           # React + Vite + TypeScript
├── backend/            # Express + TypeScript
├── database/           # PostgreSQL schema & seed
├── docs/               # Documentation
├── README.md           # Hướng dẫn chung
└── .gitignore
```

## Frontend Structure

```
frontend/src/
├── assets/             # Hình ảnh, icons
├── components/
│   ├── common/         # Button, Modal, Table, Loading...
│   ├── layout/         # Sidebar, MainLayout
│   ├── pos/            # Cart, ProductCard...
│   ├── dashboard/      # StatCard, Charts...
│   ├── products/       # ProductForm, ProductList...
│   └── forms/          # Input, Select, DatePicker...
├── pages/
│   ├── auth/           # LoginPage
│   ├── dashboard/      # DashboardPage
│   ├── pos/            # POSPage
│   ├── products/       # ProductsPage
│   ├── categories/     # CategoriesPage
│   ├── suppliers/      # SuppliersPage
│   ├── customers/      # CustomersPage
│   ├── orders/         # OrdersPage
│   ├── stock/          # StockPage
│   ├── reports/        # ReportsPage
│   └── ai/             # AIRecommendationsPage
├── routes/             # ProtectedRoute
├── services/           # Axios API instances
├── stores/             # Zustand stores (auth, cart)
├── types/              # TypeScript interfaces
├── validations/        # Zod schemas
├── utils/              # Helper functions
├── App.tsx             # Router setup
└── main.tsx            # Entry point
```

## Backend Structure

```
backend/src/
├── config/             # env, supabase, groq configs
├── controllers/        # Request handlers (thin layer)
├── services/           # Business logic
├── routes/             # Express routes + index
├── middlewares/         # auth, role, validate, error
├── validations/        # Zod schemas
├── types/              # TypeScript interfaces
├── utils/              # response, calculate, pdf, qr
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## Nguyên tắc thiết kế

1. **Controller → Service**: Controller chỉ gọi service, không chứa business logic
2. **Middleware chain**: authMiddleware → roleMiddleware → validateMiddleware → controller
3. **Type-safe**: Mọi thứ đều có TypeScript type/interface
4. **Validation**: Zod schema validate ở cả frontend (form) và backend (middleware)
5. **State management**: Zustand cho global state (auth, cart)
6. **API abstraction**: Axios instance với interceptor cho auth token
