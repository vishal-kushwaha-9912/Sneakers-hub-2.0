// Product Data


const products = [
 
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
  // Add more products as needed





];

// Cart Management

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`, "success");
  }
}

// Load Products

function loadProducts() {
  const productsGrid = document.getElementById("products-grid");
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "col-md-6 col-lg-4 mb-4";
    productCard.innerHTML = `
      <div class="product-card">
        <div style="position: relative;">
          <img src="${product.image}" alt="${product.name}" class="product-image">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        </div>
        <div class="product-body">
          <h5 class="product-title">${product.name}</h5>
          <p class="product-description">${product.description}</p>
          <div class="product-price">₹${product.price.toLocaleString("en-IN")}</div>
          <button class="product-button" onclick="addToCart(${product.id})">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });
}

// Form Validation
const contactForm = document.getElementById("contact-form");

function validateName(name) {
  return name.trim().length >= 3;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

function validateMessage(message) {
  return message.trim().length >= 10;
}

function showFieldError(fieldId, show) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (show) {
    field.classList.add("is-invalid");
    errorElement.classList.add("show");
  } else {
    field.classList.remove("is-invalid");
    errorElement.classList.remove("show");
  }
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `toast-notification ${type === "error" ? "error" : ""}`;
  notification.innerHTML = `
    <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i> ${message}
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Form Submission
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  // Validate all fields
  let isValid = true;

  if (!validateName(name)) {
    showFieldError("name", true);
    isValid = false;
  } else {
    showFieldError("name", false);
  }

  if (!validateEmail(email)) {
    showFieldError("email", true);
    isValid = false;
  } else {
    showFieldError("email", false);
  }

  if (!validatePhone(phone)) {
    showFieldError("phone", true);
    isValid = false;
  } else {
    showFieldError("phone", false);
  }

  if (!subject) {
    showFieldError("subject", true);
    isValid = false;
  } else {
    showFieldError("subject", false);
  }

  if (!validateMessage(message)) {
    showFieldError("message", true);
    isValid = false;
  } else {
    showFieldError("message", false);
  }

  if (!isValid) {
    showNotification("Please fix the errors in the form", "error");
    return;
  }

  // Show loading state
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const submitText = document.getElementById("submit-text");
  const submitSpinner = document.getElementById("submit-spinner");

  submitBtn.disabled = true;
  submitText.style.display = "none";
  submitSpinner.classList.add("show");

  // Simulate API call (you can replace with real API endpoint)

  try {
    // In real application, send data to your backend
    // const response = await fetch('your-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, phone, subject, message })
    // });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Show success message
    document.getElementById("success-message").classList.add("show");
    contactForm.reset();

    // Clear success message after 5 seconds
    setTimeout(() => {
      document.getElementById("success-message").classList.remove("show");
    }, 5000);
  } catch (error) {
    showNotification("Failed to send message. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitText.style.display = "inline";
    submitSpinner.classList.remove("show");
  }
});

// Real-time field validation
document.getElementById("name").addEventListener("blur", () => {
  const value = document.getElementById("name").value;
  showFieldError("name", !validateName(value) && value.length > 0);
});

document.getElementById("email").addEventListener("blur", () => {
  const value = document.getElementById("email").value;
  showFieldError("email", !validateEmail(value) && value.length > 0);
});

document.getElementById("phone").addEventListener("blur", () => {
  const value = document.getElementById("phone").value;
  showFieldError("phone", !validatePhone(value) && value.length > 0);
});

document.getElementById("message").addEventListener("blur", () => {
  const value = document.getElementById("message").value;
  showFieldError("message", !validateMessage(value) && value.length > 0);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Initialize
loadProducts();
updateCartCount();
