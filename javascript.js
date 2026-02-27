const API_BASE = "http://localhost:4000/api";
const MPESA_RECEIVER = "0710236087";

const imagePool = [
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513116476489-7635e79feb27?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=800&q=80"
];

const namePool = [
  "Leather Jacket",
  "Wireless Headphones",
  "Smart Watch",
  "Minimal Lamp",
  "Sneakers",
  "Travel Backpack",
  "Polarized Sunglasses",
  "Gaming Mouse",
  "Mechanical Keyboard",
  "Streetwear Hoodie",
  "Desk Organizer",
  "Bluetooth Speaker",
  "Power Bank",
  "Coffee Maker",
  "Running Shorts",
  "Yoga Mat",
  "Monitor Stand",
  "Phone Case",
  "Bean Bag Chair",
  "Portable Projector"
];

const items = Array.from({ length: 240 }, (_, index) => {
  const id = index + 1;
  const baseName = namePool[index % namePool.length];
  const price = 19.99 + (index % 50) * 3 + (index % 3) * 0.99;
  return {
    id,
    name: `${baseName} ${id}`,
    price,
    img: imagePool[index % imagePool.length]
  };
});

const trending = items.slice(0, 24);
const cart = [];

const productsEl = document.getElementById("products");
const megaProductsEl = document.getElementById("megaProducts");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const authBtn = document.getElementById("authBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authMessage = document.getElementById("authMessage");
const toggleAuthMode = document.getElementById("toggleAuthMode");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const checkoutBtn = document.getElementById("checkoutBtn");
const paymentModal = document.getElementById("paymentModal");
const closePaymentModalBtn = document.getElementById("closePaymentModal");
const paymentForm = document.getElementById("paymentForm");
const paymentPhone = document.getElementById("paymentPhone");
const paymentAmount = document.getElementById("paymentAmount");
const paymentMessage = document.getElementById("paymentMessage");

let isLoginMode = true;
let currentUser = null;

function productCard(item) {
  return `
    <article class="product">
      <img src="${item.img}" alt="${item.name}" loading="lazy" />
      <h3>${item.name}</h3>
      <div class="price-row">
        <span class="price">$${item.price.toFixed(2)}</span>
        <button class="add" data-id="${item.id}">Add</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  productsEl.innerHTML = trending.map(productCard).join("");
  megaProductsEl.innerHTML = items.map(productCard).join("");
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function addToCart(id) {
  const item = items.find((product) => product.id === id);
  if (!item) return;
  cart.push(item);
  renderCart();
}

function renderCart() {
  cartCountEl.textContent = cart.length;
  cartItemsEl.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <span>${c.name}</span>
      <span>
        $${c.price.toFixed(2)}
        <button class="item-remove" data-index="${i}">X</button>
      </span>
    </div>
  `).join("");
  cartTotalEl.textContent = getCartTotal().toFixed(2);
}

function showAuthModal() {
  authModal.classList.remove("hidden");
  authModal.setAttribute("aria-hidden", "false");
}

function hideAuthModal() {
  authModal.classList.add("hidden");
  authModal.setAttribute("aria-hidden", "true");
}

function setAuthMode(loginMode) {
  isLoginMode = loginMode;
  authTitle.textContent = loginMode ? "Log In" : "Create Account";
  toggleAuthMode.textContent = loginMode ? "Create an account" : "Already have an account? Log in";
  authName.style.display = loginMode ? "none" : "block";
  authMessage.textContent = "";
}

function setAuthUI(user) {
  currentUser = user;
  if (user) {
    authStatus.textContent = `Hi, ${user.name}`;
    authBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    authStatus.textContent = "Guest";
    authBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
}

function getToken() {
  return localStorage.getItem("urbancart_token");
}

function setToken(token) {
  localStorage.setItem("urbancart_token", token);
}

function clearToken() {
  localStorage.removeItem("urbancart_token");
}

function normalizeKenyanPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  return null;
}

function setPaymentMessage(message, isError = false) {
  paymentMessage.textContent = message;
  paymentMessage.style.color = isError ? "#b42318" : "#45556f";
}

