// ============================================================================
// Dark Mode Management 🌙
// ============================================================================

const DarkModeManager = {
  STORAGE_KEY: 'sneakerhub_dark_mode',

  // Initialize dark mode on page load
  init() {
    this.detectSystemPreference();
    this.setupToggleButton();
  },

  // Detect system preference for dark mode
  detectSystemPreference() {
    // Check localStorage first
    const savedMode = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedMode !== null) {
      // User has set a preference
      if (savedMode === 'true') {
        this.enable();
      }
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.enable();
      }
    }
  },

  // Setup toggle button click handler
  setupToggleButton() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  },

  // Enable dark mode
  enable() {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    localStorage.setItem(this.STORAGE_KEY, 'true');
  },

  // Disable dark mode
  disable() {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    localStorage.setItem(this.STORAGE_KEY, 'false');
  },

  // Toggle dark mode
  toggle() {
    if (document.body.classList.contains('dark-mode')) {
      this.disable();
    } else {
      this.enable();
    }
  },

  // Check if dark mode is enabled
  isEnabled() {
    return document.body.classList.contains('dark-mode');
  }
};

// ============================================================================
// Product Data & Configuration 📊📈📊
// ============================================================================

const PRODUCTS = [
  {
    id: 1,
    name: "ReadTape Classic Pro",
    description: "Premium comfort with iconic style",
    price: 9999,
    image: "Assets/ProductIMG/readtape01.jpg",
    badge: "Limited",
  },
  {
    id: 2,
    name: "ReadTape Urban Runner",
    description: "Modern design meets comfort",
    price: 8999,
    image: "Assets/ProductIMG/readtape02.webp",
    badge: "Trending",
  },
  {
    id: 3,
    name: "ReadTape Elite Series",
    description: "Exclusive design with premium quality",
    price: 7999,
    image: "Assets/ProductIMG/readtape03.jpeg",
    badge: "Limited",
  },
  {
    id: 4,
    name: "ReadTape Velocity X",
    description: "High-performance street sneaker",
    price: 8499,
    image: "Assets/ProductIMG/readtape04.jpeg",
    badge: "Trending",
  },
  {
    id: 5,
    name: "ReadTape Premium Edition",
    description: "Luxury crafted with premium materials",
    price: 10499,
    image: "Assets/ProductIMG/readtape05.jpeg",
    badge: "Limited",
  },
  {
    id: 6,
    name: "ReadTape Street Style",
    description: "Contemporary urban aesthetic",
    price: 8799,
    image: "Assets/ProductIMG/readtape06.jpeg",
    badge: "Trending",
  },
  {
    id: 7,
    name: "ReadTape Bold Signature",
    description: "Statement design with comfort",
    price: 9299,
    image: "Assets/ProductIMG/readtape07.jpeg",
    badge: "Trending",
  },
  {
    id: 8,
    name: "US Polo Assn. Classic Sneaker",
    description: "Comfortable and stylish design",
    price: 10499,
    image: "Assets/ProductIMG/uspolo01.jpg",
    badge: "Trending",
  },
  {
    id: 9,
    name: "ReadTape Core Collection",
    description: "Essential style at great value",
    price: 6999,
    image: "Assets/ProductIMG/readtape08.jpeg",
    badge: "Trending",
  },
];

const STORAGE_KEY = "sneakerhub_cart";
const NOTIFICATION_DURATION = 3000;

// ============================================================================
// Cart Management Module 🛒🛒
// ============================================================================

const CartManager = {
  // Initialize cart from localStorage
  init() {
    try {
      this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      console.error("Error loading cart from storage:", error);
      this.cart = [];
    }
    this.updateCartCount();
  },

  // Get cart items
  getCart() {
    return this.cart;
  },

  // Add item to cart
  addItem(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return false;
    }

    this.cart.push(product);
    this.saveCart();
    this.updateCartCount();
    showNotification(`${product.name} added to cart!`, "success");
    return true;
  },

  // Remove item from cart
  removeItem(index) {
    if (index >= 0 && index < this.cart.length) {
      const product = this.cart[index];
      this.cart.splice(index, 1);
      this.saveCart();
      this.updateCartCount();
      showNotification(`${product.name} removed from cart`, "info");
      return true;
    }
    return false;
  },

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cart));
    } catch (error) {
      console.error("Error saving cart to storage:", error);
      showNotification("Failed to save cart", "error");
    }
  },

  // Update cart count badge
  updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = this.cart.length;
    }
  },

  // Clear entire cart
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartCount();
  },

  // Get total price
  getTotalPrice() {
    return this.cart.reduce((total, item) => total + item.price, 0);
  },
};

// ============================================================================
// Product Display Module
// ============================================================================

