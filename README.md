# UrbanCart E-Commerce Website

UrbanCart is a full-stack e-commerce website with:
- Modern storefront UI
- Product catalog + cart drawer
- User authentication (register, login, profile)
- M-Pesa STK Push payment initiation

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Auth: JWT + bcrypt
- Payment: Safaricom Daraja (M-Pesa STK Push)
- Storage: JSON files in `data/` (simple local storage)

## Project Structure

- `index.html` - storefront and modals
- `style.css` - UI styles
- `javascript.js` - frontend app logic (catalog, cart, auth, payment calls)
- `server.js` - API server (auth + M-Pesa)
- `data/` - runtime JSON storage (`users.json`, `mpesa-transactions.json`)
- `.env.example` - environment variable template

## Prerequisites

- Node.js 18+ (includes npm)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Update `.env` values, especially M-Pesa credentials.

4. Start backend API:

```bash
npm start
```

5. Open `index.html` with a local server (for example VS Code Live Server).

## Environment Variables

From `.env.example`:

- `PORT` - API port (default `4000`)
- `JWT_SECRET` - JWT signing secret
- `MPESA_ENV` - `sandbox` or `production`
- `MPESA_CONSUMER_KEY` - Daraja app consumer key
- `MPESA_CONSUMER_SECRET` - Daraja app consumer secret
- `MPESA_SHORTCODE` - business shortcode
- `MPESA_PARTY_B` - usually same as shortcode for STK push
- `MPESA_PASSKEY` - Daraja Lipa Na M-Pesa passkey
- `MPESA_CALLBACK_URL` - public callback endpoint URL
- `MPESA_TRANSACTION_TYPE` - usually `CustomerPayBillOnline`
- `MPESA_RECEIVER_MSISDN` - receiver number (currently `0710236087`)

## API Endpoints

### Auth
- `POST /api/register`
- `POST /api/login`
- `GET /api/me`

### Payment
- `POST /api/payments/mpesa` - initiate STK push
- `POST /api/payments/mpesa/callback` - Daraja callback endpoint

### Utility
- `GET /api/health`

## Notes for M-Pesa

- In `sandbox`, real phone prompts are not guaranteed on a live handset.
- For production STK push, use valid live Daraja credentials and approved business setup.
- `MPESA_CALLBACK_URL` must be publicly reachable (not localhost).

## Git Workflow

```bash
git add .
git commit -m "Update project"
git push
```

