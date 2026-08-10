 "use strict";

/* ==========================================================================
   DARK MODE MANAGER
   Remembers the user's choice in localStorage, falls back to the OS
   preference the first time a visitor arrives.
   ========================================================================== */

const DarkModeManager = {
  STORAGE_KEY: "sneakerhub_dark_mode",

  init() {
    this.detectSystemPreference();
    this.setupToggleButton();
  },

  detectSystemPreference() {
    const savedMode = localStorage.getItem(this.STORAGE_KEY);

    if (savedMode !== null) {
      if (savedMode === "true") this.enable();
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.enable();
    }
  },

  setupToggleButton() {
    const toggleBtn = document.getElementById("dark-mode-toggle");
    if (toggleBtn) toggleBtn.addEventListener("click", () => this.toggle());
  },

  enable() {
    document.body.classList.add("dark-mode");
    localStorage.setItem(this.STORAGE_KEY, "true");
  },

  disable() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem(this.STORAGE_KEY, "false");
  },

  toggle() {
    document.body.classList.contains("dark-mode") ? this.disable() : this.enable();
  },
};

/* ==========================================================================
   PRODUCT DATA
   Each product now carries a "category" so the shop toolbar can filter it.
   ========================================================================== */

const PRODUCTS = [
  { id: 1, name: "ReadTape Classic Pro", description: "Premium comfort with iconic style", price: 9999, image: "Assets/ProductIMG/readtape01.jpg", badge: "Limited", category: "Classic" },
  { id: 2, name: "ReadTape Urban Runner", description: "Modern design meets comfort", price: 8999, image: "Assets/ProductIMG/readtape02.webp", badge: "Trending", category: "Running" },
  { id: 3, name: "ReadTape Elite Series", description: "Exclusive design with premium quality", price: 7999, image: "Assets/ProductIMG/readtape03.jpeg", badge: "Limited", category: "Premium" },
  { id: 4, name: "ReadTape Velocity X", description: "High-performance street sneaker", price: 8499, image: "Assets/ProductIMG/readtape04.jpeg", badge: "Trending", category: "Running" },
  { id: 5, name: "ReadTape Premium Edition", description: "Luxury crafted with premium materials", price: 10499, image: "Assets/ProductIMG/readtape05.jpeg", badge: "Limited", category: "Premium" },
  { id: 6, name: "ReadTape Street Style", description: "Contemporary urban aesthetic", price: 8799, image: "Assets/ProductIMG/readtape06.jpeg", badge: "Trending", category: "Street" },
  { id: 7, name: "ReadTape Bold Signature", description: "Statement design with comfort", price: 9299, image: "Assets/ProductIMG/readtape07.jpeg", badge: "Trending", category: "Street" },
  { id: 8, name: "US Polo Assn. Classic Sneaker", description: "Comfortable and stylish design", price: 10499, image: "Assets/ProductIMG/uspolo01.jpg", badge: "Trending", category: "Classic" },
  { id: 9, name: "ReadTape Core Collection", description: "Essential style at great value", price: 6999, image: "Assets/ProductIMG/readtape08.jpeg", badge: "Trending", category: "Classic" },
];

const CART_KEY = "sneakerhub_cart";
const WISHLIST_KEY = "sneakerhub_wishlist";
const NOTIFICATION_DURATION = 3000;

/* ==========================================================================
   CART MANAGER
   Cart items now store a quantity instead of duplicating the product object
   every time "Add to Cart" is pressed.
   ========================================================================== */

