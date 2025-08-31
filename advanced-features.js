// Advanced Features for Modern Shop
// Features: Local Storage, Favorites, Order History, User Preferences

class ShopFeatures {
    constructor() {
        this.init();
    }

    init() {
        this.setupLocalStorage();
        this.loadUserPreferences();
        this.setupFavorites();
        this.setupOrderHistory();
        this.setupDarkMode();
        this.setupRecentlyViewed();
    }

    // Local Storage Management
    setupLocalStorage() {
        // Check if localStorage is available
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            this.storageAvailable = true;
        } catch (e) {
            this.storageAvailable = false;
            console.warn('localStorage not available');
        }
    }

    // Save cart to localStorage
    saveCart(cart) {
        if (!this.storageAvailable) return;
        try {
            localStorage.setItem('shop_cart', JSON.stringify(cart));
        } catch (e) {
            console.warn('Failed to save cart:', e);
        }
    }

    // Load cart from localStorage
    loadCart() {
        if (!this.storageAvailable) return [];
        try {
            const cart = localStorage.getItem('shop_cart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.warn('Failed to load cart:', e);
            return [];
        }
    }

    // Favorites System
    setupFavorites() {
        this.favorites = this.loadFavorites();
        this.createFavoritesUI();
    }

    loadFavorites() {
        if (!this.storageAvailable) return [];
        try {
            const favorites = localStorage.getItem('shop_favorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            return [];
        }
    }

    saveFavorites() {
        if (!this.storageAvailable) return;
        try {
            localStorage.setItem('shop_favorites', JSON.stringify(this.favorites));
        } catch (e) {
            console.warn('Failed to save favorites:', e);
        }
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(productId);
        }
        this.saveFavorites();
        this.updateFavoritesUI();
        return this.isFavorite(productId);
    }

    isFavorite(productId) {
        return this.favorites.includes(productId);
    }

    createFavoritesUI() {
        // Add favorites button to existing product cards
        setTimeout(() => {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const productId = parseInt(card.querySelector('.add-to-cart-btn').onclick.toString().match(/\d+/)[0]);
                const favoriteBtn = document.createElement('button');
                favoriteBtn.className = 'favorite-btn';
                favoriteBtn.innerHTML = this.isFavorite(productId) ? '❤️' : '🤍';
                favoriteBtn.onclick = () => {
                    const isFav = this.toggleFavorite(productId);
                    favoriteBtn.innerHTML = isFav ? '❤️' : '🤍';
                    this.showNotification(isFav ? 'Ajouté aux favoris!' : 'Retiré des favoris');
                };
                card.appendChild(favoriteBtn);
            });
        }, 1000);
    }

    updateFavoritesUI() {
        // Update all favorite buttons
        const favoriteBtns = document.querySelectorAll('.favorite-btn');
        favoriteBtns.forEach(btn => {
            const productId = parseInt(btn.parentElement.querySelector('.add-to-cart-btn').onclick.toString().match(/\d+/)[0]);
            btn.innerHTML = this.isFavorite(productId) ? '❤️' : '🤍';
        });
    }

    // Order History
    setupOrderHistory() {
        this.orderHistory = this.loadOrderHistory();
    }

    loadOrderHistory() {
        if (!this.storageAvailable) return [];
        try {
            const history = localStorage.getItem('shop_order_history');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }

    saveOrder(order) {
        if (!this.storageAvailable) return;
        const orderData = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: order.items,
            total: order.total,
            status: 'confirmed'
        };
        this.orderHistory.push(orderData);
        try {
            localStorage.setItem('shop_order_history', JSON.stringify(this.orderHistory));
        } catch (e) {
            console.warn('Failed to save order history:', e);
        }
    }

    getOrderHistory() {
        return this.orderHistory;
    }

    // User Preferences
    loadUserPreferences() {
        if (!this.storageAvailable) return {};
        try {
            const prefs = localStorage.getItem('shop_preferences');
            return prefs ? JSON.parse(prefs) : {};
        } catch (e) {
            return {};
        }
    }

    saveUserPreferences(prefs) {
        if (!this.storageAvailable) return;
        try {
            localStorage.setItem('shop_preferences', JSON.stringify(prefs));
        } catch (e) {
            console.warn('Failed to save preferences:', e);
        }
    }

    // Dark Mode
    setupDarkMode() {
        const darkModeBtn = document.createElement('button');
        darkModeBtn.className = 'dark-mode-toggle';
        darkModeBtn.innerHTML = '🌙';
        darkModeBtn.onclick = () => this.toggleDarkMode();

        // Add to header
        const header = document.querySelector('.header .nav-container');
        if (header) {
            header.appendChild(darkModeBtn);
        }

        // Load saved preference
        const prefs = this.loadUserPreferences();
        if (prefs.darkMode) {
            this.enableDarkMode();
        }
    }

    toggleDarkMode() {
        const body = document.body;
        const isDark = body.classList.contains('dark-mode');

        if (isDark) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }

        // Save preference
        const prefs = this.loadUserPreferences();
        prefs.darkMode = !isDark;
        this.saveUserPreferences(prefs);
    }

    enableDarkMode() {
        document.body.classList.add('dark-mode');
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) toggle.innerHTML = '☀️';
    }

    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) toggle.innerHTML = '🌙';
    }

    // Recently Viewed Products
    setupRecentlyViewed() {
        this.recentlyViewed = this.loadRecentlyViewed();
    }

    loadRecentlyViewed() {
        if (!this.storageAvailable) return [];
        try {
            const viewed = localStorage.getItem('shop_recently_viewed');
            return viewed ? JSON.parse(viewed) : [];
        } catch (e) {
            return [];
        }
    }

    addToRecentlyViewed(productId) {
        if (!this.storageAvailable) return;

        // Remove if already exists
        const index = this.recentlyViewed.indexOf(productId);
        if (index > -1) {
            this.recentlyViewed.splice(index, 1);
        }

        // Add to beginning
        this.recentlyViewed.unshift(productId);

        // Keep only last 10
        if (this.recentlyViewed.length > 10) {
            this.recentlyViewed = this.recentlyViewed.slice(0, 10);
        }

        try {
            localStorage.setItem('shop_recently_viewed', JSON.stringify(this.recentlyViewed));
        } catch (e) {
            console.warn('Failed to save recently viewed:', e);
        }
    }

    getRecentlyViewed() {
        return this.recentlyViewed;
    }

    // Product Quick View
    setupQuickView() {
        // Add click handlers for product images
        setTimeout(() => {
            const productImages = document.querySelectorAll('.product-image');
            productImages.forEach(img => {
                img.style.cursor = 'pointer';
                img.onclick = (e) => {
                    e.preventDefault();
                    const card = img.closest('.product-card');
                    const productId = parseInt(card.querySelector('.add-to-cart-btn').onclick.toString().match(/\d+/)[0]);
                    this.showQuickView(productId);
                };
            });
        }, 1000);
    }

    showQuickView(productId) {
        // This would show a modal with product details
        // For now, just add to recently viewed
        this.addToRecentlyViewed(productId);
        this.showNotification('Produit ajouté aux récemment consultés');
    }

    // Enhanced Notifications
    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add to notification container or create one
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    // Export/Import Data
    exportUserData() {
        const data = {
            cart: this.loadCart(),
            favorites: this.favorites,
            orderHistory: this.orderHistory,
            preferences: this.loadUserPreferences(),
            recentlyViewed: this.recentlyViewed,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shop-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Données exportées avec succès!');
    }

    importUserData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.cart) localStorage.setItem('shop_cart', JSON.stringify(data.cart));
                if (data.favorites) localStorage.setItem('shop_favorites', JSON.stringify(data.favorites));
                if (data.orderHistory) localStorage.setItem('shop_order_history', JSON.stringify(data.orderHistory));
                if (data.preferences) localStorage.setItem('shop_preferences', JSON.stringify(data.preferences));
                if (data.recentlyViewed) localStorage.setItem('shop_recently_viewed', JSON.stringify(data.recentlyViewed));

                this.showNotification('Données importées avec succès! Actualisez la page.');
            } catch (error) {
                this.showNotification('Erreur lors de l\'importation des données', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize advanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.shopFeatures = new ShopFeatures();
});

