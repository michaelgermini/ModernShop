// Système de notation et commentaires
class ReviewsSystem {
    constructor() {
        this.init();
    }

    init() {
        this.loadReviews();
        this.createReviewsUI();
        this.setupEventListeners();
    }

    // Charger les avis depuis localStorage
    loadReviews() {
        try {
            this.reviews = JSON.parse(localStorage.getItem('product_reviews') || '{}');
        } catch (e) {
            this.reviews = {};
            console.warn('Erreur lors du chargement des avis:', e);
        }
    }

    // Sauvegarder les avis
    saveReviews() {
        try {
            localStorage.setItem('product_reviews', JSON.stringify(this.reviews));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde des avis:', e);
        }
    }

    // Créer l'interface des avis
    createReviewsUI() {
        // Ajouter un bouton "Voir les avis" à chaque carte produit
        setTimeout(() => {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const productId = this.getProductIdFromCard(card);
                if (productId) {
                    const reviewsBtn = document.createElement('button');
                    reviewsBtn.className = 'reviews-btn';
                    reviewsBtn.innerHTML = '<span class="material-icons">star</span> Avis';
                    reviewsBtn.onclick = () => this.showProductReviews(productId);

                    // Insérer avant le bouton "Ajouter au panier"
                    const addToCartBtn = card.querySelector('.add-to-cart-btn');
                    if (addToCartBtn) {
                        addToCartBtn.parentNode.insertBefore(reviewsBtn, addToCartBtn);
                    }

                    // Ajouter la note moyenne
                    this.addRatingDisplay(card, productId);
                }
            });

            // Créer la modal des avis
            this.createReviewsModal();
        }, 1000);
    }

    getProductIdFromCard(card) {
        // Essayer de trouver l'ID du produit depuis le bouton ajouter au panier
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

    addRatingDisplay(card, productId) {
        const productReviews = this.reviews[productId] || [];
        if (productReviews.length === 0) return;

        const avgRating = this.calculateAverageRating(productReviews);
        const ratingDisplay = document.createElement('div');
        ratingDisplay.className = 'product-rating';
        ratingDisplay.innerHTML = `
            <div class="rating-stars">
                ${this.generateStars(avgRating)}
            </div>
            <span class="rating-count">(${productReviews.length})</span>
        `;

        const productInfo = card.querySelector('.product-info');
        if (productInfo) {
            productInfo.insertBefore(ratingDisplay, productInfo.firstChild);
        }
    }

    generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<span class="material-icons star filled">star</span>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<span class="material-icons star half">star_half</span>';
            } else {
                stars += '<span class="material-icons star">star_border</span>';
            }
        }

        return stars;
    }

    calculateAverageRating(reviews) {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((total, review) => total + review.rating, 0);
        return sum / reviews.length;
    }

    createReviewsModal() {
        const modal = document.createElement('div');
        modal.className = 'reviews-modal';
        modal.id = 'reviewsModal';
        modal.innerHTML = `
            <div class="reviews-modal-content">
                <span class="reviews-close" onclick="reviewsSystem.closeReviewsModal()">&times;</span>
                <div id="reviewsContent">
                    <!-- Le contenu sera chargé dynamiquement -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showProductReviews(productId) {
        const modal = document.getElementById('reviewsModal');
        const content = document.getElementById('reviewsContent');

        const productReviews = this.reviews[productId] || [];
        const avgRating = this.calculateAverageRating(productReviews);

        let reviewsHtml = `
            <div class="reviews-header">
                <h3>Avis clients</h3>
                <div class="overall-rating">
                    <div class="rating-stars">
                        ${this.generateStars(avgRating)}
                    </div>
                    <div class="rating-summary">
                        <span class="rating-score">${avgRating.toFixed(1)}</span>
                        <span class="rating-count">${productReviews.length} avis</span>
                    </div>
                </div>
            </div>

            <div class="reviews-list">
        `;

        if (productReviews.length === 0) {
            reviewsHtml += `
                <div class="no-reviews">
                    <span class="material-icons">rate_review</span>
                    <p>Soyez le premier à donner votre avis !</p>
                </div>
            `;
        } else {
            productReviews.forEach(review => {
                reviewsHtml += `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <span class="reviewer-name">${review.name || 'Anonyme'}</span>
                                <div class="review-rating">
                                    ${this.generateStars(review.rating)}
                                </div>
                            </div>
                            <span class="review-date">${this.formatDate(review.date)}</span>
                        </div>
                        <div class="review-content">
                            <p>${review.comment}</p>
                        </div>
                    </div>
                `;
            });
        }

        reviewsHtml += `
            </div>

            <div class="add-review-section">
                <h4>Donner votre avis</h4>
                <form id="reviewForm" onsubmit="reviewsSystem.submitReview(event, ${productId})">
                    <div class="rating-input">
                        <label>Note:</label>
                        <div class="star-rating" id="starRating">
                            ${[1,2,3,4,5].map(i => `<span class="material-icons star-input" data-rating="${i}" onclick="reviewsSystem.setRating(${i})">star_border</span>`).join('')}
                        </div>
                    </div>
                    <input type="hidden" id="selectedRating" required>
                    <textarea id="reviewComment" placeholder="Partagez votre expérience avec ce produit..." required></textarea>
                    <button type="submit" class="submit-review-btn">Publier l'avis</button>
                </form>
            </div>
        `;

        content.innerHTML = reviewsHtml;
        modal.style.display = 'block';
    }

    closeReviewsModal() {
        const modal = document.getElementById('reviewsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    setRating(rating) {
        document.getElementById('selectedRating').value = rating;

        const stars = document.querySelectorAll('#starRating .star-input');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = 'star';
                star.classList.add('selected');
            } else {
                star.textContent = 'star_border';
                star.classList.remove('selected');
            }
        });
    }

    async submitReview(event, productId) {
        event.preventDefault();

        const rating = parseInt(document.getElementById('selectedRating').value);
        const comment = document.getElementById('reviewComment').value.trim();

        if (!rating || !comment) {
            this.showNotification('Veuillez donner une note et écrire un commentaire', 'error');
            return;
        }

        // Récupérer les informations de l'utilisateur
        let reviewerName = 'Anonyme';
        if (window.authSystem && window.authSystem.isLoggedIn()) {
            const user = window.authSystem.getCurrentUser();
            reviewerName = user.name;
        }

        const review = {
            id: Date.now(),
            name: reviewerName,
            rating: rating,
            comment: comment,
            date: new Date().toISOString(),
            verified: window.authSystem ? window.authSystem.isLoggedIn() : false
        };

        // Ajouter l'avis
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }
        this.reviews[productId].push(review);
        this.saveReviews();

        // Fermer la modal et afficher un message de succès
        this.closeReviewsModal();
        this.showNotification('Votre avis a été publié avec succès !', 'success');

        // Mettre à jour l'affichage des notes sur les cartes produits
        this.updateProductRatings();
    }

    updateProductRatings() {
        // Mettre à jour toutes les cartes produits avec les nouvelles notes
        setTimeout(() => {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                // Supprimer l'ancien affichage de note
                const oldRating = card.querySelector('.product-rating');
                if (oldRating) {
                    oldRating.remove();
                }

                // Ajouter le nouveau
                const productId = this.getProductIdFromCard(card);
                if (productId) {
                    this.addRatingDisplay(card, productId);
                }
            });
        }, 100);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        // Fermer la modal en cliquant en dehors
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('reviewsModal');
            if (event.target === modal) {
                this.closeReviewsModal();
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
    getProductReviews(productId) {
        return this.reviews[productId] || [];
    }

    getAverageRating(productId) {
        const reviews = this.getProductReviews(productId);
        return this.calculateAverageRating(reviews);
    }

    getReviewCount(productId) {
        return this.getProductReviews(productId).length;
    }
}

// CSS pour le système d'avis
const reviewsCSS = `
<style>
/* Reviews Button */
.reviews-btn {
    background: #f8f9fa;
    color: #667eea;
    border: 1px solid #667eea;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
}

.reviews-btn:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
}

