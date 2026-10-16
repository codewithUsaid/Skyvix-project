# Skyvix.tech — Premium Tech & Electronics Store

A modern, fast, and responsive eCommerce platform for **Skyvix** (`Skyvix.tech`), built with React 19, TanStack Start, Vite, Tailwind CSS, and powered by PostgreSQL (via Supabase).

---

## 🚀 Key Features

* **Modern eCommerce Experience:** Sleek, minimal interface inspired by Apple & Amazon with responsive layouts for mobile, tablet, and desktop.
* **Product Catalog:** Real-time catalog with dynamic filtering, category sorting, search with dropdowns, and rich product detail pages.
* **Cart & Checkout:** Smooth shopping cart experience with local storage persistence and delivery boundary validation.
* **User Accounts & Auth:** Secure authentication for tracking order history, saved addresses, and profile details.
* **Database & Migrations:** Full PostgreSQL schema migrations included in the `supabase/migrations/` directory.
* **High Performance:** SSR & static route optimization powered by TanStack Start and Vite.

---

## 🛠️ Tech Stack

* **Framework:** [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router)
* **Frontend:** React 19, TypeScript
* **Styling:** [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com/), Lucide Icons
* **Database / Backend:** PostgreSQL (via Supabase client)
* **Build Tool:** [Vite](https://vitejs.dev)
* **Package Manager:** npm

---

## 📦 Getting Started

### 1. Prerequisites
* **Node.js**: v20 or v22 LTS recommended
* **npm**: v9 or higher

### 2. Installation
Clone the repository and install dependencies using npm:

```bash
git clone <repository-url>
cd skyvixstore-main
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your PostgreSQL / Supabase credentials:

```env
# Supabase / PostgreSQL Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-or-publishable-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"

# Server environment variables (SSR)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-or-publishable-key"
SUPABASE_PROJECT_ID="your-project-id"
```

### 4. Database Setup (PostgreSQL)
All database schema and initial tables are located in:
```
supabase/migrations/
```
You can run these SQL files directly in any PostgreSQL / Supabase SQL Editor to initialize tables, relations, and Row Level Security (RLS) policies.

### 5. Running the Application
Start the local development server:

```bash
npm run dev
```

The application will start locally (typically at `http://localhost:3000` or `http://localhost:5173`).

---

## 🏗️ Production Build

To build the application for production deployment:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

---

## 📂 Project Structure

```
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Brand images & banners
│   ├── components/         # Reusable UI components (Header, Footer, ProductCard, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Supabase client & database types
│   ├── lib/                # Store configuration, utils, and delivery rules
│   ├── routes/             # TanStack Start file-based routing
│   └── main.tsx            # App entry point
├── supabase/
│   └── migrations/         # PostgreSQL database migrations
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 📄 License & Credits
Developed for **Skyvix.tech**. All rights reserved.
# Skyvix-project
