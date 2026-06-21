# UrbanCart🛒

UrbanCart is a **demo** e-commerce site: a vanilla HTML/CSS/JS storefront with a Node.js/Express API. It covers browsing, search and category filters, cart, JWT auth (signup/login), and M-Pesa–style checkout (Safaricom Daraja when configured, otherwise a **built-in simulation** for local demos).

This project is **not production-ready** and is intended for learning and portfolios only.

## Demo link (static preview)🔗

GitHub Pages hosts the frontend only:

- https://denismunene2006-lab.github.io/e-commerce-website/

For cart, signup, payments, and the catalog API together, **run the server locally** (see below). The static Pages build cannot talk to `localhost`.

## Documentation

- [Safaricom Daraja API](https://developer.safaricom.co.ke/)

## Features

- Responsive UI (hero, categories, trending + mega catalog, support section, newsletter)
- Catalog search and category chips; category tiles scroll to filtered catalog
- Shopping cart with quantity controls (+/−), empty state, overlay backdrop, and toast feedback
- User signup/login (bcrypt + JWT); optional Bearer token used when present
- M-Pesa: real STK push when Daraja env vars are set; **demo simulation** when they are missing (see below)
- `GET /api/health`, `GET /api/meta`, static site + API on one port when you use `npm start`

## Tech stack

- HTML, CSS, JavaScript
- Node.js, Express
- Safaricom Daraja (optional; sandbox or production credentials)

## Project structure

| Path | Purpose |
|------|--------|
| `index.html` | Storefront markup |
| `style.css` | Styles |
| `javascript.js` | UI logic (API URL resolves for `localhost`) |
| `server.js` | REST API + static file hosting |
| `data/` | Local JSON persistence (ignored by Git except `.gitkeep`) |
| `.env.example` | **Safe template** — copy to `.env` (never committed) |

## Environment and secrets

- **Never commit `.env`.** It is listed in `.gitignore` along with variants like `.env.local`.
- Duplicate the template:

```bash
copy .env.example .env
```

(On macOS/Linux: `cp .env.example .env`.)

Then edit `.env` with your `JWT_SECRET` and, if you use live M-Pesa, your Daraja values. Variables are documented in `.env.example`.

### M-Pesa demo simulation

If Daraja credentials are **incomplete**, the server completes checkout in **demo mode** (records a simulated transaction and returns success). No SMS is sent.

To **disable** simulation and require real credentials instead, set in `.env`:

```env
MPESA_DISABLE_DEMO_STUB=true
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and adjust values (`JWT_SECRET` at minimum).

3. Start the API and serve the storefront from the same process:

```bash
npm start
```

4. Open **http://localhost:4000** (or use the `PORT` in your `.env`).

You can still open `index.html` via another static server, but API calls default to **http://localhost:4000** when the page is not served from port `4000`.

## Main API routes

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/health` | Liveness |
| GET | `/api/meta` | `mpesaConfigured`, `demoPayments` flags |
| POST | `/api/register` | Create user |
| POST | `/api/login` | Returns JWT |
| GET | `/api/me` | Current user (Bearer token) |
| POST | `/api/payments/mpesa` | Initiate STK or demo stub |
| POST | `/api/payments/mpesa/callback` | Daraja webhook (needs public URL for real flows) |

## Notes

- For a real STK push you need sandbox or production Daraja credentials and a **public** `MPESA_CALLBACK_URL` reachable by Safaricom.
- Files under `data/*.json` are runtime data and are ignored by Git; keep secrets only in `.env`.

---

If you find this demo useful, consider starring the repo⭐🌟.
