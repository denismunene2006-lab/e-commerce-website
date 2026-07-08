function resolveApiBase() {
  const { hostname, protocol, port, origin } = window.location;
  if (protocol === "file:") return "http://localhost:4000/api";
  if ((hostname === "localhost" || hostname === "127.0.0.1") && port === "4000") return `${origin}/api`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:4000/api";
  return `${origin}/api`;
}

const API_BASE = resolveApiBase();
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
  const itemTemplate = category.items[Math.floor(index / categories.length) % category.items.length];
  const variant = adjectives[index % adjectives.length];
  const price = 19.99 + (index % 15) * 5 + ((index * 13) % 80) / 10;
  const rating = Math.min(4.9, 4 + (((index * 7) % 10) / 10));
  const reviews = 20 + ((index * 31) % 480);

  return {
    id: index + 1,
    name: `${variant} ${itemTemplate.name}`,
    category: category.title,
    price: Math.round(price * 100) / 100,
    img: itemTemplate.img,
    rating: rating.toFixed(1),
    reviews
  };
});

const trending = items.slice(0, 24);
const cart = [];
const CART_STORAGE_KEY = "urbancart_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    parsed.forEach((entry) => {
      const product = items.find((p) => p.id === entry.id);
      if (!product) return;
      const quantity = Math.max(1, Math.floor(Number(entry.quantity)) || 1);
      cart.push({ ...product, quantity });
    });
  } catch (_error) {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

function saveCart() {
  const payload = cart.map(({ id, quantity }) => ({ id, quantity }));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

let megaCategoryFilter = "";
let megaSearchQuery = "";
let megaSortBy = "default";

const productsEl = document.getElementById("products");
const megaProductsEl = document.getElementById("megaProducts");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
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
const paymentSubmitBtn = document.getElementById("paymentSubmitBtn");
const paymentItemCount = document.getElementById("paymentItemCount");
const demoPayHint = document.getElementById("demoPayHint");

const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterHint = document.getElementById("newsletterHint");

const catalogSearch = document.getElementById("catalogSearch");
const catalogCount = document.getElementById("catalogCount");
const catalogSort = document.getElementById("catalogSort");

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
          <button type="button" class="add" data-id="${item.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function showToast(message, variant = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${variant}`;
  const icon =
    variant === "error"
      ? "ri-error-warning-fill"
      : variant === "neutral"
      ? "ri-information-fill"
      : "ri-checkbox-circle-fill";
  toast.innerHTML = `<i class="${icon}" aria-hidden="true"></i> ${message}`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 280);
  }, 3200);
}

function megaFilteredItems() {
  const q = megaSearchQuery.trim().toLowerCase();
  return items.filter((item) => {
    const catOk = !megaCategoryFilter || item.category === megaCategoryFilter;
    const searchOk =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return catOk && searchOk;
  });
}

function sortCatalogItems(list) {
  const sorted = [...list];
  switch (megaSortBy) {
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
      break;
    default:
      sorted.sort((a, b) => a.id - b.id);
  }
  return sorted;
}

function observeProductCards(scope) {
  scope.querySelectorAll(".product").forEach((el) => observer.observe(el));
}

function renderTrendingProducts() {
  productsEl.innerHTML = trending.map(productCard).join("");
  observeProductCards(productsEl);
}

function renderMegaProducts() {
  const list = sortCatalogItems(megaFilteredItems());
  catalogCount.textContent =
    list.length === items.length
      ? `Showing all ${list.length} products`
      : `Showing ${list.length} of ${items.length} products`;

  if (!list.length) {
    megaProductsEl.innerHTML = `
      <div class="catalog-empty" role="status">
        <i class="ri-search-eye-line" aria-hidden="true"></i>
        <p>No products match your search or filter.</p>
        <button type="button" class="btn btn-outline catalog-reset">Clear filters</button>
      </div>
    `;
    return;
  }

  megaProductsEl.innerHTML = list.map(productCard).join("");
  observeProductCards(megaProductsEl);
}

