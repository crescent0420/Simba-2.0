# Simba 2.0 — Project Documentation

> **SIMBA 2.0** — Rwanda's Online Supermarket · Kigali, Rwanda · Built for A2SV Competition

| **552** Products | **9** Categories | **3** Languages | **1** HTML File |
|---|---|---|---|

---

## 1. Project Overview

Simba 2.0 is a modern, production-ready e-commerce web application built for Simba Supermarket — Rwanda's online supermarket based in Kigali. The project was developed as a single-file React application using a zero-build-step architecture, making it instantly deployable with no configuration required.

The app was built for the A2SV Competition and demonstrates real-world e-commerce functionality tailored specifically to the Rwandan market — with local currency (RWF), MTN Mobile Money payment simulation, and full Kinyarwanda language support.

---

## 2. Tech Stack

| **Layer** | **Technology** | **Notes** |
|---|---|---|
| Framework | React 18 | Loaded via CDN — no npm install needed |
| Styling | Tailwind CSS | CDN version with custom config for Simba brand colors |
| State Management | React Hooks | useState, useMemo, useCallback, useEffect |
| Persistence | localStorage | Cart survives page refresh automatically |
| Typography | Plus Jakarta Sans | Google Fonts — modern, warm, readable |
| Data | JSON (552 products) | simba_products.json loaded via fetch() |
| Dev Server | serve (npm) | npx serve . — zero config local server |
| Deployment | Netlify / Vercel | Drag-and-drop deploy, no build step |

---

## 3. Project Structure

The entire application ships as just two files:

```
simba2/
├── index.html            ← Complete React app (all components, styles, logic)
├── simba_products.json   ← 552 products across 9 categories
└── README.md             ← This document
```

Inside `index.html`, the code is organized into these React components:

- **ProductCard** — individual product tile with image, price, add-to-cart button and stock badge
- **CartDrawer** — sliding cart panel with quantity controls and order total
- **ProductModal** — full-screen product detail view on click
- **CheckoutPage** — multi-step checkout: delivery form → MoMo PIN → success screen
- **App** — root component managing all state, filters, search, routing and dark mode

---

## 4. Features Implemented

### 4.1 Core Features

| | **Feature** | **Status** | **Description** |
|---|---|---|---|
| 🏪 | Product Display | Done | 552 products in responsive grid, grouped by 9 categories |
| 🔍 | Search | Done | Instant name search with clear button, no page reload |
| 🗂 | Category Tabs | Done | Scrollable tabs with icons and colour-coded banners |
| ⚙️ | Filters Sidebar | Done | In-stock toggle, dynamic price range slider, sort dropdown |
| 🛒 | Cart System | Done | Add/remove/update qty, subtotal, persisted to localStorage |
| 📱 | Responsive Design | Done | Mobile-first: 2-column on phone, auto-fill grid on desktop |

### 4.2 Bonus Features

| | **Feature** | **Status** | **Description** |
|---|---|---|---|
| 📄 | Product Detail Modal | Done | Click any card to open large image, price, stock, add-to-cart |
| 🧾 | Checkout Flow | Done | Delivery form with name, phone number and Kigali address |
| 💛 | MTN MoMo Payment | Done | Simulated PIN entry, progress bar, success confirmation |
| 🌍 | Multi-Language | Done | English, French, Kinyarwanda — all UI strings translated |
| 🌙 | Dark Mode | Done | Toggle persists within session, full UI adaptation |
| 🖼 | Category Banners | Done | Unsplash photos change with selected category |
| ✨ | Animations | Done | Card hover lift, cart bounce, slide-in drawer, fade-in modals |
| 🏷 | Product Badges | Done | NEW and HOT labels, cart quantity overlays on cards |

---

## 5. Fixes & Improvements Made During Development

