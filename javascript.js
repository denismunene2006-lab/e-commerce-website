const API_BASE = "http://localhost:4000/api";
const MPESA_RECEIVER = "0710236087";

const categories = [
  {
    id: "fashion",
    title: "Fashion",
    items: [
      { name: "Leather Jacket", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80" },
      { name: "Urban Sneakers", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
      { name: "Chic Handbag", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" },
      { name: "Winter Coat", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" },
      { name: "Summer Heels", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" },
      { name: "Denim Jeans", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "tech",
    title: "Electronics",
    items: [
      { name: "Wireless Headphones", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
      { name: "Smart Watch", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
      { name: "Gaming Mouse", img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80" },
      { name: "Mechanical Keyboard", img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
      { name: "Bluetooth Speaker", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80" },
      { name: "DSLR Camera", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "home",
    title: "Home",
    items: [
      { name: "Minimal Lamp", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
      { name: "Succulent Plant", img: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80" },
      { name: "Comfort Chair", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80" },
      { name: "Ceramic Vase", img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80" },
      { name: "Desk Organizer", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80" }
    ]
  }
];

const adjectives = ["Pro", "Max", "Ultra", "Lite", "Classic", "Modern", "Sleek", "Premium", "Elite", "Core"];

const items = Array.from({ length: 72 }, (_, index) => {
  const category = categories[index % categories.length];
  // Pick item from the new object structure ensuring name/img match
  const itemTemplate = category.items[Math.floor(index / categories.length) % category.items.length];
  const variant = adjectives[index % adjectives.length];

  return {
    id: index + 1,
    name: `${variant} ${itemTemplate.name}`,
    category: category.title,
    price: 19.99 + (index % 15) * 5 + (Math.random() * 10),
    img: itemTemplate.img,
    rating: (4 + Math.random()).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 10
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
const togglePassword = document.getElementById("togglePassword");
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
      <div class="product-img-wrap">
        <img src="${item.img}" alt="${item.name}" loading="lazy" />
        <span class="category-badge">${item.category}</span>
      </div>
      <div class="product-details">
        <div class="product-header">
          <h3>${item.name}</h3>
          <div class="rating"><i class="ri-star-fill"></i> ${item.rating} <span class="reviews">(${item.reviews} reviews)</span></div>
        </div>
        <div class="price-row">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="add" data-id="${item.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function renderProducts() {
  productsEl.innerHTML = trending.map(productCard).join("");
  megaProductsEl.innerHTML = items.map(productCard).join("");
  document.querySelectorAll('.product').forEach(el => observer.observe(el));
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="ri-checkbox-circle-fill"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function addToCart(id) {
  const item = items.find((product) => product.id === id);
  if (!item) return;
  cart.push(item);
  showToast(`Added ${item.name} to cart`);
  renderCart();
}

function renderCart() {
  cartCountEl.textContent = cart.length;
  cartItemsEl.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <span>${c.name}</span>
      <span>
        $${c.price.toFixed(2)}
        <button class="item-remove" data-index="${i}"><i class="ri-delete-bin-line"></i></button>
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
togglePassword.addEventListener("click", () => {
  const type = authPassword.getAttribute("type") === "password" ? "text" : "password";
  authPassword.setAttribute("type", type);
  togglePassword.innerHTML = type === "password" ? '<i class="ri-eye-line"></i>' : '<i class="ri-eye-off-line"></i>';
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

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("siteNav");
const navBackdrop = document.getElementById("navBackdrop");

function setNavOpen(open) {
  if (!menuToggle || !siteNav) return;
  siteNav.classList.toggle("nav-open", open);
  if (navBackdrop) {
    navBackdrop.hidden = !open;
  }
  menuToggle.classList.toggle("nav-open", open);
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  document.body.classList.toggle("nav-locked", open);
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    setNavOpen(!siteNav.classList.contains("nav-open"));
  });
  if (navBackdrop) {
    navBackdrop.addEventListener("click", () => setNavOpen(false));
  }
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });
}

setAuthMode(true);
renderProducts();
renderCart();
loadCurrentUser();