const CartManager = {
  init() {
    this.cart = this.readFromStorage(CART_KEY, []);
    this.updateCartCount();
  },

  readFromStorage(key, fallback) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      return Array.isArray(stored) ? stored : fallback;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return fallback;
    }
  },

  getCart() {
    return this.cart;
  },

  getItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  },

  addItem(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return false;
    }

    const existing = this.cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    this.saveCart();
    this.updateCartCount();
    CartUI.render();
    showNotification(`${product.name} added to cart!`, "success");
    return true;
  },

  updateQuantity(productId, delta) {
    const item = this.cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId, false);
    } else {
      this.saveCart();
      this.updateCartCount();
      CartUI.render();
    }
  },

  removeItem(productId, notify = true) {
    const index = this.cart.findIndex((item) => item.id === productId);
    if (index === -1) return false;

    const [removed] = this.cart.splice(index, 1);
    this.saveCart();
    this.updateCartCount();
    CartUI.render();
    if (notify) showNotification(`${removed.name} removed from cart`, "info");
    return true;
  },

  saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
    } catch (error) {
      console.error("Error saving cart to storage:", error);
      showNotification("Failed to save cart", "error");
    }
  },

  updateCartCount() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = this.getItemCount();
  },

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartCount();
    CartUI.render();
  },

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
};

/* ==========================================================================
   CART DRAWER UI
   Renders the slide-in cart panel and wires up its open/close/checkout
   interactions.
   ========================================================================== */

