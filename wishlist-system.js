// Système de liste de souhaits (Wishlist)
if (typeof WishlistSystem === 'undefined') {
class WishlistSystem {
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
        console.log('🎯 Creating wishlist UI...');

        // Attendre que les produits soient chargés
        const waitForProducts = () => {
            const productCards = document.querySelectorAll('.product-card, .carousel-product-card');
            console.log(`🎯 Found ${productCards.length} product cards`);

            if (productCards.length === 0) {
                console.log('⏳ Waiting for products to load...');
                setTimeout(waitForProducts, 500);
                return;
            }

            // Créer les boutons wishlist de manière très simple et sécurisée
            try {
                this.createWishlistButtons(productCards);

                // Ajouter un bouton wishlist dans le header
                this.addWishlistToHeader();

                // Créer la modal de wishlist
                this.createWishlistModal();

                console.log('✅ Wishlist UI created successfully');
            } catch (error) {
                console.error('❌ Error creating wishlist UI:', error);
                // Retry après un délai
                setTimeout(() => {
                    console.log('🔄 Retrying wishlist UI creation...');
                    this.createWishlistUI();
                }, 1000);
            }
        };

        // Démarrer après un court délai
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

            } catch (error) {
                console.error('❌ Failed to add wishlist button to card', index, error);
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

        // Méthode 4: Générer un ID basé sur l'index dans la liste (dernier recours)
        const allCards = Array.from(document.querySelectorAll('.product-card, .carousel-product-card'));
        const index = allCards.indexOf(card);
        if (index >= 0 && window.allProducts && window.allProducts[index]) {
            const id = window.allProducts[index].id;
            return id;
        }

        console.warn('❌ Could not find product ID for card:', card);
        return null;
    }

    addWishlistToHeader() {
        const headerNav = document.querySelector('.nav-container');
        if (headerNav) {
            const wishlistBtn = document.createElement('div');
            wishlistBtn.className = 'wishlist-header-btn';
            wishlistBtn.innerHTML = `
                <button onclick="wishlistSystem.showWishlistModal()">
                    <span class="material-icons">favorite</span>
                    <span class="wishlist-count" id="wishlistCount">${this.wishlist.length}</span>
                </button>
            `;
            headerNav.appendChild(wishlistBtn);
        }
    }

    createWishlistModal() {
        const modal = document.createElement('div');
        modal.className = 'wishlist-modal';
        modal.id = 'wishlistModal';
        modal.innerHTML = `
            <div class="wishlist-modal-content">
                <span class="wishlist-close" onclick="wishlistSystem.closeWishlistModal()">&times;</span>
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
            // Retirer de la wishlist
            this.wishlist.splice(index, 1);
            this.showNotification('Produit retiré de votre liste de souhaits', 'info');
        } else {
            // Ajouter à la wishlist
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
            const card = btn.closest('.product-card');
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
                    <button onclick="wishlistSystem.closeWishlistModal(); document.getElementById('products').scrollIntoView({behavior: 'smooth'});" class="browse-btn">
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
                    const avgRating = window.reviewsSystem ?
                        window.reviewsSystem.getAverageRating(productId) : 0;

                    wishlistHtml += `
                        <div class="wishlist-item">
                            <div class="wishlist-item-image">
                                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/shop-icon-128.png'">
                                <button class="remove-from-wishlist" onclick="wishlistSystem.toggleWishlist(${productId})">
                                    <span class="material-icons">close</span>
                                </button>
                            </div>
                            <div class="wishlist-item-info">
                                <h4>${product.name}</h4>
                                <div class="wishlist-item-rating">
                                    ${window.reviewsSystem ? window.reviewsSystem.generateStars(avgRating) : ''}
                                </div>
                                <p class="wishlist-item-price">${product.price.toFixed(2)} €</p>
                                <p class="wishlist-item-description">${product.description.substring(0, 80)}...</p>
                                <div class="wishlist-item-actions">
                                    <button class="add-to-cart-from-wishlist" onclick="addToCart(${productId}); wishlistSystem.showNotification('Produit ajouté au panier !', 'success')">
                                        <span class="material-icons">add_shopping_cart</span>
                                        Ajouter au panier
                                    </button>
                                    <button class="view-product-from-wishlist" onclick="wishlistSystem.closeWishlistModal()">
                                        Voir le produit
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            wishlistHtml += `
                </div>
                <div class="wishlist-actions">
                    <button class="clear-wishlist-btn" onclick="wishlistSystem.clearWishlist()">
                        <span class="material-icons">clear</span>
                        Vider la liste
                    </button>
                    <button class="add-all-to-cart-btn" onclick="wishlistSystem.addAllToCart()">
                        <span class="material-icons">shopping_cart</span>
                        Tout ajouter au panier
                    </button>
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

    clearWishlist() {
        if (confirm('Êtes-vous sûr de vouloir vider votre liste de souhaits ?')) {
            this.wishlist = [];
            this.saveWishlist();
            this.updateWishlistUI();
            this.updateWishlistCount();
            this.showWishlistModal(); // Rafraîchir la modal
            this.showNotification('Liste de souhaits vidée', 'info');
        }
    }

    addAllToCart() {
        let addedCount = 0;
        this.wishlist.forEach(productId => {
            const product = this.getProductById(productId);
            if (product) {
                // Simuler l'ajout au panier
                if (window.addToCart) {
                    window.addToCart(productId);
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            this.showNotification(`${addedCount} produit(s) ajouté(s) au panier !`, 'success');
        }
    }

    getProductById(productId) {
        // Chercher dans les produits chargés
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
    }

    showNotification(message, type = 'info') {
        // Utiliser le système de notification existant
        if (window.shopFeatures && window.shopFeatures.showNotification) {
            window.shopFeatures.showNotification(message, type);
        } else if (window.paymentSystem) {
            window.paymentSystem.showNotification(message, type);
        } else {
            // Fallback simple
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

    // Méthodes publiques
    getWishlist() {
        return this.wishlist;
    }

    addToWishlist(productId) {
        if (!this.isInWishlist(productId)) {
            this.toggleWishlist(productId);
        }
    }

    removeFromWishlist(productId) {
        if (this.isInWishlist(productId)) {
            this.toggleWishlist(productId);
        }
    }

    getWishlistCount() {
        return this.wishlist.length;
    }
}
}

// CSS pour le système de wishlist
const wishlistCSS = `
<style>
/* Wishlist Button - Now handled by JavaScript for better control */

.wishlist-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.wishlist-btn .material-icons {
    color: #e0e0e0;
    transition: color 0.3s ease;
}

.wishlist-btn.in-wishlist .material-icons {
    color: #e91e63;
}

.wishlist-btn:hover .material-icons {
    color: #e91e63;
}

/* Header Wishlist Button */
.wishlist-header-btn button {
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
}

.wishlist-header-btn button:hover {
    background: rgba(255,255,255,0.2);
}

.wishlist-count {
    background: #e91e63;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
}

/* Wishlist Modal */
.wishlist-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: none;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.wishlist-modal-content {
    background: white;
    margin: 2% auto;
    padding: 0;
    border-radius: 12px;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.wishlist-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    z-index: 10001;
}

.wishlist-close:hover {
    color: #333;
}

/* Wishlist Header */
.wishlist-header {
    padding: 30px;
    text-align: center;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.wishlist-header h3 {
    margin-bottom: 10px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.wishlist-header h3 .material-icons {
    color: #e91e63;
}

.wishlist-header p {
    color: #666;
}

/* Wishlist Stats */
.wishlist-stats {
    padding: 15px 30px;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
    text-align: center;
    font-weight: 500;
    color: #333;
}

/* Empty Wishlist */
.empty-wishlist {
    text-align: center;
    padding: 60px 30px;
}

.empty-wishlist .material-icons {
    font-size: 64px;
    color: #e0e0e0;
    margin-bottom: 20px;
}

.empty-wishlist h3 {
    margin-bottom: 10px;
    color: #666;
}

.empty-wishlist p {
    color: #999;
    margin-bottom: 30px;
}

.browse-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.browse-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Wishlist Grid */
.wishlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 30px;
}

.wishlist-item {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
}

.wishlist-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.wishlist-item-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.wishlist-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.wishlist-item:hover .wishlist-item-image img {
    transform: scale(1.05);
}

.remove-from-wishlist {
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
}

.remove-from-wishlist:hover {
    background: #f44336;
    transform: scale(1.1);
}

.wishlist-item-info {
    padding: 20px;
}

.wishlist-item-info h4 {
    margin-bottom: 8px;
    color: #333;
    font-size: 16px;
    line-height: 1.3;
}

.wishlist-item-rating {
    margin-bottom: 8px;
}

.wishlist-item-price {
    font-size: 18px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 10px;
}

.wishlist-item-description {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 15px;
}

.wishlist-item-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.add-to-cart-from-wishlist,
.view-product-from-wishlist {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
}

.add-to-cart-from-wishlist {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.add-to-cart-from-wishlist:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.view-product-from-wishlist {
    background: #f0f0f0;
    color: #333;
}

.view-product-from-wishlist:hover {
    background: #e0e0e0;
}

/* Wishlist Actions */
.wishlist-actions {
    padding: 20px 30px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    gap: 15px;
}

.clear-wishlist-btn,
.add-all-to-cart-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.clear-wishlist-btn {
    background: #f44336;
    color: white;
}

.clear-wishlist-btn:hover {
    background: #d32f2f;
    transform: translateY(-2px);
}

.add-all-to-cart-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    color: white;
}

.add-all-to-cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
    .wishlist-modal-content {
        margin: 1% auto;
        width: 95%;
    }

    .wishlist-grid {
        grid-template-columns: 1fr;
        padding: 20px;
    }

    .wishlist-actions {
        flex-direction: column;
    }

    .wishlist-actions button {
        width: 100%;
        justify-content: center;
    }

    .wishlist-item-actions {
        flex-direction: column;
    }

    .wishlist-item-actions button {
        justify-content: center;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
`;

// Ajouter le CSS au document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', wishlistCSS);
});

    // Fonction de sécurité pour prévenir les erreurs DOM
    function safeInsertBefore(parent, newElement, referenceElement) {
        try {
            if (parent && newElement && referenceElement &&
                parent.contains(referenceElement)) {
                parent.insertBefore(newElement, referenceElement);
                return true;
            } else if (parent && newElement) {
                parent.appendChild(newElement);
                return true;
            }
        } catch (e) {
            console.warn('Safe insert failed:', e);
        }
        return false;
    }

    // Initialiser le système de wishlist
    document.addEventListener('DOMContentLoaded', function() {
        window.wishlistSystem = new WishlistSystem();

        // Ajouter une fonction globale pour les erreurs DOM
        window.safeInsertBefore = safeInsertBefore;

        // Rafraîchir le système wishlist après le chargement des produits
        const refreshWishlist = function() {
            if (window.wishlistSystem && window.allProducts && window.allProducts.length > 0) {
                console.log('Refreshing wishlist system after products loaded');
                window.wishlistSystem.createWishlistUI();
            }
        };

        // Écouter les événements de chargement des produits
        document.addEventListener('productsLoaded', refreshWishlist);

        // Aussi rafraîchir après un délai si les produits sont déjà chargés
        setTimeout(refreshWishlist, 2000);
    });
