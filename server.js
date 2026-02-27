require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

const USERS_FILE = path.join(__dirname, "data", "users.json");
const TRANSACTIONS_FILE = path.join(__dirname, "data", "mpesa-transactions.json");

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const MPESA_BASE_URL = MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const MPESA_PARTY_B = process.env.MPESA_PARTY_B || MPESA_SHORTCODE;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "";
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://example.com/api/payments/mpesa/callback";
const MPESA_TRANSACTION_TYPE = process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline";
const MPESA_RECEIVER_MSISDN = formatKenyanPhoneNumber(process.env.MPESA_RECEIVER_MSISDN || "0710236087") || "254710236087";

app.use(cors());
app.use(express.json());

function ensureDataFiles() {
  const folder = path.dirname(USERS_FILE);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
  }

  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, "[]", "utf8");
  }
}

function readJsonArray(filePath) {
  ensureDataFiles();
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function writeJsonArray(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function readUsers() {
  return readJsonArray(USERS_FILE);
}

function writeUsers(users) {
  writeJsonArray(USERS_FILE, users);
}

function readTransactions() {
  return readJsonArray(TRANSACTIONS_FILE);
}

function writeTransactions(transactions) {
  writeJsonArray(TRANSACTIONS_FILE, transactions);
}

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid auth token." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Token expired or invalid." });
  }
}

function formatKenyanPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  return null;
}

function makeTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function httpsJsonRequest(url, { method = "GET", headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers }, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        let data = {};
        if (responseBody) {
          try {
            data = JSON.parse(responseBody);
          } catch (_error) {
            data = { raw: responseBody };
          }
        }

        resolve({
          statusCode: res.statusCode || 500,
          data
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function getMissingMpesaConfig() {
  const missing = [];
  if (!MPESA_CONSUMER_KEY) missing.push("MPESA_CONSUMER_KEY");
  if (!MPESA_CONSUMER_SECRET) missing.push("MPESA_CONSUMER_SECRET");
  if (!MPESA_PASSKEY) missing.push("MPESA_PASSKEY");
  if (!MPESA_SHORTCODE) missing.push("MPESA_SHORTCODE");
  if (!MPESA_CALLBACK_URL) missing.push("MPESA_CALLBACK_URL");
  return missing;
}

async function getMpesaAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const { statusCode, data } = await httpsJsonRequest(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  );

  if (statusCode < 200 || statusCode >= 300 || !data.access_token) {
    throw new Error(data.errorMessage || "Could not get M-Pesa access token.");
  }

  return data.access_token;
}

async function initiateStkPush({ phoneNumber, amount, accountReference, transactionDesc }) {
  const timestamp = makeTimestamp();
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");
  const accessToken = await getMpesaAccessToken();

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: MPESA_TRANSACTION_TYPE,
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: MPESA_PARTY_B,
    PhoneNumber: phoneNumber,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  };

  const { statusCode, data } = await httpsJsonRequest(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(data.errorMessage || data.ResponseDescription || `M-Pesa request failed (${statusCode}).`);
  }

  return data;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const users = readUsers();
  const existing = users.find((user) => user.email === email);
  if (existing) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  return res.status(201).json({
    token: createToken(user),
    user: sanitizeUser(user)
  });
});

app.post("/api/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();
  const user = users.find((entry) => entry.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    token: createToken(user),
    user: sanitizeUser(user)
  });
});

app.get("/api/me", authMiddleware, (req, res) => {
  const users = readUsers();
  const user = users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.post("/api/payments/mpesa", async (req, res) => {
  const missing = getMissingMpesaConfig();
  if (missing.length) {
    return res.status(500).json({
      message: `M-Pesa configuration is incomplete: ${missing.join(", ")}`
    });
  }

  const phoneNumber = formatKenyanPhoneNumber(req.body.phoneNumber);
  const amount = Math.round(Number(req.body.amount));

  if (!phoneNumber) {
    return res.status(400).json({ message: "Use a valid Kenyan phone number (07XXXXXXXX)." });
  }

  if (!Number.isFinite(amount) || amount < 1) {
    return res.status(400).json({ message: "Amount must be at least 1." });
  }

  try {
    const accountReference = `URBANCART-${Date.now()}`;
    const transactionDesc = `Pay to ${MPESA_RECEIVER_MSISDN}`;

    const stkResponse = await initiateStkPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc
    });

    const transactions = readTransactions();
    transactions.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      amount,
      payerPhone: phoneNumber,
      receiverPhone: MPESA_RECEIVER_MSISDN,
      checkoutRequestId: stkResponse.CheckoutRequestID || null,
      merchantRequestId: stkResponse.MerchantRequestID || null,
      responseCode: stkResponse.ResponseCode || null,
      responseDescription: stkResponse.ResponseDescription || null,
      customerMessage: stkResponse.CustomerMessage || null,
      status: "PENDING"
    });
    writeTransactions(transactions);

    return res.json({
      message: stkResponse.CustomerMessage || "M-Pesa prompt sent. Complete payment on your phone.",
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      receiverPhone: MPESA_RECEIVER_MSISDN
    });
  } catch (error) {
    return res.status(502).json({ message: error.message || "Failed to initiate M-Pesa payment." });
  }
});

app.post("/api/payments/mpesa/callback", (req, res) => {
  const callback = req.body && req.body.Body && req.body.Body.stkCallback;
  if (!callback) {
    return res.status(400).json({ message: "Invalid callback payload." });
  }

  const transactions = readTransactions();
  const index = transactions.findIndex(
    (entry) => entry.checkoutRequestId === callback.CheckoutRequestID
  );

  const metadataItems = callback.CallbackMetadata && callback.CallbackMetadata.Item
    ? callback.CallbackMetadata.Item
    : [];

  const metadata = {};
  metadataItems.forEach((item) => {
    metadata[item.Name] = item.Value;
  });

  if (index >= 0) {
    transactions[index] = {
      ...transactions[index],
      callbackReceivedAt: new Date().toISOString(),
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
      metadata,
      status: callback.ResultCode === 0 ? "SUCCESS" : "FAILED"
    };
    writeTransactions(transactions);
  }

  return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
  ensureDataFiles();
  console.log(`UrbanCart API running on http://localhost:${PORT}`);
});