const CartUI = {
  init() {
    this.drawer = document.getElementById("cart-drawer");
    this.overlay = document.getElementById("drawer-overlay");
    this.itemsContainer = document.getElementById("cart-items");
    this.totalEl = document.getElementById("cart-total");

    document.getElementById("cart-toggle")?.addEventListener("click", () => this.open());
    document.getElementById("cart-close")?.addEventListener("click", () => this.close());
    document.getElementById("checkout-btn")?.addEventListener("click", () => this.checkout());
    this.overlay?.addEventListener("click", () => DrawerManager.closeAll());

    this.render();
  },

  open() {
    DrawerManager.openOnly(this.drawer);
  },

  close() {
    DrawerManager.closeAll();
  },

  render() {
    if (!this.itemsContainer) return;
    const cart = CartManager.getCart();

    if (cart.length === 0) {
      this.itemsContainer.innerHTML = `
        <div class="drawer-empty">
          <i class="fas fa-shopping-cart" aria-hidden="true"></i>
          <p>Your cart is empty.</p>
        </div>`;
    } else {
      this.itemsContainer.innerHTML = cart.map((item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="cart-item-info">
            <h6>${item.name}</h6>
            <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString("en-IN")}</div>
            <div class="qty-controls">
              <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `).join("");

      // Attach listeners after building the markup
      this.itemsContainer.querySelectorAll("[data-action]").forEach((btn) => {
        const id = Number(btn.dataset.id);
        btn.addEventListener("click", () => {
          if (btn.dataset.action === "increase") CartManager.updateQuantity(id, 1);
          if (btn.dataset.action === "decrease") CartManager.updateQuantity(id, -1);
          if (btn.dataset.action === "remove") CartManager.removeItem(id);
        });
      });
    }

    if (this.totalEl) {
      this.totalEl.textContent = `₹${CartManager.getTotalPrice().toLocaleString("en-IN")}`;
    }
  },

  checkout() {
    if (CartManager.getCart().length === 0) {
      showNotification("Your cart is empty", "info");
      return;
    }
    // No real backend in this demo — simulate a successful order instead.
    showNotification("Order placed! Thanks for shopping with SneakerHub.", "success");
    CartManager.clearCart();
    this.close();
  },
};

/* ==========================================================================
   WISHLIST MANAGER + UI
   Lets shoppers save items for later, stored the same way as the cart.
   ========================================================================== */

const WishlistManager = {
  init() {
    this.items = CartManager.readFromStorage(WISHLIST_KEY, []);
    this.updateCount();
  },

  isSaved(productId) {
    return this.items.some((p) => p.id === productId);
  },

  toggle(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    if (this.isSaved(productId)) {
      this.items = this.items.filter((p) => p.id !== productId);
      showNotification(`${product.name} removed from wishlist`, "info");
    } else {
      this.items.push(product);
      showNotification(`${product.name} added to wishlist!`, "success");
    }

    this.save();
    this.updateCount();
    WishlistUI.render();
    ProductManager.refreshWishlistButtons();
  },

  save() {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  },

  updateCount() {
    const el = document.getElementById("wishlist-count");
    if (el) el.textContent = this.items.length;
  },
};

const WishlistUI = {
  init() {
    this.drawer = document.getElementById("wishlist-drawer");
    this.itemsContainer = document.getElementById("wishlist-items");

    document.getElementById("wishlist-toggle")?.addEventListener("click", () => this.open());
    document.getElementById("wishlist-close")?.addEventListener("click", () => DrawerManager.closeAll());

    this.render();
  },

  open() {
    DrawerManager.openOnly(this.drawer);
  },

  render() {
    if (!this.itemsContainer) return;
    const items = WishlistManager.items;

    if (items.length === 0) {
      this.itemsContainer.innerHTML = `
        <div class="drawer-empty">
          <i class="fas fa-heart" aria-hidden="true"></i>
          <p>Nothing saved yet. Tap the heart on a sneaker to save it here.</p>
        </div>`;
      return;
    }

    this.itemsContainer.innerHTML = items.map((item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <div class="cart-item-info">
          <h6>${item.name}</h6>
          <div class="cart-item-price">₹${item.price.toLocaleString("en-IN")}</div>
          <div class="wishlist-item-actions">
            <button type="button" class="primary" data-action="move-to-cart" data-id="${item.id}">Add to Cart</button>
            <button type="button" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");

    this.itemsContainer.querySelectorAll("[data-action]").forEach((btn) => {
      const id = Number(btn.dataset.id);
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "move-to-cart") {
          CartManager.addItem(id);
        } else {
          WishlistManager.toggle(id);
        }
      });
    });
  },
};

/* ==========================================================================
   DRAWER MANAGER
   Small helper so the cart drawer and wishlist drawer never fight over the
   shared overlay — opening one always closes the other first.
   ========================================================================== */

const DrawerManager = {
  overlay: null,

  init() {
    this.overlay = document.getElementById("drawer-overlay");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAll();
    });
  },

  openOnly(drawer) {
    this.closeAll();
    drawer?.classList.add("open");
    this.overlay?.classList.add("show");
    document.body.style.overflow = "hidden";
  },

  closeAll() {
    document.querySelectorAll(".cart-drawer.open").forEach((d) => d.classList.remove("open"));
    this.overlay?.classList.remove("show");
    document.body.style.overflow = "";
  },
};

/* ==========================================================================
   PRODUCT DISPLAY + FILTERING
   ========================================================================== */

const ProductManager = {
  activeCategory: "all",
  searchTerm: "",
  sortBy: "default",

  init() {
    this.buildCategoryChips();
    this.bindToolbar();
    this.render();
  },

  buildCategoryChips() {
    const container = document.getElementById("category-filters");
    if (!container) return;

    const categories = [...new Set(PRODUCTS.map((p) => p.category))];
    categories.forEach((category) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "filter-chip";
      chip.dataset.category = category;
      chip.textContent = category;
      container.appendChild(chip);
    });

    container.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      container.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      this.activeCategory = chip.dataset.category;
      this.render();
    });
  },

  bindToolbar() {
    const searchInput = document.getElementById("product-search");
    searchInput?.addEventListener("input", (e) => {
      this.searchTerm = e.target.value.trim().toLowerCase();
      this.render();
    });

    const sortSelect = document.getElementById("sort-select");
    sortSelect?.addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.render();
    });
  },

  getFilteredProducts() {
    let list = PRODUCTS.filter((p) => {
      const matchesCategory = this.activeCategory === "all" || p.category === this.activeCategory;
      const matchesSearch = !this.searchTerm ||
        p.name.toLowerCase().includes(this.searchTerm) ||
        p.description.toLowerCase().includes(this.searchTerm);
      return matchesCategory && matchesSearch;
    });

    switch (this.sortBy) {
      case "price-asc":
        list = list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list = list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // keep original order
    }

    return list;
  },

  render() {
    const grid = document.getElementById("products-grid");
    const noResults = document.getElementById("no-results");
    if (!grid) return;

    const products = this.getFilteredProducts();
    grid.innerHTML = "";

    if (products.length === 0) {
      noResults?.removeAttribute("hidden");
    } else {
      noResults?.setAttribute("hidden", "");
      products.forEach((product) => grid.appendChild(this.createProductCard(product)));
    }
  },

  createProductCard(product) {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4";
    col.setAttribute("role", "listitem");

    const saved = WishlistManager.isSaved(product.id);

    col.innerHTML = `
      <div class="product-card">
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name} - ${product.description}" class="product-image" loading="lazy">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          <button class="wishlist-btn ${saved ? "active" : ""}" data-id="${product.id}" aria-label="${saved ? "Remove from" : "Add to"} wishlist" aria-pressed="${saved}">
            <i class="fas fa-heart"></i>
          </button>
          <button class="quickview-btn" data-id="${product.id}">Quick View</button>
        </div>
        <div class="product-body">
          <div class="product-category">${product.category}</div>
          <h5 class="product-title">${product.name}</h5>
          <p class="product-description">${product.description}</p>
          <div class="product-price">₹${product.price.toLocaleString("en-IN")}</div>
          <button class="product-button" type="button" aria-label="Add ${product.name} to cart" data-id="${product.id}">
            <i class="fas fa-shopping-bag" aria-hidden="true"></i> Add to Cart
          </button>
        </div>
      </div>
    `;

    col.querySelector(".product-button").addEventListener("click", () => CartManager.addItem(product.id));
    col.querySelector(".wishlist-btn").addEventListener("click", () => WishlistManager.toggle(product.id));
    col.querySelector(".quickview-btn").addEventListener("click", () => QuickView.open(product.id));

    return col;
  },

  // Called by WishlistManager after a toggle so hearts stay in sync
  // without re-rendering (and losing filter/scroll state) unnecessarily.
  refreshWishlistButtons() {
    document.querySelectorAll(".wishlist-btn").forEach((btn) => {
      const id = Number(btn.dataset.id);
      const saved = WishlistManager.isSaved(id);
      btn.classList.toggle("active", saved);
      btn.setAttribute("aria-pressed", saved);
    });
  },
};

/* ==========================================================================
   QUICK VIEW MODAL
   ========================================================================== */

const QuickView = {
  init() {
    this.overlay = document.getElementById("quickview-overlay");
    this.body = document.getElementById("quickview-body");
    document.getElementById("quickview-close")?.addEventListener("click", () => this.close());
    this.overlay?.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
  },

  open(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product || !this.body) return;

    this.body.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="quickview-details">
        <div class="product-category">${product.category}</div>
        <h3 id="quickview-title">${product.name}</h3>
        <p class="desc">${product.description}</p>
        <div class="product-price">₹${product.price.toLocaleString("en-IN")}</div>
        <button class="product-button" type="button" id="quickview-add">
          <i class="fas fa-shopping-bag" aria-hidden="true"></i> Add to Cart
        </button>
      </div>
    `;

    document.getElementById("quickview-add").addEventListener("click", () => {
      CartManager.addItem(product.id);
      this.close();
    });

    this.overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  },

  close() {
    this.overlay.classList.remove("show");
    document.body.style.overflow = "";
  },
};

/* ==========================================================================
   FORM VALIDATION MODULE (contact form)
   ========================================================================== */

const FormValidator = {
  rules: {
    name: (value) => value.trim().length >= 3,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => !value || /^[0-9]{10,}$/.test(value.replace(/\D/g, "")),
    subject: (value) => value.length > 0,
    message: (value) => value.trim().length >= 10,
  },

  validateField(fieldId, value) {
    const rule = this.rules[fieldId];
    return rule ? rule(value) : true;
  },

  showFieldError(fieldId, show) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (!field || !errorElement) return;

    field.classList.toggle("is-invalid", show);
    errorElement.classList.toggle("show", show);
  },

  validateForm(formData) {
    let isValid = true;

    Object.entries(formData).forEach(([fieldId, value]) => {
      const fieldValid = this.validateField(fieldId, value);
      this.showFieldError(fieldId, !fieldValid);
      if (!fieldValid) isValid = false;
    });

    return { isValid };
  },
};

