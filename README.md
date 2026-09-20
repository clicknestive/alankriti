# ALANKRITI COUTURE (अलंकृति)

> *"Drapes That Define, Jewellery That Inspires"*  
> *"Elegance Woven in Every Drape"*

An ultra-luxury Indian saree boutique e-commerce web application engineered with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Razorpay Payment Gateway**.

---

## 🏛️ Brand Identity & Palette

The boutique adheres strictly to the Alankriti royal heritage palette:
- **Sage Light Green**: `#A8B89A`
- **Cream / Ivory**: `#F8F1E7` / `#FAF6F0`
- **Warm Gold**: `#C6A15B` / `#826530`
- **Heritage Charcoal / Forest**: `#1C241D` / `#2A3425`

---

## ⚡ Key Architecture & Features

### 1. Customer Boutique Surface
- **Artisanal Catalog**: Dynamic filtering by collection (Kanjivaram Bridal, Mysore Silk, Banarasi Brocade, Chanderi, Organza), fabric, color, occasion, price slider, and instant keyword search.
- **Product Storytelling**: Multi-image high-resolution gallery, Silk Mark authenticity seals, blouse specifications, care instructions, and customer reviews.
- **5-Step Bespoke Checkout**: Customer Details → Insured Shipping Address → Order Summary → Payment & Authorization → Order Confirmation with printable receipt.
- **Live Patron Order Tracking**: Step-by-step dispatch workflow visualizer with Courier Partner (BlueDart, Delhivery) AWB tracking and 1-click return requests.
- **Authentication**: Secure bcrypt-hashed customer accounts, JWT sessions in `httpOnly` cookies, password reset workflows, and order history.

### 2. Isolated Administrative Console (`/admin`)
- **Strict Separation**: Zero links or references to `/admin` exist on the customer website.
- **Role-Based Authorization**: Separate `ADMIN_JWT_SECRET` and `alc_admin_token` cookie. All `/api/admin/*` endpoints strictly enforce `role === "ADMIN"`.
- **Executive Dashboard**: Real-time sales counters, monthly revenue charts, top-selling sarees, and recent activity feed.
- **Catalog Management**: Full CRUD for sarees and categories with auto-slug generation and automatic deactivation when stock hits `0`.
- **Order Logistics & Refunds**: 11-stage order lifecycle tracking, courier assignment, and 1-click Razorpay refund processing with automatic inventory restocking.
- **Compliance Audit Trail**: Every administrative action (login, price change, stock update, refund, status change) is recorded in the `AuditLog` table.

### 3. Payment & Stock Engine
- **Razorpay Integration**: Pre-order stock verification (overselling prevention), cryptographic HMAC-SHA256 signature verification, webhook synchronization, and payment records (`Payment` model).
- **Atomic Stock Management**: Decrements stock during payment settlement in a Prisma transaction, auto-deactivates zero-stock items, and automatically restocks on returns/cancellations.

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **Database & ORM**: SQLite (Dev) / PostgreSQL (Prod) via Prisma ORM
- **Payment Gateway**: Razorpay Node SDK & Razorpay Checkout.js
- **Security & Cryptography**: bcryptjs, jsonwebtoken, crypto (HMAC-SHA256)
- **Icons**: Lucide React

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js 18.x or 20.x LTS
- npm or yarn

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/alankriti-couture.git
cd alankriti
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment variables in `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="alankriti-customer-jwt-secret-key-2026"
ADMIN_JWT_SECRET="alankriti-admin-jwt-secret-key-2026"

ADMIN_USERNAME="admin@alankriticouture.com"
ADMIN_PASSWORD="AlankritiAdmin@2026"

RAZORPAY_KEY_ID="rzp_test_ALANKRITI2026"
RAZORPAY_KEY_SECRET="ALANKRITI_SECRET_KEY_2026"
RAZORPAY_WEBHOOK_SECRET="ALANKRITI_WEBHOOK_SECRET_2026"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to database
npx prisma db push

# Seed demo products, categories, reviews, orders, and admin credentials
npx ts-node prisma/seed.ts
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

### Customer Accounts
| Name | Email | Password | Role |
|---|---|---|---|
| Priyanka Sharma | `priyanka@example.com` | `Alankriti@123` | Patron (Customer) |
| Ananya Iyer | `ananya@example.com` | `Alankriti@123` | Patron (Customer) |
| Meera Reddy | `meera@example.com` | `Alankriti@123` | Patron (Customer) |

### Administrative Account
| Email | Password | Role | Console URL |
|---|---|---|---|
| `admin@alankriticouture.com` | `AlankritiAdmin@2026` | Administrator | `http://localhost:3000/admin/login` |

*Note: Administrative routes are protected. Entering wrong credentials triggers rate limiting and security audit logs.*

---

## 💳 Razorpay Gateway Configuration

1. **Dashboard Setup**: Obtain API Key ID and Key Secret from the [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys).
2. **Webhooks Setup**: Configure Webhook URL in Razorpay Dashboard:
   - **URL**: `https://your-domain.com/api/payment/razorpay/webhook`
   - **Secret**: Set matching `RAZORPAY_WEBHOOK_SECRET` in `.env`.
   - **Events**: Subscribe to `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
3. **Simulation Mode**: In development environments without active API keys, the system falls back to simulation mode allowing 1-click test checkout.

---

## 🖼️ Cloud Image Storage Setup

For production cloud storage (AWS S3 / Cloudinary / Supabase Storage):
1. Upload saree images to your S3 bucket or Cloudinary media library.
2. Ensure image domains are registered in `next.config.mjs` under `images.remotePatterns`.
3. Use the public HTTPS URLs when creating products in `/admin/products/new`.

---

## 🏗️ Production Build & Deployment

```bash
# Type check and build Next.js application
npm run build

# Start production server
npm run start
```

### Deployment Platforms:
- **Vercel**: Connect repository, set environment variables, and deploy with zero configuration.
- **AWS / Render / Railway / Docker**: Use Node.js 20 LTS runtime with PostgreSQL database.

---

## 🔒 Security & Compliance Standards

- **Passwords**: Hashed with salted bcrypt. Plain-text passwords are never stored.
- **Authentication**: Two distinct JWT tokens (`alc_auth_token` for patrons, `alc_admin_token` for admins) in secure `httpOnly` cookies.
- **Rate Limiting**: In-memory sliding window protects `/api/auth/*` and `/api/admin/auth/*` against brute-force attacks.
- **Audit Trail**: Administrative actions and transactions write immutable records to the `AuditLog` table.
- **SEO & Search Bots**: Dynamic `sitemap.xml`, `robots.txt` restricting sensitive folders, and Schema.org `Product` JSON-LD structured data.

---

## 📜 License
Proprietary & Confidential — **Alankriti Couture Private Limited**. All Rights Reserved.
