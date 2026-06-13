# Simba 2.0 — Project Documentation

> **SIMBA 2.0** — Rwanda's Online Supermarket · Kigali, Rwanda

---

## 1. Project Overview

Simba 2.0 is a modern e-commerce web application built for Simba Supermarket — Rwanda's online supermarket based in Kigali. The project features a Django backend REST API and vanilla HTML/CSS/JS frontend.

---

## 2. Tech Stack

| **Layer** | **Technology** |
|---|---|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Django REST API |
| Icons | Lucide |
| Fonts | DM Sans, Syne (Google Fonts) |
| Languages | EN / FR / RW |
| Persistence | localStorage + Django REST API |

---

## 3. Project Structure

```
Simba-2.0/
├── index.html          # Home page
├── shop.html         # Product listing
├── auth.html         # Sign In / Register
├── checkout.html   # Cart checkout
├── orders.html      # Order history
├── wishlist.html   # Saved items
├── product.html    # Product detail
├── dashboard.html # Admin dashboard
├── simba_backend/  # Django API
│   ├── settings.py
│   ├── urls.py
│   └── api/v1/     # REST endpoints
└── README.md
```

---

## 4. Features

### Core Features
| Status | Feature |
|---|---|
| ✅ | 552+ products in responsive grid |
| ✅ | Category filtering and search |
| ✅ | Shopping cart with localStorage |
| ✅ | Multi-language (EN/FR/RW) |
| ✅ | Dark mode toggle |
| ✅ | Responsive design (mobile-first) |

### Pages
- **index.html** — Home page with hero, categories, branches
- **shop.html** — Product listing with filters, AI search
- **auth.html** — Sign In / Register
- **checkout.html** — Cart checkout flow
- **orders.html** — Order history
- **wishlist.html** — Saved items
- **product.html** — Product detail view
- **dashboard.html** — Admin dashboard

---

## 5. Icons

Using **Lucide** icons (https://lucide.dev) throughout the application.

| Icon | Usage |
|---|---|
| shopping-cart | Cart, Add to cart |
| moon / sun | Dark mode toggle |
| menu | Mobile menu |
| search | Search button |
| map-pin | Branch locations |
| package | Orders |
| heart | Wishlist |
| check-circle / x-circle | Stock status |
| bot | AI assistant |
| flame | Hot badge |
| gift | Free delivery |

---

## 6. Local Setup

### Frontend (Static)
Open `index.html` directly in browser or use a static server:
```bash
npx serve .
```

### Backend (Django)
```bash
cd simba_backend
python manage.py migrate
python manage.py runserver
```

API available at: `http://127.0.0.1:8000/api/v1/`

---

## 7. API Endpoints

| Endpoint | Description |
|---|---|
| `/api/v1/products/` | List all products |
| `/api/v1/products/{id}/` | Product detail |
| `/api/v1/categories/` | List categories |
| `/api/v1/orders/` | Order management |
| `/api/v1/cart/` | Cart operations |
| `/api/v1/auth/login/` | User authentication |
| `/api/v1/auth/register/` | User registration |
| `/api/v1/branches/` | Branch locations |

---

## 8. Dark Mode

Dark mode is universal across all pages using localStorage:
- Toggle persists between page navigation
- All pages share the same preference

---

## 9. Multi-Language

Languages supported:
- **EN** — English
- **FR** — French (Français)
- **RW** — Kinyarwanda (Ikinyarwanda)

Language preference saved to localStorage.

---

*Simba 2.0 · Kigali, Rwanda · Built with Django + Vanilla HTML/CSS/JS