# Simba 2.0 — Phase 1 Changes & Verification

Phase 1 goal: make the app actually run, fix authentication end-to-end, close the
staff-authorization hole, and remove the dual-backend confusion. Verified with an
in-process test (`smoke_test.py`): **21/21 passing**, plus frontend-payload checks.

## Decisions taken
- **Canonical backend = the split apps** (`users`/`products`/`orders`/`payments`).
  The orphaned `api` app was moved to `_quarantine/` (delete it once you're happy).
- **Login accepts phone, email, OR username** via a single `login` field, so the
  existing forms work without forcing an identity choice yet. Registration requires
  phone and auto-generates a username if none is supplied.

## Backend changes
- `simba_backend/settings.py` — env-driven `SECRET_KEY` / `DEBUG` / `ALLOWED_HOSTS`;
  CORS is permissive only in DEBUG (and no longer combines credentials with a
  wildcard); access-token lifetime cut from 7 days to 30 min with refresh rotation;
  full password-validator set restored (min length 8, common/numeric checks);
  basic logging; request throttling. (Pagination intentionally deferred to Phase 2.)
- `users/serializers.py` — `UserCreateSerializer` now accepts the frontend payload
  (optional username, optional password_confirm, required phone, unique-phone check,
  real password validation). New `SimbaTokenObtainPairSerializer` authenticates on
  phone/email/username and returns the user object.
- `users/views.py` — `RegisterView` now returns `{access, refresh, user}` so the
  client is logged in on signup. New `SimbaTokenObtainPairView` for login.
- `users/urls.py` — login routed to the new flexible token view.
- `users/permissions.py` (new) — `IsRepOrAdmin` / `IsAdmin` keyed off `user.role`.
- `orders/views.py` — all four `Rep*` views now require `IsRepOrAdmin`
  (previously any logged-in buyer could read all customers' PII and mutate orders).
- `orders/urls.py` — **fixed URL ordering**: literal routes (`create/`, `rep/`,
  `rep/dashboard/`) now precede the `<str:number>/` catch-all. Previously
  `/orders/create/` resolved to order-detail (405) and `/orders/rep/` to
  detail-with-number="rep" (404), so order creation and the rep list never worked.
- `products/models.py` — removed the `discount_percent` field that was shadowed by a
  same-named property; added a `has_discount` property; guarded divide-by-zero.
- `products/serializers.py` — `has_discount` now resolves correctly and the list
  endpoint exposes `current_price` + `discount_percent`; removed dead method.
- `products/management/commands/seed_products.py` (new) — seeds the REAL `products`
  models from `simba_products.json` (the old seed targeted the dead `api` app and
  hardcoded a Windows path). Usage: `python manage.py seed_products [--limit N]`.
- `requirements.txt` — added the missing `djangorestframework-simplejwt` and
  `django-cors-headers` (plus pinned PyJWT); the project now installs from scratch.
- `.gitignore` (new) — stops committing `db.sqlite3`, `.venv/`, `__pycache__`, `.env`.

## Frontend changes
- `js/services.js` — API base is now configurable (`window.SIMBA_API_BASE`); login
  sends the flexible `login` field; added a `RepService` (order ops wired; product
  CRUD is an honest Phase-3 stub since no canonical endpoint exists yet).
- `js/api.js` — fixed the footer that referenced undefined globals and **threw on
  load** (which had been breaking every page); aliases now point at `window.Services`.
- `auth.html` — corrected the API prefix (`/api/auth/` → `/api/v1/auth/`), switched
  the login payload to the `login` field, fixed the post-register auto-login, and
  aligned the password minimum to 8.

## Not done in Phase 1 (as planned)
- Real payment flow (Phase 3), coupons (Phase 3), pagination + N+1 fixes (Phase 2),
  rep product-management endpoints (Phase 3), Postgres/prod hosting (Phase 4), and an
  automated test suite (Phase 5). `smoke_test.py` is a stopgap, not that suite.

## How to run
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py seed_products           # or --limit 60 for a quick subset
    python manage.py createsuperuser         # optional, for /admin
    python manage.py runserver
Then open http://127.0.0.1:8000/ . To re-run the verification: `python smoke_test.py`.

## Known follow-ups surfaced while testing
- The login form is labelled "email" but the backend now accepts phone/email/username.
  Decide the canonical identity and update the label/validation accordingly.
- `_quarantine/api/` can be deleted once confirmed.
