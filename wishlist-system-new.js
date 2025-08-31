// Wishlist System - Version corrigée
if (typeof WishlistSystemNew === 'undefined') {
class WishlistSystemNew {
    constructor() {
        this.wishlist = [];
        this.init();
    }

    init() {
        this.loadWishlist();
        this.createWishlistUI();
        this.setupEventListeners();
    }

    // Charger la wishlist depuis localStorage
    loadWishlist() {
        try {
            const saved = localStorage.getItem('user_wishlist');
            this.wishlist = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.wishlist = [];
            console.warn('Erreur lors du chargement de la wishlist:', e);
        }
    }

    // Sauvegarder la wishlist
    saveWishlist() {
        try {
            localStorage.setItem('user_wishlist', JSON.stringify(this.wishlist));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde de la wishlist:', e);
        }
    }

    // Créer l'interface de la wishlist
    createWishlistUI() {
        console.log('🎯 [NEW] Creating wishlist UI...');

        // Attendre que les produits soient chargés
        const waitForProducts = () => {
            const productCards = document.querySelectorAll('.product-card, .carousel-product-card');
            console.log(`🎯 [NEW] Found ${productCards.length} product cards`);

            if (productCards.length === 0) {
                console.log('⏳ [NEW] Waiting for products to load...');
                setTimeout(waitForProducts, 500);
                return;
            }

            // Créer les boutons wishlist de manière très simple et sécurisée
            try {
                this.createWishlistButtons(productCards);
                this.addWishlistToHeader();
                this.createWishlistModal();
                console.log('✅ [NEW] Wishlist UI created successfully');
            } catch (error) {
                console.error('❌ [NEW] Error creating wishlist UI:', error);
            }
        };

        setTimeout(waitForProducts, 500);
    }

    // Méthode simplifiée pour créer les boutons wishlist
    createWishlistButtons(productCards) {
        productCards.forEach((card, index) => {
            // Éviter de dupliquer les boutons
            if (card.querySelector('.wishlist-btn')) {
                return;
            }

            const productId = this.getProductIdFromCard(card);
            if (!productId) {
                return;
            }

            // Créer le bouton wishlist
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.setAttribute('data-product-id', productId);
            wishlistBtn.innerHTML = this.isInWishlist(productId) ?
                '<span class="material-icons">favorite</span>' :
                '<span class="material-icons">favorite_border</span>';

            wishlistBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleWishlist(productId);
            };

            // Positionner le bouton de manière absolue sur la carte
            wishlistBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                z-index: 10;
            `;

            // Assurer que la carte a une position relative
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }

            // Ajouter le bouton à la carte de manière sécurisée
            try {
                card.appendChild(wishlistBtn);
                console.log(`✅ [NEW] Added wishlist button to card ${index}`);
            } catch (error) {
                console.error(`❌ [NEW] Failed to add wishlist button to card ${index}:`, error);
            }
        });
    }

    getProductIdFromCard(card) {
        // Méthode 1: Chercher dans les attributs data de la carte
        const cardDataId = card.getAttribute('data-product-id') ||
                          card.getAttribute('data-id') ||
                          card.getAttribute('data-productid');

        if (cardDataId) {
            const id = parseInt(cardDataId);
            if (!isNaN(id)) {
                return id;
            }
        }

        // Méthode 2: Chercher dans les boutons d'ajout au panier
        const addToCartBtn = card.querySelector('.add-to-cart-btn, .carousel-add-to-cart, button[onclick*="addToCart"]');

        if (addToCartBtn) {
            // Essayer d'extraire l'ID depuis l'attribut onclick
            if (addToCartBtn.onclick) {
                const onclickStr = addToCartBtn.onclick.toString();
                const match = onclickStr.match(/addToCart\((\d+)\)/);
                if (match) {
                    const id = parseInt(match[1]);
                    return id;
                }
            }

            // Essayer depuis un attribut data-id du bouton
            const btnDataId = addToCartBtn.getAttribute('data-product-id') ||
                             addToCartBtn.getAttribute('data-id');

            if (btnDataId) {
                const id = parseInt(btnDataId);
                if (!isNaN(id)) {
                    return id;
                }
            }
        }

        // Méthode 3: Chercher dans l'URL de l'image (méthode de secours)
        const img = card.querySelector('img');
        if (img && img.src) {
            const match = img.src.match(/\/(\d+)\./) || img.src.match(/product_(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                if (!isNaN(id)) {
                    return id;
                }
            }
        }

        // Méthode 4: Générer un ID basé sur l'index dans le tableau (dernier recours)
        const allCards = Array.from(document.querySelectorAll('.product-card, .carousel-product-card'));
        const index = allCards.indexOf(card);
        if (index >= 0 && window.allProducts && window.allProducts[index]) {
            const id = window.allProducts[index].id;
            return id;
        }

        return null;
    }

    addWishlistToHeader() {
        const headerNav = document.querySelector('.nav-container');
        if (headerNav && !headerNav.querySelector('.wishlist-header-btn')) {
            const wishlistBtn = document.createElement('div');
            wishlistBtn.className = 'wishlist-header-btn';
            wishlistBtn.innerHTML = `
                <button onclick="wishlistSystemNew.showWishlistModal()">
                    <span class="material-icons">favorite</span>
                    <span class="wishlist-count" id="wishlistCount">${this.wishlist.length}</span>
                </button>
            `;
            headerNav.appendChild(wishlistBtn);
        }
    }

    createWishlistModal() {
        if (document.getElementById('wishlistModal')) {
            return; // Modal déjà créée
        }

        const modal = document.createElement('div');
        modal.className = 'wishlist-modal';
        modal.id = 'wishlistModal';
        modal.innerHTML = `
            <div class="wishlist-modal-content">
                <span class="wishlist-close" onclick="wishlistSystemNew.closeWishlistModal()">&times;</span>
                <div class="wishlist-header">
                    <h3><span class="material-icons">favorite</span> Ma Liste de Souhaits</h3>
                    <p>Découvrez vos produits préférés</p>
                </div>
                <div id="wishlistContent">
                    <!-- Le contenu sera chargé dynamiquement -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
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
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    updateWishlistUI() {
        // Mettre à jour tous les boutons wishlist
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            const card = btn.closest('.product-card, .carousel-product-card');
            const productId = this.getProductIdFromCard(card);

            if (productId && this.isInWishlist(productId)) {
                btn.innerHTML = '<span class="material-icons">favorite</span>';
                btn.classList.add('in-wishlist');
            } else {
                btn.innerHTML = '<span class="material-icons">favorite_border</span>';
                btn.classList.remove('in-wishlist');
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
                <div class="empty-wishlist">
                    <span class="material-icons">favorite_border</span>
                    <h3>Votre liste de souhaits est vide</h3>
                    <p>Ajoutez des produits à votre liste pour les retrouver facilement !</p>
                    <button onclick="wishlistSystemNew.closeWishlistModal(); document.getElementById('products').scrollIntoView({behavior: 'smooth'});" class="browse-btn">
                        Découvrir les produits
                    </button>
                </div>
            `;
        } else {
            let wishlistHtml = `
                <div class="wishlist-stats">
                    <span>${this.wishlist.length} produit(s) dans votre liste</span>
                </div>
                <div class="wishlist-grid">
            `;

            this.wishlist.forEach(productId => {
                const product = this.getProductById(productId);
                if (product) {
                    wishlistHtml += `
                        <div class="wishlist-item">
                            <div class="wishlist-item-image">
                                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/shop-icon-128.png'">
                                <button class="remove-from-wishlist" onclick="wishlistSystemNew.toggleWishlist(${productId})">
                                    <span class="material-icons">close</span>
                                </button>
                            </div>
                            <div class="wishlist-item-info">
                                <h4>${product.name}</h4>
                                <p class="wishlist-item-price">${product.price.toFixed(2)} €</p>
                                <p class="wishlist-item-description">${product.description.substring(0, 80)}...</p>
                                <div class="wishlist-item-actions">
                                    <button class="add-to-cart-from-wishlist" onclick="addToCart(${productId}); wishlistSystemNew.showNotification('Produit ajouté au panier !', 'success')">
                                        <span class="material-icons">add_shopping_cart</span>
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
    }

    closeWishlistModal() {
        const modal = document.getElementById('wishlistModal');
        if (modal) {
            modal.style.display = 'none';
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

        // Écouter l'événement de chargement des produits
        document.addEventListener('productsLoaded', (event) => {
            console.log('📦 [NEW] Products loaded event received:', event.detail);
            // Re-créer l'interface wishlist si nécessaire
            if (document.querySelectorAll('.product-card, .carousel-product-card').length > 0) {
                this.createWishlistUI();
            }
        });
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
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}
}

// Initialiser le système de wishlist
document.addEventListener('DOMContentLoaded', function() {
    window.wishlistSystemNew = new WishlistSystemNew();
});
