
const API_BASE = 'https://fakestoreapi.com';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';


const elements = {
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    cartSidebar: document.getElementById('cartSidebar'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartClose: document.getElementById('cartClose'),
    cartItems: document.getElementById('cartItems'),
    totalPrice: document.getElementById('totalPrice'),
    productModal: document.getElementById('productModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    modalBody: document.getElementById('modalBody'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    newsletterForm: document.getElementById('newsletterForm')
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateCartUI();
});

function initializeApp() {
    const isProductsPage = window.location.pathname.includes('products.html');

    if (isProductsPage) {
        loadCategories();
        loadProducts('all');
    } else {
        loadTrendingProducts();
    }
}

function setupEventListeners() {
    // Cart
    elements.cartBtn?.addEventListener('click', toggleCart);
    elements.cartClose?.addEventListener('click', toggleCart);
    elements.cartOverlay?.addEventListener('click', toggleCart);

    // Modal
    elements.modalClose?.addEventListener('click', closeModal);
    elements.modalOverlay?.addEventListener('click', closeModal);

    // Mobile Menu
    elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

    // Newsletter
    elements.newsletterForm?.addEventListener('submit', handleNewsletter);

    // Escape key to close modal/cart
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            if (elements.cartSidebar.classList.contains('active')) {
                toggleCart();
            }
        }
    });
}


// MOBILE MENU

function toggleMobileMenu() {
    elements.mobileMenu.style.display =
        elements.mobileMenu.style.display === 'block' ? 'none' : 'block';
}


// NEWSLETTER

function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;

    // Simulate subscription
    alert(`Thank you for subscribing! We'll send updates to ${email}`);
    e.target.reset();
}


// FETCH FUNCTIONS

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}


// CATEGORIES

async function loadCategories() {
    const categories = await fetchData('/products/categories');
    if (!categories) return;

    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.dataset.category = category;
        btn.addEventListener('click', () => {
            setActiveCategory(category);
            loadProducts(category);
        });
        filterContainer.appendChild(btn);
    });
}

function setActiveCategory(category) {
    currentCategory = category;
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}


// PRODUCTS LOADING

async function loadProducts(category = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    // Show loading spinner
    showLoading(grid);

    const endpoint = category === 'all'
        ? '/products'
        : `/products/category/${category}`;

    const products = await fetchData(endpoint);

    if (!products || products.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-full">No products found</p>';
        return;
    }

    displayProducts(products, grid);
}

async function loadTrendingProducts() {
    const grid = document.getElementById('trendingGrid');
    if (!grid) return;

    // Show loading spinner
    showLoading(grid);

    const products = await fetchData('/products?limit=3');

    if (!products) {
        grid.innerHTML = '<p class="text-center col-span-full">Failed to load products</p>';
        return;
    }

    displayProducts(products, grid);
}

function showLoading(container) {
    container.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading products...</p>
        </div>
    `;
}

function displayProducts(products, container) {
    container.innerHTML = '';

    products.forEach((product, index) => {
        const card = createProductCard(product, index);
        container.appendChild(card);
    });

    // Reinitialize Lucide icons for new elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.setProperty('--i', index);

    const stars = generateStars(product.rating.rate);
    const truncatedTitle = product.title.length > 50
        ? product.title.substring(0, 50) + '...'
        : product.title;

    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${truncatedTitle}</h3>
            <div class="product-rating">
                <div class="stars">${stars}</div>
                <span class="rating-count">${product.rating.rate} (${product.rating.count})</span>
            </div>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-actions">
                <button class="btn-details" onclick="showProductDetails(${product.id})">
                    <i data-lucide="eye"></i>
                    Details
                </button>
                <button class="btn-cart" onclick="addToCart(${product.id})">
                    <i data-lucide="shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i data-lucide="star" fill="currentColor"></i>';
    }

    if (hasHalfStar) {
        stars += '<i data-lucide="star-half" fill="currentColor"></i>';
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i data-lucide="star"></i>';
    }

    return stars;
}


// PRODUCT DETAILS MODAL

async function showProductDetails(productId) {
    const product = await fetchData(`/products/${productId}`);
    if (!product) return;

    const stars = generateStars(product.rating.rate);

    elements.modalBody.innerHTML = `
        <div class="modal-product">
            <div>
                <img src="${product.image}" alt="${product.title}" class="modal-image">
            </div>
            <div class="modal-details">
                <span class="product-category">${product.category}</span>
                <h2>${product.title}</h2>
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-count">${product.rating.rate} (${product.rating.count} reviews)</span>
                </div>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="modal-description">${product.description}</p>
                <div class="modal-actions">
                    <button class="btn-cart" onclick="addToCart(${product.id}); closeModal();">
                        <i data-lucide="shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    elements.productModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeModal() {
    elements.productModal.classList.remove('active');
    document.body.style.overflow = '';
}


// CART FUNCTIONALITY

function toggleCart() {
    const isActive = elements.cartSidebar.classList.toggle('active');
    elements.cartOverlay.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
}

async function addToCart(productId) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        showNotification('Product already in cart!');
        return;
    }

    // Fetch product details
    const product = await fetchData(`/products/${productId}`);
    if (!product) return;

    // Add to cart
    cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category
    });

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    updateCartUI();
    showNotification('Product added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('Product removed from cart');
}

function updateCartUI() {
    // Update cart count
    elements.cartCount.textContent = cart.length;

    // Update cart items
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="empty-cart">
                <i data-lucide="shopping-bag"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        elements.cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');
    }

    // Update total price
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    elements.totalPrice.textContent = `$${total.toFixed(2)}`;

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}


// NOTIFICATIONS

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// MAKE FUNCTIONS GLOBAL

window.showProductDetails = showProductDetails;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.closeModal = closeModal;
