// Système de paiement simulé
class PaymentSystem {
    constructor() {
        this.init();
    }

    init() {
        this.createPaymentUI();
        this.setupEventListeners();
    }

    createPaymentUI() {
        const paymentContainer = document.createElement('div');
        paymentContainer.className = 'payment-container';
        paymentContainer.innerHTML = `
            <div class="payment-modal" id="paymentModal">
                <div class="payment-modal-content">
                    <span class="payment-close" onclick="paymentSystem.closePaymentModal()">&times;</span>
                    <h3>Paiement sécurisé</h3>

                    <div class="payment-tabs">
                        <button class="payment-tab active" onclick="paymentSystem.showCreditCardForm()">Carte bancaire</button>
                        <button class="payment-tab" onclick="paymentSystem.showPayPalForm()">PayPal</button>
                        <button class="payment-tab" onclick="paymentSystem.showBankTransferForm()">Virement</button>
                    </div>

                    <div id="paymentForms">
                        ${this.getCreditCardForm()}
                    </div>

                    <div class="payment-summary" id="paymentSummary">
                        <h4>Récapitulatif de commande</h4>
                        <div class="summary-items" id="summaryItems"></div>
                        <div class="summary-total">
                            <strong>Total: <span id="summaryTotal">0.00 €</span></strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(paymentContainer);
    }

    getCreditCardForm() {
        return `
            <form class="payment-form" id="creditCardForm" onsubmit="paymentSystem.processCreditCardPayment(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Numéro de carte</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Titulaire de la carte</label>
                        <input type="text" id="cardHolder" placeholder="John Doe" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group half">
                        <label>Date d'expiration</label>
                        <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group half">
                        <label>CVV</label>
                        <input type="text" id="cvv" placeholder="123" maxlength="4" required>
                    </div>
                </div>
                <button type="submit" class="payment-submit-btn">Payer <span id="paymentAmount">0.00 €</span></button>
            </form>
        `;
    }

    getPayPalForm() {
        return `
            <div class="payment-form paypal-form">
                <div class="paypal-info">
                    <p>Vous serez redirigé vers PayPal pour finaliser votre paiement en toute sécurité.</p>
                    <button class="paypal-btn" onclick="paymentSystem.processPayPalPayment()">
                        <span class="paypal-logo">PayPal</span>
                        Payer avec PayPal
                    </button>
                </div>
            </div>
        `;
    }

    getBankTransferForm() {
        return `
            <div class="payment-form bank-form">
                <div class="bank-info">
                    <h4>Informations de virement</h4>
                    <div class="bank-details">
                        <p><strong>Banque:</strong> Banque Demo SA</p>
                        <p><strong>IBAN:</strong> FR76 1234 5678 9012 3456 7890 123</p>
                        <p><strong>BIC:</strong> DEMOFRPP</p>
                        <p><strong>Référence:</strong> CMD-${Date.now()}</p>
                    </div>
                    <div class="bank-notice">
                        <p>⚠️ Le traitement de votre commande sera effectué une fois le virement reçu.</p>
                    </div>
                    <button class="bank-confirm-btn" onclick="paymentSystem.confirmBankTransfer()">Confirmer la commande</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Formatter automatiquement le numéro de carte
        document.addEventListener('input', (e) => {
            if (e.target.id === 'cardNumber') {
                this.formatCardNumber(e.target);
            }
            if (e.target.id === 'expiryDate') {
                this.formatExpiryDate(e.target);
            }
        });
    }

    formatCardNumber(input) {
        let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';

        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }

