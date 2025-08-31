// Product Carousel System
if (typeof ProductCarousel === 'undefined') {
class ProductCarousel {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            itemsPerView: options.itemsPerView || 4,
            autoplay: options.autoplay || false,
            autoplayDelay: options.autoplayDelay || 3000,
            loop: options.loop || true,
            showDots: options.showDots || true,
            showArrows: options.showArrows || true,
            responsive: options.responsive || {
                768: { itemsPerView: 2 },
                480: { itemsPerView: 1 }
            }
        };

        this.currentIndex = 0;
        this.autoplayTimer = null;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        console.log('🎠 [CAROUSEL] Initializing ProductCarousel for container:', this.containerId);
        this.createCarousel();
        this.setupEventListeners();
        this.updateResponsiveSettings();
        this.renderProducts();

        if (this.options.autoplay) {
            this.startAutoplay();
        }

        // Update on window resize
        window.addEventListener('resize', () => {
            this.updateResponsiveSettings();
            this.updateCarouselPosition();
        });

        console.log('🎠 [CAROUSEL] ProductCarousel initialized successfully');
    }

    createCarousel() {
        const container = document.getElementById(this.containerId);
        console.log('🎠 [CAROUSEL] Looking for container:', this.containerId, 'Found:', !!container);
        if (!container) {
            console.error('🎠 [CAROUSEL] Container not found:', this.containerId);
            return;
        }

        container.innerHTML = `
            <div class="carousel-wrapper">
                <div class="carousel-container">
                    <div class="carousel-track" id="${this.containerId}-track">
                        <!-- Products will be inserted here -->
                    </div>
                </div>

                ${this.options.showArrows ? `
                    <button class="carousel-arrow carousel-prev" id="${this.containerId}-prev">
                        <span class="material-icons">chevron_left</span>
                    </button>
                    <button class="carousel-arrow carousel-next" id="${this.containerId}-next">
                        <span class="material-icons">chevron_right</span>
                    </button>
                ` : ''}

                ${this.options.showDots ? `
                    <div class="carousel-dots" id="${this.containerId}-dots">
                        <!-- Dots will be inserted here -->
                    </div>
                ` : ''}
            </div>
        `;

        this.track = document.getElementById(`${this.containerId}-track`);
        this.prevBtn = document.getElementById(`${this.containerId}-prev`);
        this.nextBtn = document.getElementById(`${this.containerId}-next`);
        this.dotsContainer = document.getElementById(`${this.containerId}-dots`);
    }

    setupEventListeners() {
        // Arrow navigation
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Touch events for mobile swipe
        this.setupTouchEvents();

        // Pause autoplay on hover
        const wrapper = document.querySelector(`#${this.containerId} .carousel-wrapper`);
        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => this.pauseAutoplay());
            wrapper.addEventListener('mouseleave', () => this.resumeAutoplay());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.closest(`#${this.containerId}`)) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prev();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.next();
                }
            }
        });
    }

    setupTouchEvents() {
        const track = this.track;
        if (!track) return;

        track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    renderProducts() {
        console.log('🎠 [CAROUSEL] Rendering products. Track exists:', !!this.track, 'Products available:', !!window.allProducts);
        if (!this.track || !window.allProducts) {
            console.warn('🎠 [CAROUSEL] Cannot render products - missing track or products');
            return;
        }

        const products = [...window.allProducts];
        const totalSlides = Math.ceil(products.length / this.options.itemsPerView);

        this.track.innerHTML = '';

        // Create slides
        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            const startIndex = i * this.options.itemsPerView;
            const endIndex = Math.min(startIndex + this.options.itemsPerView, products.length);

            for (let j = startIndex; j < endIndex; j++) {
                const product = products[j];
                if (product) {
                    const productCard = this.createProductCard(product);
                    slide.appendChild(productCard);
                }
            }

            this.track.appendChild(slide);
        }

        this.totalSlides = totalSlides;
        this.updateDots();
        this.updateCarouselPosition();
        this.updateNavigationButtons();
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'carousel-product-card';
        card.innerHTML = `
            <div class="carousel-product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/shop-icon-128.png'">
                <div class="carousel-product-overlay">
                    <button class="carousel-quick-view" onclick="showQuickView(${product.id})">
                        <span class="material-icons">visibility</span>
                    </button>
                </div>
            </div>
            <div class="carousel-product-info">
                <h4 class="carousel-product-title">${product.name}</h4>
                <div class="carousel-product-rating">
                    ${this.generateStars(Math.random() * 2 + 3)} <!-- Random rating for demo -->
                    <span class="rating-count">(${Math.floor(Math.random() * 50 + 10)})</span>
                </div>
                <p class="carousel-product-price">€${product.price.toFixed(2)}</p>
                <button class="carousel-add-to-cart" onclick="addToCart(${product.id})" data-product-id="${product.id}">
                    <span class="material-icons">add_shopping_cart</span>
                    Add to Cart
                </button>
            </div>
        `;
        return card;
    }

    generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<span class="material-icons star">star</span>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<span class="material-icons star">star_half</span>';
            } else {
                stars += '<span class="material-icons star">star_border</span>';
            }
        }

        return stars;
    }

    updateDots() {
        if (!this.dotsContainer || !this.options.showDots) return;

        this.dotsContainer.innerHTML = '';

        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === this.currentIndex ? 'active' : ''}`;
            dot.onclick = () => this.goToSlide(i);
            this.dotsContainer.appendChild(dot);
        }
    }

    updateCarouselPosition() {
        if (!this.track) return;

        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
    }

    updateNavigationButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        // Update prev button
        if (this.currentIndex === 0 && !this.options.loop) {
            this.prevBtn.disabled = true;
            this.prevBtn.classList.add('disabled');
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.classList.remove('disabled');
        }

        // Update next button
        if (this.currentIndex === this.totalSlides - 1 && !this.options.loop) {
            this.nextBtn.disabled = true;
            this.nextBtn.classList.add('disabled');
        } else {
            this.nextBtn.disabled = false;
            this.nextBtn.classList.remove('disabled');
        }
    }

    prev() {
        if (this.isTransitioning) return;

        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        } else if (this.options.loop) {
            this.goToSlide(this.totalSlides - 1);
        }
    }

    next() {
        if (this.isTransitioning) return;

        if (this.currentIndex < this.totalSlides - 1) {
            this.goToSlide(this.currentIndex + 1);
        } else if (this.options.loop) {
            this.goToSlide(0);
        }
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;

        this.isTransitioning = true;
        this.currentIndex = index;

        this.updateCarouselPosition();
        this.updateDots();
        this.updateNavigationButtons();

        // Reset transition flag after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }

    startAutoplay() {
        if (this.autoplayTimer) return;

        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.options.autoplayDelay);
    }

    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    resumeAutoplay() {
        if (this.options.autoplay && !this.autoplayTimer) {
            this.startAutoplay();
        }
    }

    updateResponsiveSettings() {
        const width = window.innerWidth;

        // Reset to default
        this.options.itemsPerView = 4;

        // Apply responsive settings
        Object.keys(this.options.responsive).forEach(breakpoint => {
            if (width <= parseInt(breakpoint)) {
                Object.assign(this.options, this.options.responsive[breakpoint]);
            }
        });

        // Re-render if needed
        if (this.track) {
            this.renderProducts();
        }
    }

    // Public methods
    refresh() {
        this.renderProducts();
    }

    destroy() {
        this.pauseAutoplay();

        // Remove event listeners
        window.removeEventListener('resize', this.updateResponsiveSettings);

        // Clear HTML
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}
}

// Quick view modal for products
if (typeof QuickViewModal === 'undefined') {
class QuickViewModal {
    constructor() {
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.id = 'quickViewModal';
        modal.innerHTML = `
            <div class="quick-view-content">
                <span class="quick-view-close" onclick="quickViewModal.close()">&times;</span>
                <div id="quickViewBody">
                    <!-- Product details will be loaded here -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.close();
            }
        });
    }

    show(productId) {
        const product = this.getProductById(productId);
        if (!product) return;

        const modal = document.getElementById('quickViewModal');
        const body = document.getElementById('quickViewBody');

        // Get product reviews and rating
        const reviews = window.reviewsSystem ? window.reviewsSystem.getProductReviews(productId) : [];
        const avgRating = window.reviewsSystem ? window.reviewsSystem.getAverageRating(productId) : 0;

        body.innerHTML = `
            <div class="quick-view-product">
                <div class="quick-view-image">
                    <img src="${product.largeImage || product.image}" alt="${product.name}"
                         onerror="this.src='images/shop-icon-128.png'">
                </div>
                <div class="quick-view-details">
                    <h2>${product.name}</h2>
                    <div class="quick-view-rating">
                        ${window.reviewsSystem ? window.reviewsSystem.generateStars(avgRating) : ''}
                        <span class="rating-score">${avgRating.toFixed(1)}</span>
                        <span class="review-count">(${reviews.length} reviews)</span>
                    </div>
                    <p class="quick-view-price">€${product.price.toFixed(2)}</p>
                    <div class="quick-view-description">
                        ${product.description}
                    </div>
                    <div class="quick-view-meta">
                        <span class="meta-item">
                            <span class="material-icons">category</span>
                            Category: ${product.category}
                        </span>
                        <span class="meta-item">
                            <span class="material-icons">inventory</span>
                            In Stock
                        </span>
                    </div>
                    <div class="quick-view-actions">
                        <button class="quick-add-to-cart" onclick="addToCart(${productId}); quickViewModal.close()">
                            <span class="material-icons">add_shopping_cart</span>
                            Add to Cart
                        </button>
                        <button class="quick-add-to-wishlist" onclick="wishlistSystem.toggleWishlist(${productId})">
                            <span class="material-icons">favorite_border</span>
                            Add to Wishlist
                        </button>
                        <button class="quick-compare" onclick="comparisonSystem.addToComparison(${productId})">
                            <span class="material-icons">compare</span>
                            Compare
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('quickViewModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    getProductById(productId) {
        if (window.allProducts) {
            return window.allProducts.find(p => p.id === productId);
        }
        return null;
    }
}
}

// Quick view function
function showQuickView(productId) {
    if (!window.quickViewModal) {
        window.quickViewModal = new QuickViewModal();
    }
    window.quickViewModal.show(productId);
}

// CSS for quick view modal
const quickViewCSS = `
<style>
.quick-view-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.quick-view-content {
    position: relative;
    background: white;
    margin: 5% auto;
    padding: 0;
    border-radius: 12px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.quick-view-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    z-index: 10001;
}

.quick-view-close:hover {
    color: #333;
}

.quick-view-product {
    display: flex;
    min-height: 500px;
}

.quick-view-image {
    flex: 0 0 50%;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.quick-view-image img {
    max-width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.quick-view-details {
    flex: 1;
    padding: 30px;
    display: flex;
    flex-direction: column;
}

.quick-view-details h2 {
    margin-bottom: 15px;
    color: #333;
    font-size: 1.8rem;
    line-height: 1.3;
}

.quick-view-rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.quick-view-rating .star {
    color: #ffc107;
    font-size: 18px;
}

.rating-score {
    font-weight: 600;
    color: #333;
}

.review-count {
    color: #666;
    font-size: 0.9rem;
}

.quick-view-price {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 20px;
}

.quick-view-description {
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
    flex: 1;
}

.quick-view-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 30px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 0.9rem;
}

.meta-item .material-icons {
    font-size: 16px;
    color: #667eea;
}

.quick-view-actions {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.quick-add-to-cart,
.quick-add-to-wishlist,
.quick-compare {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    flex: 1;
    justify-content: center;
}

.quick-add-to-cart {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.quick-add-to-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.quick-add-to-wishlist {
    background: #e91e63;
    color: white;
}

.quick-add-to-wishlist:hover {
    background: #c2185b;
    transform: translateY(-2px);
}

.quick-compare {
    background: #ff9800;
    color: white;
}

.quick-compare:hover {
    background: #f57c00;
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .quick-view-product {
        flex-direction: column;
    }

    .quick-view-image,
    .quick-view-details {
        flex: none;
        padding: 20px;
    }

    .quick-view-image {
        order: -1;
    }

    .quick-view-details h2 {
        font-size: 1.5rem;
    }

    .quick-view-price {
        font-size: 1.8rem;
    }

    .quick-view-actions {
        flex-direction: column;
    }

    .quick-add-to-cart,
    .quick-add-to-wishlist,
    .quick-compare {
        width: 100%;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
`;

// Add CSS to document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', quickViewCSS);
});

// CSS for the carousel
const carouselCSS = `
<style>
/* Carousel Container */
.carousel-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.carousel-container {
    overflow: hidden;
    border-radius: 12px;
}

/* Carousel Track */
.carousel-track {
    display: flex;
    transition: transform 0.3s ease-in-out;
    width: 100%;
}

.carousel-slide {
    flex: 0 0 100%;
    display: flex;
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;
}

/* Product Cards */
.carousel-product-card {
    flex: 1;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    position: relative;
}

.carousel-product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.carousel-product-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.carousel-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.carousel-product-card:hover .carousel-product-image img {
    transform: scale(1.05);
}

.carousel-product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.carousel-product-card:hover .carousel-product-overlay {
    opacity: 1;
}

.carousel-quick-view {
    background: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.carousel-quick-view:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

.carousel-product-info {
    padding: 15px;
}

.carousel-product-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #333;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.carousel-product-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
}

.carousel-product-rating .star {
    font-size: 14px;
    color: #ffc107;
}

.rating-count {
    font-size: 12px;
    color: #666;
}

.carousel-product-price {
    font-size: 18px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 12px;
}

.carousel-add-to-cart {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.carousel-add-to-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Navigation Arrows */
.carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    z-index: 10;
}

.carousel-arrow:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.carousel-arrow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.carousel-arrow.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.carousel-prev {
    left: 15px;
}

.carousel-next {
    right: 15px;
}

/* Dots Navigation */
.carousel-dots {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
}

.carousel-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.3s ease;
}

.carousel-dot:hover {
    background: rgba(255,255,255,0.8);
}

.carousel-dot.active {
    background: white;
    transform: scale(1.2);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .carousel-slide {
        gap: 15px;
        padding: 15px;
    }

    .carousel-product-image {
        height: 180px;
    }
}

@media (max-width: 768px) {
    .carousel-arrow {
        width: 40px;
        height: 40px;
    }

    .carousel-arrow .material-icons {
        font-size: 20px;
    }

    .carousel-slide {
        gap: 10px;
        padding: 10px;
    }

    .carousel-product-image {
        height: 150px;
    }

    .carousel-product-info {
        padding: 12px;
    }

    .carousel-product-title {
        font-size: 14px;
    }

    .carousel-product-price {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .carousel-dots {
        bottom: 10px;
    }

    .carousel-dot {
        width: 10px;
        height: 10px;
    }

    .carousel-arrow {
        width: 35px;
        height: 35px;
    }

    .carousel-arrow .material-icons {
        font-size: 18px;
    }
}

/* Touch-friendly for mobile */
@media (hover: none) and (pointer: coarse) {
    .carousel-product-card:hover {
        transform: none;
    }

    .carousel-product-overlay {
        opacity: 1;
        background: rgba(0,0,0,0.3);
    }

    .carousel-arrow:active {
        transform: translateY(-50%) scale(0.95);
    }
}

/* Accessibility */
.carousel-arrow:focus,
.carousel-dot:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

/* Animation for slide transitions */
.carousel-track {
    will-change: transform;
}

/* Loading state */
.carousel-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: #f8f9fa;
    border-radius: 12px;
}

.carousel-loading .material-icons {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
`;

// Add CSS to document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', carouselCSS);
});

// Initialize carousel when products are loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎠 [CAROUSEL] DOM Content Loaded - Initializing carousel system');

    // Wait for products to be loaded
    const checkProducts = setInterval(() => {
        if (window.allProducts && window.allProducts.length > 0) {
            clearInterval(checkProducts);
            console.log('🎠 [CAROUSEL] Products loaded, initializing carousel with', window.allProducts.length, 'products');

            try {
                // Initialize carousel
                window.productCarousel = new ProductCarousel('productCarousel', {
                    itemsPerView: 4,
                    autoplay: true,
                    autoplayDelay: 4000,
                    loop: true,
                    showDots: true,
                    showArrows: true,
                    responsive: {
                        1024: { itemsPerView: 3 },
                        768: { itemsPerView: 2 },
                        480: { itemsPerView: 1 }
                    }
                });
                console.log('🎠 [CAROUSEL] Carousel initialized successfully');
            } catch (error) {
                console.error('🎠 [CAROUSEL] Error initializing carousel:', error);
            }
        }
    }, 100);

    // Timeout after 10 seconds to prevent infinite waiting
    setTimeout(() => {
        if (!window.productCarousel) {
            console.warn('🎠 [CAROUSEL] Timeout waiting for products, initializing with empty carousel');
            clearInterval(checkProducts);
            try {
                window.productCarousel = new ProductCarousel('productCarousel', {
                    itemsPerView: 4,
                    autoplay: false,
                    loop: true,
                    showDots: true,
                    showArrows: true
                });
                console.log('🎠 [CAROUSEL] Fallback carousel initialized');
            } catch (error) {
                console.error('🎠 [CAROUSEL] Error in fallback initialization:', error);
            }
        }
    }, 10000);
});