/* ==========================================================================
   NOTIFICATION SYSTEM (toast)
   ========================================================================== */

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `toast-notification ${type === "error" ? "error" : type === "info" ? "info" : ""}`;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");

  const iconClass = { success: "check-circle", error: "exclamation-circle", info: "info-circle" }[type] || "check-circle";
  notification.innerHTML = `<i class="fas fa-${iconClass}" aria-hidden="true"></i> ${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, NOTIFICATION_DURATION);
}

/* ==========================================================================
   CONTACT FORM HANDLING
   ========================================================================== */

function initializeForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", handleFormSubmit);

  ["name", "email", "phone", "message"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field?.addEventListener("blur", () => {
      const isValid = FormValidator.validateField(fieldId, field.value);
      FormValidator.showFieldError(fieldId, !isValid && field.value.length > 0);
    });
  });

  const subjectField = document.getElementById("subject");
  subjectField?.addEventListener("change", () => {
    const isValid = FormValidator.validateField("subject", subjectField.value);
    FormValidator.showFieldError("subject", !isValid && subjectField.value === "");
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  const { isValid } = FormValidator.validateForm(formData);
  if (!isValid) {
    showNotification("Please fix the errors in the form", "error");
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const submitText = document.getElementById("submit-text");
  const submitSpinner = document.getElementById("submit-spinner");

  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", "true");
  submitText.style.display = "none";
  submitSpinner.classList.add("show");

  try {
    // Simulated network delay — swap this for a real fetch() call to your backend.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const successMessage = document.getElementById("success-message");
    if (successMessage) {
      successMessage.classList.add("show");
      setTimeout(() => successMessage.classList.remove("show"), 5000);
    }

    e.target.reset();
    showNotification("Message sent successfully!", "success");
  } catch (error) {
    console.error("Form submission error:", error);
    showNotification("Failed to send message. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.setAttribute("aria-busy", "false");
    submitText.style.display = "inline";
    submitSpinner.classList.remove("show");
  }
}

/* ==========================================================================
   NEWSLETTER FORM
   ========================================================================== */

function initializeNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("newsletter-email");
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);

    if (!isValid) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    showNotification("You're subscribed! Watch your inbox for new drops.", "success");
    form.reset();
  });
}

/* ==========================================================================
   SMOOTH SCROLL (also closes the mobile nav menu after a click)
   ========================================================================== */

function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        const navCollapse = document.getElementById("navbarNav");
        if (navCollapse?.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
        }
      }
    });
  });
}

/* ==========================================================================
   SCROLL REVEAL
   Fades sections/cards in as they enter the viewport using
   IntersectionObserver (much cheaper than a scroll event listener).
   ========================================================================== */

function initializeScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   BACK TO TOP BUTTON
   ========================================================================== */

function initializeBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 400);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

function init() {
  if (document.readyState !== "loading") {
    setupApp();
  } else {
    document.addEventListener("DOMContentLoaded", setupApp);
  }
}

function setupApp() {
  try {
    DarkModeManager.init();
    DrawerManager.init();
    CartManager.init();
    WishlistManager.init();
    CartUI.init();
    WishlistUI.init();
    QuickView.init();
    ProductManager.init();
    initializeForm();
    initializeNewsletter();
    initializeSmoothScroll();
    initializeScrollReveal();
    initializeBackToTop();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("An error occurred while loading the page", "error");
  }
}

init();