function setCartOpen(open) {
  cartDrawer.classList.toggle("open", open);
  if (cartBackdrop) {
    cartBackdrop.hidden = !open;
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function addToCart(id) {
  const item = items.find((product) => product.id === id);
  if (!item) return;
  const existing = cart.find((entry) => entry.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  showToast(`Added ${item.name} to cart`);
  renderCart();
}

function renderCart() {
  const count = cart.length;
  cartCountEl.textContent = count;
  checkoutBtn.disabled = count === 0;
  checkoutBtn.classList.toggle("is-disabled", count === 0);

  if (!count) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty" role="status">
        <i class="ri-shopping-bag-3-line" aria-hidden="true"></i>
        <p>Your cart is empty.</p>
        <p class="cart-empty-hint">Browse trending or the catalog, then use <strong>Add to Cart</strong>.</p>
        <a href="#shop" class="btn btn-outline cart-empty-cta">Browse products</a>
      </div>
    `;
    cartTotalEl.textContent = "0.00";
    saveCart();
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (c, i) => `
    <div class="cart-item">
      <span class="cart-item-name">${c.name}</span>
      <div class="cart-item-meta">
        <span class="cart-item-qty">
          <button type="button" class="qty-btn" data-action="dec" data-index="${i}" aria-label="Decrease quantity for ${c.name}">−</button>
          <span class="qty-value">${c.quantity}</span>
          <button type="button" class="qty-btn" data-action="inc" data-index="${i}" aria-label="Increase quantity for ${c.name}">+</button>
        </span>
        <span>$${(c.price * c.quantity).toFixed(2)}</span>
        <button type="button" class="item-remove" data-index="${i}" aria-label="Remove ${c.name}"><i class="ri-delete-bin-line" aria-hidden="true"></i></button>
      </div>
    </div>
  `
    )
    .join("");
  cartTotalEl.textContent = getCartTotal().toFixed(2);
  saveCart();
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
  paymentMessage.classList.toggle("auth-message-error", isError);
}

async function loadPaymentMeta() {
  if (!demoPayHint) return;
  try {
    const res = await fetch(`${API_BASE}/meta`);
    const data = await res.json();
    if (data.demoPayments) {
      demoPayHint.textContent = "(Demo: server will simulate success without live M-Pesa keys.)";
      demoPayHint.classList.remove("hidden");
    } else {
      demoPayHint.textContent = "";
      demoPayHint.classList.add("hidden");
    }
  } catch (_e) {
    demoPayHint.textContent = "(Start API on :4000 for checkout.)";
    demoPayHint.classList.remove("hidden");
  }
}

function showPaymentModal() {
  if (!cart.length) {
    showToast("Your cart is empty — add something first.", "error");
    return;
  }

  paymentAmount.value = Math.max(1, Math.round(getCartTotal()));
  paymentPhone.value = "";
  paymentItemCount.textContent = String(cart.length);
  setPaymentMessage(`You’ll pay to ${MPESA_RECEIVER}. Use a valid Safaricom number for STK in live mode.`);
  loadPaymentMeta();

  paymentModal.classList.remove("hidden");
  paymentModal.setAttribute("aria-hidden", "false");
}

function hidePaymentModal() {
  paymentModal.classList.add("hidden");
  paymentModal.setAttribute("aria-hidden", "true");
}

// Local Storage Order Management
function saveOrderToLocalStorage(result, amount, phone) {
  const savedOrders = JSON.parse(localStorage.getItem("urbancart_orders") || "[]");
  const newOrder = {
    id: result.checkoutRequestId || `DEMO_CO_${Date.now()}`,
    date: new Date().toISOString(),
    amount: amount,
    payerPhone: phone,
    status: result.demo ? "COMPLETED" : "PENDING",
    items: [...cart], // Copy current cart items
    userEmail: currentUser ? currentUser.email : "guest"
  };
  savedOrders.unshift(newOrder);
  localStorage.setItem("urbancart_orders", JSON.stringify(savedOrders));
}

function renderDashboard() {
  const profileNameEl = document.getElementById("profileName");
  const profileEmailEl = document.getElementById("profileEmail");
  const profileStatusBadgeEl = document.getElementById("profileStatusBadge");
  const ordersListEl = document.getElementById("ordersList");

  if (!profileNameEl || !profileEmailEl || !ordersListEl) return;

  if (currentUser) {
    profileNameEl.textContent = currentUser.name;
    profileEmailEl.textContent = currentUser.email;
    profileStatusBadgeEl.textContent = "Verified Member";
    profileStatusBadgeEl.style.background = "rgba(16, 185, 129, 0.15)";
    profileStatusBadgeEl.style.color = "#10b981";
  } else {
    profileNameEl.textContent = "Guest User";
    profileEmailEl.textContent = "guest@urbancart.demo";
    profileStatusBadgeEl.textContent = "Guest Session";
    profileStatusBadgeEl.style.background = "rgba(107, 114, 128, 0.15)";
    profileStatusBadgeEl.style.color = "var(--muted)";
  }

  const allOrders = JSON.parse(localStorage.getItem("urbancart_orders") || "[]");
  const userEmail = currentUser ? currentUser.email : "guest";
  const userOrders = allOrders.filter(order => order.userEmail === userEmail);

  if (!userOrders.length) {
    ordersListEl.innerHTML = `
      <div class="no-orders-hint">
        <i class="ri-history-line"></i>
        <p>No orders found in this session.</p>
        <p class="cart-empty-hint">Completed payments will show up here.</p>
      </div>
    `;
    return;
  }

  ordersListEl.innerHTML = userOrders.map((order, index) => {
    const dateFormatted = new Date(order.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const statusClass = order.status === "COMPLETED" ? "completed" : order.status === "PENDING" ? "pending" : "failed";
    const statusText = order.status === "COMPLETED" ? "Success" : order.status === "PENDING" ? "Pending" : "Failed";
    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return `
      <div class="order-item">
        <div class="order-info">
          <span class="order-date">${dateFormatted}</span>
          <span class="order-meta">${itemsCount} item${itemsCount > 1 ? "s" : ""} · Ref: ${order.id}</span>
        </div>
        <div class="order-actions-wrap">
          <span class="order-status-badge ${statusClass}">${statusText}</span>
          <span class="order-total font-semibold">$${order.amount.toFixed(2)}</span>
          <button type="button" class="view-receipt-btn" data-index="${index}">View Receipt</button>
        </div>
      </div>
    `;
  }).join("");
}

function showReceipt(order) {
  const receiptContentEl = document.getElementById("receiptContent");
  if (!receiptContentEl) return;

  const dateFormatted = new Date(order.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHtml = order.items.map(item => `
    <div class="receipt-item-row">
      <span>${item.name}</span>
      <span class="qty">x${item.quantity}</span>
      <span class="price-val">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join("");

  receiptContentEl.innerHTML = `
    <div class="receipt-header">
      <h4>UrbanCart Store</h4>
      <p>Official Purchase Receipt</p>
    </div>
    <div class="receipt-divider"></div>
    <div class="receipt-meta-grid">
      <span class="receipt-meta-label">Date:</span>
      <span class="receipt-meta-val">${dateFormatted}</span>
      <span class="receipt-meta-label">Ref ID:</span>
      <span class="receipt-meta-val">${order.id}</span>
      <span class="receipt-meta-label">Paid Via:</span>
      <span class="receipt-meta-val">M-Pesa Checkout</span>
      <span class="receipt-meta-label">Payer:</span>
      <span class="receipt-meta-val">${order.payerPhone}</span>
      <span class="receipt-meta-label">Receiver:</span>
      <span class="receipt-meta-val">${MPESA_RECEIVER}</span>
    </div>
    <div class="receipt-divider"></div>
    <div class="receipt-table-header">
      <span>Item</span>
      <span class="qty">Qty</span>
      <span class="price-val">Total</span>
    </div>
    <div class="receipt-items-list">
      ${itemsHtml}
    </div>
    <div class="receipt-divider"></div>
    <div class="receipt-total-row">
      <span>Grand Total:</span>
      <span>$${order.amount.toFixed(2)}</span>
    </div>
    <div class="receipt-footer-note">
      Thank you for shopping with us!
    </div>
  `;

  document.getElementById("receiptModal").classList.remove("hidden");
  document.getElementById("receiptModal").setAttribute("aria-hidden", "false");
}

function showDashboardModal() {
  renderDashboard();
  document.getElementById("dashboardModal").classList.remove("hidden");
  document.getElementById("dashboardModal").setAttribute("aria-hidden", "false");
}

function hideDashboardModal() {
  document.getElementById("dashboardModal").classList.add("hidden");
  document.getElementById("dashboardModal").setAttribute("aria-hidden", "true");
}

function hideReceiptModal() {
  document.getElementById("receiptModal").classList.add("hidden");
  document.getElementById("receiptModal").setAttribute("aria-hidden", "true");
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
    throw new Error("Cannot reach API. Run the server: npm start (http://localhost:4000).");
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

  paymentSubmitBtn.disabled = true;
  setPaymentMessage("Processing…");

  try {
    const result = await apiRequest(
      "/payments/mpesa",
      "POST",
      {
        phoneNumber: normalizedPhone,
        amount,
        items: cart.map(({ id, name, price, quantity, category }) => ({
          id,
          name,
          price,
          quantity,
          category
        }))
      },
      getToken()
    );

    const checkoutId = result.checkoutRequestId ? ` Ref: ${result.checkoutRequestId}` : "";
    setPaymentMessage(`${result.message || "Request completed."}${checkoutId}`);

    if (result.demo) {
      showToast("Demo checkout complete — cart cleared.", "neutral");
      saveOrderToLocalStorage(result, amount, normalizedPhone);
      cart.length = 0;
      saveCart();
      renderCart();
      setCartOpen(false);
      setTimeout(() => hidePaymentModal(), 1600);
    } else {
      showToast("STK push sent — complete payment on your phone.", "success");
      saveOrderToLocalStorage({ ...result, demo: false }, amount, normalizedPhone);
    }
  } catch (error) {
    setPaymentMessage(error.message || "Payment initiation failed.", true);
    showToast(error.message || "Payment failed", "error");
  } finally {
    paymentSubmitBtn.disabled = false;
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
    authMessage.textContent = "Please wait…";
    const result = isLoginMode ? await login(email, password) : await register(name, email, password);

    setToken(result.token);
    setAuthUI(result.user);
    authForm.reset();
    hideAuthModal();
    showToast(isLoginMode ? "Welcome back." : "Account created.");
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

function setMegaFilterButtons() {
  document.querySelectorAll(".filter-chip").forEach((btn) => {
    const v = btn.getAttribute("data-filter") || "";
    btn.classList.toggle("is-active", v === megaCategoryFilter);
  });
}

function scrollToMega() {
  document.getElementById("mega-shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    return;
  }

  const qtyButton = event.target.closest(".qty-btn");
  if (qtyButton) {
    const index = Number(qtyButton.dataset.index);
    const action = qtyButton.dataset.action;
    const item = cart[index];
    if (!item) return;
    if (action === "inc") {
      item.quantity += 1;
    } else if (action === "dec") {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.splice(index, 1);
      }
    }
    renderCart();
    return;
  }

  const resetBtn = event.target.closest(".catalog-reset");
  if (resetBtn) {
    megaCategoryFilter = "";
    megaSearchQuery = "";
    megaSortBy = "default";
    if (catalogSearch) catalogSearch.value = "";
    if (catalogSort) catalogSort.value = "default";
    setMegaFilterButtons();
    renderMegaProducts();
  }
});

document.getElementById("cartBtn").addEventListener("click", () => setCartOpen(true));
document.getElementById("closeCart").addEventListener("click", () => setCartOpen(false));
if (cartBackdrop) {
  cartBackdrop.addEventListener("click", () => setCartOpen(false));
}

authBtn.addEventListener("click", showAuthModal);
closeAuthModal.addEventListener("click", hideAuthModal);
toggleAuthMode.addEventListener("click", () => setAuthMode(!isLoginMode));
authForm.addEventListener("submit", handleAuthSubmit);
logoutBtn.addEventListener("click", () => {
  clearToken();
  setAuthUI(null);
  showToast("Signed out.", "neutral");
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

// Dashboard and Receipt Modals
const dashboardBtn = document.getElementById("dashboardBtn");
const closeDashboardModalBtn = document.getElementById("closeDashboardModal");
const closeReceiptModalBtn = document.getElementById("closeReceiptModal");
const dashboardModal = document.getElementById("dashboardModal");
const receiptModal = document.getElementById("receiptModal");
const printReceiptBtn = document.getElementById("printReceiptBtn");
const ordersList = document.getElementById("ordersList");

if (dashboardBtn) {
  dashboardBtn.addEventListener("click", showDashboardModal);
}
if (closeDashboardModalBtn) {
  closeDashboardModalBtn.addEventListener("click", hideDashboardModal);
}
if (closeReceiptModalBtn) {
  closeReceiptModalBtn.addEventListener("click", hideReceiptModal);
}
if (dashboardModal) {
  dashboardModal.addEventListener("click", (event) => {
    if (event.target === dashboardModal) hideDashboardModal();
  });
}
if (receiptModal) {
  receiptModal.addEventListener("click", (event) => {
    if (event.target === receiptModal) hideReceiptModal();
  });
}
if (printReceiptBtn) {
  printReceiptBtn.addEventListener("click", () => window.print());
}
if (ordersList) {
  ordersList.addEventListener("click", (event) => {
    const btn = event.target.closest(".view-receipt-btn");
    if (btn) {
      const index = Number(btn.dataset.index);
      const allOrders = JSON.parse(localStorage.getItem("urbancart_orders") || "[]");
      const userEmail = currentUser ? currentUser.email : "guest";
      const userOrders = allOrders.filter(order => order.userEmail === userEmail);
      const order = userOrders[index];
      if (order) {
        showReceipt(order);
      }
    }
  });
}

if (catalogSearch) {
  catalogSearch.addEventListener("input", () => {
    megaSearchQuery = catalogSearch.value;
    renderMegaProducts();
  });
}

if (catalogSort) {
  catalogSort.addEventListener("change", () => {
    megaSortBy = catalogSort.value;
    renderMegaProducts();
  });
}

document.querySelectorAll(".filter-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    megaCategoryFilter = btn.getAttribute("data-filter") || "";
    setMegaFilterButtons();
    renderMegaProducts();
  });
});

document.querySelectorAll(".cat-tile").forEach((tile) => {
  const go = () => {
    const cat = tile.getAttribute("data-category") || "";
    megaCategoryFilter = cat;
    if (catalogSearch) catalogSearch.value = "";
    megaSearchQuery = "";
    setMegaFilterButtons();
    renderMegaProducts();
    scrollToMega();
    if (!cat) {
      showToast("Showing the full catalog.", "neutral");
    }
  };
  tile.addEventListener("click", go);
  tile.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  });
});

