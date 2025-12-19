# 🥞 Full Tech Stack - Eli's Bakery E-Commerce

This document outlines the complete technology stack used in your application, from frontend to backend and infrastructure.

## 🎨 Frontend (Client-Side)

The user interface is built with a modern, high-performance React stack.

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | **React 18** | Core UI library |
| **Build Tool** | **Vite** | Fast development and optimized production builds |
| **Language** | **TypeScript** | Static typing for better code quality |
| **Routing** | **React Router v6** | Client-side navigation (SPA) |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework |
| **Components** | **Shadcn/UI** | Reusable accessible components (based on Radix UI) |
| **Animations** | **Framer Motion** | Smooth transitions and effects |
| **State Mgmt** | **TanStack Query** | Async state management for API data |
| **Forms** | **React Hook Form** | Efficient form handling |
| **Validation** | **Zod** | Schema validation for forms and data |
| **Maps** | **Google Maps API** | Address autocomplete and location display |
| **Notifications**| **Sonner** | Toast notifications |
| **Icons** | **Lucide React** | Modern SVG icons |

---

## ⚙️ Backend (Server-Side)

The server is a lightweight Node.js API that handles business logic, database interactions, and payments.

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | **Node.js** | JavaScript server runtime |
| **Framework** | **Express.js** | Web server framework for API endpoints |
| **Language** | **JavaScript (ESM)** | Server-side logic |
| **Database Driver**| **node-postgres (pg)** | PostgreSQL client (Recommended for Production) |
| **Alt Database** | **Better-SQLite3** | SQLite client (Development/Local) |
| **Payments** | **Square SDK** | Processing credit card payments |
| **Security** | **CORS** | Cross-Origin Resource Sharing configuration |
| **Environment** | **Dotenv** | Managing secrets and config |

---

## 💾 Database

The application supports two database modes:

### 1. PostgreSQL (Production Recommended) 🐘
*   **Usage:** Robust, scalable, concurrent connections.
*   **Hosting:** Railway, Neon, AWS RDS, DigitalOcean.
*   **Connection:** Uses `DATABASE_URL` connection string.

### 2. SQLite (Development/Small Scale) 🗃️
*   **Usage:** Simple, file-based, easy to set up.
*   **Limitations:** Not suitable for serverless (data loss on restart) unless using persistent volumes.
*   **File:** `backend/db/bakery.db`

---

## 🔌 Integrations & External Services

| Service | Usage |
|---------|-------|
| **Square** | Payment processing and checkout flows |
| **Google Cloud** | Places API (Address Autocomplete), Maps JavaScript API |
| **Make.com** | (Formerly Integromat) Webhooks for email/SMS notifications |
| **Email** | Currently handled via Make.com webhooks |

---

## 🏗️ Infrastructure / DevOps

| Category | Technology |
|----------|------------|
| **Frontend Host**| **Vercel** (Recommended) |
| **Backend Host** | **Railway** or **VPS** (DigitalOcean/Linode) |
| **Version Control**| **Git / GitHub** |
| **Package Manager**| **NPM** |

---

## 📂 Key Project Structure

```text
/
├── src/                  # Frontend Source
│   ├── components/       # React Components (UI, Blocks)
│   ├── pages/           # Page Views (Home, Order, Menu)
│   ├── lib/             # Utilities (API client, validation)
│   ├── contexts/        # Global State (Auth, Language)
│   └── assets/          # Images, Fonts, Videos
│
├── backend/              # Backend Source
│   ├── routes/          # API Endpoints (Orders, Payments)
│   ├── db/              # Database Connection & Schemas
│   └── server.js        # Entry Point
│
└── public/              # Static Assets (favicon, robots.txt)
```