.reviews-btn .material-icons {
    font-size: 16px;
}

/* Product Rating Display */
.product-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.rating-stars {
    display: flex;
    align-items: center;
}

.rating-stars .star {
    font-size: 16px;
    color: #ffc107;
}

.rating-count {
    font-size: 12px;
    color: #666;
    font-weight: 500;
}

/* Reviews Modal */
.reviews-modal {
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

.reviews-modal-content {
    background: white;
    margin: 2% auto;
    padding: 0;
    border-radius: 12px;
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.reviews-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    z-index: 10001;
}

.reviews-close:hover {
    color: #333;
}

/* Reviews Header */
.reviews-header {
    padding: 30px 30px 20px;
    border-bottom: 1px solid #eee;
}

.reviews-header h3 {
    margin-bottom: 15px;
    color: #333;
}

.overall-rating {
    display: flex;
    align-items: center;
    gap: 20px;
}

.rating-summary {
    display: flex;
    flex-direction: column;
}

.rating-score {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
}

.rating-count {
    font-size: 0.9rem;
    color: #666;
}

/* Reviews List */
.reviews-list {
    padding: 20px 30px;
    max-height: 400px;
    overflow-y: auto;
}

.no-reviews {
    text-align: center;
    padding: 40px;
    color: #666;
}

.no-reviews .material-icons {
    font-size: 48px;
    margin-bottom: 10px;
    opacity: 0.5;
}

.review-item {
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 0;
}

.review-item:last-child {
    border-bottom: none;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.reviewer-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.reviewer-name {
    font-weight: 500;
    color: #333;
}

.review-rating .star {
    font-size: 16px;
    color: #ffc107;
}

.review-date {
    font-size: 0.9rem;
    color: #666;
}

.review-content p {
    color: #555;
    line-height: 1.5;
    margin: 0;
}

/* Add Review Section */
.add-review-section {
    padding: 20px 30px;
    background: #f8f9fa;
    border-top: 1px solid #eee;
}

.add-review-section h4 {
    margin-bottom: 15px;
    color: #333;
}

.rating-input {
    margin-bottom: 15px;
}

.rating-input label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.star-rating {
    display: flex;
    gap: 5px;
}

.star-input {
    font-size: 24px;
    color: #ddd;
    cursor: pointer;
    transition: all 0.3s ease;
}

.star-input:hover,
.star-input.selected {
    color: #ffc107;
}

#reviewForm textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    min-height: 100px;
    resize: vertical;
    margin-bottom: 15px;
    box-sizing: border-box;
}

#reviewForm textarea:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
}

.submit-review-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.submit-review-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
    .reviews-modal-content {
        margin: 1% auto;
        width: 95%;
    }

    .reviews-header,
    .reviews-list,
    .add-review-section {
        padding-left: 20px;
        padding-right: 20px;
    }

    .review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .overall-rating {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
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
    document.head.insertAdjacentHTML('beforeend', reviewsCSS);
});

// Initialiser le système d'avis
document.addEventListener('DOMContentLoaded', function() {
    window.reviewsSystem = new ReviewsSystem();
});
