# UrbanCart

UrbanCart is a **demo** e-commerce website built with a Node.js/Express backend and a vanilla HTML/CSS/JS frontend. It showcases a basic storefront flow (products, cart, and authentication) plus an M-Pesa STK push integration for learning and portfolio purposes.

This project is **not production-ready** and is intended for demonstration only.

## Links

- website:https://denismunene2006-lab.github.io/e-commerce-website/
- Safaricom Daraja API docs: [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)

## Features

- Modern, responsive UI with glassmorphism effects
- Interactive product listing with categories
- Shopping cart with toast notifications
- User signup/login with password visibility toggle
- JWT auth + bcrypt
- M-Pesa checkout (STK push, sandbox-ready)
- Health check endpoint

## Tech Stack

- HTML, CSS, JavaScript
- Node.js + Express
- Safaricom Daraja API

## Project Structure

- `index.html` - main storefront
- `style.css` - styles
- `javascript.js` - frontend logic
- `server.js` - backend API
- `data/` - local data storage
- `.env.example` - environment template

## Run Locally

1. Install packages:

```bash
npm install
```

2. Create your env file:

```bash
copy .env.example .env
```

3. Update your Daraja credentials in `.env`.

4. Start the server:

```bash
npm start
```

5. Open `index.html` using a local server (for example, Live Server).

## Main API Routes

- `POST /api/register`
- `POST /api/login`
- `GET /api/me`
- `POST /api/payments/mpesa`
- `POST /api/payments/mpesa/callback`
- `GET /api/health`

## Notes

- For real STK push, use production Daraja credentials and a public callback URL.