if (newsletterForm && newsletterEmail && newsletterHint) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    if (!email || !newsletterEmail.checkValidity()) {
      newsletterHint.textContent = "Enter a valid email address.";
      return;
    }
    newsletterHint.textContent = "Thanks — you’re on the list (demo; no email was sent).";
    showToast("Subscribed (demo).", "neutral");
    newsletterEmail.value = "";
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("siteNav");
const navBackdrop = document.getElementById("navBackdrop");
let navScrollY = 0;

function setNavOpen(open) {
  if (!menuToggle || !siteNav) return;
  siteNav.classList.toggle("nav-open", open);
  if (navBackdrop) {
    navBackdrop.hidden = !open;
  }
  menuToggle.classList.toggle("nav-open", open);
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");

  if (open) {
    navScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("nav-locked");
    document.body.style.top = `-${navScrollY}px`;
  } else {
    document.body.classList.remove("nav-locked");
    document.body.style.top = "";
    window.scrollTo(0, navScrollY);
  }
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

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  setNavOpen(false);
  setCartOpen(false);
  hideAuthModal();
  hidePaymentModal();
  hideDashboardModal();
  hideReceiptModal();
});

// Theme toggle logic
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    // Add transition helper class
    document.documentElement.classList.add("theme-transitioning");
    
    // Update theme attribute
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("urbancart_theme", newTheme);
    
    // Remove helper class after transition finishes (400ms)
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 400);
  });
}

setAuthMode(true);
loadCart();
renderTrendingProducts();
renderMegaProducts();
renderCart();
loadCurrentUser();
