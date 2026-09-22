# ShopMaster ERP — Production Deployment Guide 🚀

This document outlines the step-by-step instructions for deploying **ShopMaster ERP** to production environments (Vercel, Railway, AWS, or custom servers) connected to a production MySQL database.

---

## 📋 System Requirements

- **Node.js**: `v18.x`, `v20.x`, or `v24.x` (LTS recommended)
- **Database**: MySQL `8.0+` (AWS RDS, PlanetScale, Railway MySQL, or self-hosted)
- **Hosting Platform**: Vercel (recommended for native Vercel Cron support)

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env` in production and configure the following variables:

```env
# 1. Database Connection String (MySQL)
DATABASE_URL="mysql://username:password@your-mysql-host:3306/shopmaster"

# 2. Application Security Secret
NEXTAUTH_SECRET="your-32-character-random-secret-key"

# 3. WhatsApp Business API Credentials (Optional - Defaults to SIMULATED MODE if omitted)
WHATSAPP_API_URL="https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages"
WHATSAPP_API_TOKEN="your_whatsapp_bearer_token"

# 4. Scheduled Cron Job Security Secret
WHATSAPP_CRON_SECRET="your_secure_cron_auth_token"
```

> [!CAUTION]
> **Security Notice**: Never commit `.env` or hardcode API keys into source control. All secrets must remain server-side.

---

## 🗄 Database Initialization & Migrations

### 1. Execute Production Database Migration

Do NOT use `prisma migrate reset` or `prisma db push` in production. Run:

```bash
npx prisma migrate deploy
```

This applies the schema (`User`, `ShopSettings`, `Product`, `Customer`, `Bill`, `BillItem`, `Expense`, `DailyReportLog`) to MySQL.

### 2. Seed Initial Demo / Shop Settings (Development / Staging Only)

```bash
npx prisma db seed
```

> [!NOTE]
> Seeded demo accounts:
> - Owner: `owner@shopmaster.in` / `owner123`
> - Cashier 1: `cashier1@shopmaster.in` / `cashier123`

---

## ⏰ Automated 9 PM IST WhatsApp Report (Vercel Cron)

The scheduled nightly report is configured via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-profit",
      "schedule": "30 15 * * *"
    }
  ]
}
```

- **Cron Path**: `/api/cron/daily-profit`
- **UTC Schedule**: `15:30 UTC` = **21:00 IST (9:00 PM IST)**
- **Authentication**: Include header `Authorization: Bearer <WHATSAPP_CRON_SECRET>` or query parameter `?secret=<WHATSAPP_CRON_SECRET>`.
- **Duplicate Prevention**: Logged in `DailyReportLog` table with unique constraint on `reportDate` (`YYYY-MM-DD`).

---

## 💬 WhatsApp Integration Modes

1. **Customer Bill Sharing (Feature A)**:
   - Uses `generateWhatsAppBillUrl()` to generate web link `https://wa.me/91...` for cashier one-click dispatch.
2. **Owner Daily Report (Feature B)**:
   - **Simulated Mode**: If `WHATSAPP_API_URL` or `WHATSAPP_API_TOKEN` are not set, reports are formatted and logged safely in simulated mode.
   - **Live Provider Mode**: If credentials are set, executes HTTP POST request to the configured WhatsApp API.

---

## 🛡 Security & Database Backup Recommendations

1. **Database Backups**: Configure automated daily snapshots/backups on your MySQL host (e.g. AWS RDS automated backups or `mysqldump` cron).
2. **Cron Endpoint Security**: Ensure `WHATSAPP_CRON_SECRET` is set in Vercel environment settings to block unauthorized manual triggers.
3. **Role Enforcement**: Cashier accounts cannot view owner financial profit reports or alter WhatsApp settings.

---

## 🔧 Production Build Verification

Verify code quality and build before deploying:

```bash
# 1. Lint check
npm run lint

# 2. TypeScript type check
npx tsc --noEmit

# 3. Prisma schema check
npx prisma validate

# 4. Production build
npm run build
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `P1001: Can't reach database server` | MySQL server is offline or port 3306 blocked | Verify MySQL service status and firewall settings. |
| `401 Unauthorized` on Cron Route | Missing or mismatched `WHATSAPP_CRON_SECRET` | Pass `Authorization: Bearer <WHATSAPP_CRON_SECRET>` in request headers. |
| Report status `SIMULATED` | WhatsApp credentials not set in `.env` | Add valid `WHATSAPP_API_URL` and `WHATSAPP_API_TOKEN` in production env. |
