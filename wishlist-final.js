// =====================================================
// WISHLIST SYSTEM - FINAL VERSION
// Fully functional wishlist system
// =====================================================

// Prevent redeclarations
if (typeof window.wishlistSystemInstance === 'undefined') {

console.log('🎯 [WISHLIST] Loading Wishlist System...');

// WishlistSystem class definition
class WishlistSystem {
    constructor() {
        console.log('🎯 [WISHLIST] Constructor called');
        this.wishlist = [];
        this.init();
    }

    init() {
        console.log('🎯 [WISHLIST] Initializing...');
        this.loadWishlist();
        this.createWishlistUI();
        this.setupEventListeners();
        console.log('✅ [WISHLIST] Initialization complete');
    }

    // Load wishlist from localStorage
    loadWishlist() {
        try {
            const saved = localStorage.getItem('user_wishlist');
            this.wishlist = saved ? JSON.parse(saved) : [];
            console.log('📦 [WISHLIST] Loaded wishlist:', this.wishlist.length, 'items');
        } catch (e) {
            console.warn('⚠️ [WISHLIST] Error loading wishlist:', e);
            this.wishlist = [];
        }
    }

    // Save wishlist
    saveWishlist() {
        try {
            localStorage.setItem('user_wishlist', JSON.stringify(this.wishlist));
            console.log('💾 [WISHLIST] Wishlist saved');
        } catch (e) {
            console.warn('⚠️ [WISHLIST] Error saving wishlist:', e);
        }
    }

    // Create wishlist interface
    createWishlistUI() {
        console.log('🎨 [WISHLIST] Creating UI...');

        // Wait for products to be loaded
        const waitForProducts = () => {
            const productCards = document.querySelectorAll('.product-card, .carousel-product-card');
            console.log(`🎯 [WISHLIST] Found ${productCards.length} product cards`);

            if (productCards.length === 0) {
                console.log('⏳ [WISHLIST] Waiting for products...');
                setTimeout(waitForProducts, 500);
                return;
            }

            // Create wishlist buttons
            this.createWishlistButtons(productCards);

            // Add header button
            this.addWishlistToHeader();

            // Create modal
            this.createWishlistModal();

            console.log('✅ [WISHLIST] UI creation complete');
        };

        setTimeout(waitForProducts, 500);
    }

    // Create wishlist buttons
    createWishlistButtons(productCards) {
        console.log(`🔧 [WISHLIST] Creating buttons for ${productCards.length} cards`);

        productCards.forEach((card, index) => {
            // Éviter les doublons
            if (card.querySelector('.wishlist-btn')) {
                return;
            }

            const productId = this.getProductIdFromCard(card);
            if (!productId) {
                return;
            }

            // Create button
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.setAttribute('data-product-id', productId);
            wishlistBtn.innerHTML = this.isInWishlist(productId) ?
                '<span class="material-icons">favorite</span>' :
                '<span class="material-icons">favorite_border</span>';

            wishlistBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('❤️ [WISHLIST] Button clicked for product:', productId);
                this.toggleWishlist(productId);
            };

            // Styles inline pour s'assurer qu'ils fonctionnent
            wishlistBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #e91e63;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                z-index: 10;
                font-size: 20px;
            `;

            // Assurer que la carte a une position relative
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }

            // Ajouter le bouton
            try {
                card.appendChild(wishlistBtn);
                console.log(`✅ [WISHLIST] Added button to card ${index}`);
            } catch (error) {
                console.error(`❌ [WISHLIST] Failed to add button to card ${index}:`, error);
            }
        });

        console.log('✅ [WISHLIST] All buttons created');
    }

    getProductIdFromCard(card) {
        // Method 1: Data attributes
        const cardDataId = card.getAttribute('data-product-id') ||
                          card.getAttribute('data-id') ||
                          card.getAttribute('data-productid');

        if (cardDataId) {
            const id = parseInt(cardDataId);
            if (!isNaN(id)) {
                return id;
            }
        }

        // Method 2: Add to cart buttons
        const addToCartBtn = card.querySelector('.add-to-cart-btn, .carousel-add-to-cart, button[onclick*="addToCart"]');

        if (addToCartBtn) {
            if (addToCartBtn.onclick) {
                const onclickStr = addToCartBtn.onclick.toString();
                const match = onclickStr.match(/addToCart\((\d+)\)/);
                if (match) {
                    return parseInt(match[1]);
                }
            }

            const btnDataId = addToCartBtn.getAttribute('data-product-id') ||
                             addToCartBtn.getAttribute('data-id');

            if (btnDataId) {
                const id = parseInt(btnDataId);
                if (!isNaN(id)) {
                    return id;
                }
            }
        }

        // Method 3: Array index
        const allCards = Array.from(document.querySelectorAll('.product-card, .carousel-product-card'));
        const index = allCards.indexOf(card);
        if (index >= 0 && window.allProducts && window.allProducts[index]) {
            return window.allProducts[index].id;
        }

        return null;
    }

    addWishlistToHeader() {
        const headerNav = document.querySelector('.nav-container');
        if (headerNav && !headerNav.querySelector('.wishlist-header-btn')) {
            const wishlistBtn = document.createElement('div');
            wishlistBtn.className = 'wishlist-header-btn';
            wishlistBtn.innerHTML = `
                <button onclick="window.wishlistSystem.showWishlistModal()" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 8px 12px;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                ">
                    <span class="material-icons" style="font-size: 24px;">favorite</span>
                    <span class="wishlist-count" id="wishlistCount" style="
                        background: #e91e63;
                        color: white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 600;
                    ">${this.wishlist.length}</span>
                </button>
            `;
            headerNav.appendChild(wishlistBtn);
            console.log('✅ [WISHLIST] Header button added');
        }
    }

    createWishlistModal() {
        if (document.getElementById('wishlistModal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'wishlist-modal';
        modal.id = 'wishlistModal';
        modal.innerHTML = `
            <div class="wishlist-modal-content" style="
                background: white;
                margin: 5% auto;
                padding: 0;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <span class="wishlist-close" onclick="window.wishlistSystem.closeWishlistModal()" style="
                    position: absolute;
                    right: 20px;
                    top: 15px;
                    font-size: 28px;
                    cursor: pointer;
                    color: #666;
                    z-index: 10001;
                ">&times;</span>
                <div class="wishlist-header" style="
                    padding: 30px;
                    text-align: center;
                    border-bottom: 1px solid #eee;
                    background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
                ">
                    <h3 style="
                        margin-bottom: 10px;
                        color: #333;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        font-size: 1.5rem;
                    ">
                        <span class="material-icons" style="color: #e91e63;">favorite</span>
                        Ma Liste de Souhaits
                    </h3>
                    <p style="color: #666; margin: 0;">Découvrez vos produits préférés</p>
                </div>
                <div id="wishlistContent"></div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('✅ [WISHLIST] Modal created');
    }

    toggleWishlist(productId) {
        const index = this.wishlist.indexOf(productId);

        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showNotification('Produit retiré de votre liste de souhaits', 'info');
        } else {
            this.wishlist.push(productId);
            this.showNotification('Produit ajouté à votre liste de souhaits ❤️', 'success');
        }

        this.saveWishlist();
        this.updateWishlistUI();
        this.updateWishlistCount();

        console.log('🔄 [WISHLIST] Toggled product:', productId, 'In wishlist:', this.isInWishlist(productId));
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    updateWishlistUI() {
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            const card = btn.closest('.product-card, .carousel-product-card');
            const productId = this.getProductIdFromCard(card);

            if (productId && this.isInWishlist(productId)) {
                btn.innerHTML = '<span class="material-icons">favorite</span>';
                btn.style.borderColor = '#e91e63';
                btn.querySelector('.material-icons').style.color = '#e91e63';
            } else {
                btn.innerHTML = '<span class="material-icons">favorite_border</span>';
                btn.style.borderColor = '#e91e63';
                btn.querySelector('.material-icons').style.color = '#666';
            }
        });
    }

    updateWishlistCount() {
        const countElement = document.getElementById('wishlistCount');
        if (countElement) {
            countElement.textContent = this.wishlist.length;
        }
    }

    showWishlistModal() {
        const modal = document.getElementById('wishlistModal');
        const content = document.getElementById('wishlistContent');

        if (this.wishlist.length === 0) {
            content.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 60px 30px;
                ">
                    <span class="material-icons" style="
                        font-size: 64px;
                        color: #e0e0e0;
                        margin-bottom: 20px;
                        display: block;
                    ">favorite_border</span>
                    <h3 style="margin-bottom: 10px; color: #666;">Votre liste de souhaits est vide</h3>
                    <p style="color: #999; margin-bottom: 30px;">Ajoutez des produits à votre liste pour les retrouver facilement !</p>
                    <button onclick="window.wishlistSystem.closeWishlistModal(); document.getElementById('products').scrollIntoView({behavior: 'smooth'});" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    ">
                        Découvrir les produits
                    </button>
                </div>
            `;
        } else {
            let wishlistHtml = `
                <div style="
                    padding: 15px 30px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #eee;
                    text-align: center;
                    font-weight: 500;
                    color: #333;
                ">
                    ${this.wishlist.length} produit(s) dans votre liste
                </div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    padding: 30px;
                ">
            `;

            this.wishlist.forEach(productId => {
                const product = this.getProductById(productId);
                if (product) {
                    wishlistHtml += `
                        <div style="
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                            transition: transform 0.3s ease;
                        ">
                            <div style="
                                position: relative;
                                height: 180px;
                                overflow: hidden;
                            ">
                                <img src="${product.image}" alt="${product.name}" style="
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                " onerror="this.src='images/shop-icon-128.png'">
                                <button onclick="window.wishlistSystem.toggleWishlist(${productId})" style="
                                    position: absolute;
                                    top: 10px;
                                    right: 10px;
                                    background: rgba(244, 67, 54, 0.9);
                                    color: white;
                                    border: none;
                                    border-radius: 50%;
                                    width: 30px;
                                    height: 30px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                ">
                                    <span class="material-icons" style="font-size: 16px;">close</span>
                                </button>
                            </div>
                            <div style="padding: 15px;">
                                <h4 style="
                                    margin-bottom: 8px;
                                    color: #333;
                                    font-size: 14px;
                                    line-height: 1.3;
                                ">${product.name}</h4>
                                <p style="
                                    font-size: 16px;
                                    font-weight: 700;
                                    color: #667eea;
                                    margin-bottom: 10px;
                                ">${product.price.toFixed(2)} €</p>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="addToCart(${productId}); window.wishlistSystem.showNotification('Produit ajouté au panier !', 'success')" style="
                                        flex: 1;
                                        padding: 8px 12px;
                                        border: none;
                                        border-radius: 20px;
                                        cursor: pointer;
                                        font-size: 12px;
                                        font-weight: 500;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 5px;
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        transition: all 0.3s ease;
                                    ">
                                        <span class="material-icons" style="font-size: 14px;">add_shopping_cart</span>
                                        Ajouter au panier
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            wishlistHtml += `
                </div>
            `;

            content.innerHTML = wishlistHtml;
        }

        modal.style.display = 'block';
        console.log('📋 [WISHLIST] Modal shown');
    }

    closeWishlistModal() {
        const modal = document.getElementById('wishlistModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('📋 [WISHLIST] Modal closed');
        }
    }

    getProductById(productId) {
        if (window.allProducts) {
            return window.allProducts.find(p => p.id === productId);
        }
        return null;
    }

    setupEventListeners() {
        // Fermer la modal en cliquant en dehors
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('wishlistModal');
            if (event.target === modal) {
                this.closeWishlistModal();
            }
        });

        // Listen to product loading event
        document.addEventListener('productsLoaded', (event) => {
            console.log('📦 [WISHLIST] Products loaded event received');
            if (document.querySelectorAll('.product-card, .carousel-product-card').length > 0) {
                this.createWishlistUI();
            }
        });

        console.log('👂 [WISHLIST] Event listeners set up');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);

        console.log('🔔 [WISHLIST] Notification shown:', message);
    }
}

// =====================================================
// INITIALISATION DU SYSTÈME
// =====================================================

console.log('🚀 [WISHLIST] Initializing Wishlist System...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 [WISHLIST] DOM ready, creating system instance...');
        window.wishlistSystem = new WishlistSystem();
        window.wishlistSystemInstance = window.wishlistSystem; // Mark as initialized
        console.log('✅ [WISHLIST] System instance created successfully');
    });
} else {
    // DOM already ready
    console.log('📄 [WISHLIST] DOM already ready, creating system instance...');
    window.wishlistSystem = new WishlistSystem();
            window.wishlistSystemInstance = window.wishlistSystem; // Mark as initialized
    console.log('✅ [WISHLIST] System instance created successfully');
}

console.log('🎯 [WISHLIST] Wishlist System loaded and ready!');

} // Closing condition to prevent redeclarations