| **Issue Found** | **Fix Applied** |
|---|---|
| Category tab names not translating | Added `categoryLabels` lookup object keyed by language code |
| Price slider max hardcoded at 1,000,000 RWF | Replaced with dynamic `actualMax` derived from product data via `useMemo` |
| Kinyarwanda 'Sort by' label incorrect (Rtangiraho) | Updated translation to correct Kinyarwanda: 'Tegura ukurikije' |
| Footer category names not translated | Applied `categoryLabels[lang][c]` lookup in footer as well |

---

## 6. Local Setup (Windows + VSCode)

> **Prerequisites:** Windows 10/11, VSCode, Node.js v24+ installed. If Node is not recognized after install, restart VSCode or reboot your PC.

### Step 1 — Install Node.js

Download the LTS installer from [nodejs.org](https://nodejs.org) and run it with all defaults. After installing, restart VSCode.

### Step 2 — Set up project folder

Unzip `simba2_app.zip` and place both `index.html` and `simba_products.json` in the same folder. Open that folder in VSCode via **File > Open Folder**.

### Step 3 — Install the serve package

Open the VSCode terminal with `` Ctrl + ` `` and run:

```bash
npm install -g serve
```

### Step 4 — Start the server

```bash
serve .
```

Then open your browser and navigate to:

```
http://localhost:3000
```

### Stop the server

Press `Ctrl + C` in the terminal to stop the local server.

---

## 7. Deployment

https://simbav20.vercel.app/

### Vercel

```bash
npm install -g vercel
cd simba2_app && vercel --prod
```

### GitHub Pages

1. Push the `simba2_app` folder to a GitHub repository
2. Go to **Settings > Pages** and set source to the main branch
3. Site goes live at `https://crescent0420.github.io/simba2/`

---

## 8. Future Improvement Ideas

- **Real product images** — replace placeholder images with actual product photography
- **Backend API** — add a Django or Node.js API layer for real order management
- **User authentication** — SMS OTP sign-in via MTN Rwanda or Airtel API
- **Real MoMo integration** — connect to MTN Rwanda's official MoMo API
- **PWA support** — add a service worker for offline browsing and home screen install
- **Delivery tracking** — integrate with Yego or SafeMotos API for real-time tracking
- **Admin dashboard** — inventory management panel for supermarket staff
- **Fuzzy search** — integrate Fuse.js for typo-tolerant product search
- **Product reviews** — allow customers to rate and review products
- **Promotions engine** — discount codes, bundle deals, flash sales

---

## 9. Product Data

The dataset (`simba_products.json`) contains 552 real products from Simba Supermarket Kigali. Each product record includes:

| **Field** | **Type** | **Example** |
|---|---|---|
| id | Integer | 23419 |
| name | String | The Macallan 18yr Double Cask Whiskey 700ml |
| price | Float (RWF) | 750,000.00 |
| category | String | Alcoholic Drinks |
| subcategoryId | Integer | 234 |
| inStock | Boolean | true |
| image | URL | https://placehold.co/300x300/... |
| unit | String | Pcs |

---

## 10. Product Categories

| | **Category** | **Examples** |
|---|---|---|
| 🍯 | Food Products | Honey varieties, corned beef, chicken sausage |
| 🍷 | Alcoholic Drinks | Beer (Skol, Primus), wines, whisky, gin, champagne |
| 💄 | Cosmetics & Personal Care | Shampoo, soap, deodorant, body lotion, razors |
| 🧹 | Cleaning & Sanitary | Fabric softeners, mops, brushes, cleaning tools |
| ⚡ | Kitchenware & Electronics | Irons, kettles, frying pans, extension sockets |
| 👶 | Baby Products | Baby milk formula (Nestle Lactogen) |
| 💪 | Sports & Fitness | Massage roller |
| ✏️ | Stationery | Photocopy paper, scotch tape |
| 📦 | General | Water bottles, storage items |

---

*Simba 2.0 · Kigali, Rwanda · Built with React + Tailwind 