const ProductManager = {
  // Load and display products
  loadProducts() {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) {
      console.error("Products grid element not found");
      return;
    }

    productsGrid.innerHTML = "";
    productsGrid.setAttribute("role", "list");

    PRODUCTS.forEach((product) => {
      const productCard = this.createProductCard(product);
      productsGrid.appendChild(productCard);
    });
  },

  // Create a single product card
  createProductCard(product) {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4";
    col.setAttribute("role", "listitem");

    const card = document.createElement("div");
    card.className = "product-card";

    const imageContainer = document.createElement("div");
    imageContainer.style.position = "relative";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = `${product.name} - ${product.description}`;
    img.className = "product-image";
    img.loading = "lazy";
    imageContainer.appendChild(img);

    if (product.badge) {
      const badge = document.createElement("span");
      badge.className = "product-badge";
      badge.textContent = product.badge;
      badge.setAttribute("aria-label", `${product.name} is ${product.badge}`);
      imageContainer.appendChild(badge);
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const title = document.createElement("h5");
    title.className = "product-title";
    title.textContent = product.name;

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = `₹${product.price.toLocaleString("en-IN")}`;

    const button = document.createElement("button");
    button.className = "product-button";
    button.type = "button";
    button.setAttribute("aria-label", `Add ${product.name} to cart`);
    button.innerHTML = `<i class="fas fa-shopping-bag" aria-hidden="true"></i> Add to Cart`;
    button.addEventListener("click", () => CartManager.addItem(product.id));

    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(price);
    body.appendChild(button);

    card.appendChild(imageContainer);
    card.appendChild(body);
    col.appendChild(card);

    return col;
  },
};

// ============================================================================
// Form Validation Module
// ============================================================================

const FormValidator = {
  // Validation rules
  rules: {
    name: (value) => value.trim().length >= 3,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => !value || /^[0-9]{10,}$/.test(value.replace(/\D/g, "")),
    subject: (value) => value.length > 0,
    message: (value) => value.trim().length >= 10,
  },

  // Validate single field
  validateField(fieldId, value) {
    const rule = this.rules[fieldId];
    if (!rule) return true;
    return rule(value);
  },

  // Show/hide field error
  showFieldError(fieldId, show) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (!field || !errorElement) {
      console.error(`Field or error element not found for: ${fieldId}`);
      return;
    }

    if (show) {
      field.classList.add("is-invalid");
      errorElement.classList.add("show");
    } else {
      field.classList.remove("is-invalid");
      errorElement.classList.remove("show");
    }
  },

  // Validate entire form
  validateForm(formData) {
    let isValid = true;
    const errors = {};

    Object.entries(formData).forEach(([fieldId, value]) => {
      if (!this.validateField(fieldId, value)) {
        errors[fieldId] = true;
        this.showFieldError(fieldId, true);
        isValid = false;
      } else {
        this.showFieldError(fieldId, false);
      }
    });

    return { isValid, errors };
  },
};

// ============================================================================
// Notification System
// ============================================================================

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `toast-notification ${type === "error" ? "error" : type === "info" ? "info" : ""}`;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");

  const iconClass = {
    success: "check-circle",
    error: "exclamation-circle",
    info: "info-circle",
  }[type] || "check-circle";

  notification.innerHTML = `
    <i class="fas fa-${iconClass}" aria-hidden="true"></i> ${message}
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, NOTIFICATION_DURATION);
}

// ============================================================================
// Form Handling
// ============================================================================

function initializeForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) {
    console.error("Contact form not found");
    return;
  }

  // Form submission
  contactForm.addEventListener("submit", handleFormSubmit);

  // Real-time validation on blur
  const formFields = ["name", "email", "phone", "message"];
  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("blur", () => {
        const value = field.value;
        const isValid = FormValidator.validateField(fieldId, value);
        FormValidator.showFieldError(fieldId, !isValid && value.length > 0);
      });
    }
  });

  const subjectField = document.getElementById("subject");
  if (subjectField) {
    subjectField.addEventListener("change", () => {
      const isValid = FormValidator.validateField("subject", subjectField.value);
      FormValidator.showFieldError("subject", !isValid && subjectField.value === "");
    });
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  // Get form data
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  // Validate form
  const { isValid } = FormValidator.validateForm(formData);
  if (!isValid) {
    showNotification("Please fix the errors in the form", "error");
    return;
  }

  // Set loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const submitText = document.getElementById("submit-text");
  const submitSpinner = document.getElementById("submit-spinner");

  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", "true");
  submitText.style.display = "none";
  submitSpinner.classList.add("show");

  try {
    // Simulate API call (replace with real endpoint)
    // const response = await fetch('your-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Show success message
    const successMessage = document.getElementById("success-message");
    if (successMessage) {
      successMessage.classList.add("show");

      setTimeout(() => {
        successMessage.classList.remove("show");
      }, 5000);
    }

    // Reset form
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

// ============================================================================
// Smooth Scrolling
// ============================================================================

function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const href = this.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// ============================================================================
// Initialization 😎
// ============================================================================

function init() {
  // Check if DOM is loaded
  if (document.readyState !== "loading") {
    setupApp();
  } else {
    document.addEventListener("DOMContentLoaded", setupApp);
  }
}

function setupApp() {
  try {
    DarkModeManager.init();
    CartManager.init();
    ProductManager.loadProducts();
    initializeForm();
    initializeSmoothScroll();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("An error occurred while loading the page", "error");
  }
}

// Start the application
init();