# Simba 2.0 — Phase 2 (Path A): static frontend deploy + simulated checkout

This step makes the shopper-facing app deployable to Vercel as a static site and
gives it a working, client-side **simulated checkout** (no backend required).

## What changed in this step

1. **Security — leaked key removed** (`Simba-2.0/shop.html`)
   - The hardcoded Groq API key was removed; AI search now degrades to the existing
     client-side keyword search when no key is present.
   - ⚠️ **You must still REVOKE/ROTATE that key in your Groq dashboard** — it was
     already shipped in the zip, so treat it as compromised.

2. **Simulated checkout** (`Simba-2.0/js/checkout.js`, new; wired into `checkout.html`)
   - Renders the cart (from `localStorage.simba_cart`) into the order summary.
   - Pickup branch + delivery-slot selection.
   - Name/phone validation (Rwandan mobile format).
   - 30% deposit model (deposit now via "MoMo", balance on delivery) — this is the
     scalable hook for real MoMo later.
   - MoMo-style PIN entry + simulated payment progress.
   - Generates an order reference, **persists a simulated order** to
     `localStorage.simba_orders`, clears the cart, and shows the confirmation screen.
   - No network/backend calls — works fully on a static deploy.

3. **Vercel static config** (`Simba-2.0/vercel.json`, new)
   - Basic security headers + asset caching for the static site.

## Deploy to Vercel (static frontend)

The repo root contains `manage.py`, so Vercel's zero-config would otherwise try to
deploy the **Django backend**. To deploy the **static frontend** instead:

**Option A — Dashboard (recommended)**
1. Push this repo to GitHub.
2. In Vercel: New Project → import the repo.
3. **Set "Root Directory" to `Simba-2.0`** (the inner folder with `index.html`).
   This is the critical setting — it makes Vercel see only the static files.
4. Framework Preset: **Other** (no build step). Build/Output can be left empty.
5. Deploy. Your public URL serves `index.html`.

**Option B — Vercel CLI**
```bash
cd Simba-2.0/Simba-2.0      # the inner static folder (has index.html + vercel.json)
vercel deploy --prod
```

## What works on the static deploy
- Catalog, category browse, search, filtering, cart (add/update/remove, persisted)
- Multi-language (EN/FR/RW), dark mode
- **Simulated checkout + order confirmation**

## What is intentionally deferred to the backend track
- Real login / accounts and server-stored orders (static deploy has no API)
- Real MoMo integration (the deposit/PIN flow is simulated; architecture is ready)
- Bringing back AI search **safely** (proxy the key through the backend)
- `orders.html` reading `simba_orders` for an order-history view (next small step)

## Note
This step was verified by static syntax checks and by serving the folder locally and
confirming every page returns HTTP 200 with no backend running. The checkout flow has
not been clicked through in a real browser here — please do a quick manual run after
deploy (add items → checkout → enter name/phone → PIN → confirmation).
