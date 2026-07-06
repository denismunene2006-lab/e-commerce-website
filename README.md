# 🛒 UrbanCart — Full-Stack E-Commerce Demo.

**UrbanCart** is a full-stack e-commerce demo application built with vanilla HTML, CSS, and JavaScript on the frontend, backed by a Node.js/Express REST API. It showcases core e-commerce functionality — product browsing, search & category filtering, cart management, JWT-based authentication, and M-Pesa payment integration (live Daraja STK push **or** built-in simulation for local demos).

> ⚠️ This project is **not production-ready**. It is intended for **learning, experimentation, and portfolio**.

---

## 🚀 Demo (Static Frontend)

The frontend is hosted on **GitHub Pages**:

🔗 [https://denismunene2006-lab.github.io/e-commerce-website/](https://denismunene2006-lab.github.io/e-commerce-website/)

> ℹ️ The static Pages build **cannot** talk to `localhost`, so cart, signup, payments, and the full catalog API require running the server locally (see [Run Locally](#-run-locally)).

---

## ✨ Features

### Frontend
- **Responsive UI** — Hero section, category tiles, trending grid, mega catalog, newsletter signup, and support section
- **Product Catalog** — Search by keyword, filter by category chips, scroll-to-filter from category tiles
- **Shopping Cart** — Add/remove items, quantity controls (+/−), empty state, overlay backdrop, toast notifications
- **Auth UI** — Signup and login modals; Bearer token stored in memory and sent on authenticated requests

### Backend API (Node.js/Express)
- **User Management** — Signup with bcrypt password hashing, login returning a JWT, protected `/api/me` endpoint
- **Payments** — M-Pesa STK push via Safaricom Daraja API when credentials are configured; **demo simulation** when they are not (see [M-Pesa Demo Simulation](#-m-pesa-demo-simulation))
- **Health & Meta Endpoints** — `GET /api/health` (liveness), `GET /api/meta` (reports `mpesaConfigured` and `demoPayments` flags)

---

## 🧰 Tech Stack

| Layer              | Technology                                                     |
|--------------------|----------------------------------------------------------------|
| Frontend           | HTML5, CSS3, Vanilla JavaScript                                |
| Backend            | Node.js, Express                                               |
| Authentication     | bcryptjs + JSON Web Tokens (jsonwebtoken)                      |
| Payments           | Safaricom Daraja API (optional — sandbox or production)        |
| Dependencies       | `bcryptjs`, `cors`, `dotenv`, `express`, `jsonwebtoken`        |

---

## 📁 Project Structure

```
├── index.html          # Storefront markup
├── style.css           # Styles
├── javascript.js       # Frontend logic (API base URL auto-resolves for localhost)
├── server.js           # Express REST API + static file serving
├── package.json        # Node manifest
├── .env.example        # Safe template — copy to .env (never committed)
├── .gitignore
└── data/
    ├── .gitkeep        # Ensures data/ directory is tracked
    ├── users.json      # Persisted user records (gitignored)
    └── mpesa-transactions.json  # Transaction log (gitignored)
```

---

## 🔐 Environment & Secrets

**Never commit `.env`.** The `.gitignore` already excludes `.env` and variants like `.env.local`.

### Quick setup

Copy the template and edit as needed:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

### Required variables

| Variable       | Description                                    |
|----------------|------------------------------------------------|
| `PORT`         | Server port (default `4000`)                   |
| `JWT_SECRET`   | **Strong random string** for token signing     |

### Daraja (M-Pesa) variables — optional

See `.env.example` for the full list. When these are populated, the server uses the real Safaricom Daraja STK push flow.

---

## 💳 M-Pesa Demo Simulation

If Daraja credentials are **missing or incomplete**, the server automatically falls back to **demo mode**:

- Records a simulated transaction to `data/mpesa-transactions.json`
- Returns a success response immediately
- **No real SMS or payment is sent**

To **disable** simulation and require real Daraja credentials, add this to your `.env`:

```
MPESA_DISABLE_DEMO_STUB=true
```

When this flag is set, checkout will fail if Daraja keys are not fully configured.

---

## 🏃 Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- npm (ships with Node.js)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/denismunene2006-lab/e-commerce-website.git
   cd e-commerce-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   copy .env.example .env
   ```
   Open `.env` and set `JWT_SECRET` to a strong random value.

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open in your browser:**
   [http://localhost:4000](http://localhost:4000)

> The API and static frontend are served from the **same process** on a single port.

---

## 🌐 API Reference

| Method | Path                               | Auth Required | Description                          |
|--------|------------------------------------|---------------|--------------------------------------|
| GET    | `/api/health`                      | ❌            | Liveness check                       |
| GET    | `/api/meta`                        | ❌            | Returns `mpesaConfigured` + `demoPayments` flags |
| POST   | `/api/register`                    | ❌            | Create a new user                    |
| POST   | `/api/login`                       | ❌            | Authenticate & receive JWT           |
| GET    | `/api/me`                          | ✅ Bearer     | Get current user info                |
| POST   | `/api/payments/mpesa`              | ❌            | Initiate STK push (or demo stub)     |
| POST   | `/api/payments/mpesa/callback`     | ❌            | Daraja webhook (needs public URL)    |

---

## 📝 Important Notes

- **Real STK Push** — Requires sandbox or production Daraja credentials and a **public** `MPESA_CALLBACK_URL` that Safaricom can reach (use tools like ngrok for local testing).
- **Runtime Data** — Files under `data/*.json` are created at runtime and ignored by Git (`.gitignore`).
- **Secrets** — Keep all secrets in `.env` only. Never commit them to version control.
- **API Base URL** — The frontend automatically detects when it's served from `localhost:4000` and resolves API calls to the same origin. When opened via `file://` or another port, it defaults to `http://localhost:4000/api`.

---

## 🤝 Contributing

This is a personal demo project, but contributions, suggestions, and bug reports are welcome! Feel free to open an [issue](https://github.com/denismunene2006-lab/e-commerce-website/issues) or submit a pull request.

---

## ⭐ Support

If you find this project useful or interesting, please **star** the repo on GitHub — it helps a lot!

[⭐ Star on GitHub](https://github.com/denismunene2006-lab/e-commerce-website)

---

Made with ❤️ by [Denis Munene](https://github.com/denismunene2006-lab)