// Add CSS for advanced features
const advancedCSS = `
<style>
/* Dark Mode Styles */
.dark-mode {
    background-color: #121212;
    color: #ffffff;
}

.dark-mode .header,
.dark-mode .product-card,
.dark-mode .search-filters,
.dark-mode .info-section {
    background-color: #1e1e1e;
    color: #ffffff;
}

.dark-mode .product-card,
.dark-mode .search-filters,
.dark-mode .info-section {
    border: 1px solid #333;
}

.dark-mode .product-title,
.dark-mode .info-section h2 {
    color: #ffffff;
}

.dark-mode .product-description {
    color: #cccccc;
}

/* Favorites Button */
.favorite-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    z-index: 10;
}

.favorite-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Dark Mode Toggle */
.dark-mode-toggle {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
    border-radius: 50%;
    transition: all 0.3s ease;
    margin-left: 10px;
}

.dark-mode-toggle:hover {
    background: rgba(255,255,255,0.1);
}

/* Notification Styles */
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
}

.notification {
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideInRight 0.3s ease;
}

.notification-success { background: #4CAF50; }
.notification-error { background: #f44336; }
.notification-info { background: #2196F3; }

.notification-icon {
    font-size: 20px;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Quick View Modal Styles */
.quick-view-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.quick-view-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
`;

// Add CSS to document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', advancedCSS);
});
