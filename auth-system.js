// Système d'authentification utilisateur
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.createAuthUI();
        this.setupEventListeners();
    }

    // Charger l'utilisateur depuis localStorage
    loadUser() {
        try {
            const user = localStorage.getItem('currentUser');
            if (user) {
                this.currentUser = JSON.parse(user);
                this.updateUI();
            }
        } catch (e) {
            console.warn('Erreur lors du chargement de l\'utilisateur:', e);
        }
    }

    // Sauvegarder l'utilisateur
    saveUser() {
        try {
            if (this.currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            } else {
                localStorage.removeItem('currentUser');
            }
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde de l\'utilisateur:', e);
        }
    }

    // Créer l'interface d'authentification
    createAuthUI() {
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-container';
        authContainer.innerHTML = `
            <div class="auth-modal" id="authModal">
                            <div class="auth-modal-content">
                <span class="auth-close" onclick="authSystem.closeAuthModal()">&times;</span>
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="authSystem.showLogin()">Login</button>
                    <button class="auth-tab" onclick="authSystem.showRegister()">Register</button>
                </div>
                <div id="authForms">
                        ${this.getLoginForm()}
                </div>
            </div>
            </div>
        `;

        document.body.appendChild(authContainer);
    }

    getLoginForm() {
        return `
            <form class="auth-form" id="loginForm" onsubmit="authSystem.login(event)">
                <h3>Login</h3>
                <div class="form-group">
                    <input type="email" id="loginEmail" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="password" id="loginPassword" placeholder="Password" required>
                </div>
                <button type="submit" class="auth-btn">Sign In</button>
                <p class="auth-link">Forgot password?</p>
            </form>
        `;
    }

    getRegisterForm() {
        return `
            <form class="auth-form" id="registerForm" onsubmit="authSystem.register(event)">
                <h3>Register</h3>
                <div class="form-group">
                    <input type="text" id="registerName" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                    <input type="email" id="registerEmail" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="password" id="registerPassword" placeholder="Password" required>
                </div>
                <div class="form-group">
                    <input type="password" id="registerConfirmPassword" placeholder="Confirm Password" required>
                </div>
                <button type="submit" class="auth-btn">Sign Up</button>
            </form>
        `;
    }

    setupEventListeners() {
        // Ajouter bouton de connexion dans le header
        const headerNav = document.querySelector('.nav-container');
        if (headerNav) {
            const authBtn = document.createElement('div');
            authBtn.className = 'auth-button-container';
            authBtn.innerHTML = `
                <button class="auth-nav-btn" onclick="authSystem.openAuthModal()">
                    <span class="material-icons">person</span>
                    <span id="authStatus">${this.currentUser ? 'My Account' : 'Login'}</span>
                </button>
            `;
            headerNav.appendChild(authBtn);
        }
    }

    openAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showLogin() {
        this.updateTabs('login');
        document.getElementById('authForms').innerHTML = this.getLoginForm();
    }

    showRegister() {
        this.updateTabs('register');
        document.getElementById('authForms').innerHTML = this.getRegisterForm();
    }

    updateTabs(active) {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        if (active === 'login') {
            tabs[0].classList.add('active');
        } else {
            tabs[1].classList.add('active');
        }
    }

    async login(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simulation d'authentification (remplacer par vraie API)
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            };
            this.saveUser();
            this.updateUI();
            this.closeAuthModal();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Incorrect email or password', 'error');
        }
    }

    async register(event) {
        event.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if user already exists
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            this.showNotification('This email is already in use', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        // Auto-login
        this.currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar
        };
        this.saveUser();
        this.updateUI();
        this.closeAuthModal();
        this.showNotification('Registration successful! Welcome!', 'success');
    }

    logout() {
        this.currentUser = null;
        this.saveUser();
        this.updateUI();
        this.showNotification('Logout successful', 'info');
    }

    getUsers() {
        try {
            const users = localStorage.getItem('users');
            return users ? JSON.parse(users) : [];
        } catch (e) {
            return [];
        }
    }

    saveUsers(users) {
        try {
            localStorage.setItem('users', JSON.stringify(users));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde des utilisateurs:', e);
        }
    }

    updateUI() {
        const authStatus = document.getElementById('authStatus');
        if (authStatus) {
            authStatus.textContent = this.currentUser ? 'Mon compte' : 'Connexion';
        }

        // Ajouter menu déroulant pour utilisateur connecté
        if (this.currentUser) {
            this.createUserMenu();
        } else {
            this.removeUserMenu();
        }
    }

    createUserMenu() {
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) existingMenu.remove();

        const authBtn = document.querySelector('.auth-nav-btn');
        if (!authBtn) return;

        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-info">
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="user-avatar">
                <span>${this.currentUser.name}</span>
            </div>
            <div class="user-menu-items">
                <a href="#" onclick="authSystem.showProfile()">Mon profil</a>
                <a href="#" onclick="authSystem.showOrders()">Mes commandes</a>
                <a href="#" onclick="authSystem.showFavorites()">Mes favoris</a>
                <a href="#" onclick="authSystem.logout()">Déconnexion</a>
            </div>
        `;

        authBtn.appendChild(userMenu);
    }

    removeUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }

    showProfile() {
        this.showNotification('Fonctionnalité profil à implémenter', 'info');
    }

    showOrders() {
        this.showNotification('Fonctionnalité commandes à implémenter', 'info');
    }

    showFavorites() {
        this.showNotification('Fonctionnalité favoris à implémenter', 'info');
    }

    showNotification(message, type = 'info') {
        // Utiliser le système de notification existant ou créer un fallback
        if (window.shopFeatures && window.shopFeatures.showNotification) {
            window.shopFeatures.showNotification(message, type);
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
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    }

    // Méthodes publiques pour l'accès global
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// CSS pour le système d'authentification
const authCSS = `
<style>
/* Auth Modal */
.auth-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: none;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.auth-modal-content {
    background: white;
    margin: 10% auto;
    padding: 0;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.auth-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    z-index: 10001;
}