        input.value = formattedValue;
    }

    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        input.value = value;
    }

    openPaymentModal(cart, total) {
        this.currentCart = cart;
        this.currentTotal = total;

        const modal = document.getElementById('paymentModal');
        if (modal) {
            this.updatePaymentSummary(cart, total);
            document.getElementById('paymentAmount').textContent = total.toFixed(2) + ' €';
            modal.style.display = 'block';
        }
    }

    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updatePaymentSummary(cart, total) {
        const summaryItems = document.getElementById('summaryItems');
        const summaryTotal = document.getElementById('summaryTotal');

        let itemsHtml = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            itemsHtml += `
                <div class="summary-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${itemTotal.toFixed(2)} €</span>
                </div>
            `;
        });

        summaryItems.innerHTML = itemsHtml;
        summaryTotal.textContent = total.toFixed(2) + ' €';
    }

    showCreditCardForm() {
        this.updatePaymentTabs('credit');
        document.getElementById('paymentForms').innerHTML = this.getCreditCardForm();
        document.getElementById('paymentAmount').textContent = this.currentTotal.toFixed(2) + ' €';
    }

    showPayPalForm() {
        this.updatePaymentTabs('paypal');
        document.getElementById('paymentForms').innerHTML = this.getPayPalForm();
    }

    showBankTransferForm() {
        this.updatePaymentTabs('bank');
        document.getElementById('paymentForms').innerHTML = this.getBankTransferForm();
    }

    updatePaymentTabs(active) {
        const tabs = document.querySelectorAll('.payment-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        if (active === 'credit') {
            tabs[0].classList.add('active');
        } else if (active === 'paypal') {
            tabs[1].classList.add('active');
        } else {
            tabs[2].classList.add('active');
        }
    }

    async processCreditCardPayment(event) {
        event.preventDefault();

        const cardNumber = document.getElementById('cardNumber').value;
        const cardHolder = document.getElementById('cardHolder').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        // Validation basique
        if (!this.validateCardNumber(cardNumber)) {
            this.showNotification('Numéro de carte invalide', 'error');
            return;
        }

        if (!this.validateExpiryDate(expiryDate)) {
            this.showNotification('Date d\'expiration invalide', 'error');
            return;
        }

        if (!this.validateCVV(cvv)) {
            this.showNotification('CVV invalide', 'error');
            return;
        }

        // Simulation du traitement du paiement
        this.showNotification('Traitement du paiement...', 'info');

        // Désactiver le bouton pendant le traitement
        const submitBtn = event.target.querySelector('.payment-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Traitement...';

        // Simuler un délai de traitement
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% de succès

            if (success) {
                this.completeOrder('credit_card');
                this.showNotification('Paiement réussi ! Commande confirmée.', 'success');
            } else {
                this.showNotification('Paiement refusé. Veuillez réessayer.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = `Payer ${this.currentTotal.toFixed(2)} €`;
            }
        }, 2000);
    }

    async processPayPalPayment() {
        this.showNotification('Redirection vers PayPal...', 'info');

        // Simuler la redirection PayPal
        setTimeout(() => {
            const success = Math.random() > 0.1;
            if (success) {
                this.completeOrder('paypal');
                this.showNotification('Paiement PayPal réussi !', 'success');
            } else {
                this.showNotification('Paiement PayPal annulé', 'error');
            }
        }, 3000);
    }

    confirmBankTransfer() {
        this.completeOrder('bank_transfer');
        this.showNotification('Commande enregistrée ! Effectuez le virement selon les instructions.', 'success');
    }

    completeOrder(paymentMethod) {
        // Créer la commande
        const order = {
            id: 'CMD-' + Date.now(),
            items: this.currentCart,
            total: this.currentTotal,
            paymentMethod: paymentMethod,
            date: new Date().toISOString(),
            status: 'confirmed',
            customer: window.authSystem ? window.authSystem.getCurrentUser() : null
        };

        // Sauvegarder la commande
        this.saveOrder(order);

        // Fermer la modal de paiement
        this.closePaymentModal();

        // Vider le panier
        if (window.cart && window.updateCartCount) {
            // Supprimer tous les items du panier
            window.cart = [];
            window.updateCartCount();
            window.updateCartDisplay();
        }

        // Afficher la confirmation
        this.showOrderConfirmation(order);
    }

    saveOrder(order) {
        try {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Sauvegarder dans l'historique utilisateur si connecté
            if (window.authSystem && window.authSystem.isLoggedIn()) {
                const user = window.authSystem.getCurrentUser();
                const userOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`) || '[]');
                userOrders.push(order);
                localStorage.setItem(`orders_${user.id}`, JSON.stringify(userOrders));
            }
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde de la commande:', e);
        }
    }

    showOrderConfirmation(order) {
        const confirmation = document.createElement('div');
        confirmation.className = 'order-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <span class="material-icons success-icon">check_circle</span>
                    <h3>Commande confirmée !</h3>
                </div>
                <div class="confirmation-details">
                    <p><strong>Numéro de commande:</strong> ${order.id}</p>
                    <p><strong>Total:</strong> ${order.total.toFixed(2)} €</p>
                    <p><strong>Méthode de paiement:</strong> ${this.getPaymentMethodLabel(order.paymentMethod)}</p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div class="confirmation-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">Continuer mes achats</button>
                    <button onclick="window.location.reload()">Voir mes commandes</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmation);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (confirmation.parentElement) {
                confirmation.remove();
            }
        }, 10000);
    }

    getPaymentMethodLabel(method) {
        switch (method) {
            case 'credit_card': return 'Carte bancaire';
            case 'paypal': return 'PayPal';
            case 'bank_transfer': return 'Virement bancaire';
            default: return method;
        }
    }

    // Validations
    validateCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s+/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
    }

    validateExpiryDate(expiryDate) {
        const [month, year] = expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        const expMonth = parseInt(month);
        const expYear = parseInt(year);

        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;

        return true;
    }

    validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    showNotification(message, type = 'info') {
        // Utiliser le système de notification existant
        if (window.shopFeatures && window.shopFeatures.showNotification) {
            window.shopFeatures.showNotification(message, type);
        } else if (window.deploymentManager) {
            window.deploymentManager.showNotification(message, type);
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
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem('orders') || '[]');
        } catch (e) {
            return [];
        }
    }

    getUserOrders(userId) {
        try {
            return JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]');
        } catch (e) {
            return [];
        }
    }
}

// CSS pour le système de paiement
const paymentCSS = `
<style>
/* Payment Modal */
.payment-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: none;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.payment-modal-content {
    background: white;
    margin: 5% auto;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.payment-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 28px;
    cursor: pointer;
    color: #666;
}

.payment-close:hover {
    color: #333;
}

/* Payment Tabs */
.payment-tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.payment-tab {
    flex: 1;
    padding: 15px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
}

.payment-tab.active {
    background: #f8f9fa;
    border-bottom-color: #667eea;
    color: #667eea;
}

/* Payment Forms */
.payment-form {
    margin-bottom: 30px;
}

.form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
}

.form-group {
    flex: 1;
}

.form-group.half {
    flex: 0 0 calc(50% - 7.5px);
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

.form-group input {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.form-group input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
}

.payment-submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
}

.payment-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.payment-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

/* PayPal Form */
.paypal-form {
    text-align: center;
    padding: 30px;
}

.paypal-btn {
    background: #0070ba;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
}

.paypal-btn:hover {
    background: #005ea6;
    transform: translateY(-2px);
}

.paypal-logo {
    font-weight: 700;
}

/* Bank Transfer Form */
.bank-form {
    padding: 20px;
}

.bank-details {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid #667eea;
}

.bank-details p {
    margin: 8px 0;
    font-family: monospace;
    font-size: 14px;
}

.bank-notice {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}

.bank-confirm-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.bank-confirm-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* Payment Summary */
.payment-summary {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.payment-summary h4 {
    margin-bottom: 15px;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
}

.summary-items {
    margin-bottom: 15px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-total {
    background: white;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    border: 2px solid #667eea;
}

/* Order Confirmation */
.order-confirmation {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    animation: fadeIn 0.3s ease;
}

.confirmation-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.confirmation-header {
    margin-bottom: 20px;
}

.success-icon {
    font-size: 48px;
    color: #4CAF50;
    display: block;
    margin-bottom: 10px;
}

.confirmation-details {
    text-align: left;
    margin-bottom: 20px;
}

.confirmation-details p {
    margin: 8px 0;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.confirmation-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.confirmation-actions button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.confirmation-actions button:first-child {
    background: #f0f0f0;
    color: #333;
}

.confirmation-actions button:first-child:hover {
    background: #e0e0e0;
}

.confirmation-actions button:last-child {
    background: #667eea;
    color: white;
}

.confirmation-actions button:last-child:hover {
    background: #5a67d8;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
    .payment-modal-content {
        margin: 2% auto;
        padding: 20px;
        width: 95%;
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .form-group.half {
        flex: 1;
    }

    .confirmation-actions {
        flex-direction: column;
    }

    .confirmation-actions button {
        width: 100%;
    }
}
</style>
`;

// Ajouter le CSS au document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', paymentCSS);
});

// Initialiser le système de paiement
document.addEventListener('DOMContentLoaded', function() {
    window.paymentSystem = new PaymentSystem();
});
