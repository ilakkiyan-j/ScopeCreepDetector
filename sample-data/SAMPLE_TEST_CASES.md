# ALXO Scope Creep Ledger — Sample Test Cases Guide

This guide provides ready-to-use sample test cases, form field values, and conversation thread files for testing the **ALXO Scope Creep Ledger** analysis pipeline.

---

## 📁 Sample Conversation Files Location

All test files are stored locally in the repository at:
`sample-data/conversations/`

Available sample files:
1. `ecommerce-web-dev.txt` — Web & E-Commerce Development Scenario
2. `mobile-app-design.txt` — UI/UX & Mobile App Design Scenario
3. `saas-content-campaign.txt` — Copywriting & Content Marketing Scenario
4. `sample-whatsapp-redesign.txt` — Benchmark WhatsApp Chat Export Scenario

---

## 🧪 Test Case 1: Web & E-Commerce Development (INR Currency)

### Form Values to Fill in "New Analysis" Page (`/app/analysis/new`):

| Field | Sample Value |
|---|---|
| **Project Name** | `Nexus Storefront Redesign` |
| **Client / Company** | `Nexus Retail Ltd` |
| **Your Role** | `Web / Software Developer` |
| **Hourly Rate** | `2500` |
| **Rate Currency** | `INR — Indian Rupee` |

### Original Baseline Scope (Paste into Textarea):
```text
Develop 4 responsive e-commerce pages: Home, Product Catalog, Product Detail, and Contact Us.
Includes 1 round of revisions.
Includes standard Razorpay payment gateway integration.
Excludes custom ERP inventory synchronization, multi-currency auto-conversion, customer loyalty rewards portal, and custom mobile app API endpoints.
Budget: ₹1,500,000 at ₹2,500/hr. Timeline: 4 weeks.
```

### Conversation File to Upload:
- **File**: `sample-data/conversations/ecommerce-web-dev.txt`
- **Detected Scope Creep Items Expected**:
  1. Customer loyalty rewards portal (`3 hrs` / `₹7,500`)
  2. Live 2-way SAP ERP inventory sync (`8 hrs` / `₹20,000`)
  3. Second revision round on Product Detail page (`1.5 hrs` / `₹3,750`)
  4. Multi-currency auto-conversion dropdown (`2.5 hrs` / `₹6,250`)
  5. Third revision round on Homepage hero banner (`1.5 hrs` / `₹3,750`)
  6. Custom mobile app API auth endpoint (`3 hrs` / `₹7,500`)

---

## 🧪 Test Case 2: UI/UX & Mobile App Design (USD Currency)

### Form Values to Fill in "New Analysis" Page (`/app/analysis/new`):

| Field | Sample Value |
|---|---|
| **Project Name** | `Aura Pay Mobile App UI` |
| **Client / Company** | `Aura Pay Inc` |
| **Your Role** | `UI/UX & Designer` |
| **Hourly Rate** | `50` |
| **Rate Currency** | `USD — US Dollar` |

### Original Baseline Scope (Paste into Textarea):
```text
Design Figma wireframes and high-fidelity screens for 5 core user flows: Onboarding, Dashboard, Send Money, Transaction History, and User Settings.
Includes 1 design revision round per screen in Light Mode.
Excludes dark mode variants, interactive Lottie micro-animations, app store marketing banners, and additional revision rounds.
```

### Conversation File to Upload:
- **File**: `sample-data/conversations/mobile-app-design.txt`
- **Detected Scope Creep Items Expected**:
  1. Dark mode screens for all 5 flows (`5 hrs` / `$250`)
  2. Lottie micro-animations for transaction icons (`3 hrs` / `$150`)
  3. Second revision round on Dashboard (`1.5 hrs` / `$75`)
  4. App Store & Google Play promo banners (`2 hrs` / `$100`)
  5. Third revision round on Onboarding (`1.5 hrs` / `$75`)

---

## 🧪 Test Case 3: Copywriting & Content Marketing (GBP Currency)

### Form Values to Fill in "New Analysis" Page (`/app/analysis/new`):

| Field | Sample Value |
|---|---|
| **Project Name** | `SaaS Onboarding Copy Campaign` |
| **Client / Company** | `CloudSync Technologies` |
| **Your Role** | `Copywriter & Content` |
| **Hourly Rate** | `45` |
| **Rate Currency** | `GBP — British Pound` |

### Original Baseline Scope (Paste into Textarea):
```text
Write high-converting website copy for 3 landing pages (Homepage, Pricing, Features) and a 5-part email onboarding welcome sequence.
Includes 1 copy revision round.
Excludes LinkedIn ad copy variations, 2,000-word SEO articles, developer API technical documentation, and extra revision rounds.
```

### Conversation File to Upload:
- **File**: `sample-data/conversations/saas-content-campaign.txt`
- **Detected Scope Creep Items Expected**:
  1. 10 LinkedIn ad copy variations (`2.5 hrs` / `£112.50`)
  2. 2,000-word SEO keyword article (`4 hrs` / `£180.00`)
  3. Second revision round on Pricing page (`1.5 hrs` / `£67.50`)
  4. Developer API technical documentation (`5 hrs` / `£225.00`)
  5. Third revision round on email tone (`1.5 hrs` / `£67.50`)

---

## ⚡ 1-Click Benchmark Sample Thread

If you prefer testing instantly without uploading files:
1. Navigate to `/app/analysis/new` (or click **"New Analysis"** in the workspace header).
2. Click **"Load benchmark sample thread"**.
3. All fields and sample WhatsApp conversation text will be populated automatically!
4. Click **"Stage and analyze conversation"** to generate the scope creep ledger.