.auth-close:hover {
    color: #333;
}

/* Auth Tabs */
.auth-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
}

.auth-tab {
    flex: 1;
    padding: 15px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
}

.auth-tab.active {
    background: #f8f9fa;
    border-bottom-color: #667eea;
    color: #667eea;
}

/* Auth Forms */
.auth-form {
    padding: 30px 20px;
}

.auth-form h3 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}

.form-group {
    margin-bottom: 15px;
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

.auth-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.auth-link {
    text-align: center;
    margin-top: 15px;
    color: #667eea;
    cursor: pointer;
    font-size: 14px;
}

.auth-link:hover {
    text-decoration: underline;
}

/* Auth Navigation Button */
.auth-nav-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 25px;
    transition: all 0.3s ease;
}

.auth-nav-btn:hover {
    background: rgba(255,255,255,0.2);
}

/* User Menu */
.user-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    min-width: 200px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    display: none;
    z-index: 1000;
    margin-top: 10px;
}

.auth-nav-btn:hover .user-menu {
    display: block;
}

.user-info {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.user-menu-items {
    padding: 10px 0;
}

.user-menu-items a {
    display: block;
    padding: 10px 15px;
    color: #333;
    text-decoration: none;
    transition: all 0.3s ease;
}

.user-menu-items a:hover {
    background: #f8f9fa;
    color: #667eea;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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

/* Responsive */
@media (max-width: 768px) {
    .auth-modal-content {
        margin: 5% auto;
        width: 95%;
    }

    .auth-form {
        padding: 20px 15px;
    }
}
</style>
`;

// Ajouter le CSS au document
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', authCSS);
});

// Initialiser le système d'authentification
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new AuthSystem();
});
