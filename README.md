# UrbanCart

A simple e-commerce website I built with a Node.js backend.

It includes:
- Product listing and cart
- User signup/login
- M-Pesa checkout (STK push)

## Stack

- HTML, CSS, JavaScript
- Node.js + Express
- JWT auth + bcrypt
- Safaricom Daraja API

## Files

- `index.html` - main storefront
- `style.css` - styles
- `javascript.js` - frontend logic
- `server.js` - backend API
- `.env.example` - env template

## Run Locally

1. Install packages:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Update your Daraja credentials in `.env`.

4. Start server:

```bash
npm start
```

5. Open `index.html` using a local server (like Live Server).

## Main API Routes

- `POST /api/register`
- `POST /api/login`
- `GET /api/me`
- `POST /api/payments/mpesa`
- `POST /api/payments/mpesa/callback`
- `GET /api/health`

## Note

For real STK push, use production Daraja credentials and a public callback URL.
