# ShopMaster ERP 🛒

A micro-small ERP (Enterprise Resource Planning) system tailored for small local retail shops such as supermarkets, fancy stores, mobile shops, and local retail businesses.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **MySQL**, and **Prisma ORM**.

---

## 🌟 Key Features & Scope

1. **Billing Counter**: Quick creation of **GST** and **Non-GST** bills.
2. **Historical Profit Preservation**: `BillItem` snapshots purchase price and selling price at time of sale so future product price updates do not distort historical financial reports.
3. **Inventory & Low-Stock Alerts**: Real-time stock tracking with configurable low-stock thresholds.
4. **Expense Management**: Categorized daily store operational expenses (`CURRENT`, `EB`, `SALARY`, `OTHER`).
5. **Real-time Profit & Loss**: Precise calculation:
   - **Gross Profit**: `Total Sales - Cost of Goods Sold (COGS)`
   - **Net Profit**: `Gross Profit - Total Expenses`
6. **Customer Management**: Phone directory for instant bill sharing.
7. **WhatsApp Integration Ready**: Direct WhatsApp link generation for customer bills and automated daily 9 PM profit summaries.
8. **Role-Based Security**: Structure for `OWNER` and `CASHIER` roles with password hashing (`bcryptjs`).

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Components & Actions
- **Database**: MySQL
- **ORM**: Prisma ORM v6
- **Icons**: Lucide React
- **Validation**: Zod
- **Security**: BcryptJS password hashing

---

## 📋 Prerequisites

- **Node.js**: `v18.x` or `v20.x` or higher (Tested on `v24.20.0`)
- **NPM**: `v9.x` or higher
- **MySQL Database Server**: Running locally or hosted (e.g. MySQL 8.0+)

---

## 🚀 Environment Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Configure your MySQL connection string in `.env`:

   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/shopmaster"
   NEXTAUTH_SECRET="your-super-secret-key"
   WHATSAPP_API_URL="https://api.whatsapp.com/v1/messages"
   WHATSAPP_API_TOKEN="your_whatsapp_api_token"
   ```

---

## 📦 Installation & Setup Commands

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client Types

```bash
npx prisma generate
```

### 3. Run Database Migrations (Requires running MySQL server)

```bash
npx prisma migrate dev --name init
```

### 4. Seed Database with Realistic Retail Data

```bash
npx prisma db seed
```

---

## 💻 Development & Build Commands

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run TypeScript Verification & Build

```bash
npm run build
```

---

## 📁 Project Structure

```text
ShopMaster/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx           # Retail Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Main App Shell (Sidebar + Header + MobileNav)
│   │   ├── dashboard/page.tsx     # KPI metrics & quick previews
│   │   ├── billing/page.tsx       # Billing Counter placeholder
│   │   ├── products/page.tsx      # Products & Stock management placeholder
│   │   ├── expenses/page.tsx      # Daily Expenses module placeholder
│   │   ├── reports/page.tsx       # Dynamic P&L Reports placeholder
│   │   ├── customers/page.tsx     # Customer directory placeholder
│   │   └── settings/page.tsx      # Shop profile & GST configuration placeholder
│   ├── globals.css                # Tailwind directives
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Redirect to /dashboard
├── components/
│   ├── ui/                        # Reusable primitives (Button, Card, Input, Badge)
│   └── layout/                    # Layout structure (Sidebar, Header, MobileNav)
├── lib/
│   ├── prisma.ts                  # Next.js safe Prisma singleton
│   ├── calculations.ts            # Accurate INR money & profit logic
│   ├── whatsapp.ts                # WhatsApp URL generator & message formatter
│   ├── auth.ts                    # Password hashing helper
│   └── validations/               # Zod input schemas
├── prisma/
│   ├── schema.prisma              # MySQL database models
│   └── seed.ts                    # Seed script with realistic Indian shop data
├── types/
│   └── index.ts                   # DTOs & TypeScript definitions
├── .env.example                   # Environment variable blueprint
└── README.md
```

---

## 🔑 Seeded Demo Credentials

- **Owner**: `owner@shopmaster.in` / `owner123`
- **Cashier 1**: `cashier1@shopmaster.in` / `cashier123`
- **Cashier 2**: `cashier2@shopmaster.in` / `cashier123`