function showPaymentModal() {
  if (!cart.length) {
    setPaymentMessage("Add at least one product to the cart before payment.", true);
    cartDrawer.classList.add("open");
    return;
  }

  paymentAmount.value = Math.max(1, Math.round(getCartTotal()));
  paymentPhone.value = "";
  setPaymentMessage(`You will receive an STK prompt. Payment destination is ${MPESA_RECEIVER}.`);

  paymentModal.classList.remove("hidden");
  paymentModal.setAttribute("aria-hidden", "false");
}

function hidePaymentModal() {
  paymentModal.classList.add("hidden");
  paymentModal.setAttribute("aria-hidden", "true");
}

async function apiRequest(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
  } catch (_error) {
    throw new Error("Cannot reach auth server. Start backend on http://localhost:4000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

async function register(name, email, password) {
  return apiRequest("/register", "POST", { name, email, password });
}

async function login(email, password) {
  return apiRequest("/login", "POST", { email, password });
}

async function getMe(token) {
  return apiRequest("/me", "GET", null, token);
}

async function initiateMpesaPayment(event) {
  event.preventDefault();

  const normalizedPhone = normalizeKenyanPhoneNumber(paymentPhone.value);
  const amount = Math.round(Number(paymentAmount.value));

  if (!normalizedPhone) {
    setPaymentMessage("Use a valid Kenyan number like 07XXXXXXXX.", true);
    return;
  }

  if (!Number.isFinite(amount) || amount < 1) {
    setPaymentMessage("Amount must be at least 1.", true);
    return;
  }

  try {
    setPaymentMessage("Sending M-Pesa prompt...");
    const result = await apiRequest("/payments/mpesa", "POST", {
      phoneNumber: normalizedPhone,
      amount,
      cartItems: cart.length
    }, getToken());

    const checkoutId = result.checkoutRequestId ? ` Ref: ${result.checkoutRequestId}` : "";
    setPaymentMessage(`${result.message || "M-Pesa prompt sent. Check your phone."}${checkoutId}`);
  } catch (error) {
    setPaymentMessage(error.message || "Payment initiation failed.", true);
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const name = authName.value.trim();
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    authMessage.textContent = "Email and password are required.";
    return;
  }

  if (!isLoginMode && !name) {
    authMessage.textContent = "Name is required for signup.";
    return;
  }

  try {
    authMessage.textContent = "Please wait...";
    const result = isLoginMode
      ? await login(email, password)
      : await register(name, email, password);

    setToken(result.token);
    setAuthUI(result.user);
    authForm.reset();
    hideAuthModal();
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

async function loadCurrentUser() {
  const token = getToken();
  if (!token) {
    setAuthUI(null);
    return;
  }

  try {
    const result = await getMe(token);
    setAuthUI(result.user);
  } catch (_error) {
    clearToken();
    setAuthUI(null);
  }
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add");
  if (addButton) {
    addToCart(Number(addButton.dataset.id));
    return;
  }

  const removeButton = event.target.closest(".item-remove");
  if (removeButton) {
    cart.splice(Number(removeButton.dataset.index), 1);
    renderCart();
  }
});

document.getElementById("cartBtn").addEventListener("click", () => cartDrawer.classList.add("open"));
document.getElementById("closeCart").addEventListener("click", () => cartDrawer.classList.remove("open"));
authBtn.addEventListener("click", showAuthModal);
closeAuthModal.addEventListener("click", hideAuthModal);
toggleAuthMode.addEventListener("click", () => setAuthMode(!isLoginMode));
authForm.addEventListener("submit", handleAuthSubmit);
logoutBtn.addEventListener("click", () => {
  clearToken();
  setAuthUI(null);
});
authModal.addEventListener("click", (event) => {
  if (event.target === authModal) hideAuthModal();
});

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", showPaymentModal);
}
if (closePaymentModalBtn) {
  closePaymentModalBtn.addEventListener("click", hidePaymentModal);
}
if (paymentForm) {
  paymentForm.addEventListener("submit", initiateMpesaPayment);
}
if (paymentModal) {
  paymentModal.addEventListener("click", (event) => {
    if (event.target === paymentModal) hidePaymentModal();
  });
}

setAuthMode(true);
renderProducts();
renderCart();
loadCurrentUser();
