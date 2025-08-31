// Système de comparaison de produits
class ComparisonSystem {
    constructor() {
        this.comparedProducts = [];
        this.maxProducts = 4;
        this.init();
    }

    init() {
        this.loadComparedProducts();
        this.createComparisonUI();
        this.setupEventListeners();
    }

    // Charger les produits comparés depuis localStorage
    loadComparedProducts() {
        try {
            const saved = localStorage.getItem('compared_products');
            this.comparedProducts = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.comparedProducts = [];
            console.warn('Erreur lors du chargement des produits comparés:', e);
        }
    }

    // Sauvegarder les produits comparés
    saveComparedProducts() {
        try {
            localStorage.setItem('compared_products', JSON.stringify(this.comparedProducts));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde des produits comparés:', e);
        }
    }

    // Créer l'interface de comparaison
    createComparisonUI() {
        // Ajouter un bouton de comparaison à chaque carte produit
        setTimeout(() => {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const productId = this.getProductIdFromCard(card);
                if (productId) {
                    const compareBtn = document.createElement('button');
                    compareBtn.className = 'compare-btn';
                    compareBtn.innerHTML = this.isInComparison(productId) ?
                        '<span class="material-icons">check</span> Comparé' :
                        '<span class="material-icons">compare</span> Comparer';

                    compareBtn.onclick = () => this.toggleProductComparison(productId);

                    // Insérer après le bouton avis
                    const reviewsBtn = card.querySelector('.reviews-btn');
                    if (reviewsBtn) {
                        reviewsBtn.parentNode.insertBefore(compareBtn, reviewsBtn.nextSibling);
                    } else {
                        const addToCartBtn = card.querySelector('.add-to-cart-btn');
                        if (addToCartBtn) {
                            addToCartBtn.parentNode.insertBefore(compareBtn, addToCartBtn);
                        }
                    }
                }
            });

            // Créer la barre de comparaison flottante
            this.createComparisonBar();

            // Créer la modal de comparaison
            this.createComparisonModal();
        }, 1000);
    }

    getProductIdFromCard(card) {
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        if (addToCartBtn && addToCartBtn.onclick) {
            const onclickStr = addToCartBtn.onclick.toString();
            const match = onclickStr.match(/addToCart\((\d+)\)/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return null;
    }

    createComparisonBar() {
        const bar = document.createElement('div');
        bar.className = 'comparison-bar';
        bar.id = 'comparisonBar';
        bar.innerHTML = `
            <div class="comparison-bar-content">
                <div class="comparison-info">
                    <span class="material-icons">compare</span>
                    <span id="comparisonCount">0</span> produit(s) à comparer
                </div>
                <div class="comparison-actions">
                    <button class="comparison-btn" onclick="comparisonSystem.showComparison()">
                        <span class="material-icons">visibility</span>
                        Comparer
                    </button>
                    <button class="clear-btn" onclick="comparisonSystem.clearComparison()">
                        <span class="material-icons">clear</span>
                        Vider
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(bar);
        this.updateComparisonBar();
    }

    createComparisonModal() {
        const modal = document.createElement('div');
        modal.className = 'comparison-modal';
        modal.id = 'comparisonModal';
        modal.innerHTML = `
            <div class="comparison-modal-content">
                <span class="comparison-close" onclick="comparisonSystem.closeComparisonModal()">&times;</span>
                <div id="comparisonContent">
                    <!-- Le contenu sera chargé dynamiquement -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    toggleProductComparison(productId) {
        const index = this.comparedProducts.indexOf(productId);

        if (index > -1) {
            // Retirer de la comparaison
            this.comparedProducts.splice(index, 1);
            this.showNotification('Produit retiré de la comparaison', 'info');
        } else {
            // Ajouter à la comparaison
            if (this.comparedProducts.length >= this.maxProducts) {
                this.showNotification(`Vous ne pouvez comparer que ${this.maxProducts} produits maximum`, 'error');
                return;
            }

            this.comparedProducts.push(productId);
            this.showNotification('Produit ajouté à la comparaison', 'success');
        }

        this.saveComparedProducts();
        this.updateComparisonBar();
        this.updateCompareButtons();
    }

    isInComparison(productId) {
        return this.comparedProducts.includes(productId);
    }

    updateComparisonBar() {
        const bar = document.getElementById('comparisonBar');
        const count = document.getElementById('comparisonCount');

        if (this.comparedProducts.length > 0) {
            bar.classList.add('visible');
            if (count) count.textContent = this.comparedProducts.length;
        } else {
            bar.classList.remove('visible');
        }
    }

    updateCompareButtons() {
        const compareBtns = document.querySelectorAll('.compare-btn');
        compareBtns.forEach(btn => {
            const card = btn.closest('.product-card');
            const productId = this.getProductIdFromCard(card);

            if (productId && this.isInComparison(productId)) {
                btn.innerHTML = '<span class="material-icons">check</span> Comparé';
                btn.classList.add('compared');
            } else {
                btn.innerHTML = '<span class="material-icons">compare</span> Comparer';
                btn.classList.remove('compared');
            }
        });
    }

    showComparison() {
        if (this.comparedProducts.length < 2) {
            this.showNotification('Ajoutez au moins 2 produits pour comparer', 'error');
            return;
        }

        const modal = document.getElementById('comparisonModal');
        const content = document.getElementById('comparisonContent');

        let comparisonHtml = `
            <div class="comparison-header">
                <h3>Comparaison de produits</h3>
                <p>Comparez ${this.comparedProducts.length} produits côte à côte</p>
            </div>

            <div class="comparison-table">
                <div class="comparison-row comparison-header-row">
                    <div class="comparison-cell feature-cell">Caractéristiques</div>
        `;

        // Ajouter les cellules pour chaque produit
        this.comparedProducts.forEach(productId => {
            const product = this.getProductById(productId);
            if (product) {
                comparisonHtml += `
                    <div class="comparison-cell product-cell">
                        <div class="product-remove" onclick="comparisonSystem.removeFromComparison(${productId})">
                            <span class="material-icons">close</span>
                        </div>
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/shop-icon-128.png'">
                        <h4>${product.name}</h4>
                        <p class="product-price">${product.price.toFixed(2)} €</p>
                    </div>
                `;
            }
        });

        comparisonHtml += `
                </div>

                <div class="comparison-row">
                    <div class="comparison-cell feature-cell">Prix</div>
        `;

        this.comparedProducts.forEach(productId => {
            const product = this.getProductById(productId);
            comparisonHtml += `
                <div class="comparison-cell">
                    <strong>${product ? product.price.toFixed(2) + ' €' : 'N/A'}</strong>
                </div>
            `;
        });

        comparisonHtml += `
                </div>

                <div class="comparison-row">
                    <div class="comparison-cell feature-cell">Note moyenne</div>
        `;

        this.comparedProducts.forEach(productId => {
            const avgRating = window.reviewsSystem ?
                window.reviewsSystem.getAverageRating(productId) : 0;
            comparisonHtml += `
                <div class="comparison-cell">
                    ${avgRating > 0 ? `${avgRating.toFixed(1)} ⭐ (${window.reviewsSystem.getReviewCount(productId)} avis)` : 'Pas d\'avis'}
                </div>
            `;
        });

        comparisonHtml += `
                </div>

                <div class="comparison-row">
                    <div class="comparison-cell feature-cell">Description</div>
        `;

        this.comparedProducts.forEach(productId => {
            const product = this.getProductById(productId);
            comparisonHtml += `
                <div class="comparison-cell">
                    <p>${product ? product.description.substring(0, 100) + '...' : 'N/A'}</p>
                </div>
            `;
        });

        comparisonHtml += `
                </div>

                <div class="comparison-row comparison-actions-row">
                    <div class="comparison-cell feature-cell">Actions</div>
        `;

        this.comparedProducts.forEach(productId => {
            const product = this.getProductById(productId);
            comparisonHtml += `
                <div class="comparison-cell">
                    <button class="action-btn add-to-cart-btn-small" onclick="addToCart(${productId})">
                        <span class="material-icons">add_shopping_cart</span>
                        Ajouter
                    </button>
                </div>
            `;
        });

        comparisonHtml += `
                </div>
            </div>
        `;

        content.innerHTML = comparisonHtml;
        modal.style.display = 'block';
    }

    closeComparisonModal() {
        const modal = document.getElementById('comparisonModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    removeFromComparison(productId) {
        const index = this.comparedProducts.indexOf(productId);
        if (index > -1) {
            this.comparedProducts.splice(index, 1);
            this.saveComparedProducts();
            this.updateComparisonBar();
            this.updateCompareButtons();
            this.showComparison(); // Rafraîchir la modal
        }
    }

    clearComparison() {
        this.comparedProducts = [];
        this.saveComparedProducts();
        this.updateComparisonBar();
        this.updateCompareButtons();
        this.showNotification('Comparaison vidée', 'info');
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
            const modal = document.getElementById('comparisonModal');
            if (event.target === modal) {
                this.closeComparisonModal();
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
    getComparedProducts() {
        return this.comparedProducts;
    }

    addToComparison(productId) {
        this.toggleProductComparison(productId);
    }

    removeFromComparison(productId) {
        this.removeFromComparison(productId);
    }
}

// CSS pour le système de comparaison
const comparisonCSS = `
<style>
/* Compare Button */
.compare-btn {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #1976d2;
    padding: 6px 10px;
    border-radius: 15px;
    cursor: pointer;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
    margin-right: 8px;
    transition: all 0.3s ease;
}

.compare-btn:hover {
    background: #1976d2;
    color: white;
    transform: translateY(-1px);
}

.compare-btn.compared {
    background: #4caf50;
    color: white;
    border-color: #4caf50;
}

.compare-btn .material-icons {
    font-size: 14px;
}

/* Comparison Bar */
.comparison-bar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.comparison-bar.visible {
    opacity: 1;
    visibility: visible;
}

.comparison-bar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.comparison-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.comparison-actions {
    display: flex;
    gap: 10px;
}

.comparison-btn,
.clear-btn {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    transition: all 0.3s ease;
}

.comparison-btn:hover,
.clear-btn:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-1px);
}

/* Comparison Modal */
.comparison-modal {
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

.comparison-modal-content {
    background: white;
    margin: 2% auto;
    padding: 0;
    border-radius: 12px;
    width: 95%;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.comparison-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    z-index: 10001;
}

.comparison-close:hover {
    color: #333;
}

/* Comparison Header */
.comparison-header {
    padding: 30px;
    text-align: center;
    border-bottom: 1px solid #eee;
}

.comparison-header h3 {
    margin-bottom: 10px;
    color: #333;
}

.comparison-header p {
    color: #666;
}

/* Comparison Table */
.comparison-table {
    padding: 20px;
}

.comparison-row {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
}

.comparison-row:last-child {
    border-bottom: none;
}

.comparison-header-row {
    background: #f8f9fa;
    font-weight: 600;
    border-bottom: 2px solid #667eea;
}

.comparison-cell {
    flex: 1;
    padding: 15px;
    text-align: center;
    border-right: 1px solid #f0f0f0;
}

.comparison-cell:last-child {
    border-right: none;
}

.feature-cell {
    flex: 0 0 150px;
    font-weight: 600;
    color: #333;
    background: #f8f9fa;
    text-align: left;
}

.product-cell {
    position: relative;
}

.product-cell img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 10px;
}

.product-cell h4 {
    font-size: 14px;
    margin-bottom: 5px;
    line-height: 1.3;
}

.product-price {
    color: #667eea;
    font-weight: 600;
    font-size: 16px;
}

.product-remove {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #f44336;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

.product-remove:hover {
    background: #d32f2f;
    transform: scale(1.1);
}

.comparison-actions-row {
    background: #f8f9fa;
}

.add-to-cart-btn-small {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
}

.add-to-cart-btn-small:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
    .comparison-modal-content {
        margin: 1% auto;
        width: 98%;
    }

    .comparison-table {
        padding: 10px;
    }

    .comparison-cell {
        padding: 8px 4px;
        font-size: 12px;
    }

    .feature-cell {
        flex: 0 0 100px;
        font-size: 11px;
    }

    .product-cell img {
        width: 60px;
        height: 60px;
    }

    .product-cell h4 {
        font-size: 11px;
    }

    .comparison-bar {
        bottom: 10px;
        left: 10px;
        right: 10px;
        transform: none;
    }

    .comparison-bar-content {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .comparison-actions {
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
    document.head.insertAdjacentHTML('beforeend', comparisonCSS);
});

// Initialiser le système de comparaison
document.addEventListener('DOMContentLoaded', function() {
    window.comparisonSystem = new ComparisonSystem();
});
